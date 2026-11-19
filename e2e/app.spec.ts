import { expect, test } from '@playwright/test';

test('the Dance Community page offers account creation', async ({ page }) => {
  await page.goto('/home');

  const createAccount = page.getByRole('link', { name: 'Create an account with Learn 2 Step' });
  await expect(createAccount).toBeVisible();
  await createAccount.click();

  await expect(page).toHaveURL(/\/create-account$/);
  await expect(page.getByRole('heading', { name: 'Your next step starts here.' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Display name / username')).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirm password')).toBeVisible();
});

test('the signup form reports required-field errors', async ({ page }) => {
  await page.goto('/create-account');
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByText('Enter your email address.')).toBeVisible();
  await expect(page.getByText('Choose a username.')).toBeVisible();
  await expect(page.getByText('Use at least 8 characters.')).toBeVisible();
});
