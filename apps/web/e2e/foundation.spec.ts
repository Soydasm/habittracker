import { test, expect, type Locator } from '@playwright/test';

const style = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

test.describe('the navigation shell and the home screen', () => {
  test('the app name is at the top of the page and nothing links to /ui-kit', async ({ page }) => {
    // a visitor's "/" is the welcome screen (no header), so the shell is looked at on a public screen with one
    await page.goto('/login');
    await expect(page.getByTestId('app-header-name')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('app-header-name')).toHaveText('Alışkanlık Takipçisi');
    await expect(page.getByTestId('login-screen')).toBeVisible();
    // the name is above the page, not below it
    const header = await page.getByTestId('app-header').boundingBox();
    const home = await page.getByTestId('login-screen').boundingBox();
    expect(header && home && header.y < home.y).toBeTruthy();
    // no link anywhere (header, menu, home) points at the kit preview
    const hrefs = await page.getByRole('link').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => href.includes('ui-kit'))).toEqual([]);
  });

  test('the app follows the browser language: Turkish for a Turkish browser', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('app-header-name')).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
  });

  test.describe('an English browser', () => {
    test.use({ locale: 'en-US' });

    test('sees the app in English', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByTestId('app-header-name')).toHaveText('Habit Tracker', { timeout: 30_000 });
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    });
  });
});

test.describe('the design theme on /ui-kit at 390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('light: components use the Figma colours, text styles and radii', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/ui-kit');
    await expect(page.getByTestId('ui-kit')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('ui-kit')).toHaveCSS('background-color', 'rgb(223, 226, 236)'); // #dfe2ec

    const card = page.getByTestId('ui-kit-card');
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(card).toHaveCSS('border-top-left-radius', '20px');

    const button = page.getByTestId('ui-kit-button-primary');
    await expect(button).toHaveCSS('background-color', 'rgb(123, 97, 197)'); // #7b61c5
    await expect(button).toHaveCSS('min-height', '57px');
    expect(parseFloat(await style(button, 'border-top-left-radius'))).toBeGreaterThanOrEqual(28);

    const input = page.getByTestId('ui-kit-input');
    await expect(input).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(input).toHaveCSS('border-top-left-radius', '20px');
    await expect(input).toHaveCSS('font-size', '18px');

    const title = page.getByTestId('ui-kit-text-title');
    await expect(title).toHaveCSS('font-size', '30px');
    await expect(title).toHaveCSS('font-weight', '600');
    await expect(title).toHaveCSS('color', 'rgb(28, 23, 33)'); // #1c1721
    expect(await style(title, 'font-family')).toContain('Jost');
    await expect(page.getByTestId('ui-kit-text-display')).toHaveCSS('font-size', '48px');
    await expect(page.getByTestId('ui-kit-text-label')).toHaveCSS('letter-spacing', '2px');
  });

  test('dark: the device dark setting switches the components to the Figma dark colours', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/ui-kit');
    await expect(page.getByTestId('ui-kit')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('ui-kit')).toHaveCSS('background-color', 'rgb(43, 38, 48)'); // #2b2630
    await expect(page.getByTestId('ui-kit-card')).toHaveCSS('background-color', 'rgb(54, 56, 67)'); // #363843
    await expect(page.getByTestId('ui-kit-button-primary')).toHaveCSS('background-color', 'rgb(93, 71, 152)'); // #5d4798
    await expect(page.getByTestId('ui-kit-input')).toHaveCSS('background-color', 'rgb(54, 56, 67)');
    await expect(page.getByTestId('ui-kit-text-title')).toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  test('nothing overflows horizontally at 390 px', async ({ page }) => {
    await page.goto('/ui-kit');
    await expect(page.getByTestId('ui-kit')).toBeVisible({ timeout: 30_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
