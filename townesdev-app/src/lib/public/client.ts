// Public pages client - optimized for caching and performance
import { createClient } from 'next-sanity'
import { previewClient } from '../../sanity/lib/client'

/**
 * Public client optimized for marketing pages
 * - CDN enabled for global performance
 * - Designed for cached, revalidated content
 * - Used with revalidate timers on public routes
 */
export const publicSanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // Optimal for public cached content
  perspective: 'published',
})

/**
 * Query helper for public pages
 * Uses default Next.js caching behavior with route-level revalidation
 */
export async function runPublicQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  const client = preview ? previewClient : publicSanity
  return client.fetch(query, params)
}
