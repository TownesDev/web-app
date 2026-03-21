import { ReactNode } from 'react'
import { getCurrentClient } from '../../../lib/auth'
import { redirect } from 'next/navigation'
import TrialBanner from '../../../components/TrialBanner'

export const dynamic = 'force-dynamic'

/**
 * Portal app layout - handles subscription gating and trial mode notifications
 * Works in conjunction with middleware.ts for route protection
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const client = await getCurrentClient()

  // If no client found, this should have been caught by parent layout
  // but handle gracefully
  if (!client) {
    redirect('/auth/signin')
  }

  return (
    <>
      {/* Show trial banner if no active subscription */}
      {client.hasActiveSubscription === false && <TrialBanner />}
      {children}
    </>
  )
}
