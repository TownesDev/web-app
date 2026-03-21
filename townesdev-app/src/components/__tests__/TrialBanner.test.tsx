import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import TrialBanner from '../TrialBanner'

describe('TrialBanner', () => {
  it('renders trial mode message', () => {
    render(<TrialBanner />)
    expect(
      screen.getByText(/Trial mode - Subscribe to unlock full access/)
    ).toBeInTheDocument()
  })

  it('renders view plans link', () => {
    render(<TrialBanner />)
    const link = screen.getByRole('link', { name: /View Plans/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/pricing')
  })

  it('renders warning icon', () => {
    const { container } = render(<TrialBanner />)
    const icon = container.querySelector('svg[aria-hidden="true"]')
    expect(icon).toBeInTheDocument()
  })
})
