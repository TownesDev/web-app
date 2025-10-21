/**
 * Bot Platform API Utilities
 * Helper functions for bot platform integration
 */

import { runQuery, sanityWrite } from '@/lib/client'

/**
 * Get client by ID with bot platform fields
 */
export async function getClient(clientId: string) {
  return await runQuery(
    `*[_type=="client" && _id==$clientId][0]{
      _id,
      name,
      email,
      status,
      user,
      botTenantId,
      botApiKey,
      selectedPlan
    }`,
    { clientId }
  )
}

/**
 * Update client with bot platform data
 */
export async function updateClientBotData(
  clientId: string,
  botData: {
    botTenantId?: string
    botApiKey?: string
  }
) {
  return await sanityWrite.patch(clientId).set(botData).commit()
}
