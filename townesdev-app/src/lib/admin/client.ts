// Admin client - optimized for administrative operations
import { createClient } from 'next-sanity'
import { unstable_noStore as noStore } from 'next/cache'
import { previewClient } from '../../sanity/lib/client'

/**
 * Admin read client optimized for administrative data
 * - No CDN for fresh admin data
 * - Full read access with auth token
 * - Designed for admin-sensitive operations
 */
export const adminSanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false, // Always fresh for admin data
  token: process.env.SANITY_READ_TOKEN,
  perspective: 'published',
})

/**
 * Admin write client for mutations
 * - Write permissions for admin operations
 * - Always fresh, no CDN
 */
export const adminSanityWrite = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

/**
 * Query helper for admin pages
 * Always bypasses cache for fresh admin-sensitive data
 */
export async function runAdminQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  // Ensure no caching for admin-sensitive data
  noStore()
  const client = preview ? previewClient : adminSanity
  return client.fetch(query, params)
}

/**
 * Legacy alias for compatibility during transition
 * @deprecated Use runAdminQuery instead
 */
export const runQueryNoCache = runAdminQuery
