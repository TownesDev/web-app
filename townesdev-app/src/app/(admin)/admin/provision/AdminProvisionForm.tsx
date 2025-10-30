'use client'

import { useEffect, useMemo, useState } from 'react'

type ClientLite = { _id: string; name?: string; email?: string }

type Vertical = '' | 'musician' | 'bakery' | 'bracelet'

const BRAND_PRIMARY = '#1E2E3E'
const BRAND_FONT = 'Inter'

const PAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Services' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'contact', label: 'Contact' },
  { value: 'faq', label: 'FAQ' },
  { value: 'blog', label: 'Blog' },
  // Vertical-specific commonly used
  { value: 'menu', label: 'Menu (Bakery)' },
  { value: 'order', label: 'Order (Bakery)' },
  { value: 'music', label: 'Music (Musician)' },
  { value: 'events', label: 'Events (Musician)' },
  { value: 'shop', label: 'Shop (E‑commerce)' },
]

const PRESET_PAGES: Record<Exclude<Vertical, ''>, string[]> = {
  musician: ['home', 'about', 'music', 'events', 'contact'],
  bakery: ['home', 'menu', 'about', 'order', 'contact'],
  bracelet: ['home', 'shop', 'about', 'faq', 'contact'],
}

export default function AdminProvisionForm({
  clients,
}: {
  clients: ClientLite[]
}) {
  const [vertical, setVertical] = useState<Vertical>('')
  const [selectedPages, setSelectedPages] = useState<string[]>([
    'home',
    'about',
    'contact',
  ])
  const [additionalPages, setAdditionalPages] = useState('')
  const [useBrandDefaults, setUseBrandDefaults] = useState(true)
  const [autoPresetPages, setAutoPresetPages] = useState(true)

  // Derive a unique list preserving order
  const allSelectedPages = useMemo(() => {
    const extras = additionalPages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const merged = [...selectedPages, ...extras]
    return Array.from(new Set(merged))
  }, [selectedPages, additionalPages])

  useEffect(() => {
    if (autoPresetPages && vertical && PRESET_PAGES[vertical]) {
      setSelectedPages(PRESET_PAGES[vertical])
    }
  }, [vertical, autoPresetPages])

  const togglePage = (value: string) => {
    setSelectedPages((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="mt-6 max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <form
        action="/api/admin/provision"
        method="post"
        onSubmit={(e) => {
          e.preventDefault()
          const form = e.currentTarget as HTMLFormElement
          const data = new FormData(form)

          const payload = {
            clientId: data.get('clientId') as string,
            web: {
              vertical: (data.get('vertical') as string) || undefined,
              pages: allSelectedPages,
              theme: useBrandDefaults
                ? { primaryColor: BRAND_PRIMARY, font: BRAND_FONT }
                : {
                    primaryColor:
                      (data.get('primaryColor') as string) || BRAND_PRIMARY,
                    font: (data.get('font') as string) || BRAND_FONT,
                  },
            },
            discord: {
              enabled: data.get('discordEnabled') === 'on',
              botName: (data.get('botName') as string) || undefined,
            },
          }

          fetch('/api/admin/provision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(async (res) => {
              if (!res.ok) throw new Error('Provisioning failed')
              const result = await res.json()
              window.location.href = result.previewUrl || '/admin'
            })
            .catch(() => alert('Provisioning failed'))
        }}
      >
        <div className="space-y-6">
          {/* Client selection */}
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-semibold text-gray-900"
            >
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
              aria-label="Select an existing client"
            >
              <option value="">Select a client…</option>
              {clients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-600">
              Provisioning is idempotent: if a project exists, it won’t be
              duplicated.
            </p>
          </div>

          {/* Vertical and presets */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="vertical"
                className="block text-sm font-semibold text-gray-900"
              >
                Vertical
              </label>
              <select
                id="vertical"
                name="vertical"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
                aria-label="Choose a vertical preset"
              >
                <option value="">Generic</option>
                <option value="musician">Musician</option>
                <option value="bakery">Bakery</option>
                <option value="bracelet">Bracelet / E‑commerce</option>
              </select>
              <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-300"
                  checked={autoPresetPages}
                  onChange={(e) => setAutoPresetPages(e.target.checked)}
                />
                Auto‑preset pages from vertical
              </label>
            </div>

            {/* Theme defaults toggle + custom controls */}
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                Theme
              </label>
              <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-300"
                  checked={useBrandDefaults}
                  onChange={(e) => setUseBrandDefaults(e.target.checked)}
                  aria-label="Use brand defaults"
                />
                Use brand defaults
                <span className="text-xs text-gray-600">
                  ({BRAND_PRIMARY}, {BRAND_FONT})
                </span>
              </label>
              {!useBrandDefaults && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="primaryColor"
                      className="block text-xs font-medium text-gray-800"
                    >
                      Primary color
                    </label>
                    <input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={BRAND_PRIMARY}
                      className="mt-1 h-10 w-full rounded-md border border-gray-300"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="font"
                      className="block text-xs font-medium text-gray-800"
                    >
                      Font
                    </label>
                    <select
                      id="font"
                      name="font"
                      defaultValue={BRAND_FONT}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option>Inter</option>
                      <option>Space Grotesk</option>
                      <option>JetBrains Mono</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pages selection */}
          <fieldset className="rounded-md border border-gray-200 p-4">
            <legend className="px-1 text-sm font-semibold text-gray-900">
              Pages
            </legend>
            <p className="mb-3 text-xs text-gray-600">
              Select the pages to seed. You can add any additional custom pages
              below.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAGE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex items-center gap-2 text-sm text-gray-900"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-300"
                    checked={selectedPages.includes(opt.value)}
                    onChange={() => togglePage(opt.value)}
                    aria-label={`Include ${opt.label}`}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="mt-3">
              <label
                htmlFor="additionalPages"
                className="block text-xs font-medium text-gray-800"
              >
                Additional pages (comma‑separated)
              </label>
              <input
                id="additionalPages"
                name="additionalPages"
                value={additionalPages}
                onChange={(e) => setAdditionalPages(e.target.value)}
                placeholder="portfolio, careers"
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </fieldset>

          {/* Discord */}
          <fieldset className="border-t pt-4">
            <legend className="text-sm font-semibold text-gray-900">
              Discord
            </legend>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="discordEnabled"
                  className="h-4 w-4 rounded border-gray-300 text-slate-700 focus:ring-slate-300"
                />{' '}
                Enable
              </label>
              <input
                name="botName"
                placeholder="Bot name (optional)"
                aria-label="Discord bot name"
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-white shadow-sm"
            style={{ backgroundColor: BRAND_PRIMARY }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = '#152231')
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = BRAND_PRIMARY)
            }
          >
            Provision
          </button>
          <a
            href="/admin"
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
            aria-label="Cancel and go back"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
