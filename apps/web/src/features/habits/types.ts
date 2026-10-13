export type Habit = {
  id: string; name: string; created_at: string; checked_today: boolean; streak: number;
  /** The days (`YYYY-MM-DD`) the habit was marked, when the response carries them; `lib/streak` reads them. */
  check_days?: string[];
};

/** A list endpoint's `data`. */
export type Page<T> = { results: T[]; count: number; next: string | null; previous: string | null };

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
