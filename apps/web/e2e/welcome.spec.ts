import { test, expect, type APIRequestContext, type Page } from '@playwright/test';

const PASSWORD = 'correct-horse-9';
const uniqueEmail = () => `welcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

async function register(request: APIRequestContext) {
  const email = uniqueEmail();
  const response = await request.post('/api/v1/auth/register/', { data: { email, password: PASSWORD } });
  expect(response.status()).toBe(201);
  return email;
}

async function signIn(page: Page, email: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
}

test.describe('the welcome screen', () => {
  test('a visitor opening the main address sees the welcome screen with its pieces', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('welcome-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page.getByTestId('welcome-title')).toHaveText('Alışkanlık Takipçisi');
    await expect(page.getByTestId('welcome-illustration')).toBeVisible();
    await expect(page.getByTestId('welcome-dots')).toBeVisible();
    await expect(page.getByTestId('welcome-start')).toHaveAttribute('aria-label', 'Başlayalım!');
    await expect(page.getByTestId('welcome-skip')).toHaveText('Geç');
    // full-bleed: no shell header above it
    await expect(page.getByTestId('app-header')).toHaveCount(0);
  });

  test('the Start button opens the sign-up screen', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByTestId('welcome-start').click();
    await expect(page.getByTestId('register-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/register$/);
  });

  test('Skip opens the sign-in screen', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByTestId('welcome-skip').click();
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test('a signed-in user opening the welcome address lands on the home list', async ({ page, request }) => {
    await signIn(page, await register(request));
    await page.goto('/welcome');
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('welcome-screen')).toHaveCount(0);
  });

  test('after signing up the user never sees the welcome screen again', async ({ page }) => {
    await page.goto('/welcome');
    await page.getByTestId('welcome-start').click();
    await page.getByTestId('register-email-input').fill(uniqueEmail());
    await page.getByTestId('register-password-input').fill(PASSWORD);
    await page.getByTestId('register-submit').click();
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await page.goto('/');
    await expect(page.getByTestId('home-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('welcome-screen')).toHaveCount(0);
  });
});

test.describe('the welcome screen at 390 px follows the device setting', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('light: the Figma gradient colours, white title, 271 px pill button', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/welcome');
    await expect(page.getByTestId('welcome-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('welcome-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.getByTestId('welcome-title')).toHaveCSS('font-size', '30px');
    await expect(page.getByTestId('welcome-tagline')).toHaveCSS('color', 'rgb(255, 255, 255)');
    const button = page.getByTestId('welcome-start');
    await expect(button).toHaveCSS('background-color', 'rgb(123, 97, 197)'); // #7b61c5
    const box = await button.boundingBox();
    expect(box && Math.round(box.width)).toBe(272);
    expect(box && Math.round(box.height)).toBe(57);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test('dark: the Figma dark colours', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/welcome');
    await expect(page.getByTestId('welcome-screen')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('welcome-start')).toHaveCSS('background-color', 'rgb(93, 71, 152)'); // #5d4798
    await expect(page.getByTestId('welcome-tagline')).toHaveCSS('color', 'rgba(255, 255, 255, 0.5)');
    await expect(page.getByTestId('welcome-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
  });
});
