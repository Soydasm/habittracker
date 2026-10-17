import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: process.env.WEB_URL ?? 'http://localhost:8081',
    headless: true,
    // the browser speaks Turkish, the language the specs' expected texts are written in
    locale: 'tr-TR',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
