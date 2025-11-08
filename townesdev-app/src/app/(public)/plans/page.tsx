import { runQueryNoCache } from '@/lib/client'
import { qPlans } from '@/sanity/lib/queries'
import { draftMode } from 'next/headers'
import { PlansPicker } from '@/components/public/PlansPicker'
import { PortfolioShowcase } from '@/components/public/PortfolioShowcase'

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
  marketSegment?:
    | 'small_business'
    | 'discord_bot'
    | 'musician'
    | 'general'
    | string
}

async function getPlans(): Promise<Plan[]> {
  const { isEnabled } = await draftMode()
  const plans = await runQueryNoCache(qPlans, {}, isEnabled)
  return plans
}

export const revalidate = 0 // Always fetch fresh plans to reflect catalog updates

export default async function PlansPage() {
  const plans = await getPlans()
  const basePlans = plans.filter((p) => p.category === 'base')
  const addOnPlans = plans.filter((p) => p.category === 'addon')
  const oneTimePlans = plans.filter((p) => p.category === 'one_time')

  const segmentConfigs = [
    {
      id: 'small_business',
      anchor: 'small-business',
      title: 'Small Business Plans',
      description:
        'Professional websites and digital solutions to help your business grow online',
    },
    {
      id: 'discord_bot',
      anchor: 'discord',
      title: 'Discord Community Plans',
      description:
        'Custom Discord bots and automation to engage and manage your community',
    },
    {
      id: 'musician',
      anchor: 'musicians',
      title: 'Musician Plans',
      description:
        'Beautiful websites and tools to showcase your music and connect with fans',
    },
  ] as const

  const filterBySegment = (items: Plan[], segmentId: string) =>
    items.filter((item) => {
      if (!item.marketSegment || item.marketSegment === 'general') {
        return true
      }
      return item.marketSegment === segmentId
    })

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
          {segmentConfigs.map((segment) => (
            <a
              key={segment.id}
              href={`#${segment.anchor}`}
              className="px-6 py-3 bg-white border-2 border-nile-blue-600 text-nile-blue-600 rounded-lg font-semibold hover:bg-nile-blue-50 transition-colors"
            >
              {segment.title}
            </a>
          ))}
        </div>

        {segmentConfigs.map((segment) => (
          <div
            key={segment.id}
            id={segment.anchor}
            className="mb-16 scroll-mt-4"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-nile-blue-900 mb-2">
                {segment.title}
              </h2>
              <p className="text-gray-600">{segment.description}</p>
            </div>
            <PlansPicker
              basePlans={filterBySegment(basePlans, segment.id)}
              addOnPlans={filterBySegment(addOnPlans, segment.id)}
              oneTimePlans={filterBySegment(oneTimePlans, segment.id)}
            />
          </div>
        ))}
      </div>
      
      {/* Portfolio Examples Section */}
      <PortfolioShowcase />
    </div>
  )
}
