import Stripe from 'stripe'
import { runQuery } from './client'
import { sanityWrite } from './client'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

/**
 * Get or create a Stripe customer for a client
 */
export async function getOrCreateCustomer(client: {
  _id: string
  name: string
  email: string
  stripeCustomerId?: string
}): Promise<string> {
  // If client already has a Stripe customer ID, return it
  if (client.stripeCustomerId) {
    return client.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: client.email,
    name: client.name,
    metadata: {
      clientId: client._id,
    },
  })

  // Update client with Stripe customer ID
  console.log(
    'Updating client',
    client._id,
    'with stripeCustomerId',
    customer.id
  )
  await sanityWrite.mutate([
    {
      patch: {
        id: client._id,
        set: {
          stripeCustomerId: customer.id,
        },
      },
    },
  ])

  return customer.id
}

/**
 * Get client by user ID
 */
export async function getClientByUserId(userId: string) {
  return await runQuery(
    `*[_type=="client" && user._ref==$userId][0]{
      _id,
      name,
      email,
      stripeCustomerId,
      selectedPlan
    }`,
    { userId }
  )
}

/**
 * Get plan by ID with Stripe fields
 */
export async function getPlanById(planId: string) {
  return await runQuery(
    `*[_type=="plan" && _id==$planId][0]{
      _id,
      name,
      stripeProductId,
      stripePriceId,
      hoursIncluded,
      description
    }`,
    { planId }
  )
}
