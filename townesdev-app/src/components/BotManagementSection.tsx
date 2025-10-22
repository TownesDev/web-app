import { runAdminQuery } from '@/lib/admin/client'
import { TenantProvisioning } from './TenantProvisioning'
import { GuildManagement } from './GuildManagement'
import { FeatureManagement } from './FeatureManagement'

interface Client {
  _id: string
  name: string
  email: string
  status: string
  botTenantId?: string
  botApiKey?: string
  selectedPlan?: {
    name: string
  }
}

interface BotManagementSectionProps {
  clientId: string
  client: Client
}

export async function BotManagementSection({
  clientId,
  client,
}: BotManagementSectionProps) {
  // Fetch client's service assets (guilds)
  const assets = await runAdminQuery(
    `*[_type=="serviceAsset" && client._ref==$clientId && type=="discord_bot"]{
      _id,
      name,
      type,
      externalIds,
      status,
      _createdAt
    }`,
    { clientId }
  )

  // Fetch client's entitlements
  const entitlements = await runAdminQuery(
    `*[_type=="entitlement" && client._ref==$clientId]{
      _id,
      asset,
      feature->{name, key, sku},
      status,
      activatedAt,
      stripePaymentIntentId
    }`,
    { clientId }
  )

  return (
    <div className="space-y-8">
      {/* Tenant Provisioning */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Bot Platform Integration
        </h2>
        <TenantProvisioning clientId={clientId} client={client} />
      </div>

      {/* Guild Management */}
      {client.botTenantId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Discord Guilds
          </h2>
          <GuildManagement
            clientId={clientId}
            client={client}
            assets={assets}
          />
        </div>
      )}

      {/* Feature Management */}
      {assets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Feature Management
          </h2>
          <FeatureManagement
            clientId={clientId}
            assets={assets}
            entitlements={entitlements}
          />
        </div>
      )}
    </div>
  )
}
