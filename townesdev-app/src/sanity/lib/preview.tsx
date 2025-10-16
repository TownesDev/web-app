'use client'

import { LiveQueryProvider } from '@sanity/preview-kit'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_AUTH_TOKEN,
})

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  return (
    <LiveQueryProvider
      client={client}
      logger={console}
    >
      {children}
    </LiveQueryProvider>
  )
}