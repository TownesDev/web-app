#!/usr/bin/env node
// List or remediate stuck Stripe webhook records in Sanity.
// Usage:
//   NEXT_PUBLIC_SANITY_PROJECT_ID=... NEXT_PUBLIC_SANITY_DATASET=... SANITY_AUTH_TOKEN=... node scripts/list-stuck-webhooks.js --list --hours=2
//   ... --mark-failed to mark as failed

const { createClient } = require('sanity')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
  .option('list', { type: 'boolean', default: false })
  .option('hours', { type: 'number', default: 2 })
  .option('mark-failed', { type: 'boolean', default: false })
  .option('extend-lock-minutes', { type: 'number' })
  .help()
  .argv

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_AUTH_TOKEN
if (!projectId || !dataset || !token) {
  console.error('Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_AUTH_TOKEN')
  process.exit(2)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-15',
  token,
  useCdn: false,
})

async function listStuck(hours) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const q = `*[_type=="stripeEvent" && status=="processing" && createdAt < $cutoff] | order(createdAt desc){_id,eventId,eventType,createdAt,processingLockOwner,lockExpiresAt,correlationId}`
  const items = await client.fetch(q, { cutoff })
  return items
}

async function markFailed(id, note) {
  const patch = [{
    patch: {
      id,
      set: {
        status: 'failed',
        processedAt: new Date().toISOString(),
        outcome: note || 'marked_failed_by_admin',
      },
    },
  }]
  return client.mutate(patch)
}

async function extendLock(id, minutes) {
  const until = new Date(Date.now() + minutes * 60 * 1000).toISOString()
  return client.mutate([
    {
      patch: {
        id,
        set: { lockExpiresAt: until },
      },
    },
  ])
}

;(async () => {
  const items = await listStuck(argv.hours)
  if (!items || items.length === 0) {
    console.log('No stuck processing events found')
    return
  }

  console.log(`Found ${items.length} stuck processing events (older than ${argv.hours} hours):`)
  for (const it of items) {
    console.log(`- ${it._id} eventId=${it.eventId} eventType=${it.eventType} createdAt=${it.createdAt} lockExpiresAt=${it.lockExpiresAt} owner=${it.processingLockOwner} corr=${it.correlationId}`)
  }

  if (argv['extend-lock-minutes']) {
    for (const it of items) {
      await extendLock(it._id, argv['extend-lock-minutes'])
      console.log(`Extended lock for ${it._id} by ${argv['extend-lock-minutes']} minutes`)
    }
  }

  if (argv['mark-failed']) {
    for (const it of items) {
      await markFailed(it._id, 'admin_marked_failed_for_replay')
      console.log(`Marked ${it._id} as failed`)
    }
  }
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
