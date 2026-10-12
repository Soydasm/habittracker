import { test, expect } from '@playwright/test';

test('the home screen shows the greeting from the API', async ({ page }) => {
  await page.goto('/');
  // wait for the content state rather than a literal: the copy is translated, the testID is not
  await expect(page.getByTestId('hello-message')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('hello-message')).not.toBeEmpty();
});
