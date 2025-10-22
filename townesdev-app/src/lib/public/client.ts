// Public-only utilities - no Sanity imports!
// This keeps the shared bundle clean for public pages
export async function runPublicQuery(
  query: string,
  params?: { [key: string]: unknown }
) {
  // Dynamically import Sanity only when needed
  const { createClient } = await import('next-sanity')

  const publicClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: true, // public pages can use CDN
    // No token needed for public content
    perspective: 'published',
  })

  return publicClient.fetch(query, params)
}
