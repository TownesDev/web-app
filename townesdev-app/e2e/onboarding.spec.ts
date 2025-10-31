import { test, expect } from '@playwright/test'

test('onboarding -> review shows checkout CTA', async ({ page }) => {
  // Navigate to onboarding start
  await page.goto('/onboarding')

  // Basic sanity: page loads and has step navigation
  await expect(page.locator('text=Services')).toBeVisible({ timeout: 5000 })

  // Choose a base plan (if select exists)
  const planSelect = page.locator('select[name="basePlan"]')
  if (await planSelect.count()) {
    await planSelect.selectOption({ index: 1 })
  }

  // Proceed to next step (click Continue or Next button)
  const nextBtn = page.locator('button:has-text("Next")')
  if (await nextBtn.count()) await nextBtn.first().click()

  // Wait for Review step
  await expect(page.locator('text=Review')).toBeVisible({ timeout: 5000 })

  // Assert there is a Checkout or Continue to Checkout CTA
  const checkoutBtn = page.locator(
    'button:has-text("Checkout"), a:has-text("Checkout")'
  )
  await expect(checkoutBtn.first()).toBeVisible()
})
