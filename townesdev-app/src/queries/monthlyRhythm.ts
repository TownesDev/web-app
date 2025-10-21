/**
 * Monthly Rhythm Queries
 * Functions for fetching monthly rhythm data for portal use
 */

import { runQuery } from '../lib/client'
import {
  qMonthlyRhythmByClient,
  qMonthlyRhythmForClientMonth,
} from '../sanity/lib/queries'

/**
 * Get monthly rhythm entries for a specific client, sorted by newest first
 */
export async function getMonthlyRhythmByClient(clientId: string) {
  return runQuery(qMonthlyRhythmByClient, { clientId })
}

/**
 * Get a specific monthly rhythm entry for a client and month
 */
export async function getMonthlyRhythmForClientMonth(
  clientId: string,
  month: string
) {
  return runQuery(qMonthlyRhythmForClientMonth, { clientId, month })
}

/**
 * Get recent monthly rhythm entries across all clients for admin dashboard
 */
export async function getRecentMonthlyRhythms(limit: number = 10) {
  return runQuery(/* groq */ `
    *[_type=="monthlyRhythm"]|order(_updatedAt desc)[0...${limit}]{
      _id, month, hoursUsed, hoursIncluded,
      week1Patch, week2Observability, week3Hardening, week4Report,
      _updatedAt,
      client->{_id, name}
    }
  `)
}
