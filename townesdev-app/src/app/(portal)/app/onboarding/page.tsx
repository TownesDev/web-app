"use client"

import { useEffect, useMemo, useState } from 'react'

type WizardData = {
  basics: { name: string; email: string; elevatorPitch: string; vertical: string }
  brand: { logoUrl: string; primaryColor: string; font: string }
  services: { basePlanId?: string; addons: string[]; webApp: boolean; discord: boolean }
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

  // Load/save progress in localStorage (MVP persistence)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding-progress')
      if (raw) setData({ ...DEFAULT_DATA, ...JSON.parse(raw) })
      const s = localStorage.getItem('onboarding-step')
      if (s) setStep(Number(s))
    } catch {}
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
      <p className="mt-2 text-gray-600">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm space-y-4">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={data.basics.name} onChange={(e)=>setData(d=>({...d, basics:{...d.basics, name:e.target.value}}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" value={data.basics.email} onChange={(e)=>setData(d=>({...d, basics:{...d.basics, email:e.target.value}}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Elevator pitch</label>
              <textarea className="mt-1 w-full rounded-md border px-3 py-2" rows={3} value={data.basics.elevatorPitch} onChange={(e)=>setData(d=>({...d, basics:{...d.basics, elevatorPitch:e.target.value}}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vertical</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="musician, bakery, thrift, ..." value={data.basics.vertical} onChange={(e)=>setData(d=>({...d, basics:{...d.basics, vertical:e.target.value}}))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={data.brand.logoUrl} onChange={(e)=>setData(d=>({...d, brand:{...d.brand, logoUrl:e.target.value}}))} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Primary color</label>
                <input type="color" className="mt-1 h-10 w-full rounded-md border" value={data.brand.primaryColor} onChange={(e)=>setData(d=>({...d, brand:{...d.brand, primaryColor:e.target.value}}))} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">Font</label>
                <select className="mt-1 w-full rounded-md border px-3 py-2" value={data.brand.font} onChange={(e)=>setData(d=>({...d, brand:{...d.brand, font:e.target.value}}))}>
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
              <label className="block text-sm font-medium text-gray-700">Base plan</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Enter Plan ID (temporary)" value={data.services.basePlanId || ''} onChange={(e)=>setData(d=>({...d, services:{...d.services, basePlanId:e.target.value}}))} />
              <p className="mt-1 text-xs text-gray-500">We’ll replace this with a selector fed by Sanity Plans.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={data.services.webApp} onChange={(e)=>setData(d=>({...d, services:{...d.services, webApp:e.target.checked}}))} /> Web App</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={data.services.discord} onChange={(e)=>setData(d=>({...d, services:{...d.services, discord:e.target.checked}}))} /> Discord App</label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Pages</label>
            <div className="grid grid-cols-2 gap-2">
              {['home','about','contact','music','shows','blog'].map((p)=>{
                const checked = data.web.pages.includes(p)
                return (
                  <label key={p} className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={checked} onChange={(e)=>setData(d=>({
                      ...d,
                      web:{
                        ...d.web,
                        pages: e.target.checked ? Array.from(new Set([...d.web.pages, p])) : d.web.pages.filter(x=>x!==p)
                      }
                    }))} /> {p}
                  </label>
                )
              })}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domain intent</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" placeholder="e.g. own z8phyr.com" value={data.web.domainIntent} onChange={(e)=>setData(d=>({...d, web:{...d.web, domainIntent:e.target.value}}))} />
            </div>
          </div>
        )}

        {step === 4 && data.services.discord && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bot name</label>
              <input className="mt-1 w-full rounded-md border px-3 py-2" value={data.discord.botName} onChange={(e)=>setData(d=>({...d, discord:{...d.discord, botName:e.target.value}}))} />
            </div>
            <p className="text-sm text-gray-500">Intents and features selection to follow.</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {data.basics.name}</p>
            <p><strong>Email:</strong> {data.basics.email}</p>
            <p><strong>Base plan:</strong> {data.services.basePlanId || '(not set yet)'}</p>
            <p><strong>Web pages:</strong> {data.web.pages.join(', ')}</p>
            {data.services.discord && (
              <p><strong>Bot:</strong> {data.discord.botName || '(unnamed)'} </p>
            )}
            <div className="pt-2">
              <a href="/app/plans" className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Proceed to billing</a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={prev} disabled={step===0} className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button>
        <button onClick={next} disabled={!canGoNext || step===STEPS.length-1} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">Save & Continue</button>
        <button onClick={()=>{setStep(0); setData(DEFAULT_DATA); localStorage.removeItem('onboarding-progress'); localStorage.removeItem('onboarding-step')}} className="ml-auto inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Reset</button>
      </div>
    </section>
  )
}
