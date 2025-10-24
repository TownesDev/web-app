import { ReactNode } from 'react'
import '../globals.css'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import ClientSidebar from '../../components/ClientSidebar'
import { getCurrentClient } from '../../lib/auth'
import { redirect } from 'next/navigation'

export default async function PortalLayout({
  children,
}: {
  children: ReactNode
}) {
  const client = await getCurrentClient()

  if (!client) {
    redirect('/auth/signin')
  }

  // Gate access until onboarding is completed and subscription is active
  if (client && client.onboardingStatus !== 'completed') {
    redirect('/app/onboarding')
  }
  if (client && client.onboardingStatus === 'completed' && !client.hasActiveSubscription) {
    redirect('/app/plans')
  }

  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <Header variant="portal" />
      <div className="flex flex-1">
        <ClientSidebar />
        <main id="main-content" className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
      <Footer variant="portal" />
    </div>
  )
}
