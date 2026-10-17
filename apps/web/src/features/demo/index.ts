/**
 * The public demo build (`EXPO_PUBLIC_DEMO=1`): a banner on every screen saying the data is reset, and the demo
 * account's credentials on the sign-in screen. The backend's `seed_demo` command creates that account.
 */
export { DEMO, DEMO_ACCOUNT } from './config';
export { DemoBanner } from './DemoBanner';
export { DemoCredentials } from './DemoCredentials';
