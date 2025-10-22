import { getCurrentClient } from '@/lib/auth'
import { runPortalQuery } from '@/lib/portal/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Asset {
  _id: string
  name: string
  type: string
}

interface Feature {
  _id: string
  name: string
  summary: string
  price: number
  sku: string
}

interface Entitlement {
  _id: string
  feature: Feature
  asset: Asset
  activatedAt: string
  expiresAt?: string
}

interface Subscription {
  _id: string
  plan: {
    name: string
    billingCycle: string
    price: number
  }
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
}

export default async function EntitlementsPage() {
  const client = await getCurrentClient()

  if (!client) {
    return <div>Access denied</div>
  }

  // Get client's entitlements with feature and asset details
  const entitlements = await runPortalQuery(
    `*[_type=="entitlement" && client._ref==$clientId] | order(activatedAt desc) {
      _id,
      activatedAt,
      expiresAt,
      feature->{
        _id,
        name,
        summary,
        price,
        sku
      },
      asset->{
        _id,
        name,
        type
      }
    }`,
    { clientId: client._id }
  )

  // Get client's active subscription
  const subscription = await runPortalQuery(
    `*[_type=="subscription" && client._ref==$clientId && status=="active"][0]{
      _id,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      plan->{
        name,
        billingCycle,
        price
      }
    }`,
    { clientId: client._id }
  )

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Entitlements</h1>
        <p className="text-gray-600 mt-2">
          View your active subscriptions and purchased features
        </p>
      </div>

      {/* Active Subscription Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Base Subscription
        </h2>
        {subscription ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {subscription.plan.name} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription.plan.billingCycle} billing
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatPrice(subscription.plan.price)}
                  <span className="text-sm font-normal text-gray-500">
                    /{subscription.plan.billingCycle}
                  </span>
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Current Period</p>
                  <p className="text-gray-600">
                    {formatDate(subscription.currentPeriodStart)} -{' '}
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Next Billing</p>
                  <p className="text-gray-600">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/app/plans"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-gray-500">No active subscription</p>
              <p className="text-sm text-gray-400 mt-1">
                Choose a plan to get started with ongoing support and
                maintenance
              </p>
              <div className="mt-4">
                <Link
                  href="/app/plans"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Entitlements Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Feature Purchases
        </h2>
        {entitlements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <p className="text-gray-500">No feature purchases yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Purchase features to enhance your assets
              </p>
              <div className="mt-4">
                <Link
                  href="/app/assets"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Features
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {entitlements.map((entitlement: Entitlement) => (
              <div
                key={entitlement._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {entitlement.feature.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {entitlement.feature.summary}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>Asset: {entitlement.asset.name}</span>
                      <span>•</span>
                      <span>
                        Type: {entitlement.asset.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(entitlement.feature.price)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Activated</p>
                      <p className="text-gray-600">
                        {formatDate(entitlement.activatedAt)}
                        <span className="text-gray-500 ml-1">
                          (
                          {formatDistanceToNow(
                            new Date(entitlement.activatedAt),
                            { addSuffix: true }
                          )}
                          )
                        </span>
                      </p>
                    </div>
                    {entitlement.expiresAt && (
                      <div className="text-right">
                        <p className="font-medium text-gray-700">Expires</p>
                        <p className="text-gray-600">
                          {formatDate(entitlement.expiresAt)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/app/features?asset=${entitlement.asset._id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Manage Features
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
