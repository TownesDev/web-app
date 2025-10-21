// server-only Sanity client
import { createClient } from 'next-sanity'
import { unstable_noStore as noStore } from 'next/cache'
import { previewClient } from '../sanity/lib/client'

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // public reads
  token: process.env.SANITY_READ_TOKEN, // ONLY set on the server when needed
  perspective: process.env.SANITY_READ_TOKEN ? 'published' : 'published',
  // enable stega if we want live-preview later
})

// Client with write permissions for mutations
export const sanityWrite = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // writes need fresh data
  token: process.env.SANITY_WRITE_TOKEN, // server-only write token for mutations
})

export async function runQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  const client = preview ? previewClient : sanity
  return client.fetch(query, params)
}

export async function runQueryNoCache(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  noStore()
  const client = preview ? previewClient : sanity
  return client.fetch(query, params)
}
