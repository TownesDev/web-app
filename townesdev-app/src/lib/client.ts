// server-only Sanity client
import { createClient } from 'next-sanity';

export const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // public reads
  token: process.env.SANITY_READ_TOKEN, // ONLY set on the server when needed
  perspective: process.env.SANITY_READ_TOKEN ? 'published' : 'published',
  // enable stega if we want live-preview later
});
