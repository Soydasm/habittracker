import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ApiError } from '../../api/client';
import { fetchWeeklySummary } from './api';
import type { RequestStatus, WeeklySummary } from './types';

/**
 * This week's summary with the request status the screen renders its four states from. It reloads whenever the
 * screen comes back into focus (marks change on the home screen) and keeps what it has while it does.
 */
export function useWeeklySummary() {
  const [data, setData] = useState<WeeklySummary | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStatus((current) => (current === 'succeeded' ? current : 'loading'));
    setError(null);
    fetchWeeklySummary()
      .then((summary) => { setData(summary); setStatus('succeeded'); })
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : String(cause));
        setStatus('failed');
      });
  }, []);

  useFocusEffect(reload);
  return { data, status, error, reload };
}
