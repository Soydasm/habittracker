/**
 * The user's streak and points, worked out in the client from the habits' check records.
 *
 * A habit's records are its `check_days` (local `YYYY-MM-DD` days) when the response carries them. The list
 * endpoint does not send them today, so a habit without them is read from what it does send: `streak` days
 * in a row ending today (when `checked_today`) or yesterday. The two readings agree for the server's own
 * streak rule, so the same function serves both.
 */

/** The streak (in days) from which the home screen is in its "next achievement" state. */
export const MAIN_STATE_DAYS = 200;
/** The achievement the design shows next, fixed text: not worked out from the streak. */
export const NEXT_ACHIEVEMENT_DAYS = 200;

type Records = { check_days?: string[]; checked_today: boolean; streak: number };

const pad = (n: number) => String(n).padStart(2, '0');

/** `YYYY-MM-DD` of a date in the device's calendar. */
export const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const shift = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The days one habit was marked. */
export function checkDaysOf(habit: Records, today: Date): Set<string> {
  if (habit.check_days) return new Set(habit.check_days);
  const last = habit.checked_today ? today : shift(today, -1);
  return new Set(Array.from({ length: habit.streak }, (_, i) => dayKey(shift(last, -i))));
}

/**
 * Consecutive days, ending today or — while today is still open — yesterday, on which the user marked at least
 * one habit.
 */
export function streakOf(habits: Records[], today: Date): number {
  const marked = new Set<string>();
  habits.forEach((habit) => checkDaysOf(habit, today).forEach((day) => marked.add(day)));
  let day = marked.has(dayKey(today)) ? today : shift(today, -1);
  let count = 0;
  while (marked.has(dayKey(day))) {
    count += 1;
    day = shift(day, -1);
  }
  return count;
}

/** One point for every two days of streak. */
export const pointsOf = (streak: number) => Math.floor(streak / 2);

/** Marks (or unmarks) today in a habit's records; a habit without records stays without. */
export function withToday(habit: { check_days?: string[] }, today: Date, marked: boolean): string[] | undefined {
  if (!habit.check_days) return undefined;
  const key = dayKey(today);
  const rest = habit.check_days.filter((day) => day !== key);
  return marked ? [...rest, key] : rest;
}
