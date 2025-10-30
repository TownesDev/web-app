import { requireStaff } from '@/lib/rbac/guards'
import { runAdminQuery } from '@/lib/admin/client'
import {
  qAdminEntitlementsOverview,
  qPlanFeatureMappings,
} from '@/sanity/lib/queries'
import EntitlementsTable from './ui/EntitlementsTable'

export const revalidate = 0 // always fresh for admin

export default async function AdminEntitlementsPage() {
  await requireStaff()

  const [clients, mappings] = await Promise.all([
    runAdminQuery(qAdminEntitlementsOverview),
    runAdminQuery(qPlanFeatureMappings),
  ])

  // Compute per-client mismatches using mappings
  type Feature = { _id: string; name: string; key?: string; assetType?: string }
  type Mapping = { feature: Feature }
  const mappingByPlan: Record<string, Mapping> = {}
  for (const m of mappings || []) {
    if (m?.plan?._id) mappingByPlan[m.plan._id] = { feature: m.feature }
  }

  type Plan = { _id: string; name: string; category?: string }
  type Asset = { _id: string; name: string; type: string }
  type Entitlement = { _id: string; asset?: Asset; feature: Feature }
  type ClientRow = {
    _id: string
    name: string
    email?: string
    selectedPlan?: Plan | null
    selectedAddons?: Plan[]
    assets: Asset[]
    entitlements: Entitlement[]
  }

  const data =
    (clients as ClientRow[] | undefined)?.map((c) => {
      const selectedPlans = [
        c.selectedPlan,
        ...(c.selectedAddons || []),
      ].filter(Boolean) as Plan[]
      const expectedFeatures = selectedPlans
        .map((p) => mappingByPlan[p._id]?.feature)
        .filter(Boolean) as Feature[]

      const existingFeatures = new Set(
        (c.entitlements || []).map((e) => e.feature?._id)
      )

      const missing = expectedFeatures.filter(
        (f) => !existingFeatures.has(f._id)
      )

      // Extra entitlements whose feature isn't mapped from any selected plan
      const allowedFeatureIds = new Set(expectedFeatures.map((f) => f._id))
      const extra = (c.entitlements || []).filter(
        (e) => !allowedFeatureIds.has(e.feature?._id)
      )

      return { ...c, mismatches: { missing, extra } }
    }) || []

  return (
    <div className="p-6 space-y-6 font-sans">
      <h1 className="text-3xl font-semibold text-slate-900">
        Entitlements Overview
      </h1>
      <p className="text-base text-slate-700">
        Visualize plan-to-feature entitlements per client and reconcile missing
        or extra entries.
      </p>
      <EntitlementsTable clients={data} />
    </div>
  )
}
