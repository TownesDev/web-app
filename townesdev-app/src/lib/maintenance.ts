import type { Metadata } from 'next'

export const HOLDING_MESSAGE =
  'This site is being simplified. No services, subscriptions, or client sign-ups are currently offered here.'

export const MAINTENANCE_API_MESSAGE =
  'Public sign-ups and checkout are unavailable while the site is being simplified.'

export function isMaintenanceMode() {
  return process.env.MAINTENANCE_MODE === 'true'
}

export function getMaintenanceMetadata(): Metadata {
  if (!isMaintenanceMode()) return {}

  return {
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}
