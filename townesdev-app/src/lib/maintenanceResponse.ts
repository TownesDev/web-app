import { NextResponse } from 'next/server'
import { MAINTENANCE_API_MESSAGE } from './maintenance'

export function maintenanceUnavailableResponse() {
  return NextResponse.json(
    { error: MAINTENANCE_API_MESSAGE },
    {
      status: 503,
      headers: {
        'Retry-After': '3600',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  )
}
