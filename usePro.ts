import { useState, useEffect, useCallback } from 'react';
import { checkProAccess, FREE_TIER_LIMITS, PRO_TIER } from '../lib/revenue-cat';

export function usePro() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const hasPro = await checkProAccess();
      setIsPro(hasPro);
    } catch {
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const limits = isPro ? PRO_TIER : FREE_TIER_LIMITS;

  return { isPro, limits, loading, refresh };
}
