import { runQuery, sanityWrite } from '@/lib/client'

export type AssetType = 'web_app' | 'discord_bot'

export type FeatureMapping = {
  planId: string
  assetType: AssetType
  key: string
  name: string
  summary: string
}

// Map a plan _id to a concrete feature mapping. This is a lightweight heuristic
// that matches our seeded IDs (see sample-content/seed-plans-services.mjs).
// Later, we can replace this with a CMS-driven mapping table.
export function mapPlanToFeature(planId: string): FeatureMapping | null {
  const id = planId.toLowerCase()

  if (id.includes('webapp-starter'))
    return {
      planId,
      assetType: 'web_app',
      key: 'tier.starter',
      name: 'Web App Tier: Starter',
      summary: 'Starter hosting & maintenance tier',
    }
  if (id.includes('webapp-pro'))
    return {
      planId,
      assetType: 'web_app',
      key: 'tier.pro',
      name: 'Web App Tier: Pro',
      summary: 'Pro hosting & maintenance tier',
    }
  if (id.includes('webapp-plus'))
    return {
      planId,
      assetType: 'web_app',
      key: 'tier.plus',
      name: 'Web App Tier: Plus',
      summary: 'Plus hosting & maintenance tier',
    }
  if (id.includes('discord-bronze'))
    return {
      planId,
      assetType: 'discord_bot',
      key: 'tier.bronze',
      name: 'Discord Tier: Bronze',
      summary: 'Entry-tier Discord bot hosting & maintenance',
    }
  if (id.includes('discord-silver'))
    return {
      planId,
      assetType: 'discord_bot',
      key: 'tier.silver',
      name: 'Discord Tier: Silver',
      summary: 'Mid-tier Discord bot hosting & maintenance',
    }
  if (id.includes('discord-gold'))
    return {
      planId,
      assetType: 'discord_bot',
      key: 'tier.gold',
      name: 'Discord Tier: Gold',
      summary: 'Gold-tier Discord bot hosting & maintenance',
    }

  return null
}

// Optionally, a Sanity-driven lookup can be added here later to supersede the heuristic.

export async function ensureClientAsset(
  clientId: string,
  assetType: AssetType
): Promise<{ _id: string }> {
  const existing = await runQuery(
    `*[_type=="serviceAsset" && client._ref==$clientId && type==$type][0]{ _id }`,
    { clientId, type: assetType }
  )
  if (existing?._id) return existing

  const name = assetType === 'web_app' ? 'Website Asset' : 'Discord Bot Asset'
  const deterministicId = `asset.${clientId}.${assetType}`
  await sanityWrite.mutate([
    {
      createIfNotExists: {
        _id: deterministicId,
        _type: 'serviceAsset',
        name,
        client: { _type: 'reference', _ref: clientId },
        type: assetType,
        status: 'active',
      },
    },
  ])
  return { _id: deterministicId }
}

export async function ensureFeature(
  mapping: FeatureMapping
): Promise<{ _id: string }> {
  const { assetType, key, name, summary } = mapping
  const existing = await runQuery(
    `*[_type=="feature" && assetType==$assetType && key==$key][0]{ _id }`,
    { assetType, key }
  )
  if (existing?._id) return existing

  const sku = `sku_${assetType
    .replace(/[^a-z]/g, '')
    .trim()}_${key.replace(/[^a-z.]/g, '').replace(/\./g, '_')}`
  const deterministicId = `feature.${assetType}.${key.replace(
    /[^a-z0-9._-]/gi,
    '_'
  )}`

  await sanityWrite.mutate([
    {
      createIfNotExists: {
        _id: deterministicId,
        _type: 'feature',
        name,
        assetType,
        key,
        summary,
        price: 0,
        sku,
        configKey: key,
        isPrivate: true,
      },
    },
  ])
  return { _id: deterministicId }
}
