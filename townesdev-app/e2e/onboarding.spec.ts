import { test, expect } from '@playwright/test'

test.describe('self-service onboarding and portal gating', () => {
  test('get-started flow reaches review with valid inputs', async ({
    page,
  }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null }),
      })
    })

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              _id: 'prod_small_business',
              name: 'Small Business Starter',
              price: '$199/mo',
              description: 'Starter plan',
              features: ['Hosting', 'Support'],
              setupPrice: '$399 one-time',
              market: 'small-business',
              tier: 'starter',
            },
          ],
        }),
      })
    })

    await page.goto('/get-started')

    await expect(
      page.getByRole('heading', { name: 'Get Started with TownesDev' })
    ).toBeVisible()

    await page.locator('input[type="text"]').first().fill('E2E User')
    await page
      .locator('input[type="email"]')
      .first()
      .fill('e2e.user@example.com')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Tell us about your business')).toBeVisible()
    await page.locator('input[type="text"]').first().fill('E2E Bakery')
    await page
      .locator('textarea')
      .first()
      .fill('We make handcrafted pastries for local events and shops.')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Your brand identity')).toBeVisible()
    await page
      .locator('input[type="url"]')
      .first()
      .fill('https://example.com/logo.png')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.getByRole('heading', { name: 'Choose your service' })
    ).toBeVisible()
    await page.getByRole('button', { name: /Small Business Website/i }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Select your plan')).toBeVisible()
    const firstPlanCard = page.getByRole('button', {
      name: /Small Business Starter/i,
    })
    await expect(firstPlanCard).toBeVisible()
    await firstPlanCard.click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText('Review & complete setup')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Complete Setup/i })
    ).toBeVisible()
  })

  test('checkout handoff posts signup and checkout then redirects', async ({
    page,
  }) => {
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null }),
      })
    })

    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              _id: 'prod_small_business',
              name: 'Small Business Starter',
              price: '$199/mo',
              description: 'Starter plan',
              features: ['Hosting', 'Support'],
              setupPrice: '$399 one-time',
              market: 'small-business',
              tier: 'starter',
            },
          ],
        }),
      })
    })

    let signupCalled = false
    let checkoutCalled = false

    await page.route('**/api/auth/signup', async (route) => {
      signupCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, userId: 'u1', clientId: 'c1' }),
      })
    })

    await page.route('**/api/stripe/checkout', async (route) => {
      checkoutCalled = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: '/get-started?checkout=mock_success',
        }),
      })
    })

    await page.goto('/get-started')

    await page.locator('input[type="text"]').first().fill('Checkout User')
    await page
      .locator('input[type="email"]')
      .first()
      .fill('checkout.user@example.com')
    await page.locator('input[type="password"]').first().fill('password123')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('input[type="text"]').first().fill('Checkout Bakery')
    await page
      .locator('textarea')
      .first()
      .fill('We handle catering and daily pastry subscriptions.')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: /Small Business Website/i }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: /Small Business Starter/i }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: /Complete Setup/i }).click()

    await expect.poll(() => signupCalled).toBeTruthy()
    await expect.poll(() => checkoutCalled).toBeTruthy()

    await expect(page).toHaveURL(/\/get-started\?checkout=mock_success/)
  })

  test('portal route redirects unauthenticated users to signin', async ({
    page,
  }) => {
    await page.goto('/app')
    await expect(page).toHaveURL(/\/auth\/signin/)
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })
})
