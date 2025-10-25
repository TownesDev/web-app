import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/rbac/guards'
import { runQuery, sanityWrite } from '@/lib/client'
import {
  ensureClientAsset,
  ensureFeature,
  mapPlanToFeature,
} from '@/lib/entitlements'
import { runAdminQuery } from '@/lib/admin/client'
import { qPlanFeatureMappings } from '@/sanity/lib/queries'

export async function POST(req: NextRequest) {
  await requireStaff()

  const { clientId, planIds } = (await req.json().catch(() => ({}))) as {
    clientId?: string
    planIds?: string[]
  }

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  // Fetch client
  const client = await runQuery(
    `*[_type=="client" && _id==$id][0]{ _id, selectedPlan->{_id}, selectedAddons[]->{_id} }`,
    { id: clientId }
  )
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  type PlanRef = { _id: string }
  const selectedAddons = (client.selectedAddons || []) as PlanRef[]
  const selectedPlanIds: string[] = [
    client.selectedPlan?._id as string | undefined,
    ...selectedAddons.map((p) => p._id),
  ].filter(Boolean) as string[]

  const targetPlanIds = (
    Array.isArray(planIds) && planIds.length ? planIds : selectedPlanIds
  ) as string[]

  // Load Sanity-driven mapping table
  const mappings = (await runAdminQuery(qPlanFeatureMappings)) as Array<{
    plan?: { _id: string }
    feature?: {
      _id: string
      name: string
      key?: string
      assetType?: 'web_app' | 'discord_bot'
    }
  }>

  const mappingLookup = new Map(
    mappings
      .filter((m) => m.plan?._id && m.feature?._id)
      .map((m) => [m.plan!._id, m.feature!])
  )

  const created: Array<{ featureId: string; assetId: string }> = []
  const skipped: Array<{ planId: string; reason: string }> = []

  for (const pid of targetPlanIds) {
    // Prefer Sanity mapping; fallback to heuristic
    const mappedFeature = mappingLookup.get(pid)
    let featureDoc: {
      _id: string
      name?: string
      key?: string
      assetType?: 'web_app' | 'discord_bot'
    } | null = null

    if (mappedFeature) {
      featureDoc = {
        _id: mappedFeature._id,
        name: mappedFeature.name,
        key: mappedFeature.key,
        assetType: mappedFeature.assetType,
      }
    } else {
      const heuristic = mapPlanToFeature(pid)
      if (!heuristic) {
        skipped.push({ planId: pid, reason: 'No mapping found' })
        continue
      }
      // Ensure feature exists for heuristic mapping
      const ensured = await ensureFeature(heuristic)
      featureDoc = {
        _id: ensured._id,
        key: heuristic.key,
        assetType: heuristic.assetType,
      }
    }

    // Ensure asset exists for client matching the feature's assetType (if known)
    const assetType = featureDoc?.assetType || 'web_app'
    const asset = await ensureClientAsset(clientId, assetType)

    // Check entitlement existence
    const existing = await runQuery(
      `*[_type=="entitlement" && client._ref==$clientId && asset._ref==$assetId && feature._ref==$featureId][0]{ _id }`,
      { clientId, assetId: asset._id, featureId: featureDoc._id }
    )
    if (existing?._id) {
      skipped.push({ planId: pid, reason: 'Entitlement already exists' })
      continue
    }

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
    created.push({ featureId: featureDoc._id, assetId: asset._id })
  }

  return NextResponse.json({ created, skipped })
}
