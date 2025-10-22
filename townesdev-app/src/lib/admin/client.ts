// Admin-specific Sanity client utilities
// Only loaded in admin routes
import { createClient } from 'next-sanity'
import { unstable_noStore as noStore } from 'next/cache'

export const adminSanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // admin needs fresh data
  token: process.env.SANITY_WRITE_TOKEN, // full admin access
})

export const previewClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // Never use CDN for preview
  token: process.env.SANITY_AUTH_TOKEN, // Use auth token for draft access
  perspective: 'previewDrafts', // Enable draft content
})

export async function runAdminQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  const client = preview ? previewClient : adminSanityClient
  return client.fetch(query, params)
}

export async function runAdminQueryNoCache(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  noStore()
  const client = preview ? previewClient : adminSanityClient
  return client.fetch(query, params)
}
