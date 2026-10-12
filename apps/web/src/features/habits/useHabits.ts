import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ApiError } from '../../api/client';
import { fetchHabits } from './api';
import type { Habit, RequestStatus } from './types';

/**
 * The signed-in user's habits, newest first, with the request status the home screen renders its four states
 * from. It reloads every time the screen comes back into focus (after adding, renaming or deleting), and keeps
 * showing the list it has while it does — only the very first load shows the loading state.
 */
export function useHabits() {
  const [data, setData] = useState<Habit[] | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStatus((current) => (current === 'succeeded' ? current : 'loading'));
    setError(null);
    fetchHabits()
      .then((page) => { setData(page.results); setStatus('succeeded'); })
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : String(cause));
        setStatus('failed');
      });
  }, []);

  useFocusEffect(reload);
  return { data, status, error, reload };
}
