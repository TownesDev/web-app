'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface IncidentFormProps {
  onSuccess?: () => void
}

export default function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<
    'low' | 'medium' | 'high' | 'critical'
  >('medium')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          severity,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit incident')
      }

      const result = await response.json()
      console.log('Incident submitted successfully:', result)

      // Success - reset form and show success message
      setTitle('')
      setSeverity('medium')
      setDescription('')
      setError('')

      toast.success('Incident reported successfully!', {
        description: "We'll get back to you soon.",
      })

      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting the incident. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
        Report New Incident
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Incident Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-nile-blue-500 focus:border-nile-blue-500 text-gray-900 placeholder-gray-600"
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label
            htmlFor="severity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Severity *
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as typeof severity)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-nile-blue-500 focus:border-nile-blue-500 text-gray-900"
          >
            <option value="low">Low - Minor issue, no immediate impact</option>
            <option value="medium">
              Medium - Noticeable issue, workarounds available
            </option>
            <option value="high">
              High - Significant impact, urgent attention needed
            </option>
            <option value="critical">
              Critical - System down or major functionality broken
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-nile-blue-500 focus:border-nile-blue-500 text-gray-900 placeholder-gray-600"
            placeholder="Detailed description of the incident, including steps to reproduce, expected vs actual behavior, etc."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Incident'}
          </button>
        </div>
      </form>
    </div>
  )
}
