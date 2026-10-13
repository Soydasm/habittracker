import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `main-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const LIST = /\/api\/v1\/habits\/\?/;

const pad = (n: number) => String(n).padStart(2, '0');
/** `YYYY-MM-DD` of `offset` days from today, in the browser's (= this machine's) calendar. */
function day(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
/** `count` consecutive marked days, the last one `end` days from today (0 = today, -1 = yesterday). */
const records = (count: number, end: number) => Array.from({ length: count }, (_, i) => day(end - i));

/**
 * An account (registered once per kind: sign-up and sign-in share a throttle, and the whole suite stays under it)
 * and the token the app keeps for it.
 */
const accounts = new Map<string, Promise<string>>();
function setup(request: APIRequestContext, names: string[] = ['Kitap oku']) {
  const key = names.join('|');
  if (!accounts.has(key)) {
    accounts.set(key, (async () => {
      const registered = await request.post('/api/v1/auth/register/', { data: { email: uniqueEmail(), password: PASSWORD } });
      expect(registered.status()).toBe(201);
      const token = (await registered.json()).data.access as string;
      for (const name of names) {
        const created = await request.post('/api/v1/habits/', { data: { name }, headers: { Authorization: `Bearer ${token}` } });
        expect(created.status()).toBe(201);
      }
      return token;
    })());
  }
  return accounts.get(key) as Promise<string>;
}

/** The habits response, with every habit carrying these check records (and the `checked_today` they imply). */
async function mockRecords(page: Page, check_days: string[]) {
  await page.route(LIST, async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    const checked_today = check_days.includes(day(0));
    body.data.results = body.data.results.map((habit: object) => ({
      ...habit, check_days, checked_today, streak: check_days.length,
    }));
    await route.fulfill({ response, json: body });
  });
}

async function signIn(page: Page, token: string) {
  await page.addInitScript((value) => window.localStorage.setItem('auth.token', value), token);
  await page.goto('/');
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
}

const isCheckCall = (suffix: 'check' | 'uncheck') => (response: { url(): string; request(): { method(): string } }) =>
  response.url().endsWith(`/${suffix}/`) && response.request().method() === 'POST';

test.describe('the home screen at a 200-day streak', () => {
  test('shows the counter, the points, the next achievement and the habit list', async ({ page, request }) => {
    const token = await setup(request);
    await mockRecords(page, records(200, -1));
    await signIn(page, token);
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200');
    await expect(page.getByTestId('home-tracker')).toHaveAccessibleName('200 gün');
    await expect(page.getByTestId('home-days')).toBeVisible();
    await expect(page.getByTestId('home-day-today')).toBeVisible();
    await expect(page.getByTestId('home-achievement-title')).toHaveText('Sıradaki başarı:');
    await expect(page.getByTestId('home-achievement-goal')).toHaveText('200 gün');
    await expect(page.getByTestId('home-achievement-points')).toHaveText('100 puan');
  });

  test('marking an open habit for today shows it done, and the screen stays in this state', async ({ page, request }) => {
    const token = await setup(request);
    await mockRecords(page, records(200, -1));
    await signIn(page, token);
    await expect(page.getByTestId('habit-card-done')).toHaveCount(0);
    const response = page.waitForResponse(isCheckCall('check'));
    await page.getByTestId('habit-card-check-toggle').click();
    expect((await response).status()).toBe(200);
    await expect(page.getByTestId('habit-card-done')).toHaveText('Yapıldı');
    await expect(page.getByTestId('home-tracker-count')).toHaveText('201');
    await expect(page.getByTestId('home-achievement')).toBeVisible();
  });

  test('taking the mark back below 200 days returns the screen to the habit-count view', async ({ page, request }) => {
    const token = await setup(request);
    await mockRecords(page, records(200, 0));
    await signIn(page, token);
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200', { timeout: 30_000 });
    const response = page.waitForResponse(isCheckCall('uncheck'));
    await page.getByTestId('habit-card-check-toggle').click();
    expect((await response).status()).toBe(200);
    await expect(page.getByTestId('home-tracker-count')).toHaveText('1');
    await expect(page.getByTestId('home-tracker')).toHaveAccessibleName('1 alışkanlık');
    await expect(page.getByTestId('home-achievement')).toHaveCount(0);
    await expect(page.getByTestId('habit-card-done')).toHaveCount(0);
  });

  test('a streak of 199 days keeps the habit-count view', async ({ page, request }) => {
    const token = await setup(request);
    await mockRecords(page, records(199, -1));
    await signIn(page, token);
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-tracker-count')).toHaveText('1');
    await expect(page.getByTestId('home-achievement')).toHaveCount(0);
  });

  test('without habits the empty state shows, with no achievement block', async ({ page, request }) => {
    const token = await setup(request, []);
    await signIn(page, token);
    await expect(page.getByTestId('home-empty')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-achievement')).toHaveCount(0);
  });

  test('a failed load offers "Tekrar dene" and the list appears when the retry works', async ({ page, request }) => {
    const token = await setup(request);
    await signIn(page, token);
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await mockRecords(page, records(200, -1));
    await page.route(LIST, (route) => route.abort(), { times: 1 });
    await page.reload();
    await expect(page.getByTestId('home-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-retry')).toHaveText('Tekrar dene');
    const reloaded = page.waitForResponse((response) => LIST.test(response.url()));
    await page.getByTestId('home-retry').click();
    await reloaded;
    await expect(page.getByTestId('habit-card')).toBeVisible();
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200');
  });
});

test.describe('the 200-day home at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('follows the device theme without a reload and fits the width', async ({ page, request }) => {
    const token = await setup(request);
    await mockRecords(page, records(200, 0));
    await page.emulateMedia({ colorScheme: 'light' });
    await signIn(page, token);
    const card = page.getByTestId('home-achievement');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    expect((await card.boundingBox())?.width).toBeCloseTo(358, 0);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(card).toHaveCSS('background-color', 'rgb(54, 56, 67)');
    await expect(page.getByTestId('home-tracker-count')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
