import { test, expect } from '@playwright/test'

const holdingMessage =
  'This site is being simplified. No services, subscriptions, or client sign-ups are currently offered here.'

const forbiddenSerializedContent = [
  'WHY START WITH TOWNESDEV?',
  'Small Business Plans',
  '$1,000',
  'Get In Touch',
  'Sweet Sunrise Bakery',
  'The Midnight Collective',
  'independent development studio',
  'mailto:',
  'tel:',
]

const heldRoutes = [
  '/',
  '/plans',
  '/pricing',
  '/contact',
  '/examples/bakery',
  '/examples/musician',
  '/get-started',
  '/auth/signup',
]

test.describe('maintenance mode', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health')
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.status).toBe('ok')
  })

  for (const route of heldRoutes) {
    test(`${route} exposes only the approved holding page`, async ({
      page,
    }) => {
      const response = await page.goto(route)

      expect(response?.status()).toBe(200)

      const main = page.getByRole('main')
      await expect(
        main.getByRole('heading', { level: 1, name: 'TownesDev' })
      ).toBeVisible()
      await expect(main.getByText(holdingMessage)).toBeVisible()
      await expect(
        main.getByRole('link', { name: 'View Donovan Townes' })
      ).toHaveAttribute('href', 'https://donovantownes.dev')
      await expect(main.getByRole('link')).toHaveCount(1)
      await expect(main.locator('form, input, button')).toHaveCount(0)
      await expect(main).not.toContainText('$275')
      await expect(main).not.toContainText('Enter (Testers)')
      await expect(main).not.toContainText('Continue to checkout')
      await expect(main).not.toContainText('Create your account')
      await expect(page).toHaveTitle('TownesDev')
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        holdingMessage
      )

      const serializedHtml = await page.content()
      for (const legacyContent of forbiddenSerializedContent) {
        expect(serializedHtml, legacyContent).not.toContain(legacyContent)
      }

      const robots = await page
        .locator('meta[name="robots"]')
        .getAttribute('content')
      expect(robots).toContain('noindex')
      expect(robots).toContain('nofollow')
    })
  }

  test('legacy public submissions are unavailable', async ({ request }) => {
    for (const endpoint of [
      '/api/auth/signup',
      '/api/checkout/plan',
      '/api/stripe/checkout',
    ]) {
      const response = await request.post(endpoint, { data: {} })

      expect(response.status(), endpoint).toBe(503)
      expect(response.headers()['x-robots-tag'], endpoint).toBe(
        'noindex, nofollow'
      )
    }
  })

  test('tester bypass no longer exists', async ({ request }) => {
    const response = await request.get('/api/maintenance/bypass')

    expect(response.status()).toBe(404)
  })
})
