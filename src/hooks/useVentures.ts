import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Venture, VenturePnL, VentureType, VentureStatus } from '../types';
import { getYearRange, getMonthRange } from '../lib/utils';

export function useVentures(userId: string | undefined) {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [venturePnLs, setVenturePnLs] = useState<VenturePnL[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVentures = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ventures')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setVentures(data || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchVenturePnLs = useCallback(async (period: 'month' | 'year' = 'month') => {
    if (!userId || ventures.length === 0) return;

    const range = period === 'month' ? getMonthRange(0) : getYearRange();
    const prevRange = period === 'month' ? getMonthRange(1) : {
      start: `${new Date().getFullYear() - 1}-01-01`,
      end: `${new Date().getFullYear() - 1}-12-31`,
    };

    const pnls: VenturePnL[] = [];

    for (const venture of ventures) {
      // Current period transactions
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('venture_id', venture.id)
        .gte('date', range.start)
        .lte('date', range.end);

      // Previous period transactions (for trend)
      const { data: prevTxns } = await supabase
        .from('transactions')
        .select('*')
        .eq('venture_id', venture.id)
        .gte('date', prevRange.start)
        .lte('date', prevRange.end);

      // Time logs
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('*')
        .eq('venture_id', venture.id)
        .gte('start_time', range.start);

      const totalIncome = (txns || [])
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = (txns || [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? netProfit / totalIncome : 0;

      const totalMinutes = (timeLogs || []).reduce(
        (sum, t) => sum + (t.duration_minutes || 0),
        0
      );
      const totalHours = totalMinutes / 60;
      const dollarPerHour = totalHours > 0 ? netProfit / totalHours : null;

      // Trend calculation
      const prevIncome = (prevTxns || [])
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const prevExpenses = (prevTxns || [])
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const prevProfit = prevIncome - prevExpenses;
      const trend = prevProfit !== 0
        ? ((netProfit - prevProfit) / Math.abs(prevProfit)) * 100
        : netProfit > 0 ? 100 : 0;

      pnls.push({
        venture,
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        totalHours,
        dollarPerHour,
        trend,
      });
    }

    // Sort by net profit descending
    pnls.sort((a, b) => b.netProfit - a.netProfit);
    setVenturePnLs(pnls);
  }, [userId, ventures]);

  useEffect(() => {
    fetchVentures();
  }, [fetchVentures]);

  useEffect(() => {
    if (ventures.length > 0) {
      fetchVenturePnLs('month');
    }
  }, [ventures, fetchVenturePnLs]);

  const addVenture = useCallback(
    async (name: string, type: VentureType, color: string, icon: string) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('ventures')
        .insert({
          user_id: userId,
          name,
          type,
          color,
          icon,
          status: 'active' as VentureStatus,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchVentures();
      return data;
    },
    [userId, fetchVentures]
  );

  const updateVenture = useCallback(
    async (id: string, updates: Partial<Venture>) => {
      const { error } = await supabase
        .from('ventures')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchVentures();
    },
    [fetchVentures]
  );

  const archiveVenture = useCallback(
    async (id: string) => {
      await updateVenture(id, { status: 'archived' });
    },
    [updateVenture]
  );

  // Aggregate stats
  const totalNetProfit = venturePnLs.reduce((sum, v) => sum + v.netProfit, 0);
  const totalIncome = venturePnLs.reduce((sum, v) => sum + v.totalIncome, 0);
  const totalExpenses = venturePnLs.reduce((sum, v) => sum + v.totalExpenses, 0);

  return {
    ventures,
    venturePnLs,
    loading,
    totalNetProfit,
    totalIncome,
    totalExpenses,
    addVenture,
    updateVenture,
    archiveVenture,
    refreshVentures: fetchVentures,
    refreshPnLs: fetchVenturePnLs,
  };
}
