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

  test('complete user flow: home → plans → auth redirect', async ({ page }) => {
    // Start from homepage
    await page.goto('/')
    await expect(page).toHaveTitle(/TownesDev/)

    // Navigate to plans page directly (no nav link in public header)
    await page.goto('/plans')
    await expect(page).toHaveURL(/.*plans/)
    await expect(page.locator('text=Choose Your Plan')).toBeVisible()

    // Try to access protected route (should redirect to auth)
    await page.goto('/app')
    await expect(page).toHaveURL(/.*signin/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('admin routes require authentication', async ({ page }) => {
    await page.goto('/admin')
    // Should redirect to signin
    await expect(page).toHaveURL(/.*signin/)
  })

  test('health endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('time')
  })
})
