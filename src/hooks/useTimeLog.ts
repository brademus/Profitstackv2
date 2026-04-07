import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TimeLog } from '../types';

export function useTimeLog(userId: string | undefined) {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activeLog, setActiveLog] = useState<TimeLog | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for active timer on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('time_logs')
        .select('*')
        .eq('user_id', userId)
        .is('end_time', null)
        .single();

      if (data) {
        setActiveLog(data);
        const start = new Date(data.start_time).getTime();
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      }
    })();
  }, [userId]);

  // Tick the timer
  useEffect(() => {
    if (activeLog) {
      intervalRef.current = setInterval(() => {
        const start = new Date(activeLog.start_time).getTime();
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeLog]);

  const startTimer = useCallback(
    async (ventureId: string, note: string = '') => {
      if (!userId) return;
      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          user_id: userId,
          venture_id: ventureId,
          start_time: new Date().toISOString(),
          note,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveLog(data);
    },
    [userId]
  );

  const stopTimer = useCallback(async () => {
    if (!activeLog) return;
    const endTime = new Date();
    const startTime = new Date(activeLog.start_time);
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    const { error } = await supabase
      .from('time_logs')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', activeLog.id);

    if (error) throw error;
    setActiveLog(null);
  }, [activeLog]);

  const addManualEntry = useCallback(
    async (ventureId: string, durationMinutes: number, date: string, note: string = '') => {
      if (!userId) return;
      const startTime = new Date(date);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      const { error } = await supabase.from('time_logs').insert({
        user_id: userId,
        venture_id: ventureId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        note,
      });

      if (error) throw error;
    },
    [userId]
  );

  const fetchTimeLogs = useCallback(
    async (ventureId: string, limit: number = 30) => {
      if (!userId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('time_logs')
          .select('*')
          .eq('venture_id', ventureId)
          .order('start_time', { ascending: false })
          .limit(limit);

        if (error) throw error;
        setTimeLogs(data || []);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const deleteTimeLog = useCallback(async (id: string) => {
    const { error } = await supabase.from('time_logs').delete().eq('id', id);
    if (error) throw error;
    setTimeLogs((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return {
    timeLogs,
    activeLog,
    elapsedSeconds,
    loading,
    startTimer,
    stopTimer,
    addManualEntry,
    fetchTimeLogs,
    deleteTimeLog,
  };
}
