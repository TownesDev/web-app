import type Stripe from 'stripe'
import { getStripeClient } from '../stripe'

/**
 * Product tier for categorization
 */
export type ProductTier =
  | 'starter'
  | 'professional'
  | 'premium'
  | 'community'
  | 'guild'
  | 'enterprise'
  | 'solo'
  | 'band'
  | 'label'

/**
 * Product market segment
 */
export type ProductMarket = 'small-business' | 'discord-bot' | 'musician'

/**
 * Normalized product structure for UI consumption
 */
export interface TownesDevProduct {
  id: string
  name: string
  market: ProductMarket
  tier: ProductTier
  description: string | null
  features: string[]
  monthlyPrice: {
    id: string
    amount: number
    currency: string
    lookupKey: string | null
  } | null
  setupPrice: {
    id: string
    amount: number
    currency: string
    lookupKey: string | null
  } | null
  metadata: Record<string, string>
}

/**
 * Map Stripe product name to market segment
 */
function getProductMarket(productName: string): ProductMarket {
  if (productName.includes('Small Business')) return 'small-business'
  if (productName.includes('Discord Bot')) return 'discord-bot'
  if (productName.includes('Musician')) return 'musician'
  return 'small-business' // fallback
}

/**
 * Map Stripe product name to tier
 */
function getProductTier(productName: string): ProductTier {
  const name = productName.toLowerCase()
  if (name.includes('starter') || name.includes('solo')) return 'starter'
  if (
    name.includes('professional') ||
    name.includes('band') ||
    name.includes('pro')
  )
    return 'professional'
  if (
    name.includes('premium') ||
    name.includes('label') ||
    name.includes('management')
  )
    return 'premium'
  if (name.includes('community')) return 'community'
  if (name.includes('guild')) return 'guild'
  if (name.includes('enterprise')) return 'enterprise'
  return 'starter' // fallback
}

/**
 * Extract features from product description or metadata
 */
function extractFeatures(product: Stripe.Product): string[] {
  // Try metadata first
  if (product.metadata.features) {
    try {
      return JSON.parse(product.metadata.features)
    } catch {
      // If not JSON, split by comma
      return product.metadata.features.split(',').map((f) => f.trim())
    }
  }

  // Fallback feature lists based on tier
  const name = product.name.toLowerCase()

  if (name.includes('small business')) {
    if (name.includes('starter')) {
      return [
        '1-3 page website',
        'Mobile optimized',
        'Contact forms',
        'Basic SEO',
      ]
    }
    if (name.includes('professional')) {
      return [
        'Full CMS integration',
        'Custom design',
        'SEO optimization',
        'Analytics dashboard',
      ]
    }
    if (name.includes('premium')) {
      return [
        'E-commerce ready',
        'Advanced integrations',
        '4-hour SLA',
        'Dedicated support',
      ]
    }
  }

  if (name.includes('discord bot')) {
    if (name.includes('community')) {
      return [
        'Welcome flows',
        'Basic moderation',
        'Community support',
        'Monthly updates',
      ]
    }
    if (name.includes('guild')) {
      return [
        'Multi-server support',
        'Role workflows',
        '48-hour response',
        'Priority updates',
      ]
    }
    if (name.includes('enterprise')) {
      return [
        'Custom features',
        'Unlimited servers',
        'Rapid response',
        'Dedicated channel',
      ]
    }
  }

  if (name.includes('musician')) {
    if (name.includes('solo') || name.includes('starter')) {
      return [
        'Artist profile page',
        'Streaming embeds',
        'Show calendar',
        'Contact form',
      ]
    }
    if (name.includes('band') || name.includes('pro')) {
      return [
        'Multi-page site',
        'Merch integration',
        'Mailing list',
        'Press kit',
      ]
    }
    if (name.includes('label') || name.includes('management')) {
      return [
        'Multi-artist platform',
        'Booking management',
        'Analytics',
        'Concierge support',
      ]
    }
  }

  return []
}

/**
 * Fetch all active products from Stripe with their prices
 * Returns normalized structure for easy UI consumption
 */
export async function fetchProducts(): Promise<TownesDevProduct[]> {
  try {
    const stripe = getStripeClient()

    // Fetch all active products with their prices
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    })

    const normalizedProducts: TownesDevProduct[] = []

    for (const product of products.data) {
      // Fetch all prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      })

      // Separate monthly recurring from one-time setup fees
      const monthlyPrice = prices.data.find(
        (p) => p.type === 'recurring' && p.recurring?.interval === 'month'
      )
      const setupPrice = prices.data.find((p) => p.type === 'one_time')

      normalizedProducts.push({
        id: product.id,
        name: product.name,
        market: getProductMarket(product.name),
        tier: getProductTier(product.name),
        description: product.description,
        features: extractFeatures(product),
        monthlyPrice: monthlyPrice
          ? {
              id: monthlyPrice.id,
              amount: monthlyPrice.unit_amount || 0,
              currency: monthlyPrice.currency,
              lookupKey: monthlyPrice.lookup_key || null,
            }
          : null,
        setupPrice: setupPrice
          ? {
              id: setupPrice.id,
              amount: setupPrice.unit_amount || 0,
              currency: setupPrice.currency,
              lookupKey: setupPrice.lookup_key || null,
            }
          : null,
        metadata: product.metadata,
      })
    }

    return normalizedProducts
  } catch (error) {
    console.error('Error fetching Stripe products:', error)
    throw new Error('Failed to fetch products from Stripe')
  }
}

/**
 * Get products filtered by market segment
 */
export async function fetchProductsByMarket(
  market: ProductMarket
): Promise<TownesDevProduct[]> {
  const allProducts = await fetchProducts()
  return allProducts.filter((p) => p.market === market)
}

/**
 * Get a single product by Stripe product ID
 */
export async function fetchProductById(
  productId: string
): Promise<TownesDevProduct | null> {
  const allProducts = await fetchProducts()
  return allProducts.find((p) => p.id === productId) || null
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100)
}
