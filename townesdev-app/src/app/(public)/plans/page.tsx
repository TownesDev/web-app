import { runPublicQuery } from '@/lib/public/client'
import { qPlans } from '@/sanity/lib/queries'
import { draftMode } from 'next/headers'
import { PlansPicker } from '@/components/public/PlansPicker'

interface Plan {
  _id: string
  name: string
  price: string
  features: string[]
  description: string
  category: 'base' | 'addon' | 'one_time' | string
  interval?: 'month' | 'year'
  visibility?: 'public' | 'internal'
  stripeProductId?: string
  stripePriceId?: string
  hoursIncluded?: number
}

async function getPlans(): Promise<Plan[]> {
  const { isEnabled } = await draftMode()
  const plans = await runPublicQuery(qPlans, {}, isEnabled)
  return plans
}

export const revalidate = 3600 // Revalidate every hour for marketing content

export default async function PlansPage() {
  const plans = await getPlans()
  const basePlans = plans.filter((p) => p.category === 'base')
  const addOnPlans = plans.filter((p) => p.category === 'addon')
  const oneTimePlans = plans.filter((p) => p.category === 'one_time')

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your business needs. All plans include
            our core features with different levels of support and
            customization.
          </p>
        </div>

        {/* Market Segment Navigation */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <a
            href="#small-business"
            className="px-6 py-3 bg-white border-2 border-nile-blue-600 text-nile-blue-600 rounded-lg font-semibold hover:bg-nile-blue-50 transition-colors"
          >
            Small Business Plans
          </a>
          <a
            href="#discord"
            className="px-6 py-3 bg-white border-2 border-nile-blue-600 text-nile-blue-600 rounded-lg font-semibold hover:bg-nile-blue-50 transition-colors"
          >
            Discord Community Plans
          </a>
          <a
            href="#musicians"
            className="px-6 py-3 bg-white border-2 border-nile-blue-600 text-nile-blue-600 rounded-lg font-semibold hover:bg-nile-blue-50 transition-colors"
          >
            Musician Plans
          </a>
        </div>

        {/* Small Business Section */}
        <div id="small-business" className="mb-16 scroll-mt-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nile-blue-900 mb-2">
              Small Business Plans
            </h2>
            <p className="text-gray-600">
              Professional websites and digital solutions to help your business
              grow online
            </p>
          </div>
          <PlansPicker
            basePlans={basePlans}
            addOnPlans={addOnPlans}
            oneTimePlans={oneTimePlans}
          />
        </div>

        {/* Discord Communities Section */}
        <div id="discord" className="mb-16 scroll-mt-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nile-blue-900 mb-2">
              Discord Community Plans
            </h2>
            <p className="text-gray-600">
              Custom Discord bots and automation to engage and manage your
              community
            </p>
          </div>
          <PlansPicker
            basePlans={basePlans}
            addOnPlans={addOnPlans}
            oneTimePlans={oneTimePlans}
          />
        </div>

        {/* Musicians Section */}
        <div id="musicians" className="mb-16 scroll-mt-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nile-blue-900 mb-2">
              Musician Plans
            </h2>
            <p className="text-gray-600">
              Beautiful websites and tools to showcase your music and connect
              with fans
            </p>
          </div>
          <PlansPicker
            basePlans={basePlans}
            addOnPlans={addOnPlans}
            oneTimePlans={oneTimePlans}
          />
        </div>
      </div>
    </div>
  )
}
