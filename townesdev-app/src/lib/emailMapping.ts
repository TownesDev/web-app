/**
 * Email-to-Client Mapping Utilities
 * Enhanced mapping logic for finding clients based on email addresses
 */

import { runQuery } from './client'
import { qClientByEmail } from '../sanity/lib/queries'

export interface ClientLookupResult {
  client: ClientDocument | null
  matchType: 'exact' | 'domain' | 'none'
  matchedEmail?: string
}

interface ClientDocument {
  _id: string
  name: string
  email: string
  status: string
  startDate?: string
  maintenanceWindow?: string
  selectedPlan?: {
    name: string
    price: number
    features: string[]
  }
}

/**
 * Find client by email address with fallback strategies
 * 1. Exact email match
 * 2. Domain match for organization emails
 * 3. Return null if no match found
 */
export async function findClientByEmail(
  emailAddress: string
): Promise<ClientLookupResult> {
  if (!emailAddress || !emailAddress.includes('@')) {
    return { client: null, matchType: 'none' }
  }

  const normalizedEmail = emailAddress.toLowerCase().trim()

  // Strategy 1: Exact email match
  console.log(`[Email Mapping] Attempting exact match for: ${normalizedEmail}`)
  const exactClient = await runQuery(qClientByEmail, { email: normalizedEmail })

  if (exactClient) {
    console.log(
      `[Email Mapping] Found exact match for ${normalizedEmail}:`,
      exactClient.name
    )
    return {
      client: exactClient,
      matchType: 'exact',
      matchedEmail: normalizedEmail,
    }
  }

  // Strategy 2: Domain-based matching for organization emails
  const [, domain] = normalizedEmail.split('@')
  console.log(`[Email Mapping] Attempting domain match for: ${domain}`)

  const domainClient = await findClientByDomain(domain)
  if (domainClient) {
    console.log(
      `[Email Mapping] Found domain match for ${domain}:`,
      domainClient.name
    )
    return {
      client: domainClient,
      matchType: 'domain',
      matchedEmail: normalizedEmail,
    }
  }

  console.log(`[Email Mapping] No client found for email: ${normalizedEmail}`)
  return { client: null, matchType: 'none' }
}

/**
 * Find client by domain matching
 * This allows organizations to send emails from different addresses
 * but still map to the correct client account
 */
async function findClientByDomain(
  domain: string
): Promise<ClientDocument | null> {
  // Query for clients where the email domain matches
  const domainQuery = `
    *[_type=="client" && email match "*@${domain}"][0]{
      _id, name, email, status,
      startDate, maintenanceWindow,
      selectedPlan->{name,price,features}
    }
  `

  try {
    const client = await runQuery(domainQuery)
    return client || null
  } catch (error) {
    console.error(
      `[Email Mapping] Error in domain lookup for ${domain}:`,
      error
    )
    return null
  }
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extract email address from various formats
 * Handles: "Name <email@domain.com>", "email@domain.com", etc.
 */
export function extractEmailAddress(emailString: string): string | null {
  if (!emailString) return null

  // Handle "Name <email@domain.com>" format
  const angleMatch = emailString.match(/<([^>]+)>/)
  if (angleMatch) {
    return angleMatch[1].trim()
  }

  // Handle plain email or extract from string
  const emailMatch = emailString.match(/[\w\.-]+@[\w\.-]+\.\w+/)
  if (emailMatch) {
    return emailMatch[0].trim()
  }

  // Return original if it looks like an email
  if (isValidEmail(emailString.trim())) {
    return emailString.trim()
  }

  return null
}
