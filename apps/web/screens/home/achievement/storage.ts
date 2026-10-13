/**
 * Whether this user has closed the 200-day celebration on this device. Kept in the browser's `localStorage`, under
 * a key of its own per user, so two accounts on one device do not see each other's answer.
 */
export const achievementKey = (days: number, userId: string) => `home:achievement-dismissed:${days}:${userId}`;

export function wasDismissed(days: number, userId: string): boolean {
  try {
    return window.localStorage.getItem(achievementKey(days, userId)) === '1';
  } catch {
    return false;
  }
}

export function rememberDismissed(days: number, userId: string): void {
  try {
    window.localStorage.setItem(achievementKey(days, userId), '1');
  } catch {
    // Storage blocked (private mode): the celebration then comes back on the next visit, which is harmless.
  }
}
