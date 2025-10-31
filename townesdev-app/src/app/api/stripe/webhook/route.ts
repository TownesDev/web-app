import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { runQuery, sanityWrite } from '@/lib/client'
import { logInfo, logError } from '@/lib/structuredLogger'
import { randomUUID } from 'crypto'
import { getEmailTemplateByName } from '../../../../queries/emailTemplates'
import { ptToHtml, ptToPlainText, mergeVars } from '../../../../lib/email'
import { resend, EMAIL_FROM } from '../../../../lib/resendClient'
import {
  ensureClientAsset,
  ensureFeature,
  mapPlanToFeature,
} from '@/lib/entitlements'
import { runAdminQuery } from '@/lib/admin/client'
import { qPlanFeatureMappings } from '@/sanity/lib/queries'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const correlationId = randomUUID()
  logInfo('webhook.received', {
    method: request.method,
    url: request.url,
    correlationId,
  })

  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    logInfo('webhook.verified', {
      eventType: event.type,
      eventId: event.id,
      correlationId,
    })
  } catch (err: unknown) {
    logError('webhook.signature_verification_failed', {
      error: err instanceof Error ? err.message : String(err),
      correlationId,
    })
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  // Duplicate suppression and atomic processing record creation.
  // Use a deterministic document _id so Sanity's createIfNotExists provides
  // an atomic create-or-noop behavior to short-circuit concurrent deliveries.
  const stripeEventDocId = `stripeEvent.${event.id}`
  const createdAt = new Date().toISOString()
  const sessionId =
    (event.data?.object as unknown as { id?: string; session?: string })?.id ||
    (event.data?.object as unknown as { id?: string; session?: string })
      ?.session ||
    null

  try {
    // Attempt to create the stripeEvent doc if it doesn't already exist.
    // If it already exists, createIfNotExists is a no-op on the server.
    const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await sanityWrite.mutate([
      {
        createIfNotExists: {
          _id: stripeEventDocId,
          _type: 'stripeEvent',
          eventId: event.id,
          eventType: event.type,
          sessionId,
          status: 'processing',
          correlationId,
          processingLockOwner: correlationId,
          lockExpiresAt,
          createdAt,
          raw: JSON.stringify(event),
        },
      },
    ])

    // Re-read the document to determine whether we should proceed or short-circuit.
    const doc = await runQuery(
      `*[_id==$id][0]{ _id, eventId, eventType, status, processedAt, createdAt, processingLockOwner, lockExpiresAt }`,
      { id: stripeEventDocId }
    )

    if (doc) {
      // If the doc indicates processing by another worker (pre-existing "processing"),
      // or the event was already completed (success/failed), then acknowledge and stop.
      if (doc.status && doc.status !== 'processing') {
        logInfo('webhook.duplicate_suppressed', {
          eventId: event.id,
          eventType: event.type,
          status: doc.status,
          processedAt: doc.processedAt,
          correlationId,
          docId: stripeEventDocId,
        })
        return NextResponse.json({ received: true })
      }


      // If doc.status is 'processing' and the lock is still valid, short-circuit.
      // If the lock is expired, attempt to claim it by patching processingLockOwner
      // and lockExpiresAt so this worker can proceed.
      if (doc.status === 'processing') {
        const now = new Date()
        const lockExpires = doc.lockExpiresAt ? new Date(doc.lockExpiresAt) : null

        if (lockExpires && lockExpires > now) {
          // Another worker owns the lock and it's still valid — short-circuit.
          logInfo('webhook.duplicate_suppressed', {
            eventId: event.id,
            eventType: event.type,
            status: doc.status,
            lockExpiresAt: doc.lockExpiresAt,
            processingLockOwner: doc.processingLockOwner,
            correlationId,
            docId: stripeEventDocId,
          })
          return NextResponse.json({ received: true })
        }

        // Lock is expired or missing — claim it for this invocation.
        try {
          const newLockExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString()
          await sanityWrite.mutate([
            {
              patch: {
                id: stripeEventDocId,
                set: {
                  processingLockOwner: correlationId,
                  lockExpiresAt: newLockExpires,
                  correlationId,
                },
              },
            },
          ])
          logInfo('webhook.lock_claimed', {
            eventId: event.id,
            docId: stripeEventDocId,
            newLockExpires,
            correlationId,
          })
        } catch (claimErr) {
          logError('webhook.lock_claim_failed', {
            error: String(claimErr),
            eventId: event.id,
            correlationId,
            docId: stripeEventDocId,
          })
          return NextResponse.json({ received: true })
        }
      }

      // Otherwise we either created the doc just now, or it's safe to proceed.
      logInfo('webhook.event_recorded', {
        eventId: event.id,
        eventType: event.type,
        docId: stripeEventDocId,
        sessionId,
        correlationId,
        rawSize: String(JSON.stringify(event)).length,
      })
    }
  } catch (dupErr) {
    // If anything goes wrong with persistence, log and continue processing the event
    // (we still want to attempt provisioning even if our telemetry store failed).
    logError('webhook.event_record_persistence_failed', {
      error: String(dupErr),
      eventId: event.id,
      correlationId,
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('🎯 Processing checkout.session.completed')
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.featureId) {
          // Handle feature purchase
          await handleFeaturePurchase(session)
        } else if (session.metadata?.planId) {
          // Handle plan subscription
          await handlePlanSubscription(session)
        } else {
          console.warn(
            'Checkout session completed without featureId or planId metadata'
          )
        }
        break
      }

      case 'customer.subscription.created': {
        console.log('🎯 Processing customer.subscription.created')
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        console.log('🎯 Processing invoice.payment_succeeded')
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'customer.subscription.updated': {
        console.log('🎯 Processing customer.subscription.updated')
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        console.log('🎯 Processing customer.subscription.deleted')
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    logInfo('webhook.processing_completed', {
      eventId: event.id,
      eventType: event.type,
      correlationId,
    })

    // Mark processing success in Sanity (best-effort). Use the deterministic
    // stripeEvent doc id so we avoid an extra query and keep behavior atomic.
    try {
      await sanityWrite.mutate([
        {
          patch: {
            id: stripeEventDocId,
            set: {
              status: 'success',
              processedAt: new Date().toISOString(),
              outcome: event.type,
            },
          },
        },
      ])
    } catch (markOkErr) {
      logError('stripeEvent.mark_success_failed', {
        error: String(markOkErr),
        correlationId,
        docId: stripeEventDocId,
      })
    }

    // TODO(provisioning): After confirming successful subscription, automatically trigger
    // project provisioning for the client (websiteProject/discordProject) instead of relying
    // on manual onboarding action. A simple approach: invoke the provisioning logic here
    // using the clientId/planId from metadata, with idempotent safeguards.

    return NextResponse.json({ received: true })
  } catch (error) {
    logError('webhook.processing_error', {
      error: String(error),
      correlationId,
    })

    // Mark processing failure in Sanity (best-effort)
    try {
      await sanityWrite.mutate([
        {
          patch: {
            id: stripeEventDocId,
            set: {
              status: 'failed',
              processedAt: new Date().toISOString(),
              outcome: String(error),
            },
          },
        },
      ])
    } catch (markErr) {
      logError('stripeEvent.mark_failed_failed', {
        error: String(markErr),
        correlationId,
        docId: stripeEventDocId,
      })
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleFeaturePurchase(session: Stripe.Checkout.Session) {
  const { featureId, assetId, clientId } = session.metadata!

  console.log('🔍 Processing feature purchase:', {
    featureId,
    assetId,
    clientId,
    paymentIntent: session.payment_intent,
  })

  // Check if entitlement already exists (idempotency)
  const existingEntitlement = await runQuery(
    `*[_type=="entitlement" && client._ref==$clientId && asset._ref==$assetId && feature._ref==$featureId][0]`,
    { clientId, assetId, featureId }
  )

  if (existingEntitlement) {
    console.log('Entitlement already exists for feature purchase:', session.id)
    return
  }

  // Create entitlement
  await sanityWrite.mutate([
    {
      create: {
        _type: 'entitlement',
        client: { _type: 'reference', _ref: clientId },
        asset: { _type: 'reference', _ref: assetId },
        feature: { _type: 'reference', _ref: featureId },
        status: 'active',
        activatedAt: new Date().toISOString(),
        stripePaymentIntentId: session.payment_intent as string,
      },
    },
  ])

  console.log('Entitlement created for feature purchase:', session.id)
}

async function handlePlanSubscription(session: Stripe.Checkout.Session) {
  const { planId, clientId, assetId, addOnIds } = session.metadata!

  console.log('🔍 Processing plan subscription:', {
    planId,
    clientId,
    assetId,
    subscriptionId: session.subscription,
  })

  if (!planId || !clientId) {
    console.error('Missing planId or clientId in subscription metadata')
    return
  }

  if (!session.subscription) {
    console.error('No subscription ID in session')
    return
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    console.log('🔍 Retrieved subscription:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: (
        subscription as unknown as Stripe.Subscription & {
          current_period_start: number
          current_period_end: number
        }
      ).current_period_start,
      current_period_end: (
        subscription as unknown as Stripe.Subscription & {
          current_period_start: number
          current_period_end: number
        }
      ).current_period_end,
    })

    // Helper to fetch plan doc
    const fetchPlan = async (id: string) =>
      runQuery(`*[_type=="plan" && _id==$id][0]{ _id, name, hoursIncluded }`, {
        id,
      })

    // Get base plan details
    const plan = await fetchPlan(planId)

    if (!plan) {
      console.error('Plan not found:', planId)
      return
    }

    // (Base plan retainer will be created after computing periodStart/End)
    const periodStartTimestamp = (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number
        current_period_end: number
      }
    )['current_period_start']

    const periodEndTimestamp = (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number
        current_period_end: number
      }
    )['current_period_end']

    console.log('🔍 Period timestamps:', {
      periodStartTimestamp,
      periodEndTimestamp,
    })

    // Handle case where timestamps might be missing or invalid
    let periodStart: string
    let periodEnd: string

    try {
      if (periodStartTimestamp && periodStartTimestamp > 0) {
        periodStart = new Date(periodStartTimestamp * 1000).toISOString()
      } else {
        console.warn(
          '⚠️ Invalid or missing periodStartTimestamp, using current date'
        )
        periodStart = new Date().toISOString()
      }

      if (periodEndTimestamp && periodEndTimestamp > 0) {
        periodEnd = new Date(periodEndTimestamp * 1000).toISOString()
      } else {
        console.warn(
          '⚠️ Invalid or missing periodEndTimestamp, using date 30 days from now'
        )
        periodEnd = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString()
      }
    } catch (dateError) {
      console.error('❌ Error creating dates:', dateError)
      console.error('❌ Timestamp values:', {
        periodStartTimestamp,
        periodEndTimestamp,
      })
      return
    }

    // Create retainer for base plan if not already present for this subscription+plan
    const existingBase = await runQuery(
      `*[_type=="retainer" && stripeSubId==$stripeSubId && plan._ref==$planId][0]`,
      { stripeSubId: subscription.id, planId: plan._id }
    )

    if (existingBase) {
      console.log('Retainer already exists for base plan on subscription:', {
        subscription: subscription.id,
        plan: plan._id,
      })
    } else {
      const retainerData = {
        _type: 'retainer',
        client: { _type: 'reference', _ref: clientId },
        plan: { _type: 'reference', _ref: planId },
        stripeSubId: subscription.id,
        status:
          subscription.status === 'active'
            ? 'active'
            : subscription.status === 'canceled'
              ? 'canceled'
              : 'past_due',
        periodStart: periodStart,
        periodEnd: periodEnd,
        hoursIncluded: plan.hoursIncluded || 0,
        hoursUsed: 0,
        ...(assetId && { asset: { _type: 'reference', _ref: assetId } }),
      }

      await sanityWrite.mutate([
        {
          create: retainerData,
        },
      ])

      console.log('Retainer created for subscription:', subscription.id)
    }

    // ──────────────── Base plan → Feature entitlement mapping ────────────────
    // Prefer CMS-driven mapping; fallback to heuristic mapping when absent.
    try {
      let mappingLookup: Map<
        string,
        {
          _id: string
          name: string
          key?: string
          assetType?: 'web_app' | 'discord_bot'
        }
      >
      try {
        const mappings = (await runAdminQuery(qPlanFeatureMappings)) as Array<{
          plan?: { _id: string }
          feature?: {
            _id: string
            name: string
            key?: string
            assetType?: 'web_app' | 'discord_bot'
          }
        }>
        mappingLookup = new Map(
          (mappings || [])
            .filter((m) => m.plan?._id && m.feature?._id)
            .map((m) => [m.plan!._id, m.feature!])
        )
      } catch (e) {
        console.warn(
          'Failed to load plan→feature mappings; will fallback to heuristic',
          e
        )
        mappingLookup = new Map()
      }

      const mappedFeature = mappingLookup.get(planId)
      let featureDoc: {
        _id: string
        name?: string
        key?: string
        assetType?: 'web_app' | 'discord_bot'
      } | null = null

      if (mappedFeature) {
        featureDoc = mappedFeature
      } else {
        const heuristic = mapPlanToFeature(planId)
        if (!heuristic) {
          console.log('No feature mapping for base plan; skipping entitlement')
        } else {
          const ensured = await ensureFeature(heuristic)
          featureDoc = {
            _id: ensured._id,
            key: heuristic.key,
            assetType: heuristic.assetType,
          }
        }
      }

      if (featureDoc?.assetType) {
        // Ensure appropriate client asset exists for the feature's assetType
        const asset = await ensureClientAsset(clientId, featureDoc.assetType)

        // Create entitlement if it doesn't exist
        const existingEnt = await runQuery(
          `*[_type=="entitlement" && client._ref==$clientId && asset._ref==$assetId && feature._ref==$featureId][0]`,
          { clientId, assetId: asset._id, featureId: featureDoc._id }
        )
        if (!existingEnt) {
          await sanityWrite.mutate([
            {
              create: {
                _type: 'entitlement',
                client: { _type: 'reference', _ref: clientId },
                asset: { _type: 'reference', _ref: asset._id },
                feature: { _type: 'reference', _ref: featureDoc._id },
                status: 'active',
                activatedAt: new Date().toISOString(),
              },
            },
          ])
          console.log('Base plan entitlement created:', {
            clientId,
            assetId: asset._id,
            featureId: featureDoc._id,
          })
        } else {
          console.log('Base plan entitlement already exists')
        }
      }
    } catch (entMapErr) {
      console.warn(
        'Base plan mapping entitlement failed (non-fatal):',
        entMapErr
      )
    }

    // If add-ons were included in checkout, create retainers for each add-on plan
    if (addOnIds) {
      // Load Sanity-driven mapping table once per webhook call
      let mappingLookup: Map<
        string,
        {
          _id: string
          name: string
          key?: string
          assetType?: 'web_app' | 'discord_bot'
        }
      >
      try {
        const mappings = (await runAdminQuery(qPlanFeatureMappings)) as Array<{
          plan?: { _id: string }
          feature?: {
            _id: string
            name: string
            key?: string
            assetType?: 'web_app' | 'discord_bot'
          }
        }>
        mappingLookup = new Map(
          (mappings || [])
            .filter((m) => m.plan?._id && m.feature?._id)
            .map((m) => [m.plan!._id, m.feature!])
        )
      } catch (e) {
        console.warn(
          'Failed to load plan→feature mappings; will fallback to heuristic',
          e
        )
        mappingLookup = new Map()
      }
      const ids = String(addOnIds)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      for (const addOnId of ids) {
        try {
          const addOn = await fetchPlan(addOnId)
          if (!addOn) {
            console.warn('Add-on plan not found:', addOnId)
            continue
          }

          const existingAddOn = await runQuery(
            `*[_type=="retainer" && stripeSubId==$stripeSubId && plan._ref==$planId][0]`,
            { stripeSubId: subscription.id, planId: addOn._id }
          )
          if (existingAddOn) {
            console.log('Add-on retainer already exists:', {
              subscription: subscription.id,
              plan: addOn._id,
            })
            continue
          }

          await sanityWrite.mutate([
            {
              create: {
                _type: 'retainer',
                client: { _type: 'reference', _ref: clientId },
                plan: { _type: 'reference', _ref: addOn._id },
                stripeSubId: subscription.id,
                status:
                  subscription.status === 'active'
                    ? 'active'
                    : subscription.status === 'canceled'
                      ? 'canceled'
                      : 'past_due',
                periodStart,
                periodEnd,
                hoursIncluded: addOn.hoursIncluded || 0,
                hoursUsed: 0,
              },
            },
          ])
          console.log('Add-on retainer created for plan:', addOn._id)

          // ──────────────── Plan → Feature entitlement mapping ────────────────
          // Prefer CMS-driven mapping; fallback to heuristic mapping when absent.
          const mappedFeature = mappingLookup.get(addOnId)
          let featureDoc: {
            _id: string
            name?: string
            key?: string
            assetType?: 'web_app' | 'discord_bot'
          } | null = null

          if (mappedFeature) {
            featureDoc = mappedFeature
          } else {
            const heuristic = mapPlanToFeature(addOnId)
            if (!heuristic) {
              console.log(
                'No feature mapping for add-on plan; skipping entitlement'
              )
              continue
            }
            const ensured = await ensureFeature(heuristic)
            featureDoc = {
              _id: ensured._id,
              key: heuristic.key,
              assetType: heuristic.assetType,
            }
          }

          if (!featureDoc?.assetType) {
            console.log('Mapped feature has no assetType; skipping entitlement')
            continue
          }

          // Ensure appropriate client asset exists for the feature's assetType
          const asset = await ensureClientAsset(clientId, featureDoc.assetType)

          // Create entitlement if it doesn't exist
          const existingEnt = await runQuery(
            `*[_type=="entitlement" && client._ref==$clientId && asset._ref==$assetId && feature._ref==$featureId][0]`,
            { clientId, assetId: asset._id, featureId: featureDoc._id }
          )
          if (!existingEnt) {
            await sanityWrite.mutate([
              {
                create: {
                  _type: 'entitlement',
                  client: { _type: 'reference', _ref: clientId },
                  asset: { _type: 'reference', _ref: asset._id },
                  feature: { _type: 'reference', _ref: featureDoc._id },
                  status: 'active',
                  activatedAt: new Date().toISOString(),
                },
              },
            ])
            console.log('Entitlement created:', {
              clientId,
              assetId: asset._id,
              featureId: featureDoc._id,
            })
          } else {
            console.log('Entitlement already exists for client/asset/feature')
          }
        } catch (addOnErr) {
          console.error('Failed creating add-on retainer:', addOnId, addOnErr)
        }
      }
    }
    // ──────────────── Auto-provision status bump (idempotent) ────────────────
    try {
      // If a previewed websiteProject exists, bump it to ready on successful subscription
      const project = await runQuery(
        `*[_type=="websiteProject" && client._ref==$clientId][0]{ _id, status }`,
        { clientId }
      )
      if (project?._id) {
        // Only bump if currently draft/provisioning
        const bumpNeeded =
          project.status === 'provisioning' ||
          project.status === 'draft' ||
          !project.status
        if (bumpNeeded) {
          await sanityWrite.mutate([
            { patch: { id: project._id, set: { status: 'ready' } } },
          ])
        }

        // Ensure web_app asset is active and linked to project
        const asset = await ensureClientAsset(clientId, 'web_app')
        await sanityWrite.mutate([
          {
            patch: {
              id: asset._id,
              set: {
                status: 'active',
                project: { _type: 'reference', _ref: project._id },
              },
              setIfMissing: {
                project: { _type: 'reference', _ref: project._id },
              },
            },
          },
        ])
      }
    } catch (provisionErr) {
      console.warn('Webhook status bump failed (non-fatal):', provisionErr)
    }
    // Build selectedAddons refs if any
    const addOnRefs = (
      addOnIds
        ? String(addOnIds)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((id) => ({ _type: 'reference', _ref: id }))
        : []
    ) as Array<{ _type: 'reference'; _ref: string }>

    await sanityWrite.mutate([
      {
        patch: {
          id: clientId,
          set: {
            hasActiveSubscription: true,
            selectedPlan: { _type: 'reference', _ref: planId },
            ...(addOnRefs.length ? { selectedAddons: addOnRefs } : {}),
          },
        },
      },
    ])

    // Send welcome email to client
    try {
      console.log(
        `📧 Sending welcome email to client ${clientId} for plan ${planId}`
      )
      await sendWelcomeEmail(clientId, planId)
      console.log(`✅ Welcome email sent successfully to client ${clientId}`)
    } catch (emailError) {
      console.error(
        `❌ Failed to send welcome email to client ${clientId}:`,
        emailError
      )
      // Don't fail the webhook if email fails
    }
  } catch (error) {
    console.error('Error creating retainer:', error)
  }
}

// ──────────────── Helpers moved to reusable module (src/lib/entitlements.ts) ────────────────

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎯 Handling subscription created:', subscription.id)

  // Get client and plan from subscription metadata or customer
  // This might be more complex - we may need to store metadata on the subscription
  // For now, let's just log that we received it
  console.log('📧 Subscription created - ready to send welcome email')

  // TODO: Extract client/plan info and send welcome email
  // This would require storing clientId and planId in subscription metadata
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('🔍 Processing invoice payment succeeded:', {
    invoiceId: invoice.id,
    metadata: invoice.metadata,
    status: invoice.status,
  })

  // Update invoice status in Sanity (with idempotency check)
  if (invoice.metadata?.invoiceId) {
    const existingInvoice = await runQuery(
      `*[_type=="invoice" && _id==$invoiceId][0]{
        _id,
        status
      }`,
      { invoiceId: invoice.metadata.invoiceId }
    )

    if (existingInvoice) {
      // Only update if not already paid
      if (existingInvoice.status !== 'paid') {
        await sanityWrite.mutate([
          {
            patch: {
              id: invoice.metadata.invoiceId,
              set: {
                status: 'paid',
              },
            },
          },
        ])
        console.log(
          'Invoice status updated to paid:',
          invoice.metadata.invoiceId
        )
      } else {
        console.log(
          'Invoice already marked as paid:',
          invoice.metadata.invoiceId
        )
      }
    } else {
      console.warn(
        'Invoice not found for payment update:',
        invoice.metadata.invoiceId
      )
    }
  } else {
    console.log('No invoiceId in invoice metadata, skipping update')
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔍 Processing subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number
        current_period_end: number
      }
    ).current_period_start,
    currentPeriodEnd: (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number
        current_period_end: number
      }
    ).current_period_end,
  })

  try {
    // Update client subscription status based on Stripe customer linkage
    if (subscription.customer && typeof subscription.customer === 'string') {
      const stripeCustomerId = subscription.customer
      const client = await runQuery(
        `*[_type=="client" && stripeCustomerId==$stripeCustomerId][0]{_id, hasActiveSubscription}`,
        { stripeCustomerId }
      )
      if (client?._id) {
        const active = subscription.status === 'active'
        await sanityWrite.mutate([
          { patch: { id: client._id, set: { hasActiveSubscription: active } } },
        ])
      }
    }

    // Update retainer with new subscription details
    const result = await runQuery(
      `*[_type=="retainer" && stripeSubId==$stripeSubId][0]`,
      { stripeSubId: subscription.id }
    )

    if (result) {
      const newStatus =
        subscription.status === 'active'
          ? 'active'
          : subscription.status === 'canceled'
            ? 'canceled'
            : 'past_due'

      // Only update if status has changed
      if (result.status !== newStatus) {
        await sanityWrite.mutate([
          {
            patch: {
              id: result._id,
              set: {
                status: newStatus,
                periodStart: new Date(
                  (
                    subscription as unknown as Stripe.Subscription & {
                      current_period_start: number
                      current_period_end: number
                    }
                  ).current_period_start * 1000
                ).toISOString(),
                periodEnd: new Date(
                  (
                    subscription as unknown as Stripe.Subscription & {
                      current_period_start: number
                      current_period_end: number
                    }
                  ).current_period_end * 1000
                ).toISOString(),
              },
            },
          },
        ])
        console.log(
          'Retainer updated for subscription:',
          subscription.id,
          'new status:',
          newStatus
        )
      } else {
        console.log(
          'Retainer status unchanged for subscription:',
          subscription.id
        )
      }
    } else {
      console.warn('No retainer found for subscription:', subscription.id)
    }
  } catch (error) {
    console.error('Error updating retainer:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🔍 Processing subscription deleted:', subscription.id)
  try {
    if (subscription.customer && typeof subscription.customer === 'string') {
      const stripeCustomerId = subscription.customer
      const client = await runQuery(
        `*[_type=="client" && stripeCustomerId==$stripeCustomerId][0]{_id}`,
        { stripeCustomerId }
      )
      if (client?._id) {
        await sanityWrite.mutate([
          { patch: { id: client._id, set: { hasActiveSubscription: false } } },
        ])
        console.log('Client marked unsubscribed:', client._id)
      }
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function sendWelcomeEmail(clientId: string, planId: string) {
  console.log(`🔍 Fetching client and plan data for welcome email...`)

  try {
    // Get client and plan details
    const [client, plan] = await Promise.all([
      runQuery(
        `*[_type=="client" && _id==$clientId][0]{
          _id,
          name,
          email,
          startDate,
          slaStartTime,
          maintenanceWindow
        }`,
        { clientId }
      ),
      runQuery(
        `*[_type=="plan" && _id==$planId][0]{
          _id,
          name
        }`,
        { planId }
      ),
    ])

    if (!client || !plan || !client.email) {
      console.warn(
        `Missing client (${!!client}), plan (${!!plan}), or email (${client?.email}) for welcome email to client ${clientId}`
      )
      return
    }

    // Get email template
    const template = await getEmailTemplateByName('Welcome Activation')
    if (!template) {
      console.warn(
        `Welcome Activation email template not found for client ${clientId}`
      )
      return
    }

    // Prepare variables for template
    const vars = {
      clientName: client.name || 'Valued Client',
      planName: plan.name || 'Your Plan',
      startDate: client.startDate
        ? new Date(client.startDate).toLocaleDateString()
        : 'As soon as possible',
      slaStartTime: client.slaStartTime
        ? new Date(client.slaStartTime).toLocaleString()
        : 'To be determined',
      maintenanceWindow: client.maintenanceWindow || 'To be scheduled',
    }

    // Render email content
    const subject = mergeVars(template.subject || '', vars)
    const htmlRaw = ptToHtml(template.htmlBody)
    const textRaw = ptToPlainText(template.htmlBody)

    const html = mergeVars(htmlRaw, vars)
    const text = mergeVars(textRaw, vars)

    // Send email
    const emailPayload = {
      from: EMAIL_FROM,
      to: [client.email],
      subject,
      text: text || 'Welcome to TownesDev!',
      ...(html && { html }),
    }

    const result = await resend.emails.send(emailPayload)
    console.log(
      `Welcome email sent successfully to ${client.email}:`,
      String(result)
    )
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw error // Re-throw to be caught by caller
  }
}
