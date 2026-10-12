import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `weekly-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
const SUMMARY = /\/api\/v1\/habits\/weekly-summary\/$/;

async function setup(request: APIRequestContext, names: string[] = [], checkToday = false) {
  const email = uniqueEmail();
  const registered = await request.post('/api/v1/auth/register/', { data: { email, password: PASSWORD } });
  expect(registered.status()).toBe(201);
  const headers = { Authorization: `Bearer ${(await registered.json()).data.access as string}` };
  for (const name of names) {
    const created = await request.post('/api/v1/habits/', { data: { name }, headers });
    expect(created.status()).toBe(201);
    if (checkToday) {
      const checked = await request.post(`/api/v1/habits/${(await created.json()).data.id}/check/`, { data: {}, headers });
      expect(checked.status()).toBe(200);
    }
  }
  return { email };
}

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
}

test.describe('the weekly summary', () => {
  test('is reached from the menu and shows "1/7" with one filled day for a habit checked today', async ({ page, request }) => {
    const { email } = await setup(request, ['Kitap oku'], true);
    await signIn(page, email);
    await page.getByTestId('app-nav-weekly').click();
    await expect(page.getByTestId('weekly-screen')).toBeVisible();
    const row = page.getByTestId('weekly-row').filter({ hasText: 'Kitap oku' });
    await expect(row.getByTestId('weekly-row-count')).toHaveText('1/7', { timeout: 30_000 });
    await expect(row.getByTestId('weekly-day-done')).toHaveCount(1);
    await expect(row.getByTestId('weekly-day-open')).toHaveCount(6);
    await expect(row.getByTestId('weekly-day-name')).toHaveText(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']);
    await expect(row.getByTestId('weekly-day-today')).toHaveCount(1);

    await row.click();
    await expect(page.getByTestId('habit-detail-screen')).toBeVisible();
    await page.getByTestId('app-nav-list').click();
    await expect(page.getByTestId('home-screen')).toBeVisible();
  });

  test('three marked days show "3/7" and three filled days', async ({ page, request }) => {
    const { email } = await setup(request, ['Kitap oku']);
    await page.route(SUMMARY, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.data.habits = body.data.habits.map((habit: object) => ({
        ...habit, days: [true, false, true, false, true, false, false], done_count: 3,
      }));
      await route.fulfill({ response, json: body });
    });
    await signIn(page, email);
    await page.getByTestId('app-nav-weekly').click();
    await expect(page.getByTestId('weekly-row-count')).toHaveText('3/7', { timeout: 30_000 });
    await expect(page.getByTestId('weekly-day-done')).toHaveCount(3);
  });

  test('another user\'s habits are not shown', async ({ page, request }) => {
    await setup(request, ['Başkasının alışkanlığı'], true);
    const { email } = await setup(request, ['Benim alışkanlığım']);
    await signIn(page, email);
    await page.getByTestId('app-nav-weekly').click();
    await expect(page.getByTestId('weekly-row')).toHaveCount(1, { timeout: 30_000 });
    await expect(page.getByTestId('weekly-row-name')).toHaveText('Benim alışkanlığım');
    await expect(page.getByText('Başkasının alışkanlığı')).toHaveCount(0);
  });

  test('a user without habits sees the empty state with a button to the list', async ({ page, request }) => {
    const { email } = await setup(request);
    await signIn(page, email);
    await page.getByTestId('app-nav-weekly').click();
    await expect(page.getByTestId('weekly-empty')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('weekly-empty-list').click();
    await expect(page.getByTestId('home-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('a failed request shows the error and "Tekrar dene" loads it again', async ({ page, request }) => {
    const { email } = await setup(request, ['Su iç']);
    await signIn(page, email);
    await page.route(SUMMARY, (route) => route.abort());
    await page.getByTestId('app-nav-weekly').click();
    await expect(page.getByTestId('weekly-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('weekly-retry')).toHaveText('Tekrar dene');
    await page.unroute(SUMMARY);
    await page.getByTestId('weekly-retry').click();
    await expect(page.getByTestId('weekly-row')).toHaveCount(1);
    await expect(page.getByTestId('weekly-error')).toHaveCount(0);
  });

  test('the API answers 401 without a token', async ({ request }) => {
    expect((await request.get('/api/v1/habits/weekly-summary/')).status()).toBe(401);
  });
});
