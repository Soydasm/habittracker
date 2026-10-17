/** The public demo build (`EXPO_PUBLIC_DEMO=1`) and the account the backend's `seed_demo` command creates. */
export const DEMO = process.env.EXPO_PUBLIC_DEMO === '1' || process.env.EXPO_PUBLIC_DEMO === 'true';

export const DEMO_ACCOUNT = { email: 'demo@vibekaizen.com', password: 'demo1234' } as const;
