import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction, TransactionType } from '../types';

export function useTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (ventureId?: string, limit: number = 50) => {
      if (!userId) return;
      setLoading(true);
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(limit);

        if (ventureId) {
          query = query.eq('venture_id', ventureId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setTransactions(data || []);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const addTransaction = useCallback(
    async (tx: {
      venture_id: string;
      type: TransactionType;
      amount: number;
      category: string;
      description: string;
      date: string;
      receipt_url?: string;
      is_recurring?: boolean;
    }) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...tx, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    [userId]
  );

  const deleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    []
  );

  return {
    transactions,
    loading,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  };
}
