import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ApiError } from '../../api/client';
import { checkHabit, fetchHabits, uncheckHabit } from './api';
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
  const [checkError, setCheckError] = useState(false);
  const pending = useRef(new Set<string>());

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

  const replace = useCallback((habit: Habit) => {
    setData((list) => (list ? list.map((item) => (item.id === habit.id ? habit : item)) : list));
  }, []);

  /**
   * Marks today done, or takes the mark back, and shows it at once. The server's answer replaces the guess; when
   * the request fails the card goes back to what it was and `checkError` says so. One request per habit at a time.
   */
  const toggle = useCallback((habit: Habit) => {
    if (pending.current.has(habit.id)) return;
    pending.current.add(habit.id);
    const next = !habit.checked_today;
    setCheckError(false);
    replace({ ...habit, checked_today: next, streak: Math.max(0, habit.streak + (next ? 1 : -1)) });
    (next ? checkHabit : uncheckHabit)(habit.id)
      .then(replace)
      .catch(() => { replace(habit); setCheckError(true); })
      .finally(() => { pending.current.delete(habit.id); });
  }, [replace]);

  return { data, status, error, reload, toggle, checkError };
}
