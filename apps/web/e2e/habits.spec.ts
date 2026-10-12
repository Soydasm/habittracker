import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `habits-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function createAccount(request: APIRequestContext) {
  const email = uniqueEmail();
  const response = await request.post('/api/v1/auth/register/', { data: { email, password: PASSWORD } });
  expect(response.status()).toBe(201);
  return { email, token: (await response.json()).data.access as string };
}

async function addHabitViaApi(request: APIRequestContext, token: string, name: string) {
  const response = await request.post('/api/v1/habits/', { data: { name }, headers: { Authorization: `Bearer ${token}` } });
  expect(response.status()).toBe(201);
}

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
}

test.describe('the habit list', () => {
  test('a user without habits sees the empty state and its button leads to the add form', async ({ page, request }) => {
    const { email } = await createAccount(request);
    await signIn(page, email);
    await expect(page.getByTestId('home-empty')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-empty')).toContainText('Henüz alışkanlığın yok');
    await expect(page.getByTestId('home-empty-add')).toHaveText('İlk alışkanlığını ekle');
    await expect(page.getByTestId('habit-card')).toHaveCount(0);
    await page.getByTestId('home-empty-add').click();
    await expect(page.getByTestId('habit-new-screen')).toBeVisible();
  });

  test('adding "Kitap oku" returns to the list with its card', async ({ page, request }) => {
    const { email, token } = await createAccount(request);
    await addHabitViaApi(request, token, 'Eski alışkanlık');
    await signIn(page, email);
    await expect(page.getByTestId('home-list')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('home-add').click();
    await page.getByTestId('habit-form-name-input').fill('Kitap oku');
    await page.getByTestId('habit-new-submit').click();
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('habit-card')).toHaveCount(2);
    await expect(page.getByTestId('habit-card').first()).toContainText('Kitap oku');
    await expect(page.getByTestId('home-tracker-count')).toHaveText('2');
  });

  test('saving with an empty name shows the required error under the name field', async ({ page, request }) => {
    const { email } = await createAccount(request);
    await signIn(page, email);
    await page.getByTestId('home-empty-add').click();
    await page.getByTestId('habit-new-submit').click();
    await expect(page.getByTestId('habit-form-name-error')).toHaveText('Ad alanı zorunlu.');
    await expect(page.getByTestId('habit-new-screen')).toBeVisible();
    await page.getByTestId('habit-form-name-input').fill('   ');
    await page.getByTestId('habit-new-submit').click();
    await expect(page.getByTestId('habit-form-name-error')).toBeVisible();
  });

  test('pressing a card opens it; renaming shows the new name in the list', async ({ page, request }) => {
    const { email, token } = await createAccount(request);
    await addHabitViaApi(request, token, 'Kitap oku');
    await signIn(page, email);
    await page.getByTestId('habit-card').click();
    await expect(page.getByTestId('habit-detail-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('habit-form-name-input')).toHaveValue('Kitap oku');
    await page.getByTestId('habit-form-name-input').fill('Roman oku');
    await page.getByTestId('habit-edit-submit').click();
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('habit-card')).toHaveCount(1);
    await expect(page.getByTestId('habit-card-name')).toHaveText('Roman oku');
  });

  test('deleting asks first; after confirming the card is gone and the user is told', async ({ page, request }) => {
    const { email, token } = await createAccount(request);
    await addHabitViaApi(request, token, 'Kitap oku');
    await addHabitViaApi(request, token, 'Su iç');
    await signIn(page, email);
    await page.getByTestId('habit-card').filter({ hasText: 'Kitap oku' }).click();
    await page.getByTestId('habit-delete').click();
    await expect(page.getByTestId('habit-delete-confirm')).toBeVisible();
    // changing one's mind keeps the habit
    await page.getByTestId('habit-delete-no').click();
    await expect(page.getByTestId('habit-delete-confirm')).toHaveCount(0);
    await page.getByTestId('habit-delete').click();
    await page.getByTestId('habit-delete-yes').click();
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('home-notice')).toContainText('Alışkanlık silindi');
    await expect(page.getByTestId('habit-card')).toHaveCount(1);
    await expect(page.getByTestId('habit-card-name')).toHaveText('Su iç');
  });

  test("another user's habits are not in the list, and opening one by its address finds nothing", async ({ page, request }) => {
    const a = await createAccount(request);
    await addHabitViaApi(request, a.token, 'Sadece A');
    const list = await request.get('/api/v1/habits/', { headers: { Authorization: `Bearer ${a.token}` } });
    const habitId = (await list.json()).data.results[0].id as string;

    const b = await createAccount(request);
    await signIn(page, b.email);
    await expect(page.getByTestId('home-empty')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Sadece A')).toHaveCount(0);
    await page.goto(`/habits/${habitId}`);
    await expect(page.getByTestId('habit-notfound')).toBeVisible({ timeout: 30_000 });
  });

  test('a failing request shows the error state and retry brings the list back', async ({ page, request }) => {
    const { email, token } = await createAccount(request);
    await addHabitViaApi(request, token, 'Kitap oku');
    await signIn(page, email);
    await expect(page.getByTestId('home-list')).toBeVisible({ timeout: 30_000 });
    await page.route(/\/api\/v1\/habits\/\?/, (route) => route.abort());
    await page.goto('/');
    await expect(page.getByTestId('home-error')).toBeVisible({ timeout: 30_000 });
    await page.unroute(/\/api\/v1\/habits\/\?/);
    await page.getByTestId('home-retry').click();
    await expect(page.getByTestId('habit-card')).toHaveCount(1);
  });

  test('a visitor who is not signed in has no habit list, and /habits/new asks them to sign in', async ({ page }) => {
    await page.goto('/habits/new');
    await expect(page.getByTestId('welcome-screen')).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('the home screen at 390 px matches the design', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const scheme of ['light', 'dark'] as const) {
    test(`${scheme}: slide, day strip and check block use the Figma colours and shapes`, async ({ page, request }) => {
      const { email, token } = await createAccount(request);
      await addHabitViaApi(request, token, 'Kitap oku');
      await page.emulateMedia({ colorScheme: scheme });
      await signIn(page, email);
      await expect(page.getByTestId('habit-card')).toBeVisible({ timeout: 30_000 });
      const dark = scheme === 'dark';

      await expect(page.getByTestId('home-screen')).toHaveCSS('background-color', dark ? 'rgb(43, 38, 48)' : 'rgb(223, 226, 236)');
      await expect(page.getByTestId('app-header')).toHaveCSS('background-color', dark ? 'rgb(54, 56, 67)' : 'rgb(255, 255, 255)');
      const card = page.getByTestId('habit-card');
      await expect(card).toHaveCSS('background-color', dark ? 'rgb(54, 56, 67)' : 'rgb(255, 255, 255)');
      await expect(card).toHaveCSS('border-top-left-radius', '20px');
      const box = await card.boundingBox();
      expect(box?.width).toBeCloseTo(358, 0);
      expect(box?.height).toBeGreaterThanOrEqual(58);
      expect(box?.height).toBeLessThanOrEqual(64);

      const today = page.getByTestId('home-day-today');
      await expect(today).toHaveCSS('background-color', 'rgb(158, 109, 251)'); // #9e6dfb
      await expect(page.getByTestId('home-day')).toHaveCount(9);
      await expect(page.getByTestId('home-day').nth(0)).toHaveCSS('background-color', dark ? 'rgb(54, 56, 67)' : 'rgb(139, 127, 163)');
      await expect(page.getByTestId('home-day').nth(8)).toHaveCSS('background-color', dark ? 'rgb(86, 86, 86)' : 'rgb(160, 160, 160)');
      const todayBox = await today.boundingBox();
      expect(todayBox?.width).toBe(30);
      expect(todayBox?.height).toBe(49);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
