'use client'

import { PricingCard, PricingTier } from './PricingCard'

interface PricingSegmentProps {
  title: string
  description: string
  tiers: PricingTier[]
}

export function PricingSegment({ title, description, tiers }: PricingSegmentProps) {
  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-nile-blue-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <PricingCard key={index} tier={tier} />
        ))}
      </div>
    </section>
  )
}
