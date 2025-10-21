import { getCurrentClient } from '@/lib/auth'
import { runQuery } from '@/lib/client'
import { qFeaturesByType, qEntitlementsByAsset } from '@/sanity/lib/queries'
import Link from 'next/link'
import { ToggleFeatureButton } from '@/components/ToggleFeatureButton'

interface Asset {
  _id: string
  name: string
  type: string
  externalIds?: string[]
}

interface Entitlement {
  _id: string
  feature: {
    _id: string
    name: string
    configKey: string
  }
  activatedAt: string
}

interface Feature {
  _id: string
  name: string
  slug: { current: string }
  summary: string
  price: number
  sku: string
  configKey: string
  key?: string // For bot features
}

export default async function FeaturesPage({
  searchParams,
}: {
  searchParams: { asset?: string }
}) {
  const client = await getCurrentClient()
  const assetId = searchParams.asset

  if (!client || !assetId) {
    return <div>Access denied</div>
  }

  // Get asset with external IDs for Discord bot guild extraction
  const asset = await runQuery(
    `*[_type=="serviceAsset" && _id==$assetId && client._ref==$clientId][0]{
      _id, name, type, externalIds
    }`,
    { assetId, clientId: client._id }
  )

  if (!asset) {
    return <div>Asset not found</div>
  }

  // Extract guild ID for Discord bots
  const getGuildId = (asset: Asset): string | null => {
    if (asset.type === 'discord_bot' && asset.externalIds) {
      const guildIdMatch = asset.externalIds.find((id: string) =>
        id.startsWith('guild:')
      )
      return guildIdMatch ? guildIdMatch.replace('guild:', '') : null
    }
    return null
  }

  const guildId = getGuildId(asset)

  // Get asset type for filtering features
  const assetTypeMap = { discord_bot: 'bot', web_app: 'app' }
  const featureAssetType = assetTypeMap[asset.type as keyof typeof assetTypeMap]

  const features = await runQuery(qFeaturesByType, {
    assetType: featureAssetType,
  })
  const entitlements = await runQuery(qEntitlementsByAsset, { assetId })

  // Create a set of entitled feature IDs
  const entitledFeatureIds = new Set(
    entitlements.map((ent: Entitlement) => ent.feature._id)
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Features for {asset.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Add new capabilities to your {asset.type.replace('_', ' ')}
            </p>
          </div>
          <Link
            href="/app/assets"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Assets
          </Link>
        </div>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No features available for this asset type.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature: Feature) => {
            const isEntitled = entitledFeatureIds.has(feature._id)

            return (
              <div
                key={feature._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {feature.summary}
                    </p>
                  </div>
                  {isEntitled && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(feature.price / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">one-time purchase</p>
                </div>

                <div className="mt-6">
                  {asset.type === 'discord_bot' && guildId && feature.key ? (
                    <ToggleFeatureButton
                      featureKey={feature.key}
                      guildId={guildId}
                      clientId={client._id}
                      isEnabled={isEntitled}
                    />
                  ) : isEntitled ? (
                    <button
                      disabled
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Already Purchased
                    </button>
                  ) : (
                    <form
                      action={`/api/checkout/feature`}
                      method="POST"
                      className="w-full"
                    >
                      <input
                        type="hidden"
                        name="featureId"
                        value={feature._id}
                      />
                      <input type="hidden" name="assetId" value={assetId} />
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Purchase Feature
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
