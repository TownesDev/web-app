#!/usr/bin/env node

/**
 * Upsert the core onboarding plans (base, add-ons, one-time) in Sanity.
 *
 * Usage:
 *   node tools/sanity/ensure-onboarding-plans.mjs
 *
 * Requires environment variables (typically via .env.local):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET
 *   - SANITY_AUTH_TOKEN (write scope)
 *   - NEXT_PUBLIC_SANITY_API_VERSION (optional, defaults to 2024-01-01)
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const requiredEnvVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_AUTH_TOKEN',
]

const missing = requiredEnvVars.filter((key) => !process.env[key])
if (missing.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missing.join(', ')}.\n` +
      'Ensure they are set in .env.local before running this script.'
  )
  process.exit(1)
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
})

const plans = [
  {
    _id: 'plan.base-retainer',
    _type: 'plan',
    name: 'Base Retainer',
    price: '$150/mo',
    hoursIncluded: 3,
    description:
      'Account management, support coverage, admin portal access, and minor updates to keep your launch on track.',
    features: [
      'Support SLA (business hours)',
      'Admin portal access',
      'Minor updates and maintenance',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'base',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.base-retainer-plus',
    _type: 'plan',
    name: 'Base Retainer Plus',
    price: '$275/mo',
    hoursIncluded: 6,
    description:
      'Adds more dedicated hours for iterative work and backlog grooming while keeping the core retainer benefits.',
    features: [
      'Everything in Base Retainer',
      '6 included studio hours per month',
      'Monthly backlog grooming session',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'base',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.webapp-starter',
    _type: 'plan',
    name: 'Web-App Starter',
    price: '$25/mo',
    hoursIncluded: 0,
    description: 'Entry-tier hosting & upkeep for your marketing site.',
    features: ['Basic hosting', 'Security patches', 'Monthly backups'],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.webapp-pro',
    _type: 'plan',
    name: 'Web-App Pro',
    price: '$75/mo',
    hoursIncluded: 0,
    description:
      'Pro monitoring, performance checks, and priority maintenance.',
    features: [
      'Priority maintenance queue',
      'Performance monitoring',
      'Enhanced backup cadence',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.webapp-plus',
    _type: 'plan',
    name: 'Web-App Plus',
    price: '$150/mo',
    hoursIncluded: 0,
    description:
      'Observability suite, premium support, and disaster recovery readiness.',
    features: [
      'Observability suite access',
      'Priority support channel',
      'Disaster recovery playbooks',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.discord-bronze',
    _type: 'plan',
    name: 'Discord Bronze',
    price: '$15/mo',
    hoursIncluded: 0,
    description: 'Baseline Discord bot monitoring and update coverage.',
    features: ['Bot uptime monitoring', 'Monthly updates'],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.discord-silver',
    _type: 'plan',
    name: 'Discord Silver',
    price: '$45/mo',
    hoursIncluded: 0,
    description: 'Improved monitoring, feature support, and faster patches.',
    features: [
      'Bot monitoring',
      'Priority patch window',
      'Feature toggle assistance',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.discord-gold',
    _type: 'plan',
    name: 'Discord Gold',
    price: '$95/mo',
    hoursIncluded: 0,
    description:
      'Top-tier Discord maintenance with proactive alerting and recovery.',
    features: [
      '24/7 alerting coverage',
      'Highest priority change queue',
      'Disaster recovery readiness',
    ],
    stripeProductId: null,
    stripePriceId: null,
    category: 'addon',
    interval: 'month',
    visibility: 'public',
  },
  {
    _id: 'plan.setup-webapp',
    _type: 'plan',
    name: 'Web-App Setup',
    price: '$500 one-time',
    hoursIncluded: 0,
    description: 'Initial site build, configuration, and deployment.',
    features: ['Site scaffolding', 'Theme configuration', 'Deployment'],
    stripeProductId: null,
    stripePriceId: null,
    category: 'one_time',
    interval: null,
    visibility: 'public',
  },
  {
    _id: 'plan.setup-discord',
    _type: 'plan',
    name: 'Discord Bot Setup',
    price: '$300 one-time',
    hoursIncluded: 0,
    description: 'App registration, command scaffolding, and launch.',
    features: ['App registration', 'Command scaffolding', 'Deployment'],
    stripeProductId: null,
    stripePriceId: null,
    category: 'one_time',
    interval: null,
    visibility: 'public',
  },
]

async function run() {
  console.log('🚀 Ensuring onboarding plans exist in Sanity...')

  for (const plan of plans) {
    await client.createOrReplace(plan)
    console.log(`   ✅ upserted ${plan._id}`)
  }

  console.log('🎉 Done. Update Stripe product/price IDs when ready.')
}

run().catch((error) => {
  console.error('❌ Failed to upsert onboarding plans', error)
  process.exit(1)
})
