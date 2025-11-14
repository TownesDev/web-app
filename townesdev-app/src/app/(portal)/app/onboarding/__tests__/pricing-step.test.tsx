import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

jest.mock('@/lib/public/client', () => ({
  runPublicQuery: jest.fn(),
}))

beforeEach(() => {
  jest.resetAllMocks()
  // Make fetch fail so the component falls back to localStorage path
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.fetch = jest.fn().mockRejectedValue(new Error('no network')) as any
  localStorage.clear()
})

function seedLocalStorageAtPricingStep() {
  const progress = {
    basics: {
      name: 'Test Co',
      email: 'test@example.com',
      elevatorPitch: 'A short pitch here',
      vertical: 'other',
    },
    brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
    services: {
      basePlanId: 'plan.base-retainer',
      addons: [],
      oneTime: [],
      webApp: true,
      discord: false,
    },
    pricing: {
      selectedPlan: undefined,
    },
    web: { pages: ['home', 'about', 'contact'], domainIntent: '' },
    discord: { botName: '', intents: [], features: [] },
  }
  localStorage.setItem('onboarding-progress', JSON.stringify(progress))
  // Pricing is step index 3 (Basics, Brand, Services, Pricing)
  localStorage.setItem('onboarding-step', '3')
}

it('shows pricing step after services step', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: ['Basic hosting'],
      appliesTo: ['web'],
    },
  ])

  seedLocalStorageAtPricingStep()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  // Wait for pricing step to render
  await waitFor(() =>
    expect(screen.getByText(/Available Tiers/i)).not.toBeNull()
  )

  // Check that we're on step 4 (Pricing)
  expect(screen.getByText(/Step 4 of/i)).not.toBeNull()
  expect(screen.getAllByText(/Pricing/i).length).toBeGreaterThan(0)
})

it('filters plans based on web service selection', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: ['Basic hosting'],
      appliesTo: ['web'],
    },
    {
      _id: 'plan.discord-bronze',
      name: 'Discord Bronze',
      category: 'addon',
      price: '$15/mo',
      interval: 'month',
      description: 'Discord monitoring',
      features: ['Bot monitoring'],
      appliesTo: ['discord'],
    },
  ])

  seedLocalStorageAtPricingStep()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  await waitFor(() =>
    expect(screen.getByText(/Available Tiers/i)).not.toBeNull()
  )

  // Should show web plan
  expect(screen.getByText(/Web-App Starter/)).not.toBeNull()

  // Should NOT show discord plan (since webApp=true, discord=false)
  expect(screen.queryByText(/Discord Bronze/)).toBeNull()
})

it('shows all plans when both web and discord selected', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: ['Basic hosting'],
      appliesTo: ['web'],
    },
    {
      _id: 'plan.discord-bronze',
      name: 'Discord Bronze',
      category: 'addon',
      price: '$15/mo',
      interval: 'month',
      description: 'Discord monitoring',
      features: ['Bot monitoring'],
      appliesTo: ['discord'],
    },
  ])

  const progress = {
    basics: {
      name: 'Test Co',
      email: 'test@example.com',
      elevatorPitch: 'A short pitch here',
      vertical: 'other',
    },
    brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
    services: {
      basePlanId: 'plan.base-retainer',
      addons: [],
      oneTime: [],
      webApp: true,
      discord: true,
    },
    pricing: {
      selectedPlan: undefined,
    },
    web: { pages: ['home', 'about', 'contact'], domainIntent: '' },
    discord: { botName: 'Test Bot', intents: [], features: [] },
  }
  localStorage.setItem('onboarding-progress', JSON.stringify(progress))
  localStorage.setItem('onboarding-step', '3')

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  await waitFor(() =>
    expect(screen.getByText(/Available Tiers/i)).not.toBeNull()
  )

  // Should show both plans
  expect(screen.getByText(/Web-App Starter/)).not.toBeNull()
  expect(screen.getByText(/Discord Bronze/)).not.toBeNull()
})

it('allows selecting a plan', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: ['Basic hosting'],
      appliesTo: ['web'],
    },
  ])

  seedLocalStorageAtPricingStep()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  await waitFor(() =>
    expect(screen.getByText(/Available Tiers/i)).not.toBeNull()
  )

  // Click on the plan
  const planButton = screen.getByRole('button', { name: /Web-App Starter/i })
  fireEvent.click(planButton)

  // The button should now be pressed
  await waitFor(() =>
    expect(planButton.getAttribute('aria-pressed')).toBe('true')
  )

  // The "Save & Continue" button should be enabled
  const continueButton = screen.getByRole('button', { name: /Save & Continue/i })
  expect((continueButton as HTMLButtonElement).disabled).toBe(false)
})

it('validates that a plan must be selected', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: ['Basic hosting'],
      appliesTo: ['web'],
    },
  ])

  seedLocalStorageAtPricingStep()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  await waitFor(() =>
    expect(screen.getByText(/Available Tiers/i)).not.toBeNull()
  )

  // Try to continue without selecting a plan
  const continueButton = screen.getByRole('button', { name: /Save & Continue/i })
  
  // Button should be disabled
  expect((continueButton as HTMLButtonElement).disabled).toBe(true)
})
