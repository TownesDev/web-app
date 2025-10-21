/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../../sanity.config'
import { getSEOConfig } from '../../../../sanity/lib/seo'

export const dynamic = 'force-static'

export { viewport } from 'next-sanity/studio'

export async function generateMetadata() {
  const seoConfig = await getSEOConfig()

  return {
    title: seoConfig?.siteTitle
      ? `${seoConfig.siteTitle} - Admin`
      : 'Sanity Studio',
    icons: {
      icon: seoConfig?.favicon?.asset?.url || '/favicon.ico',
    },
  }
}

export default function StudioPage() {
  return <NextStudio config={config} unstable_globalStyles />
}
