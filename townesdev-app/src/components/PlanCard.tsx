'use client'

import React, { useState } from 'react'

interface PlanCardProps {
  name: string
  price: string
  features: string[]
  description: string
  isPopular?: boolean
  planId?: string
}

export function PlanCard({
  name,
  price,
  features,
  description,
  isPopular = false,
  planId,
}: PlanCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Convert technical errors to user-friendly messages
  const getUserFriendlyError = (error: string): string => {
    if (error.includes('Authentication required')) {
      return 'Please log in to continue with your purchase'
    }
    if (error.includes('No client account found')) {
      return 'Your account setup is incomplete. Please contact support'
    }
    if (error.includes('Plan not found')) {
      return 'This plan is no longer available'
    }
    if (error.includes('Invalid plan price')) {
      return 'This plan has an invalid price configuration'
    }
    if (error.includes('Card was declined')) {
      return 'Your card was declined. Please try a different payment method'
    }
    if (error.includes('Too many requests')) {
      return 'Too many requests. Please wait a moment and try again'
    }
    if (error.includes('Payment service')) {
      return 'Payment service is temporarily unavailable. Please try again later'
    }
    return error // Return original error if no mapping found
  }

  const handleCheckout = async () => {
    if (!planId) {
      console.error('Missing planId')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
        }),
      })

      if (response.status === 401) {
        // User not authenticated, redirect to signup with plan info
        window.location.href = `/auth/signup?plan=${planId}`
        return
      }

      if (!response.ok) {
        // Log the actual error response for debugging
        let errorData: { error?: string; [key: string]: unknown } = {
          error: 'Unknown error',
        }
        try {
          errorData = await response.json()
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError)
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
          }
        }

        console.error('❌ Checkout API error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorData.error || errorData,
          timestamp: new Date().toISOString(),
        })

        // Show user-friendly error message
        const userMessage = getUserFriendlyError(
          errorData.error || `HTTP ${response.status} error`
        )
        throw new Error(`Checkout failed: ${userMessage}`)
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      } else {
        console.error('No checkout URL received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 border-2 flex flex-col ${isPopular ? 'border-blue-500 relative' : 'border-gray-200'}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">${price}</div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <ul className="space-y-3 mb-6 flex flex-col flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        disabled={isLoading || !planId}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        {isLoading ? 'Processing...' : 'Get Started'}
      </button>
    </div>
  )
}
