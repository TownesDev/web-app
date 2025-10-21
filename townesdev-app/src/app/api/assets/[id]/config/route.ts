import { NextRequest, NextResponse } from 'next/server'
import { runQuery } from '@/lib/client'
import { qEntitlementsByAsset } from '@/sanity/lib/queries'

interface Entitlement {
  feature: {
    configKey: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assetId } = await params

    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })
    }

    // Verify asset exists
    const asset = await runQuery(
      `*[_type=="serviceAsset" && _id==$assetId][0]{
        _id, client->{_id}
      }`,
      { assetId }
    )

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Get active entitlements for this asset
    const entitlements = await runQuery(qEntitlementsByAsset, { assetId })

    // Build feature flags object
    const flags: Record<string, boolean> = {}
    entitlements.forEach((entitlement: Entitlement) => {
      flags[entitlement.feature.configKey] = true
    })

    return NextResponse.json({
      assetId,
      flags,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Asset config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
