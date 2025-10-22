import { ReactNode } from 'react'
import '../globals.css'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { SanityLive } from '../../sanity/lib/live'
import { draftMode, cookies } from 'next/headers'
import { VisualEditingClient } from './visual-editing'
import MaintenanceCover from './MaintenanceCover'

async function PreviewBanner() {
  const { isEnabled } = await draftMode()

  if (!isEnabled) return null

  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
      Preview Mode - Viewing draft content
      <a
        href={`/api/draft-mode/disable?secret=${process.env.SANITY_PREVIEW_SECRET}`}
        className="inline ml-4 underline hover:no-underline"
      >
        Exit Preview
      </a>
    </div>
  )
}

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const maintenance = process.env.MAINTENANCE_MODE === 'true'
  const cookieStore = await cookies()
  const bypass = cookieStore.get('maintenance-bypass')?.value

  if (maintenance && bypass !== 'allow') {
    return <MaintenanceCover />
  }

  return (
    <div lang="en" className="min-h-screen flex flex-col">
      <PreviewBanner />
      <Header variant="public" />
      <main className="flex-grow">{children}</main>
      <Footer variant="public" />
      <SanityLive />
      <VisualEditingClient />
    </div>
  )
}
