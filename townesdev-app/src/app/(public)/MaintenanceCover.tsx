"use client"

import Image from 'next/image'
import { useState } from 'react'

export default function MaintenanceCover() {
  const [loading, setLoading] = useState(false)

  async function handleBypass() {
    setLoading(true)
    try {
      // Call bypass endpoint to set cookie then navigate to /app
      const res = await fetch('/api/maintenance/bypass?redirect=/app')
      if (res.redirected) {
        window.location.href = res.url
        return
      }
      // fallback
      window.location.href = '/app'
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
      <div className="relative z-10 max-w-2xl w-full mx-4 p-8 bg-white dark:bg-nile-blue-900 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-48 h-24 relative">
            <Image src="/townesdev_logo_sub_dark.svg" alt="TownesDev" fill className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-nile-blue-900 dark:text-white">TownesDev — Coming Soon</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl">
            We’re polishing things behind the scenes. If you were invited to test, click the tester button below to access the portal.
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleBypass}
              disabled={loading}
              className="px-5 py-2 bg-nile-blue-600 text-white rounded-md"
            >
              {loading ? 'Entering...' : 'Enter (Testers)'}
            </button>
            <a href="/plans" className="px-5 py-2 border rounded-md text-nile-blue-600">View Plans</a>
          </div>
        </div>
      </div>
    </div>
  )
}
