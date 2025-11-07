'use client'

import Link from 'next/link'

export interface PricingTier {
  name: string
  oneTimePrice: string
  monthlyPrice: string
  features: string[]
  badge?: 'Starter' | 'Pro' | 'Premium' | 'Community' | 'Guild' | 'Enterprise' | 'Solo' | 'Band' | 'Label'
}

interface PricingCardProps {
  tier: PricingTier
}

export function PricingCard({ tier }: PricingCardProps) {
  const getBadgeColor = (badge: string | undefined) => {
    if (!badge) return ''
    
    switch (badge) {
      case 'Starter':
      case 'Community':
      case 'Solo':
        return 'bg-nile-blue-100 text-nile-blue-800 border-nile-blue-200'
      case 'Pro':
      case 'Guild':
      case 'Band':
        return 'bg-sandy-brown-100 text-sandy-brown-800 border-sandy-brown-200'
      case 'Premium':
      case 'Enterprise':
      case 'Label':
        return 'bg-picton-blue-100 text-picton-blue-800 border-picton-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Badge */}
      {tier.badge && (
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(tier.badge)}`}
          >
            {tier.badge}
          </span>
        </div>
      )}

      {/* Tier Name */}
      <h3 className="text-2xl font-bold text-nile-blue-900 mb-4">
        {tier.name}
      </h3>

      {/* Pricing */}
      <div className="mb-6">
        {tier.oneTimePrice && (
          <div className="mb-2">
            <span className="text-3xl font-bold text-nile-blue-700">
              {tier.oneTimePrice}
            </span>
            <span className="text-gray-600 text-sm ml-2">one-time</span>
          </div>
        )}
        {tier.monthlyPrice && (
          <div>
            <span className="text-2xl font-bold text-sandy-brown-600">
              {tier.monthlyPrice}
            </span>
            <span className="text-gray-600 text-sm">/month</span>
          </div>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
            <svg
              className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href="/contact"
        className="block w-full text-center bg-nile-blue-600 hover:bg-nile-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Get Started
      </Link>
    </div>
  )
}
