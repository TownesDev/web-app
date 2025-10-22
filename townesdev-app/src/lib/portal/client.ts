// Portal-specific Sanity client utilities
// Only loaded in portal routes
import { createClient } from 'next-sanity'
import { unstable_noStore as noStore } from 'next/cache'

export const portalSanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // portal can use CDN for reads
  token: process.env.SANITY_READ_TOKEN, // read-only access
  perspective: 'published', // only published content
})

export async function runPortalQuery(
  query: string,
  params?: { [key: string]: unknown }
) {
  return portalSanityClient.fetch(query, params)
}

export async function runPortalQueryNoCache(
  query: string,
  params?: { [key: string]: unknown }
) {
  noStore()
  return portalSanityClient.fetch(query, params)
}
