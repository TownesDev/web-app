// Portal client - optimized for user-sensitive data
import { createClient } from 'next-sanity'
import { unstable_noStore as noStore } from 'next/cache'
import { previewClient } from '../../sanity/lib/client'

/**
 * Portal client optimized for user dashboard data
 * - No CDN to ensure fresh user-specific data
 * - Designed for no-cache/fresh fetches
 * - Used for client-specific, sensitive information
 */
export const portalSanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // Always fresh for user data
  token: process.env.SANITY_READ_TOKEN,
  perspective: 'published',
})

/**
 * Query helper for portal pages
 * Always bypasses cache for fresh user-sensitive data
 */
export async function runPortalQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  // Ensure no caching for user-sensitive data
  noStore()
  const client = preview ? previewClient : portalSanity
  return client.fetch(query, params)
}
