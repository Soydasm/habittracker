/**
 * Who may open what, and where the others are sent. This is the one place that names those targets: the shell
 * asks `redirectFor` on every navigation and no screen redirects on its own.
 */
export const WELCOME_ROUTE = '/welcome';
export const LOGIN_ROUTE = '/login';
export const REGISTER_ROUTE = '/register';
export const HOME_ROUTE = '/';
export const SETTINGS_ROUTE = '/settings';

/** Open to everyone. Every other route needs a signed-in user; a visitor is sent to the welcome screen instead. */
const PUBLIC_ROUTES: readonly string[] = [WELCOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE, '/ui-kit'];
/** Only for people who are not signed in: a signed-in user is sent on to the home screen. */
const GUEST_ONLY_ROUTES: readonly string[] = [WELCOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE];

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

/** The route to replace `pathname` with, or null when the user may stay. */
export function redirectFor(pathname: string, status: AuthStatus): string | null {
  if (status === 'loading') return null;
  if (status === 'signedOut' && !PUBLIC_ROUTES.includes(pathname)) return WELCOME_ROUTE;
  if (status === 'signedIn' && GUEST_ONLY_ROUTES.includes(pathname)) return HOME_ROUTE;
  return null;
}
