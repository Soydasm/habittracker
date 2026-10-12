import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../../api/client';
import { fetchMe } from './api';
import type { User } from './types';

/** The signed-in account from /auth/me/, with the request status the screen renders its four states from. */
export function useMe() {
  const [data, setData] = useState<User | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStatus('loading');
    setError(null);
    fetchMe()
      .then((user) => { setData(user); setStatus('succeeded'); })
      .catch((cause: unknown) => {
        setError(cause instanceof ApiError ? cause.message : String(cause));
        setStatus('failed');
      });
  }, []);

  useEffect(reload, [reload]);
  return { data, status, error, reload };
}
