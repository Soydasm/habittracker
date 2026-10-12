import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { fetchHabit } from './api';
import type { Habit, RequestStatus } from './types';

/** One habit of the signed-in user. `notFound` is true for an id that is not theirs or was deleted. */
export function useHabit(id: string) {
  const [data, setData] = useState<Habit | null>(null);
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    setStatus('loading');
    setError(null);
    setNotFound(false);
    fetchHabit(id)
      .then((habit) => { setData(habit); setStatus('succeeded'); })
      .catch((cause: unknown) => {
        setNotFound(cause instanceof ApiError && cause.status === 404);
        setError(cause instanceof ApiError ? cause.message : String(cause));
        setStatus('failed');
      });
  }, [id]);

  useEffect(reload, [reload]);
  return { data, status, error, notFound, reload };
}
