import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TownesDev/)
    await expect(page.locator('text=Code. Systems. Foundations.')).toBeVisible()
  })

  test('plans page loads', async ({ page }) => {
    await page.goto('/plans')
    await expect(page.locator('text=Choose Your Plan')).toBeVisible()
  })

  test('status page loads', async ({ page }) => {
    await page.goto('/status')
    await expect(page.locator('text=System Status')).toBeVisible()
  })

  test('brand page loads', async ({ page }) => {
    await page.goto('/brand')
    await expect(page.getByRole('heading', { name: 'TOWNESDEV' })).toBeVisible()
  })

  test('auth redirect works', async ({ page }) => {
    await page.goto('/app')
    // Should redirect to signin
    await expect(page).toHaveURL(/.*signin/)
  })
})
