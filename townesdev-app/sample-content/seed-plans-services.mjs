#!/usr/bin/env node

/**
 * Seed Plans & Services for EPIC A
 *
 * Usage:
 *  node sample-content/seed-plans-services.mjs
 *
 * Requires env:
 *  - NEXT_PUBLIC_SANITY_PROJECT_ID
 *  - NEXT_PUBLIC_SANITY_DATASET
 *  - SANITY_AUTH_TOKEN (write)
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
})

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
  interval = 'month',
  visibility = 'public',
}) {
  return {
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
    interval,
    visibility,
  }
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
  // Base retainer
  plan({
    _id: 'plan.base-retainer',
    name: 'Base Retainer',
    price: '$150/mo',
    hoursIncluded: 3,
    description:
      'Account management, support SLA, minor updates, admin portal access',
    features: [
      'Support SLA (business hours)',
      'Admin portal access',
      'Minor updates and maintenance',
    ],
    stripeProductId: 'prod_base_retainer',
    stripePriceId: 'price_base_retainer_month',
    category: 'base',
  }),

  // Web App tiers (add-ons)
  plan({
    _id: 'plan.webapp-starter',
    name: 'Web-App Starter',
    price: '$25/mo',
    hoursIncluded: 0,
    description: 'Basic hosting & maintenance tier for web app',
    features: ['Basic hosting', 'Security patches', 'Monthly backups'],
    stripeProductId: 'prod_webapp_starter',
    stripePriceId: 'price_webapp_starter_month',
    category: 'addon',
  }),
  plan({
    _id: 'plan.webapp-pro',
    name: 'Web-App Pro',
    price: '$75/mo',
    hoursIncluded: 0,
    description: 'Pro hosting, monitoring, and priority maintenance',
    features: ['Priority maintenance', 'Monitoring', 'Enhanced backups'],
    stripeProductId: 'prod_webapp_pro',
    stripePriceId: 'price_webapp_pro_month',
    category: 'addon',
  }),
  plan({
    _id: 'plan.webapp-plus',
    name: 'Web-App Plus',
    price: '$150/mo',
    hoursIncluded: 0,
    description: 'Plus-tier hosting, monitoring, and observability suite',
    features: [
      'Observability suite',
      'Priority support',
      'Disaster recovery plan',
    ],
    stripeProductId: 'prod_webapp_plus',
    stripePriceId: 'price_webapp_plus_month',
    category: 'addon',
  }),

  // Discord tiers (add-ons)
  plan({
    _id: 'plan.discord-bronze',
    name: 'Discord Bronze',
    price: '$15/mo',
    hoursIncluded: 0,
    description: 'Entry-tier Discord bot hosting & maintenance',
    features: ['Bot uptime SLA (best effort)', 'Monthly updates'],
    stripeProductId: 'prod_discord_bronze',
    stripePriceId: 'price_discord_bronze_month',
    category: 'addon',
  }),
  plan({
    _id: 'plan.discord-silver',
    name: 'Discord Silver',
    price: '$45/mo',
    hoursIncluded: 0,
    description: 'Improved hosting, monitoring, and feature support',
    features: ['Bot monitoring', 'Priority patches', 'Feature toggles'],
    stripeProductId: 'prod_discord_silver',
    stripePriceId: 'price_discord_silver_month',
    category: 'addon',
  }),
  plan({
    _id: 'plan.discord-gold',
    name: 'Discord Gold',
    price: '$95/mo',
    hoursIncluded: 0,
    description: 'Gold-tier with highest priority maintenance',
    features: [
      'Highest priority',
      'Monitoring & alerting',
      'Disaster recovery',
    ],
    stripeProductId: 'prod_discord_gold',
    stripePriceId: 'price_discord_gold_month',
    category: 'addon',
  }),

  // One-time setup examples
  plan({
    _id: 'plan.setup-webapp',
    name: 'Web-App Setup',
    price: '$500 one-time',
    hoursIncluded: 0,
    description: 'Initial site build & configuration',
    features: ['Site scaffolding', 'Theme configuration', 'Deployment'],
    stripeProductId: 'prod_setup_webapp',
    stripePriceId: 'price_setup_webapp_onetime',
    category: 'one_time',
    interval: undefined,
  }),
  plan({
    _id: 'plan.setup-discord',
    name: 'Discord Bot Setup',
    price: '$300 one-time',
    hoursIncluded: 0,
    description: 'Initial bot setup & configuration',
    features: ['App registration', 'Command scaffolding', 'Deployment'],
    stripeProductId: 'prod_setup_discord',
    stripePriceId: 'price_setup_discord_onetime',
    category: 'one_time',
    interval: undefined,
  }),
]

const services = [
  service({
    _id: 'service.web-app',
    name: 'Web App',
    type: 'web_app',
    defaultAddons: [{ _type: 'reference', _ref: 'plan.webapp-starter' }],
    onboardingSteps: ['Brand', 'Pages', 'Domain'],
  }),
  service({
    _id: 'service.discord',
    name: 'Discord',
    type: 'discord',
    defaultAddons: [{ _type: 'reference', _ref: 'plan.discord-bronze' }],
    onboardingSteps: ['Bot name', 'Intents', 'Features'],
  }),
]

async function run() {
  if (!client.config().token) {
    console.error(
      '❌ Missing SANITY_AUTH_TOKEN in .env.local (write token required)'
    )
    process.exit(1)
  }
  console.log('🚀 Seeding Plans & Services...')
  for (const doc of plans) {
    await client.createOrReplace(doc)
    console.log(`   ✅ Plan: ${doc._id}`)
  }
  for (const doc of services) {
    await client.createOrReplace(doc)
    console.log(`   ✅ Service: ${doc._id}`)
  }
  console.log('🎉 Done.')
}

run().catch((e) => {
  console.error('❌ Seed failed', e)
  process.exit(1)
})
