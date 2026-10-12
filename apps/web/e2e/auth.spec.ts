import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function createAccount(request: APIRequestContext) {
  const email = uniqueEmail();
  const response = await request.post('/api/v1/auth/register/', { data: { email, password: PASSWORD } });
  expect(response.status()).toBe(201);
  return email;
}

async function signUp(page: Page, email: string, password = PASSWORD) {
  await page.goto('/register');
  await page.getByTestId('register-email-input').fill(email);
  await page.getByTestId('register-password-input').fill(password);
  await page.getByTestId('register-submit').click();
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit').click();
}

test.describe('register, sign in, sign out', () => {
  test('a new e-mail with an 8+ character password registers and lands on the home screen', async ({ page }) => {
    await signUp(page, uniqueEmail());
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('app-nav-settings')).toBeVisible();
  });

  test('registering with a taken e-mail shows the error under the e-mail field', async ({ page, request }) => {
    const email = await createAccount(request);
    await signUp(page, email);
    await expect(page.getByTestId('register-email-error')).toHaveText('Bu e-posta kullanımda.', { timeout: 30_000 });
    await expect(page.getByTestId('register-screen')).toBeVisible();
    await expect(page.getByTestId('register-password-error')).toHaveCount(0);
  });

  test('a short password is refused before the request, under the password field', async ({ page }) => {
    await signUp(page, uniqueEmail(), 'short');
    await expect(page.getByTestId('register-password-error')).toBeVisible();
    await expect(page.getByTestId('register-screen')).toBeVisible();
  });

  test('a wrong password shows a form error and stays on the sign-in screen', async ({ page, request }) => {
    const email = await createAccount(request);
    await signIn(page, email, 'not-the-password');
    await expect(page.getByTestId('login-form-error')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('the sign-in and sign-up screens link to each other', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-switch-link').click();
    await expect(page.getByTestId('register-screen')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('register-switch-link').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
  });

  test('opening Settings while signed out goes to the sign-in screen', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId('app-nav')).toHaveCount(0);
  });

  test('Settings shows the account e-mail; signing out returns to sign-in and Back does not reopen Settings', async ({ page, request }) => {
    const email = await createAccount(request);
    await signIn(page, email);
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });

    await page.getByTestId('app-nav-settings').click();
    await expect(page.getByTestId('settings-email')).toHaveText(email);

    await page.getByTestId('settings-logout').click();
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await expect(page.getByTestId('settings-screen')).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/settings$/);
    await page.goForward();
    await expect(page.getByTestId('settings-email')).toHaveCount(0);
  });

  test('a signed-in user stays signed in after a reload and can sign in again after signing out', async ({ page, request }) => {
    const email = await createAccount(request);
    await signIn(page, email);
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await page.goto('/settings');
    await expect(page.getByTestId('settings-email')).toHaveText(email, { timeout: 30_000 });
    await page.getByTestId('settings-logout').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await page.getByTestId('login-email-input').fill(email);
    await page.getByTestId('login-password-input').fill(PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
  });

  test('a visitor reaches sign-in and sign-up from the home screen header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('app-header-register').click();
    await expect(page.getByTestId('register-screen')).toBeVisible({ timeout: 30_000 });
    await page.getByTestId('app-header-login').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
  });

  test('a signed-in user does not see the sign-in links in the header', async ({ page }) => {
    await signUp(page, uniqueEmail());
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('app-header-login')).toHaveCount(0);
    await expect(page.getByTestId('app-header-register')).toHaveCount(0);
  });
});
