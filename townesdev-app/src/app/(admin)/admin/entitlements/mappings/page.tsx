import { requireStaff } from '@/lib/rbac/guards'
import { runAdminQuery } from '@/lib/admin/client'
import {
  qPlanFeatureMappings,
  qPlansAll,
  qFeaturesAll,
} from '@/sanity/lib/queries'
import PlanFeatureMappings from '../ui/PlanFeatureMappings'

export const revalidate = 0

export default async function PlanFeatureMappingsPage() {
  await requireStaff()

  const [mappings, plans, features] = await Promise.all([
    runAdminQuery(qPlanFeatureMappings),
    runAdminQuery(qPlansAll),
    runAdminQuery(qFeaturesAll),
  ])

  return (
    <div className="p-6 space-y-6 font-sans">
      <h1 className="text-3xl font-semibold text-slate-900">
        Plan → Feature Mappings
      </h1>
      <p className="text-base text-slate-700">
        Create or update mappings to control which feature is entitled for each
        plan.
      </p>
      <PlanFeatureMappings
        mappings={mappings || []}
        plans={plans || []}
        features={features || []}
      />
    </div>
  )
}
