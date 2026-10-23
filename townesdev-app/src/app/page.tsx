import type { Metadata } from 'next'
import PublicHome from './(public)/page'
import PublicLayout from './(public)/layout'
import { getMaintenanceMetadata } from '@/lib/maintenance'

export function generateMetadata(): Metadata {
  return getMaintenanceMetadata()
}

export default async function RootPage() {
  // Render the public layout so Header/Footer/preview banner are present
  return (
    <PublicLayout>
      <PublicHome />
    </PublicLayout>
  )
}
