import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `checks-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function setup(request: APIRequestContext, names: string[] = ['Kitap oku']) {
  const email = uniqueEmail();
  const registered = await request.post('/api/v1/auth/register/', { data: { email, password: PASSWORD } });
  expect(registered.status()).toBe(201);
  const token = (await registered.json()).data.access as string;
  for (const name of names) {
    const created = await request.post('/api/v1/habits/', { data: { name }, headers: { Authorization: `Bearer ${token}` } });
    expect(created.status()).toBe(201);
  }
  return { email, token };
}

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('habit-card').first()).toBeVisible({ timeout: 30_000 });
}

const isCheckCall = (suffix: 'check' | 'uncheck') => (response: { url(): string; request(): { method(): string } }) =>
  response.url().endsWith(`/${suffix}/`) && response.request().method() === 'POST';

test.describe('checking a habit for today', () => {
  test('pressing the box marks the card done and raises the streak; it survives a reload; pressing again undoes it', async ({ page, request }) => {
    const { email } = await setup(request);
    await signIn(page, email);
    const card = page.getByTestId('habit-card');
    const toggle = page.getByTestId('habit-card-check-toggle');
    await expect(card.getByTestId('habit-card-done')).toHaveCount(0);
    await expect(page.getByTestId('habit-card-streak')).toHaveText('0 gün');

    const checked = page.waitForResponse(isCheckCall('check'));
    await toggle.click();
    await expect(card.getByTestId('habit-card-done')).toHaveText('Yapıldı');
    await expect(page.getByTestId('habit-card-streak')).toHaveText('1 gün');
    expect((await checked).status()).toBe(200);

    await page.reload();
    await expect(page.getByTestId('habit-card-done')).toHaveText('Yapıldı', { timeout: 30_000 });
    await expect(page.getByTestId('habit-card-streak')).toHaveText('1 gün');

    const unchecked = page.waitForResponse(isCheckCall('uncheck'));
    await toggle.click();
    await expect(card.getByTestId('habit-card-done')).toHaveCount(0);
    await expect(page.getByTestId('habit-card-streak')).toHaveText('0 gün');
    expect((await unchecked).status()).toBe(200);

    await page.reload();
    await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('habit-card-done')).toHaveCount(0);
  });

  test('pressing the box does not open the habit, and each card keeps its own state', async ({ page, request }) => {
    const { email } = await setup(request, ['Su iç', 'Kitap oku']);
    await signIn(page, email);
    const books = page.getByTestId('habit-card').filter({ hasText: 'Kitap oku' });
    const response = page.waitForResponse(isCheckCall('check'));
    await books.getByTestId('habit-card-check-toggle').click();
    await response;
    await expect(books.getByTestId('habit-card-done')).toBeVisible();
    await expect(page.getByTestId('habit-card').filter({ hasText: 'Su iç' }).getByTestId('habit-card-done')).toHaveCount(0);
    await expect(page.getByTestId('home-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test('a card whose habit was checked yesterday and today shows a "2 gün" streak', async ({ page, request }) => {
    const { email } = await setup(request);
    await page.route(/\/api\/v1\/habits\/\?/, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.data.results = body.data.results.map((habit: object) => ({ ...habit, checked_today: true, streak: 2 }));
      await route.fulfill({ response, json: body });
    });
    await signIn(page, email);
    await expect(page.getByTestId('habit-card-streak')).toHaveText('2 gün');
    await expect(page.getByTestId('habit-card-done')).toHaveText('Yapıldı');
  });

  test('a network failure leaves the card as it was and shows an error', async ({ page, request }) => {
    const { email } = await setup(request);
    await signIn(page, email);
    await page.route(/\/api\/v1\/habits\/[^/]+\/check\/$/, (route) => route.abort());
    await page.getByTestId('habit-card-check-toggle').click();
    await expect(page.getByTestId('home-check-error')).toBeVisible();
    await expect(page.getByTestId('habit-card-done')).toHaveCount(0);
    await expect(page.getByTestId('habit-card-streak')).toHaveText('0 gün');
    // the box works again once the network does
    await page.unroute(/\/api\/v1\/habits\/[^/]+\/check\/$/);
    const response = page.waitForResponse(isCheckCall('check'));
    await page.getByTestId('habit-card-check-toggle').click();
    await response;
    await expect(page.getByTestId('habit-card-done')).toBeVisible();
    await expect(page.getByTestId('home-check-error')).toHaveCount(0);
  });

  test('the API refuses another user\'s habit and a signed-out caller', async ({ request }) => {
    const a = await setup(request);
    const list = await request.get('/api/v1/habits/', { headers: { Authorization: `Bearer ${a.token}` } });
    const id = (await list.json()).data.results[0].id as string;
    const b = await setup(request, []);
    const foreign = await request.post(`/api/v1/habits/${id}/check/`, { data: {}, headers: { Authorization: `Bearer ${b.token}` } });
    expect(foreign.status()).toBe(404);
    const anonymous = await request.post(`/api/v1/habits/${id}/check/`, { data: {} });
    expect(anonymous.status()).toBe(401);
  });
});

test.describe('the check block at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const scheme of ['light', 'dark'] as const) {
    test(`${scheme}: open and done states keep the card's size and the violet label`, async ({ page, request }) => {
      const { email } = await setup(request);
      await page.emulateMedia({ colorScheme: scheme });
      await signIn(page, email);
      const card = page.getByTestId('habit-card');
      const before = await card.boundingBox();
      expect(before?.width).toBeCloseTo(358, 0);
      const toggleBox = await page.getByTestId('habit-card-check-toggle').boundingBox();
      expect(toggleBox?.width).toBeGreaterThanOrEqual(44);
      expect(toggleBox?.height).toBeGreaterThanOrEqual(44);

      const response = page.waitForResponse(isCheckCall('check'));
      await page.getByTestId('habit-card-check-toggle').click();
      await response;
      await expect(page.getByTestId('habit-card-done')).toHaveCSS('color', 'rgb(158, 109, 251)');
      const after = await card.boundingBox();
      expect(after?.height).toBeCloseTo(before?.height ?? 0, 0);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
