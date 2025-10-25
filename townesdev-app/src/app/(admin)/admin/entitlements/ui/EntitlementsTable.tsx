'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Feature = { _id: string; name: string; key?: string; assetType?: string }
type Asset = { _id: string; name: string; type: string }
type Entitlement = { _id: string; asset?: Asset; feature: Feature }
type Plan = { _id: string; name: string; category?: string }

type ClientRow = {
  _id: string
  name: string
  email?: string
  selectedPlan?: Plan | null
  selectedAddons?: Plan[]
  assets: Asset[]
  entitlements: Entitlement[]
  mismatches: {
    missing: Feature[]
    extra: Entitlement[]
  }
}

export default function EntitlementsTable({
  clients,
}: {
  clients: ClientRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleReconcile = async (clientId: string) => {
    startTransition(async () => {
      await fetch('/api/admin/entitlements/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-8 font-sans">
      {clients.map((c) => (
        <section
          key={c._id}
          className="border rounded-lg p-5 bg-white shadow-sm"
          aria-labelledby={`client-${c._id}-heading`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                id={`client-${c._id}-heading`}
                className="text-xl font-semibold text-nile-blue-900"
              >
                {c.name}
              </h2>
              <p className="text-sm text-nile-blue-700">{c.email}</p>
            </div>
            <button
              className="px-3 py-1.5 text-sm rounded bg-nile-blue-900 hover:bg-nile-blue-800 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sandy-brown-500"
              onClick={() => handleReconcile(c._id)}
              disabled={pending}
            >
              {pending ? 'Reconciling…' : 'Reconcile'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-nile-blue-800">
            <div>
              <h3 className="font-semibold mb-2 text-nile-blue-900">Plans</h3>
              <ul className="space-y-1">
                {c.selectedPlan ? (
                  <li>
                    <span className="sr-only">Base plan:</span> Base:{' '}
                    {c.selectedPlan.name}
                  </li>
                ) : (
                  <li className="text-nile-blue-700">No base plan</li>
                )}
                {(c.selectedAddons || []).map((p) => (
                  <li key={p._id}>Add-on: {p.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-nile-blue-900">Assets</h3>
              <ul className="space-y-1">
                {(c.assets || []).length ? (
                  c.assets.map((a) => (
                    <li key={a._id}>
                      {a.name}{' '}
                      <span className="text-nile-blue-700">({a.type})</span>
                    </li>
                  ))
                ) : (
                  <li className="text-nile-blue-700">No assets</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-nile-blue-900">
                Entitlements
              </h3>
              <ul className="space-y-1">
                {(c.entitlements || []).length ? (
                  c.entitlements.map((e) => (
                    <li key={e._id}>
                      {e.feature?.name}{' '}
                      <span className="text-nile-blue-700">
                        [{e.feature?.assetType}]
                      </span>
                      {e.asset ? (
                        <span className="text-nile-blue-700">
                          {' '}
                          — {e.asset.name}
                        </span>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="text-nile-blue-700">No entitlements</li>
                )}
              </ul>
            </div>
          </div>

          {(c.mismatches.missing.length || c.mismatches.extra.length) && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-sandy-brown-50 border border-sandy-brown-300 rounded p-3">
                <div className="font-semibold text-sandy-brown-900 mb-1">
                  Missing
                </div>
                <ul className="text-sandy-brown-900 text-sm list-disc ml-4">
                  {c.mismatches.missing.length ? (
                    c.mismatches.missing.map((f) => (
                      <li key={f._id}>
                        {f.name}{' '}
                        <span className="text-xs">[{f.assetType}]</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sandy-brown-800">None</li>
                  )}
                </ul>
              </div>
              <div className="bg-nile-blue-50 border border-nile-blue-300 rounded p-3">
                <div className="font-semibold text-nile-blue-900 mb-1">
                  Extra
                </div>
                <ul className="text-nile-blue-900 text-sm list-disc ml-4">
                  {c.mismatches.extra.length ? (
                    c.mismatches.extra.map((e) => (
                      <li key={e._id}>
                        {e.feature?.name}
                        {e.asset ? (
                          <span className="text-xs"> — {e.asset.name}</span>
                        ) : null}
                      </li>
                    ))
                  ) : (
                    <li className="text-nile-blue-800">None</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
