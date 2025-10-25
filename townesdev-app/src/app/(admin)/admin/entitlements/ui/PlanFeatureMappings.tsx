'use client'

import { useState, useTransition } from 'react'

type Plan = { _id: string; name: string; category?: string }
type Feature = { _id: string; name: string; key?: string; assetType?: string }

type Mapping = {
  _id: string
  plan?: Plan
  feature?: Feature
  notes?: string
}

export default function PlanFeatureMappings({
  mappings,
  plans,
  features,
}: {
  mappings: Mapping[]
  plans: Plan[]
  features: Feature[]
}) {
  const [planId, setPlanId] = useState('')
  const [featureId, setFeatureId] = useState('')
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const onSubmit = () => {
    setError(null)
    if (!planId || !featureId) {
      setError('Please select a plan and a feature')
      return
    }
    startTransition(async () => {
      const res = await fetch('/api/admin/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, featureId, notes: notes || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Request failed')
      } else {
        // Optimistic reset; caller page is server-rendered, so a refresh is simplest
        setPlanId('')
        setFeatureId('')
        setNotes('')
        window.location.reload()
      }
    })
  }

  const onDelete = (id: string) => {
    startTransition(async () => {
      await fetch(`/api/admin/mappings?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      window.location.reload()
    })
  }

  return (
    <div className="space-y-6">
      {/* Create/Update form */}
      <section className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">Add or Update Mapping</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-nile-blue-900">Plan</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-nile-blue-900"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              <option value="">Select a plan…</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.category ? `(${p.category})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nile-blue-900">Feature</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-nile-blue-900"
              value={featureId}
              onChange={(e) => setFeatureId(e.target.value)}
            >
              <option value="">Select a feature…</option>
              {features.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} {f.assetType ? `(${f.assetType})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-nile-blue-900">Notes (optional)</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-nile-blue-900 placeholder-nile-blue-700"
              placeholder="Operational notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="px-4 py-2 rounded bg-nile-blue-900 hover:bg-nile-blue-800 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sandy-brown-500"
            onClick={onSubmit}
            disabled={pending}
          >
            {pending ? 'Saving…' : 'Save mapping'}
          </button>
          {error && (
            <span className="ml-3 text-sandy-brown-900 bg-sandy-brown-50 border border-sandy-brown-300 rounded px-2 py-1 text-sm">
              {error}
            </span>
          )}
        </div>
      </section>

      {/* Existing mappings */}
      <section className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">Existing Mappings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Plan to Feature mappings</caption>
            <thead>
              <tr className="text-left text-nile-blue-900">
                <th scope="col" className="px-3 py-2">Plan</th>
                <th scope="col" className="px-3 py-2">Feature</th>
                <th scope="col" className="px-3 py-2">Notes</th>
                <th scope="col" className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.length ? (
                mappings.map((m) => (
                  <tr key={m._id} className="border-t text-nile-blue-800">
                    <td className="px-3 py-2">{m.plan?.name}</td>
                    <td className="px-3 py-2">{m.feature?.name}</td>
                    <td className="px-3 py-2">{m.notes || ''}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => onDelete(m._id)}
                        className="text-red-700 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-2" colSpan={4}>No mappings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
