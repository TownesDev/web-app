'use client'

import React, { useState } from 'react'

type Plan = {
  _id: string
  name: string
  price: string
  features: string[]
  description: string
  category: 'base' | 'addon' | 'one_time' | string
  interval?: 'month' | 'year'
  stripePriceId?: string
}

interface PlansPickerProps {
  basePlans: Plan[]
  addOnPlans: Plan[]
  oneTimePlans?: Plan[]
}

export function PlansPicker({
  basePlans,
  addOnPlans,
  oneTimePlans = [],
}: PlansPickerProps) {
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCheckout = async () => {
    setError(null)
    if (!selectedBase) {
      setError('Please select a base plan to continue')
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedBase,
          addOnIds: Array.from(selectedAddOns),
        }),
      })

      if (response.status === 401) {
        // Not authenticated; send to signup preserving selection
        const params = new URLSearchParams()
        params.set('plan', selectedBase)
        if (selectedAddOns.size > 0)
          params.set('addons', Array.from(selectedAddOns).join(','))
        window.location.href = `/auth/signup?${params.toString()}`
        return
      }

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const { url } = await response.json()
      if (url) window.location.href = url
      else setError('Unable to start checkout. Please try again later.')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Base Plans */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Base subscriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {basePlans.map((plan) => {
            const selected = selectedBase === plan._id
            return (
              <div
                key={plan._id}
                className={`bg-white rounded-lg shadow p-6 border ${selected ? 'border-blue-600' : 'border-gray-200'}`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {plan.price}
                  </p>
                  {plan.interval && (
                    <p className="text-gray-500 text-sm">
                      Billed {plan.interval}
                    </p>
                  )}
                  <p className="text-gray-700 text-sm mt-2">
                    {plan.description}
                  </p>
                </div>
                <ul className="text-gray-800 text-sm space-y-2 mb-4">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedBase(plan._id)}
                  className={`w-full py-2.5 rounded-lg font-medium ${selected ? 'bg-blue-700 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                  aria-pressed={selected}
                >
                  {selected ? 'Selected' : 'Select base plan'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Add-ons */}
      {addOnPlans.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add-ons</h2>
          <p className="text-gray-600 text-sm mb-4">
            Enhance your subscription. Requires a base plan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOnPlans.map((addon) => {
              const checked = selectedAddOns.has(addon._id)
              const disabled = !selectedBase
              return (
                <label
                  key={addon._id}
                  className={`bg-white rounded-lg shadow p-6 border ${checked ? 'border-blue-600' : 'border-gray-200'} ${disabled ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {addon.name}
                      </div>
                      <div className="text-blue-600 font-bold">
                        {addon.price}
                      </div>
                      <p className="text-gray-700 text-sm mt-1">
                        {addon.description}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-1"
                      disabled={disabled}
                      checked={checked}
                      onChange={() => toggleAddOn(addon._id)}
                      aria-label={`Select add-on ${addon.name}`}
                    />
                  </div>
                </label>
              )
            })}
          </div>
        </section>
      )}

      {/* One-time options (shown for transparency, not included in subscription) */}
      {oneTimePlans.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            One-time services
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Purchased separately after onboarding if needed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimePlans.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="text-lg font-semibold text-gray-900">
                  {p.name}
                </div>
                <div className="text-blue-600 font-bold">{p.price}</div>
                <p className="text-gray-700 text-sm mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Need a custom solution? Contact us for enterprise pricing.
        </div>
        <button
          onClick={handleCheckout}
          disabled={!selectedBase || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium"
        >
          {isLoading ? 'Processing…' : 'Continue to checkout'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
