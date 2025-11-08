#!/usr/bin/env node

/**
 * Seed Plans & Services for launch roadmap offerings
 *
 * Usage:
 *  node sample-content/seed-plans-services.mjs
 *
 * Requires env (see .env.example for full list):
 *  - NEXT_PUBLIC_SANITY_PROJECT_ID
 *  - NEXT_PUBLIC_SANITY_DATASET
 *  - SANITY_AUTH_TOKEN (write)
 *  - STRIPE_* product & price IDs as defined in docs/stripe-products.md
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const REQUIRED_ENV_KEYS = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_AUTH_TOKEN',
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
]

const missingEnvKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key])
if (missingEnvKeys.length) {
  console.error('Missing required environment variables:')
  missingEnvKeys.forEach((key) => console.error(`  - ${key}`))
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
})

const stripeCatalog = {
  smallBusiness: {
    starter: {
      productId: process.env.STRIPE_PRODUCT_SMALL_BUSINESS_STARTER_ID,
      setupPriceId: process.env.STRIPE_PRICE_SMALL_BUSINESS_STARTER_SETUP_ID,
      monthlyPriceId:
        process.env.STRIPE_PRICE_SMALL_BUSINESS_STARTER_MONTHLY_ID,
    },
    professional: {
      productId: process.env.STRIPE_PRODUCT_SMALL_BUSINESS_PROFESSIONAL_ID,
      setupPriceId:
        process.env.STRIPE_PRICE_SMALL_BUSINESS_PROFESSIONAL_SETUP_ID,
      monthlyPriceId:
        process.env.STRIPE_PRICE_SMALL_BUSINESS_PROFESSIONAL_MONTHLY_ID,
    },
    premium: {
      productId: process.env.STRIPE_PRODUCT_SMALL_BUSINESS_PREMIUM_ID,
      setupPriceId: process.env.STRIPE_PRICE_SMALL_BUSINESS_PREMIUM_SETUP_ID,
      monthlyPriceId:
        process.env.STRIPE_PRICE_SMALL_BUSINESS_PREMIUM_MONTHLY_ID,
    },
  },
  discord: {
    community: {
      productId: process.env.STRIPE_PRODUCT_DISCORD_COMMUNITY_ID,
      monthlyPriceId: process.env.STRIPE_PRICE_DISCORD_COMMUNITY_MONTHLY_ID,
    },
    guild: {
      productId: process.env.STRIPE_PRODUCT_DISCORD_GUILD_ID,
      monthlyPriceId: process.env.STRIPE_PRICE_DISCORD_GUILD_MONTHLY_ID,
    },
    enterprise: {
      productId: process.env.STRIPE_PRODUCT_DISCORD_ENTERPRISE_ID,
      monthlyPriceId: process.env.STRIPE_PRICE_DISCORD_ENTERPRISE_MONTHLY_ID,
    },
  },
  musician: {
    soloArtist: {
      productId: process.env.STRIPE_PRODUCT_MUSICIAN_SOLO_ARTIST_ID,
      setupPriceId: process.env.STRIPE_PRICE_MUSICIAN_SOLO_ARTIST_SETUP_ID,
      monthlyPriceId: process.env.STRIPE_PRICE_MUSICIAN_SOLO_ARTIST_MONTHLY_ID,
    },
    bandPro: {
      productId: process.env.STRIPE_PRODUCT_MUSICIAN_BAND_PRO_ID,
      setupPriceId: process.env.STRIPE_PRICE_MUSICIAN_BAND_PRO_SETUP_ID,
      monthlyPriceId: process.env.STRIPE_PRICE_MUSICIAN_BAND_PRO_MONTHLY_ID,
    },
    labelManagement: {
      productId: process.env.STRIPE_PRODUCT_MUSICIAN_LABEL_MANAGEMENT_ID,
      setupPriceId: process.env.STRIPE_PRICE_MUSICIAN_LABEL_MANAGEMENT_SETUP_ID,
      monthlyPriceId:
        process.env.STRIPE_PRICE_MUSICIAN_LABEL_MANAGEMENT_MONTHLY_ID,
    },
  },
}

function plan({
  _id,
  name,
  price,
  hoursIncluded = 0,
  description,
  features,
  stripeProductId,
  stripePriceId,
  category,
  interval,
  visibility = 'public',
  marketSegment = 'general',
}) {
  const doc = {
    _id,
    _type: 'plan',
    name,
    price,
    hoursIncluded,
    description,
    features,
    stripeProductId,
    stripePriceId,
    category,
    marketSegment,
    visibility,
  }

  if (typeof interval === 'string' && interval.length > 0) {
    doc.interval = interval
  }

  return doc
}

function service({
  _id,
  name,
  type,
  defaultAddons = [],
  onboardingSteps = [],
  notes = '',
}) {
  return {
    _id,
    _type: 'service',
    name,
    type,
    defaultAddons,
    onboardingSteps,
    notes,
  }
}

const plans = [
  plan({
    _id: 'plan.small-business.starter.monthly',
    name: 'Small Business Starter',
    price: '$99/mo',
    hoursIncluded: 2,
    description:
      '1-3 page responsive website with contact integrations and monthly updates.',
    features: [
      'Responsive site with up to three pages',
      'Contact form and Google Maps embed',
      'Monthly content & maintenance updates',
    ],
    stripeProductId: stripeCatalog.smallBusiness.starter.productId,
    stripePriceId: stripeCatalog.smallBusiness.starter.monthlyPriceId,
    category: 'base',
    marketSegment: 'small_business',
    interval: 'month',
  }),
  plan({
    _id: 'plan.small-business.starter.setup',
    name: 'Small Business Starter Setup',
    price: '$1,200 one-time',
    hoursIncluded: 0,
    description:
      'Discovery, design, build, and launch support for the Starter website package.',
    features: [
      'Brand discovery & site map workshop',
      'Initial content onboarding and QA',
      'Launch support with DNS & analytics',
    ],
    stripeProductId: stripeCatalog.smallBusiness.starter.productId,
    stripePriceId: stripeCatalog.smallBusiness.starter.setupPriceId,
    category: 'one_time',
    marketSegment: 'small_business',
    interval: null,
  }),
  plan({
    _id: 'plan.small-business.professional.monthly',
    name: 'Small Business Professional',
    price: '$199/mo',
    hoursIncluded: 4,
    description:
      'Custom CMS-powered website with SEO, analytics, and weekly update cadence.',
    features: [
      'Custom design with up to ten pages',
      'Sanity CMS access and training',
      'Weekly updates with priority support',
    ],
    stripeProductId: stripeCatalog.smallBusiness.professional.productId,
    stripePriceId: stripeCatalog.smallBusiness.professional.monthlyPriceId,
    category: 'base',
    marketSegment: 'small_business',
    interval: 'month',
  }),
  plan({
    _id: 'plan.small-business.professional.setup',
    name: 'Small Business Professional Setup',
    price: '$2,500 one-time',
    hoursIncluded: 0,
    description:
      'Custom UX, CMS implementation, SEO baseline, and launch playbook.',
    features: [
      'Custom UX/UI design & copywriting sprint',
      'CMS configuration with structured content',
      'Analytics, SEO, and training handoff',
    ],
    stripeProductId: stripeCatalog.smallBusiness.professional.productId,
    stripePriceId: stripeCatalog.smallBusiness.professional.setupPriceId,
    category: 'one_time',
    marketSegment: 'small_business',
    interval: null,
  }),
  plan({
    _id: 'plan.small-business.premium.monthly',
    name: 'Small Business Premium',
    price: '$399/mo',
    hoursIncluded: 8,
    description:
      'Enterprise-grade web presence with e-commerce, booking flows, and daily monitoring.',
    features: [
      'E-commerce or booking experience included',
      'Daily monitoring with 4-hour SLA',
      'Quarterly roadmap and feature releases',
    ],
    stripeProductId: stripeCatalog.smallBusiness.premium.productId,
    stripePriceId: stripeCatalog.smallBusiness.premium.monthlyPriceId,
    category: 'base',
    marketSegment: 'small_business',
    interval: 'month',
  }),
  plan({
    _id: 'plan.small-business.premium.setup',
    name: 'Small Business Premium Setup',
    price: '$5,000 one-time',
    hoursIncluded: 0,
    description:
      'Strategy, custom development, integrations, and launch concierge for Premium tier.',
    features: [
      'Platform architecture & integration planning',
      'Custom feature development & QA cycles',
      'Dedicated launch concierge and training',
    ],
    stripeProductId: stripeCatalog.smallBusiness.premium.productId,
    stripePriceId: stripeCatalog.smallBusiness.premium.setupPriceId,
    category: 'one_time',
    marketSegment: 'small_business',
    interval: null,
  }),
  plan({
    _id: 'plan.discord.community.monthly',
    name: 'Discord Community',
    price: '$49/mo',
    hoursIncluded: 0,
    description:
      'Managed Discord bot with welcome flows, moderation tools, and community support.',
    features: [
      'Welcome & moderation automations',
      '1 server, up to 1k members',
      'Community support via shared channels',
    ],
    stripeProductId: stripeCatalog.discord.community.productId,
    stripePriceId: stripeCatalog.discord.community.monthlyPriceId,
    category: 'base',
    marketSegment: 'discord_bot',
    interval: 'month',
  }),
  plan({
    _id: 'plan.discord.guild.monthly',
    name: 'Discord Guild',
    price: '$99/mo',
    hoursIncluded: 0,
    description:
      'Advanced automations with multi-server support, role workflows, and email ticketing.',
    features: [
      'Custom command suite & role workflows',
      'Up to 3 servers / 5k members',
      'Email support with 48-hour response',
    ],
    stripeProductId: stripeCatalog.discord.guild.productId,
    stripePriceId: stripeCatalog.discord.guild.monthlyPriceId,
    category: 'base',
    marketSegment: 'discord_bot',
    interval: 'month',
  }),
  plan({
    _id: 'plan.discord.enterprise.monthly',
    name: 'Discord Enterprise',
    price: '$299/mo',
    hoursIncluded: 0,
    description:
      'Custom feature development, unlimited servers, and dedicated success channel.',
    features: [
      'Unlimited servers and members',
      'Dedicated Slack/Discord success channel',
      'Roadmap planning & feature commits',
    ],
    stripeProductId: stripeCatalog.discord.enterprise.productId,
    stripePriceId: stripeCatalog.discord.enterprise.monthlyPriceId,
    category: 'base',
    marketSegment: 'discord_bot',
    interval: 'month',
  }),
  plan({
    _id: 'plan.musician.solo-artist.monthly',
    name: 'Musician Solo Artist',
    price: '$29/mo',
    hoursIncluded: 1,
    description:
      'Single-page artist site with streaming embeds, show dates, and booking contact form.',
    features: [
      'Single-page press kit design',
      'Embedded music player integrations',
      'Show calendar & booking form maintenance',
    ],
    stripeProductId: stripeCatalog.musician.soloArtist.productId,
    stripePriceId: stripeCatalog.musician.soloArtist.monthlyPriceId,
    category: 'base',
    marketSegment: 'musician',
    interval: 'month',
  }),
  plan({
    _id: 'plan.musician.solo-artist.setup',
    name: 'Musician Solo Artist Setup',
    price: '$500 one-time',
    hoursIncluded: 0,
    description:
      'Design, content onboarding, and launch of the Solo Artist site experience.',
    features: [
      'Branding alignment & asset prep',
      'Embedded player configuration',
      'Launch checklist & analytics setup',
    ],
    stripeProductId: stripeCatalog.musician.soloArtist.productId,
    stripePriceId: stripeCatalog.musician.soloArtist.setupPriceId,
    category: 'one_time',
    marketSegment: 'musician',
    interval: null,
  }),
  plan({
    _id: 'plan.musician.band-pro.monthly',
    name: 'Musician Band/Pro',
    price: '$79/mo',
    hoursIncluded: 2,
    description:
      'Multi-page band website with merch support, mailing list capture, and press kit.',
    features: [
      'Multi-page site with merch integration',
      'Mailing list and CRM capture workflows',
      'Monthly content refresh & merch updates',
    ],
    stripeProductId: stripeCatalog.musician.bandPro.productId,
    stripePriceId: stripeCatalog.musician.bandPro.monthlyPriceId,
    category: 'base',
    marketSegment: 'musician',
    interval: 'month',
  }),
  plan({
    _id: 'plan.musician.band-pro.setup',
    name: 'Musician Band/Pro Setup',
    price: '$1,200 one-time',
    hoursIncluded: 0,
    description:
      'Site architecture, merch onboarding, and mailing list automation for bands.',
    features: [
      'Content planning & merch integration',
      'Automation & mailing list setup',
      'Launch QA across devices',
    ],
    stripeProductId: stripeCatalog.musician.bandPro.productId,
    stripePriceId: stripeCatalog.musician.bandPro.setupPriceId,
    category: 'one_time',
    marketSegment: 'musician',
    interval: null,
  }),
  plan({
    _id: 'plan.musician.label-management.monthly',
    name: 'Musician Label / Management',
    price: '$199/mo',
    hoursIncluded: 4,
    description:
      'Multi-artist showcase with booking management, analytics dashboard, and concierge support.',
    features: [
      'Multi-artist roster management',
      'Advanced booking & tour calendar tooling',
      'Dedicated account manager with analytics',
    ],
    stripeProductId: stripeCatalog.musician.labelManagement.productId,
    stripePriceId: stripeCatalog.musician.labelManagement.monthlyPriceId,
    category: 'base',
    marketSegment: 'musician',
    interval: 'month',
  }),
  plan({
    _id: 'plan.musician.label-management.setup',
    name: 'Musician Label / Management Setup',
    price: '$2,500 one-time',
    hoursIncluded: 0,
    description:
      'White-glove rollout of the label portal with multi-artist configuration and analytics.',
    features: [
      'Roster import & data migration support',
      'Analytics dashboard configuration',
      'Concierge onboarding & training sessions',
    ],
    stripeProductId: stripeCatalog.musician.labelManagement.productId,
    stripePriceId: stripeCatalog.musician.labelManagement.setupPriceId,
    category: 'one_time',
    marketSegment: 'musician',
    interval: null,
  }),
]

const services = [
  service({
    _id: 'service.small-business',
    name: 'Small Business Website',
    type: 'small_business',
    defaultAddons: [],
    onboardingSteps: [
      'Discovery workshop',
      'Content collection',
      'Launch checklist',
    ],
    notes:
      'Maps to the Small Business Starter, Professional, and Premium plans.',
  }),
  service({
    _id: 'service.discord-bot',
    name: 'Discord Bot',
    type: 'discord_bot',
    defaultAddons: [],
    onboardingSteps: [
      'Bot configuration',
      'Feature selection',
      'Launch validation',
    ],
    notes: 'Covers Community, Guild, and Enterprise bot packages.',
  }),
  service({
    _id: 'service.musician-website',
    name: 'Musician Website',
    type: 'musician',
    defaultAddons: [],
    onboardingSteps: ['Branding intake', 'Content upload', 'Launch QA'],
    notes: 'Supports Solo Artist, Band/Pro, and Label tiers.',
  }),
]

const planIdsToKeep = plans.map((doc) => doc._id)
const serviceIdsToKeep = services.map((doc) => doc._id)

// Remove any plan or service documents that are not part of the canonical catalog.
async function purgeDocuments({ type, keepIds, label }) {
  if (!keepIds.length) {
    return
  }

  const legacyDocs = await client.fetch(
    '*[_type == $type && !(_id in $ids) && !(_id match "drafts.*")][]{ _id }',
    { type, ids: keepIds }
  )

  if (!legacyDocs.length) {
    return
  }

  console.log(`Removing legacy ${label} entries...`)
  for (const doc of legacyDocs) {
    try {
      await client.delete(doc._id)
      console.log(`  Removed ${label}: ${doc._id}`)
    } catch (error) {
      const hasReferences =
        error?.details?.items?.[0]?.error?.type ===
        'documentHasExistingReferencesError'

      if (hasReferences && type === 'plan') {
        await client.patch(doc._id).set({ visibility: 'internal' }).commit()
        console.log(`  Hid ${label} with active references: ${doc._id}`)
        continue
      }

      throw error
    }
  }
}

async function run() {
  if (!client.config().token) {
    console.error(
      'Missing SANITY_AUTH_TOKEN in .env.local (write token required)'
    )
    process.exit(1)
  }

  await purgeDocuments({ type: 'plan', keepIds: planIdsToKeep, label: 'plan' })
  await purgeDocuments({
    type: 'service',
    keepIds: serviceIdsToKeep,
    label: 'service',
  })

  console.log('Seeding plans and services...')
  for (const doc of plans) {
    await client.createOrReplace(doc)
    console.log(`  Plan: ${doc._id}`)
  }
  for (const doc of services) {
    await client.createOrReplace(doc)
    console.log(`  Service: ${doc._id}`)
  }
  console.log('Seed completed successfully.')
}

run().catch((error) => {
  console.error('Seed failed', error)
  process.exit(1)
})
