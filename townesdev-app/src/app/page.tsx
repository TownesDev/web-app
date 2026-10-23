import type { Metadata } from 'next'
import PublicHome from './(public)/page'
import PublicLayout from './(public)/layout'
import MaintenanceCover from './(public)/MaintenanceCover'
import {
  getMaintenanceMetadata,
  isMaintenanceMode,
} from '@/lib/maintenance'

export function generateMetadata(): Metadata {
  return getMaintenanceMetadata()
}

export default async function RootPage() {
  if (isMaintenanceMode()) return <MaintenanceCover />

  // Render the public layout so Header/Footer/preview banner are present
  return (
    <PublicLayout>
      <PublicHome />
    </PublicLayout>
  )
}
