import { client } from './client'

export interface SEOConfig {
  siteTitle?: string
  metaDescription?: string
  keywords?: string[]
  favicon?: {
    asset: {
      url: string
    }
  }
  ogImage?: {
    asset: {
      url: string
    }
  }
  twitterImage?: {
    asset: {
      url: string
    }
  }
  canonicalUrl?: string
  author?: string
  robots?: string
}

export async function getSEOConfig(): Promise<SEOConfig | null> {
  try {
    const seoConfig = await client.fetch(
      `*[_type == "seoConfig"][0]{
        ...,
        favicon{
          asset->
        },
        ogImage{
          asset->
        },
        twitterImage{
          asset->
        }
      }`
    )
    return seoConfig
  } catch (error) {
    console.error('Error fetching SEO config:', error)
    return null
  }
}