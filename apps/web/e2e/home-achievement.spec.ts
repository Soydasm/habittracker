import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `win-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
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

/** One account with one habit for the whole file (sign-up is throttled); each test is a fresh browser context. */
let account: Promise<{ token: string; id: string }> | null = null;
function setup(request: APIRequestContext) {
  account ??= (async () => {
    const registered = await request.post('/api/v1/auth/register/', { data: { email: uniqueEmail(), password: PASSWORD } });
    expect(registered.status()).toBe(201);
    const body = (await registered.json()).data;
    const created = await request.post('/api/v1/habits/', {
      data: { name: 'Kitap oku' }, headers: { Authorization: `Bearer ${body.access}` },
    });
    expect(created.status()).toBe(201);
    return { token: body.access as string, id: body.user.id as string };
  })();
  return account;
}

/** The habits response, with every habit carrying these check records (the 200-day record of the brief). */
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

async function open(page: Page, token: string) {
  await page.addInitScript((value) => window.localStorage.setItem('auth.token', value), token);
  await page.goto('/');
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
}

const modal = (page: Page) => page.getByTestId('home-achievement-modal');

test.describe('the 200-day celebration', () => {
  test('opens over the home screen with the title and the "Yay!" button, focus on the button', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(200, -1));
    await open(page, token);
    await expect(modal(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-achievement-modal-title')).toHaveText('Başarı kilidi açıldı!');
    await expect(page.getByTestId('home-achievement-modal-days')).toHaveText('200 gün');
    await expect(page.getByTestId('home-achievement-modal-points')).toHaveText('100 puan');
    await expect(page.getByTestId('home-achievement-dismiss')).toHaveText('Yaşasın!');
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(page.getByTestId('home-achievement-dismiss')).toBeFocused();
  });

  test('"Yay!" closes it and the counter, the points and the list stay', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(200, -1));
    await open(page, token);
    await expect(modal(page)).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('home-achievement-dismiss').click();
    await expect(modal(page)).toHaveCount(0);
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200');
    await expect(page.getByTestId('home-achievement-points')).toHaveText('100 puan');
    await expect(page.getByTestId('habit-card')).toBeVisible();
    // The user goes on marking: the toggle is reachable and works.
    const response = page.waitForResponse((r) => r.url().endsWith('/check/') && r.request().method() === 'POST');
    await page.getByTestId('habit-card-check-toggle').click();
    expect((await response).status()).toBe(200);
    await expect(page.getByTestId('habit-card-done')).toHaveText('Yapıldı');
    await expect(modal(page)).toHaveCount(0);
  });

  test('Esc closes it', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(200, -1));
    await open(page, token);
    await expect(modal(page)).toBeVisible({ timeout: 30_000 });
    await page.keyboard.press('Escape');
    await expect(modal(page)).toHaveCount(0);
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200');
  });

  test('a tap on the background closes it', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(200, -1));
    await open(page, token);
    await expect(modal(page)).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('home-achievement-backdrop').click({ position: { x: 20, y: 20 } });
    await expect(modal(page)).toHaveCount(0);
  });

  test('stays closed after a reload, kept per user on this device', async ({ page, request }) => {
    const { token, id } = await setup(request);
    await mockRecords(page, records(200, -1));
    await open(page, token);
    await expect(modal(page)).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('home-achievement-dismiss').click();
    await expect(modal(page)).toHaveCount(0);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), `home:achievement-dismissed:200:${id}`)).toBe('1');
    await page.reload();
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-tracker-count')).toHaveText('200');
    await expect(modal(page)).toHaveCount(0);
  });

  test('does not open below 200 days', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(199, -1));
    await open(page, token);
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await expect(modal(page)).toHaveCount(0);
  });
});

test.describe('the celebration at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('is a 378 px bottom sheet that follows the device theme', async ({ page, request }) => {
    const { token } = await setup(request);
    await mockRecords(page, records(200, -1));
    await page.emulateMedia({ colorScheme: 'light' });
    await open(page, token);
    const sheet = page.getByTestId('home-achievement-sheet');
    await expect(sheet).toBeVisible({ timeout: 30_000 });
    await expect(sheet).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const box = await sheet.boundingBox();
    expect(box?.width).toBeCloseTo(390, 0);
    expect(box?.height).toBeGreaterThan(340);
    expect(box?.height).toBeLessThan(400);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(844, 0);
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(sheet).toHaveCSS('background-color', 'rgb(54, 56, 67)');
    await expect(page.getByTestId('home-achievement-modal-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
