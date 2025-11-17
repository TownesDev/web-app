import { NextResponse } from 'next/server'
import {
  fetchProducts,
  formatPrice,
  type TownesDevProduct,
} from '@/lib/stripe/products'

export const dynamic = 'force-dynamic'

/**
 * Transforms Stripe products into the format expected by the onboarding wizard
 */
function transformToOnboardingFormat(products: TownesDevProduct[]) {
  return products.map((product) => {
    // Format the monthly price
    const monthlyDisplay = product.monthlyPrice
      ? `${formatPrice(product.monthlyPrice.amount)}/mo`
      : null

    // Format the setup price (show in description or features)
    const setupDisplay = product.setupPrice
      ? `${formatPrice(product.setupPrice.amount)} setup`
      : null

    return {
      _id: product.id,
      name: product.name,
      category: 'addon' as const, // All products shown as selectable options
      price: monthlyDisplay,
      interval: 'month',
      description: product.description,
      features: product.features,
      hoursIncluded: 0,
      stripeProductId: product.id,
      stripePriceId: product.monthlyPrice?.id || null,
      setupPriceId: product.setupPrice?.id || null,
      setupPrice: setupDisplay,
      // Determine what services this plan applies to based on market
      appliesTo: ((): Array<'web' | 'discord'> => {
        switch (product.market) {
          case 'small-business':
          case 'musician':
            return ['web']
          case 'discord-bot':
            return ['discord']
          default:
            return []
        }
      })(),
      // Add market and tier for filtering
      market: product.market,
      tier: product.tier,
    }
  })
}

/**
 * GET /api/products - Fetch all active products from Stripe
 * Returns products formatted for the onboarding wizard
 */
export async function GET() {
  try {
    const products = await fetchProducts()
    const formatted = transformToOnboardingFormat(products)

    return NextResponse.json({
      success: true,
      products: formatted,
      count: formatted.length,
    })
  } catch (error) {
    console.error('Error in /api/products:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        products: [],
      },
      { status: 500 }
    )
  }
}
