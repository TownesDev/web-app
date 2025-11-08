export interface StripePlanPriceConfig {
  productId: string
  monthlyPriceId: string
  setupPriceId?: string
}

export interface StripeCatalogEnvConfig {
  smallBusiness: {
    starter: StripePlanPriceConfig
    professional: StripePlanPriceConfig
    premium: StripePlanPriceConfig
  }
  discord: {
    community: StripePlanPriceConfig
    guild: StripePlanPriceConfig
    enterprise: StripePlanPriceConfig
  }
  musician: {
    soloArtist: StripePlanPriceConfig
    bandPro: StripePlanPriceConfig
    labelManagement: StripePlanPriceConfig
  }
}

export interface StripeEnvironmentConfig {
  secretKey: string
  publishableKey: string
  webhookSecret: string
  catalog: StripeCatalogEnvConfig
}

export const STRIPE_ENV_KEYS = [
  'STRIPE_PRODUCT_SMALL_BUSINESS_STARTER_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_STARTER_SETUP_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_STARTER_MONTHLY_ID',
  'STRIPE_PRODUCT_SMALL_BUSINESS_PROFESSIONAL_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_PROFESSIONAL_SETUP_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_PROFESSIONAL_MONTHLY_ID',
  'STRIPE_PRODUCT_SMALL_BUSINESS_PREMIUM_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_PREMIUM_SETUP_ID',
  'STRIPE_PRICE_SMALL_BUSINESS_PREMIUM_MONTHLY_ID',
  'STRIPE_PRODUCT_DISCORD_COMMUNITY_ID',
  'STRIPE_PRICE_DISCORD_COMMUNITY_MONTHLY_ID',
  'STRIPE_PRODUCT_DISCORD_GUILD_ID',
  'STRIPE_PRICE_DISCORD_GUILD_MONTHLY_ID',
  'STRIPE_PRODUCT_DISCORD_ENTERPRISE_ID',
  'STRIPE_PRICE_DISCORD_ENTERPRISE_MONTHLY_ID',
  'STRIPE_PRODUCT_MUSICIAN_SOLO_ARTIST_ID',
  'STRIPE_PRICE_MUSICIAN_SOLO_ARTIST_SETUP_ID',
  'STRIPE_PRICE_MUSICIAN_SOLO_ARTIST_MONTHLY_ID',
  'STRIPE_PRODUCT_MUSICIAN_BAND_PRO_ID',
  'STRIPE_PRICE_MUSICIAN_BAND_PRO_SETUP_ID',
  'STRIPE_PRICE_MUSICIAN_BAND_PRO_MONTHLY_ID',
  'STRIPE_PRODUCT_MUSICIAN_LABEL_MANAGEMENT_ID',
  'STRIPE_PRICE_MUSICIAN_LABEL_MANAGEMENT_SETUP_ID',
  'STRIPE_PRICE_MUSICIAN_LABEL_MANAGEMENT_MONTHLY_ID',
] as const

export type StripeEnvKey = (typeof STRIPE_ENV_KEYS)[number]
