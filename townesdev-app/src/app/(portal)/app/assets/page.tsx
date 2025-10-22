import { getCurrentClient } from '@/lib/auth'
import { runQuery } from '@/lib/client'
import { qAssetsByClient } from '@/sanity/lib/queries'
import Link from 'next/link'
import { Bot, Globe, ShoppingCart, Smartphone } from 'lucide-react'

interface Asset {
  _id: string
  name: string
  type: string
  externalIds: string[]
  notes?: string
  status?: string
}

// Asset type configurations
const assetTypeConfig = {
  discord_bot: {
    icon: Bot,
    label: 'Discord Bot',
    description: 'Server automation and moderation',
    color: 'bg-purple-100 text-purple-800',
  },
  website: {
    icon: Globe,
    label: 'Website',
    description: 'Frontend web application',
    color: 'bg-blue-100 text-blue-800',
  },
  ecommerce: {
    icon: ShoppingCart,
    label: 'E-commerce Store',
    description: 'Online store and shopping cart',
    color: 'bg-green-100 text-green-800',
  },
  mobile_app: {
    icon: Smartphone,
    label: 'Mobile App',
    description: 'iOS and Android application',
    color: 'bg-orange-100 text-orange-800',
  },
} as const

export default async function AssetsPage() {
  const client = await getCurrentClient()

  if (!client) {
    return <div>Access denied</div>
  }

  const assets = await runQuery(qAssetsByClient, { clientId: client._id })

  // Group assets by type for better organization
  const assetsByType = assets.reduce((acc: Record<string, Asset[]>, asset: Asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = []
    }
    acc[asset.type].push(asset)
    return acc
  }, {})

  const renderAssetCard = (asset: Asset) => {
    const config = assetTypeConfig[asset.type as keyof typeof assetTypeConfig]
    const IconComponent = config?.icon || Globe
    const status = asset.status || 'active'

    return (
      <div
        key={asset._id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${config?.color || 'bg-gray-100 text-gray-800'}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {asset.name}
              </h3>
              <p className="text-sm text-gray-500">
                {config?.description || asset.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status === 'active' ? 'Active' : 'Maintenance'}
          </span>
        </div>

        {asset.externalIds && asset.externalIds.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              Configuration:
            </p>
            <ul className="mt-1 text-sm text-gray-600">
              {asset.externalIds.map((id: string, index: number) => (
                <li key={index} className="truncate">
                  • {id.includes(':') ? id.split(':')[1] : id}
                </li>
              ))}
            </ul>
          </div>
        )}

        {asset.notes && (
          <p className="mt-4 text-sm text-gray-600">{asset.notes}</p>
        )}

        <div className="mt-6 flex space-x-3">
          <Link
            href={`/app/features?asset=${asset._id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Manage Features
          </Link>
          {asset.type === 'discord_bot' && (
            <Link
              href={`/app/assets/${asset._id}/config`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Bot Config
            </Link>
          )}
          {(asset.type === 'website' || asset.type === 'ecommerce') && (
            <Link
              href={`/app/assets/${asset._id}/analytics`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Analytics
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Assets</h1>
        <p className="text-gray-600 mt-2">
          Manage your digital services and applications
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <Globe className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No assets found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact support to add your first digital asset.
          </p>
          <div className="mt-6">
            <Link
              href="/app/entitlements"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View Entitlements
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Show all assets if only one type, or group by type if multiple */}
          {Object.keys(assetsByType).length === 1 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {assets.map(renderAssetCard)}
            </div>
          ) : (
            Object.entries(assetsByType).map(([type, typeAssets]) => {
              const config = assetTypeConfig[type as keyof typeof assetTypeConfig]
              const IconComponent = config?.icon || Globe
              const assetList = typeAssets as Asset[]
              
              return (
                <div key={type}>
                  <div className="flex items-center space-x-2 mb-4">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {config?.label || type.replace('_', ' ')}
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {assetList.length}
                    </span>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assetList.map(renderAssetCard)}
                  </div>
                </div>
              )
            })
          )}

          {/* Quick Action Links */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/app/entitlements"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">View Entitlements</h4>
                  <p className="text-sm text-gray-500">Subscriptions & purchases</p>
                </div>
              </Link>
              <Link
                href="/app/plans"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Upgrade Plan</h4>
                  <p className="text-sm text-gray-500">Enhanced support & features</p>
                </div>
              </Link>
              <Link
                href="/app/incidents"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Support Tickets</h4>
                  <p className="text-sm text-gray-500">Get help when needed</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
