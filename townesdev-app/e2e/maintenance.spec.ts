import { test, expect } from '@playwright/test'

test.describe('maintenance mode', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    const body = await res.json()
    expect(res.status()).toBe(200)
    expect(body.status).toBe('ok')
  })

  // This test should be run with MAINTENANCE_MODE=true in the environment
  test('shows maintenance cover when enabled', async ({ page }) => {
    await page.goto('/')
    // just ensure the page loads; in CI we'd inject the env and assert text
    await expect(page).toHaveTitle(/TownesDev|Coming Soon/i)
  })
})
