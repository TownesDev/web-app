import { render, screen, within } from '@testing-library/react'
import MaintenanceCover from '../MaintenanceCover'
import {
  getMaintenanceMetadata,
  HOLDING_MESSAGE,
  isMaintenanceMode,
} from '@/lib/maintenance'

describe('maintenance holding page', () => {
  const originalMaintenanceMode = process.env.MAINTENANCE_MODE

  afterEach(() => {
    if (originalMaintenanceMode === undefined) {
      delete process.env.MAINTENANCE_MODE
    } else {
      process.env.MAINTENANCE_MODE = originalMaintenanceMode
    }
  })

  it('renders only the approved holding content and Donovan link', () => {
    render(<MaintenanceCover />)

    const main = screen.getByRole('main')
    const holdingPage = within(main)

    expect(
      holdingPage.getByRole('heading', { level: 1, name: 'TownesDev' })
    ).toBeInTheDocument()
    expect(holdingPage.getByText(HOLDING_MESSAGE)).toBeInTheDocument()
    expect(
      holdingPage.getByRole('link', { name: 'View Donovan Townes' })
    ).toHaveAttribute('href', 'https://donovantownes.dev')
    expect(holdingPage.getAllByRole('link')).toHaveLength(1)
  })

  it('contains no legacy commercial, contact, tester, checkout, or signup controls', () => {
    render(<MaintenanceCover />)

    const main = screen.getByRole('main')
    const text = main.textContent ?? ''

    expect(within(main).queryByRole('button')).not.toBeInTheDocument()
    expect(within(main).queryByRole('form')).not.toBeInTheDocument()
    expect(within(main).queryByRole('textbox')).not.toBeInTheDocument()
    expect(text).not.toMatch(/\$\s*\d|per month|setup fee/i)
    expect(text).not.toMatch(/tester|checkout|create (an|your) account/i)
    expect(text).not.toMatch(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)
    expect(text).not.toMatch(/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/)
  })

  it('enables noindex and nofollow only in maintenance mode', () => {
    process.env.MAINTENANCE_MODE = 'true'

    expect(isMaintenanceMode()).toBe(true)
    expect(getMaintenanceMetadata()).toMatchObject({
      robots: { index: false, follow: false },
    })

    process.env.MAINTENANCE_MODE = 'false'

    expect(isMaintenanceMode()).toBe(false)
    expect(getMaintenanceMetadata()).toEqual({})
  })
})
