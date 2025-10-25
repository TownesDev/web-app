'use client'

import { useEffect, useMemo, useState } from 'react'
import { runPublicQuery } from '@/lib/public/client'
import { qPlans } from '@/sanity/lib/queries'

type WizardData = {
  basics: {
    name: string
    email: string
    elevatorPitch: string
    vertical: string
  }
  brand: { logoUrl: string; primaryColor: string; font: string }
  services: {
    basePlanId?: string
    addons: string[]
    webApp: boolean
    discord: boolean
  }
  web: { pages: string[]; domainIntent: string; links: Record<string, string> }
  discord: { botName: string; intents: string[]; features: string[] }
}

const DEFAULT_DATA: WizardData = {
  basics: { name: '', email: '', elevatorPitch: '', vertical: '' },
  brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
  services: { basePlanId: undefined, addons: [], webApp: true, discord: false },
  web: { pages: ['home', 'about', 'contact'], domainIntent: '', links: {} },
  discord: { botName: '', intents: [], features: [] },
}

const STEPS = [
  'Basics',
  'Brand',
  'Services',
  'Web App',
  'Discord',
  'Review',
] as const

export default function OnboardingPage() {
  const [step, setStep] = useState<number>(0)
  const [data, setData] = useState<WizardData>(DEFAULT_DATA)
  const [basePlans, setBasePlans] = useState<
    Array<{ _id: string; name: string }>
  >([])

  // Load/save progress in localStorage (MVP persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding-progress')
      if (raw) setData({ ...DEFAULT_DATA, ...JSON.parse(raw) })
      const s = localStorage.getItem('onboarding-step')
      if (s) setStep(Number(s))
    } catch {}
  }, [])
  // Fetch public plans for selectors (base plans only for MVP)
  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const plans: Array<{
          _id: string
          name: string
          category?: string
        }> = await runPublicQuery(qPlans)
        if (!ignore) {
          setBasePlans(
            plans
              .filter((p) => p.category === 'base')
              .map(({ _id, name }) => ({ _id, name }))
          )
        }
      } catch {
        // fail silent; selector will show a fallback input
      }
    })()
    return () => {
      ignore = true
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('onboarding-progress', JSON.stringify(data))
      localStorage.setItem('onboarding-step', String(step))
    } catch {}
  }, [data, step])

  const canGoNext = useMemo(() => {
    if (step === 0) {
      return !!data.basics.name && !!data.basics.email
    }
    if (step === 2) {
      return !!data.services.basePlanId
    }
    if (STEPS[step] === 'Discord' && data.services.discord) {
      return !!data.discord.botName
    }
    return true
  }, [data, step])

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <section className="p-6 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">Onboarding</h1>
      <p className="mt-2 text-gray-700">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm space-y-4">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                value={data.basics.name}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, name: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                value={data.basics.email}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, email: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Elevator pitch
              </label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                rows={3}
                value={data.basics.elevatorPitch}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, elevatorPitch: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Vertical
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
                value={data.basics.vertical}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, vertical: e.target.value },
                  }))
                }
              >
                <option value="">Select a vertical…</option>
                <option value="musician">Musician</option>
                <option value="bakery">Bakery</option>
                <option value="thrift">Thrift</option>
                <option value="brand">Brand</option>
                <option value="agency">Agency</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Logo URL
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                value={data.brand.logoUrl}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    brand: { ...d.brand, logoUrl: e.target.value },
                  }))
                }
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800">
                  Primary color
                </label>
                <input
                  type="color"
                  className="mt-1 h-10 w-full rounded-md border"
                  value={data.brand.primaryColor}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: { ...d.brand, primaryColor: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800">
                  Font
                </label>
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
                  value={data.brand.font}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: { ...d.brand, font: e.target.value },
                    }))
                  }
                >
                  <option value="Inter">Inter</option>
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Base plan
              </label>
              {basePlans.length > 0 ? (
                <select
                  className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
                  value={data.services.basePlanId || ''}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      services: {
                        ...d.services,
                        basePlanId: e.target.value || undefined,
                      },
                    }))
                  }
                >
                  <option value="">Select a base plan…</option>
                  {basePlans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                  placeholder="Enter Plan ID (temporary)"
                  value={data.services.basePlanId || ''}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      services: { ...d.services, basePlanId: e.target.value },
                    }))
                  }
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Desired services
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
                value={
                  data.services.webApp && data.services.discord
                    ? 'both'
                    : data.services.webApp
                      ? 'web'
                      : data.services.discord
                        ? 'discord'
                        : ''
                }
                onChange={(e) => {
                  const v = e.target.value
                  setData((d) => ({
                    ...d,
                    services: {
                      ...d.services,
                      webApp: v === 'web' || v === 'both',
                      discord: v === 'discord' || v === 'both',
                    },
                  }))
                }}
              >
                <option value="">Select services…</option>
                <option value="web">Web App</option>
                <option value="discord">Discord App</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-800">
              Website preset
            </label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
              value={(() => {
                const set = new Set(data.web.pages)
                if (
                  ['home', 'about', 'contact'].every((p) => set.has(p)) &&
                  set.size === 3
                )
                  return 'minimal'
                if (
                  ['home', 'about', 'contact', 'blog'].every((p) =>
                    set.has(p)
                  ) &&
                  set.size === 4
                )
                  return 'blog'
                if (
                  ['home', 'about', 'contact', 'music', 'shows'].every((p) =>
                    set.has(p)
                  ) &&
                  set.size === 5
                )
                  return 'musician'
                return 'custom'
              })()}
              onChange={(e) => {
                const v = e.target.value
                const presets: Record<string, string[]> = {
                  minimal: ['home', 'about', 'contact'],
                  blog: ['home', 'about', 'contact', 'blog'],
                  musician: ['home', 'about', 'contact', 'music', 'shows'],
                }
                setData((d) => ({
                  ...d,
                  web: { ...d.web, pages: presets[v] || d.web.pages },
                }))
              }}
            >
              <option value="minimal">Minimal (Home, About, Contact)</option>
              <option value="blog">Blog (adds Blog)</option>
              <option value="musician">Musician (adds Music, Shows)</option>
              <option value="custom">
                Custom (we&rsquo;ll fine-tune later)
              </option>
            </select>
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Domain intent
              </label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900"
                value={data.web.domainIntent}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    web: { ...d.web, domainIntent: e.target.value },
                  }))
                }
              >
                <option value="">Choose an option…</option>
                <option value="have_domain">I have a domain</option>
                <option value="buy_domain">I want to buy a domain</option>
                <option value="temporary_subdomain">
                  Use a temporary subdomain
                </option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && data.services.discord && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Bot name
              </label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500"
                value={data.discord.botName}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    discord: { ...d.discord, botName: e.target.value },
                  }))
                }
              />
            </div>
            <p className="text-sm text-gray-600">
              Intents and features selection to follow.
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm text-gray-800">
            <p>
              <strong>Name:</strong> {data.basics.name}
            </p>
            <p>
              <strong>Email:</strong> {data.basics.email}
            </p>
            <p>
              <strong>Base plan:</strong>{' '}
              {data.services.basePlanId || '(not set yet)'}
            </p>
            <p>
              <strong>Web pages:</strong> {data.web.pages.join(', ')}
            </p>
            {data.services.discord && (
              <p>
                <strong>Bot:</strong> {data.discord.botName || '(unnamed)'}{' '}
              </p>
            )}
            <div className="pt-2">
              <a
                href="/app/plans"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Proceed to billing
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={prev}
          disabled={step === 0}
          className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!canGoNext || step === STEPS.length - 1}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save & Continue
        </button>
        <button
          onClick={() => {
            setStep(0)
            setData(DEFAULT_DATA)
            localStorage.removeItem('onboarding-progress')
            localStorage.removeItem('onboarding-step')
          }}
          className="ml-auto inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </section>
  )
}
