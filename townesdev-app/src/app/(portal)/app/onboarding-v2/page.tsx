'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'

const BRAND_FONTS = ['Inter', 'Space Grotesk', 'JetBrains Mono'] as const

type BrandFont = (typeof BRAND_FONTS)[number]
type Market = 'small-business' | 'discord-bot' | 'musician'

type WizardData = {
  basics: {
    name: string
    email: string
    elevatorPitch: string
  }
  brand: {
    logoUrl: string
    primaryColor: string
    font: BrandFont
  }
  market: {
    selected?: Market
  }
  pricing: {
    selectedProductId?: string
  }
}

const DEFAULT_DATA: WizardData = {
  basics: { name: '', email: '', elevatorPitch: '' },
  brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
  market: { selected: undefined },
  pricing: { selectedProductId: undefined },
}

type StepLabel = 'Basics' | 'Brand' | 'Market' | 'Pricing' | 'Review'

const STEP_ORDER: StepLabel[] = [
  'Basics',
  'Brand',
  'Market',
  'Pricing',
  'Review',
]

const MARKET_OPTIONS: Array<{
  value: Market
  label: string
  description: string
  icon: string
}> = [
  {
    value: 'small-business',
    label: 'Small Business Website',
    description:
      'Professional web presence with CMS, SEO, and custom design for growing businesses.',
    icon: '🏢',
  },
  {
    value: 'discord-bot',
    label: 'Discord Bot',
    description:
      'Managed Discord bot with automation, moderation, and custom features for your community.',
    icon: '🤖',
  },
  {
    value: 'musician',
    label: 'Musician / Artist Site',
    description:
      'Artist portfolio with streaming embeds, show calendar, merch, and mailing list.',
    icon: '🎵',
  },
]

// Validation Schemas
const BASICS_SCHEMA = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  elevatorPitch: z
    .string()
    .trim()
    .min(10, 'Pitch should be at least 10 characters')
    .max(280, 'Keep it under 280 characters'),
})

const BRAND_SCHEMA = z.object({
  logoUrl: z
    .string()
    .trim()
    .refine((val) => {
      if (!val) return true
      try {
        new URL(val)
        return true
      } catch {
        return false
      }
    }, 'Must be a valid URL'),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/u, 'Must be a valid hex color'),
  font: z.enum(BRAND_FONTS),
})

const MARKET_SCHEMA = z.object({
  selected: z.enum(['small-business', 'discord-bot', 'musician'], {
    errorMap: () => ({ message: 'Please select a market' }),
  }),
})

const PRICING_SCHEMA = z.object({
  selectedProductId: z.string().trim().min(1, 'Please select a plan'),
})

// Product type from API
type Product = {
  _id: string
  name: string
  price: string | null
  description: string | null
  features: string[]
  setupPrice: string | null
  market: Market
  tier: string
}

export default function OnboardingV2() {
  const [step, setStep] = useState<number>(0)
  const [data, setData] = useState<WizardData>(DEFAULT_DATA)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const currentStep = STEP_ORDER[step]

  // Fetch products on mount
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(({ products }) => {
        setProducts(products || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err)
        setLoading(false)
      })
  }, [])

  // Filter products by selected market and sort by price (lowest first)
  const availableProducts = useMemo(() => {
    if (!data.market.selected) return []
    const filtered = products.filter((p) => p.market === data.market.selected)

    // Sort by price: extract number from price string and sort ascending
    return filtered.sort((a, b) => {
      const priceA = parseInt(a.price?.replace(/[^0-9]/g, '') || '0')
      const priceB = parseInt(b.price?.replace(/[^0-9]/g, '') || '0')
      return priceA - priceB
    })
  }, [products, data.market.selected])

  // Validation for current step
  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 'Basics':
        return BASICS_SCHEMA.safeParse(data.basics).success
      case 'Brand':
        return BRAND_SCHEMA.safeParse(data.brand).success
      case 'Market':
        return MARKET_SCHEMA.safeParse(data.market).success
      case 'Pricing':
        return PRICING_SCHEMA.safeParse(data.pricing).success
      case 'Review':
        return true
      default:
        return false
    }
  }, [currentStep, data])

  const selectedProduct = products.find(
    (p) => p._id === data.pricing.selectedProductId
  )

  const handleNext = () => {
    if (step < STEP_ORDER.length - 1 && canContinue) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Save to backend and redirect to checkout
    console.log('Submit onboarding data:', data)
    alert('Onboarding complete! (Checkout not implemented yet)')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEP_ORDER.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold ${
                    idx === step
                      ? 'border-nile-blue-600 bg-nile-blue-600 text-white'
                      : idx < step
                        ? 'border-nile-blue-600 bg-nile-blue-50 text-nile-blue-700'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {idx + 1}
                </div>
                <div
                  className={`ml-2 text-sm font-medium ${
                    idx === step ? 'text-nile-blue-700' : 'text-gray-500'
                  }`}
                >
                  {label}
                </div>
                {idx < STEP_ORDER.length - 1 && (
                  <div className="w-12 h-0.5 mx-4 bg-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentStep === 'Basics' && 'Tell us about your business'}
            {currentStep === 'Brand' && 'Your brand identity'}
            {currentStep === 'Market' && 'Choose your service'}
            {currentStep === 'Pricing' && 'Select your plan'}
            {currentStep === 'Review' && 'Review your selections'}
          </h2>

          {/* BASICS STEP */}
          {currentStep === 'Basics' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business / Project Name
                </label>
                <input
                  type="text"
                  value={data.basics.name}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      basics: { ...d.basics, name: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={data.basics.email}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      basics: { ...d.basics, email: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Elevator Pitch
                </label>
                <textarea
                  value={data.basics.elevatorPitch}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      basics: { ...d.basics, elevatorPitch: e.target.value },
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                  placeholder="Tell us what makes your business unique..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  {data.basics.elevatorPitch.length} / 280 characters
                </p>
              </div>
            </div>
          )}

          {/* BRAND STEP */}
          {currentStep === 'Brand' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo URL (optional)
                </label>
                <input
                  type="url"
                  value={data.brand.logoUrl}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: { ...d.brand, logoUrl: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={data.brand.primaryColor}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        brand: { ...d.brand, primaryColor: e.target.value },
                      }))
                    }
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={data.brand.primaryColor}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        brand: { ...d.brand, primaryColor: e.target.value },
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                    placeholder="#2e5b7e"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Font
                </label>
                <select
                  value={data.brand.font}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: { ...d.brand, font: e.target.value as BrandFont },
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-nile-blue-500 focus:border-nile-blue-500"
                >
                  {BRAND_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* MARKET STEP */}
          {currentStep === 'Market' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the type of service you need to get started.
              </p>
              {MARKET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      market: { selected: option.value },
                      pricing: { selectedProductId: undefined }, // Reset pricing when market changes
                    }))
                  }
                  className={`w-full text-left p-5 rounded-lg border-2 transition-all ${
                    data.market.selected === option.value
                      ? 'border-nile-blue-600 bg-nile-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            data.market.selected === option.value
                              ? 'border-nile-blue-600 bg-nile-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {data.market.selected === option.value && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 12 12"
                            >
                              <path d="M10 3L4.5 8.5L2 6" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.label}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* PRICING STEP */}
          {currentStep === 'Pricing' && (
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8 text-gray-500">
                  Loading plans...
                </div>
              )}

              {!loading && availableProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No plans available. Please select a market first.
                </div>
              )}

              {!loading && availableProducts.length > 0 && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the tier that best fits your needs. Setup fees are
                    one-time charges.
                  </p>
                  <div className="grid gap-4">
                    {availableProducts.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            pricing: { selectedProductId: product._id },
                          }))
                        }
                        className={`text-left rounded-lg border-2 p-5 transition-all ${
                          data.pricing.selectedProductId === product._id
                            ? 'border-nile-blue-600 bg-nile-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                  data.pricing.selectedProductId === product._id
                                    ? 'border-nile-blue-600 bg-nile-blue-600'
                                    : 'border-gray-300'
                                }`}
                              >
                                {data.pricing.selectedProductId ===
                                  product._id && (
                                  <svg
                                    className="h-3 w-3 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 12 12"
                                  >
                                    <path d="M10 3L4.5 8.5L2 6" />
                                  </svg>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {product.name}
                              </h3>
                            </div>

                            {product.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {product.description}
                              </p>
                            )}

                            {product.features.length > 0 && (
                              <ul className="space-y-1">
                                {product.features.map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start text-sm text-gray-700"
                                  >
                                    <svg
                                      className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
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
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-nile-blue-700">
                              {product.price || 'Contact us'}
                            </div>
                            {product.setupPrice && (
                              <div className="text-sm text-gray-500 mt-1">
                                + {product.setupPrice}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* REVIEW STEP */}
          {currentStep === 'Review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Business Information
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Name:</dt>
                    <dd className="font-medium text-gray-900">
                      {data.basics.name}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Email:</dt>
                    <dd className="font-medium text-gray-900">
                      {data.basics.email}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Primary Color:</dt>
                    <dd className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: data.brand.primaryColor }}
                      />
                      <span className="font-medium text-gray-900">
                        {data.brand.primaryColor}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Font:</dt>
                    <dd className="font-medium text-gray-900">
                      {data.brand.font}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Selected Service
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Market:</dt>
                    <dd className="font-medium text-gray-900">
                      {MARKET_OPTIONS.find(
                        (m) => m.value === data.market.selected
                      )?.label || 'Not selected'}
                    </dd>
                  </div>
                  {selectedProduct && (
                    <>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Plan:</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedProduct.name}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Monthly:</dt>
                        <dd className="font-medium text-gray-900">
                          {selectedProduct.price}
                        </dd>
                      </div>
                      {selectedProduct.setupPrice && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-gray-600">Setup Fee:</dt>
                          <dd className="font-medium text-gray-900">
                            {selectedProduct.setupPrice}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Click &quot;Proceed to Billing&quot; to complete your order
                  and set up payment.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {step < STEP_ORDER.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className="px-6 py-2 text-sm font-medium text-white bg-nile-blue-600 rounded-md hover:bg-nile-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Billing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
