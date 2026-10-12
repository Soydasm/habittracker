import { defineConfig } from '@playwright/test';
import { DEFAULT_LOCALE } from './src/i18n/config';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.WEB_URL ?? 'http://localhost:8081',
    headless: true,
    // the browser speaks the app's default language, so tests see what most users see
    locale: DEFAULT_LOCALE,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
