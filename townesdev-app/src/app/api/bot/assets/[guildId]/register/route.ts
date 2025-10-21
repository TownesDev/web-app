import { NextRequest, NextResponse } from 'next/server'
import { requireCapability } from '@/lib/rbac/guards'
import { getClient } from '@/lib/bot'
import { sanityWrite } from '@/lib/client'

// Bot Platform API configuration
const BOT_API_URL = process.env.BOT_API_URL

interface BotGuildResponse {
  id: string
  name: string
  memberCount: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    // Require bot asset registration capability
    await requireCapability('bot:assets:register')

    const { guildId } = await params
    const { clientId, guildName } = await request.json()

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Client ID is required' },
        { status: 400 }
      )
    }

    if (!guildName) {
      return NextResponse.json(
        { success: false, error: 'Guild name is required' },
        { status: 400 }
      )
    }

    // Verify client exists and has bot tenant
    const client = await getClient(clientId)
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    if (!client.botTenantId || !client.botApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client does not have bot tenant provisioned',
        },
        { status: 400 }
      )
    }

    // Call Bot Platform API to register guild
    const botResponse = await fetch(
      `${BOT_API_URL}/tenants/${client.botTenantId}/guilds`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': client.botApiKey,
        },
        body: JSON.stringify({
          id: guildId,
          name: guildName,
        }),
      }
    )

    if (!botResponse.ok) {
      const errorData = await botResponse.json()
      console.error('Bot platform guild registration failed:', errorData)
      return NextResponse.json(
        { success: false, error: 'Failed to register guild' },
        { status: 500 }
      )
    }

    const botData: BotGuildResponse = await botResponse.json()

    // Create serviceAsset record in Sanity
    const assetData = {
      _type: 'serviceAsset',
      client: {
        _type: 'reference',
        _ref: clientId,
      },
      type: 'discord_bot',
      name: botData.name,
      externalIds: [`guild:${guildId}`],
      status: 'active',
    }

    const asset = await sanityWrite.create(assetData)

    return NextResponse.json({
      success: true,
      data: {
        assetId: asset._id,
        guildId: botData.id,
        name: botData.name,
        memberCount: botData.memberCount,
      },
    })
  } catch (error) {
    console.error('Bot asset registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
