'use client'

import { useState } from 'react'

interface ToggleFeatureButtonProps {
  featureKey: string
  guildId: string
  clientId: string
  isEnabled: boolean
  onToggle?: (enabled: boolean) => void
}

export function ToggleFeatureButton({
  featureKey,
  guildId,
  clientId,
  isEnabled,
  onToggle,
}: ToggleFeatureButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentState, setCurrentState] = useState(isEnabled)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      const action = currentState ? 'disable' : 'enable'
      const response = await fetch(
        `/api/bot/features/${guildId}/${featureKey}/toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientId,
            action,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to toggle feature')
      }

      const newState = action === 'enable'
      setCurrentState(newState)
      onToggle?.(newState)
    } catch (error) {
      console.error('Error toggling feature:', error)
      // Could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
        currentState
          ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
          : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
      } disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Updating...
        </span>
      ) : currentState ? (
        'Disable Feature'
      ) : (
        'Enable Feature'
      )}
    </button>
  )
}
