/** One habit's week: `days` is seven booleans, Monday first; `done_count` is how many are true. */
export type WeeklyHabit = { id: string; name: string; days: boolean[]; done_count: number };

/** `GET /habits/weekly-summary/`. Dates are `YYYY-MM-DD` calendar days of the user's week (Monday to Sunday). */
export type WeeklySummary = { week_start: string; week_end: string; today: string; habits: WeeklyHabit[] };

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
