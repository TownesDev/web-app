import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'

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

function seedLocalStorage() {
  const progress = {
    basics: {
      name: 'Test Co',
      email: 'test@example.com',
      elevatorPitch: 'A short pitch here',
      vertical: 'other',
    },
    brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
    services: {
      basePlanId: undefined,
      addons: [],
      oneTime: [],
      webApp: true,
      discord: false,
    },
    web: { pages: ['home', 'about', 'contact'], domainIntent: '' },
    discord: { botName: '', intents: [], features: [] },
  }
  localStorage.setItem('onboarding-progress', JSON.stringify(progress))
  // Services is step index 2 (Basics, Brand, Services)
  localStorage.setItem('onboarding-step', '2')
}

it('uses Sanity plans and auto-selects first base plan when available', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.base-a',
      name: 'Base A',
      category: 'base',
      price: '$100/mo',
      interval: 'month',
      description: 'A',
      features: ['one'],
      hoursIncluded: 2,
    },
    {
      _id: 'plan.base-b',
      name: 'Base B',
      category: 'base',
      price: '$200/mo',
      interval: 'month',
      description: 'B',
      features: ['two'],
      hoursIncluded: 4,
    },
  ])

  seedLocalStorage()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  // Wait for the base plan select to be populated and default selected
  await waitFor(() =>
    expect(screen.getByLabelText(/Base plan/i)).not.toBeNull()
  )

  const select = screen.getByLabelText(/Base plan/i) as HTMLSelectElement
  // should default to first base plan id
  await waitFor(() => expect(select.value).toBe('plan.base-a'))
})

it('falls back to fallback catalog when Sanity returns nothing', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockRejectedValueOnce(
    new Error('sanity down')
  )

  seedLocalStorage()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  // Fallback should include 'Base Retainer' from FALLBACK_PLAN_CATALOG
  await waitFor(() =>
    expect(screen.getAllByText(/Base Retainer/).length).toBeGreaterThan(0)
  )
})

it('shows web addons when webApp selected and hides discord addons', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting',
      features: [],
    },
    {
      _id: 'plan.discord-bronze',
      name: 'Discord Bronze',
      category: 'addon',
      price: '$15/mo',
      interval: 'month',
      description: 'Discord monitoring',
      features: [],
    },
  ])

  seedLocalStorage()

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  // Wait for addons label to render
  await waitFor(() => expect(screen.getByText(/Add-ons/i)).not.toBeNull())

  // Web addon should be present
  expect(screen.getByText(/Web-App Starter/)).not.toBeNull()
  // Discord addon should not be shown since discord is not selected in seedLocalStorage
  expect(screen.queryByText(/Discord Bronze/)).toBeNull()
})

it('shows "No recurring plan" option and validates when hosting selected', async () => {
  const client = await import('@/lib/public/client')
  ;(client.runPublicQuery as jest.Mock).mockResolvedValueOnce([
    { _id: 'plan.base-a', name: 'Base A', category: 'base' },
  ])

  // seed local storage but with NO_PLAN_VALUE and webApp true
  const progress = {
    basics: {
      name: 'Test Co',
      email: 'test@example.com',
      elevatorPitch: 'A short pitch here',
      vertical: 'other',
    },
    brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
    services: {
      basePlanId: '__none__',
      addons: [],
      oneTime: [],
      webApp: true,
      discord: false,
    },
    web: { pages: ['home', 'about', 'contact'], domainIntent: '' },
    discord: { botName: '', intents: [], features: [] },
  }
  localStorage.setItem('onboarding-progress', JSON.stringify(progress))
  localStorage.setItem('onboarding-step', '2')

  const { default: OnboardingPage } = await import('../page')

  render(<OnboardingPage />)

  // Wait for base plan select
  await waitFor(() =>
    expect(screen.getByLabelText(/Base plan/i)).not.toBeNull()
  )

  // Ensure the no-plan option exists
  expect(screen.getByText(/No recurring plan/i)).not.toBeNull()

  // The next button should be enabled because NO_PLAN_VALUE is now accepted even when webApp is selected
  const next = screen.getByRole('button', { name: /Save & Continue/i })
  expect((next as HTMLButtonElement).disabled).toBe(false)
})
