import { NextRequest, NextResponse } from 'next/server'
import { requireCapability } from '@/lib/rbac/guards'
import { getClient, updateClientBotData } from '@/lib/bot'

// Bot Platform API configuration
const BOT_API_URL = process.env.BOT_API_URL
const BOT_API_KEY = process.env.BOT_API_KEY

interface BotTenantResponse {
  tenantId: string
  apiKey: string
  plan: string
}

export async function POST(request: NextRequest) {
  try {
    // Require bot tenant provisioning capability
    await requireCapability('bot:tenants:provision')

    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Verify client exists and get current data
    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Check if client already has bot tenant
    if (client.botTenantId) {
      return NextResponse.json(
        { success: false, error: 'Client already has bot tenant' },
        { status: 409 }
      )
    }

    // Call Bot Platform API to create tenant
    const botResponse = await fetch(`${BOT_API_URL}/tenants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BOT_API_KEY!,
      },
      body: JSON.stringify({
        ownerUserId: client.user?._ref || 'system',
        plan: 'trial', // Default to trial, can be upgraded later
      }),
    })

    if (!botResponse.ok) {
      const errorData = await botResponse.json()
      console.error('Bot platform tenant creation failed:', errorData)
      return NextResponse.json(
        { success: false, error: 'Failed to create bot tenant' },
        { status: 500 }
      )
    }

    const botData: BotTenantResponse = await botResponse.json()

    // Update client record with bot platform data
    await updateClientBotData(clientId, {
      botTenantId: botData.tenantId,
      botApiKey: botData.apiKey,
    })

    return NextResponse.json({
      success: true,
      data: {
        tenantId: botData.tenantId,
        plan: botData.plan,
      },
    })
  } catch (error) {
    console.error('Bot tenant provisioning error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
