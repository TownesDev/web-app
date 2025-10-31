'use client'

import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { runPublicQuery } from '@/lib/public/client'
import { qPlans } from '@/sanity/lib/queries'

const BRAND_FONTS = ['Inter', 'Space Grotesk', 'JetBrains Mono'] as const

type BrandFont = (typeof BRAND_FONTS)[number]

type WizardData = {
  basics: {
    name: string
    email: string
    elevatorPitch: string
    vertical: string
  }
  brand: { logoUrl: string; primaryColor: string; font: BrandFont }
  services: {
    basePlanId?: string
    addons: string[]
    oneTime: string[]
    webApp: boolean
    discord: boolean
  }
  web: { pages: string[]; domainIntent: string; links: Record<string, string> }
  discord: { botName: string; intents: string[]; features: string[] }
}

const DEFAULT_DATA: WizardData = {
  basics: { name: '', email: '', elevatorPitch: '', vertical: '' },
  brand: { logoUrl: '', primaryColor: '#2e5b7e', font: 'Inter' },
  services: {
    basePlanId: undefined,
    addons: [],
    oneTime: [],
    webApp: true,
    discord: false,
  },
  web: { pages: ['home', 'about', 'contact'], domainIntent: '', links: {} },
  discord: { botName: '', intents: [], features: [] },
}

type PlanCategory = 'base' | 'addon' | 'one_time'

type PlanRecord = {
  _id: string
  name: string
  category: PlanCategory
  price: string | null
  interval: string | null
  description: string | null
  features: string[]
  hoursIncluded: number | null
  stripeProductId: string | null
  stripePriceId: string | null
  appliesTo?: Array<'web' | 'discord'>
}

type PlanCatalog = {
  base: PlanRecord[]
  addon: PlanRecord[]
  oneTime: PlanRecord[]
}

const FALLBACK_PLAN_CATALOG: PlanCatalog = {
  base: [
    {
      _id: 'plan.base-retainer',
      name: 'Base Retainer',
      category: 'base',
      price: '$150/mo',
      interval: 'month',
      description:
        'Account management, support coverage, admin portal access, and minor updates to keep your launch on track.',
      features: [
        'Support SLA (business hours)',
        'Admin portal access',
        'Minor updates and maintenance',
      ],
      hoursIncluded: 3,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: [],
    },
    {
      _id: 'plan.base-retainer-plus',
      name: 'Base Retainer Plus',
      category: 'base',
      price: '$275/mo',
      interval: 'month',
      description:
        'Adds additional dedicated hours for iterative work while keeping the core retainer benefits.',
      features: [
        'Everything in Base Retainer',
        '6 included studio hours per month',
        'Monthly backlog grooming session',
      ],
      hoursIncluded: 6,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: [],
    },
  ],
  addon: [
    {
      _id: 'plan.webapp-starter',
      name: 'Web-App Starter',
      category: 'addon',
      price: '$25/mo',
      interval: 'month',
      description: 'Entry-tier hosting & upkeep for your marketing site.',
      features: ['Basic hosting', 'Security patches', 'Monthly backups'],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['web'],
    },
    {
      _id: 'plan.webapp-pro',
      name: 'Web-App Pro',
      category: 'addon',
      price: '$75/mo',
      interval: 'month',
      description:
        'Pro monitoring, performance checks, and priority maintenance.',
      features: [
        'Priority maintenance queue',
        'Performance monitoring',
        'Enhanced backup cadence',
      ],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['web'],
    },
    {
      _id: 'plan.webapp-plus',
      name: 'Web-App Plus',
      category: 'addon',
      price: '$150/mo',
      interval: 'month',
      description:
        'Observability suite, premium support, and disaster recovery readiness.',
      features: [
        'Observability suite access',
        'Priority support channel',
        'Disaster recovery playbooks',
      ],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['web'],
    },
    {
      _id: 'plan.discord-bronze',
      name: 'Discord Bronze',
      category: 'addon',
      price: '$15/mo',
      interval: 'month',
      description: 'Baseline Discord bot monitoring and update coverage.',
      features: ['Bot uptime monitoring', 'Monthly updates'],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['discord'],
    },
    {
      _id: 'plan.discord-silver',
      name: 'Discord Silver',
      category: 'addon',
      price: '$45/mo',
      interval: 'month',
      description: 'Improved monitoring, feature support, and faster patches.',
      features: [
        'Bot monitoring',
        'Priority patch window',
        'Feature toggle assistance',
      ],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['discord'],
    },
    {
      _id: 'plan.discord-gold',
      name: 'Discord Gold',
      category: 'addon',
      price: '$95/mo',
      interval: 'month',
      description:
        'Top-tier Discord maintenance with proactive alerting and recovery.',
      features: [
        '24/7 alerting coverage',
        'Highest priority change queue',
        'Disaster recovery readiness',
      ],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['discord'],
    },
  ],
  oneTime: [
    {
      _id: 'plan.setup-webapp',
      name: 'Web-App Setup',
      category: 'one_time',
      price: '$500 one-time',
      interval: null,
      description: 'Initial site build, configuration, and deployment.',
      features: ['Site scaffolding', 'Theme configuration', 'Deployment'],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['web'],
    },
    {
      _id: 'plan.setup-discord',
      name: 'Discord Bot Setup',
      category: 'one_time',
      price: '$300 one-time',
      interval: null,
      description: 'App registration, command scaffolding, and launch.',
      features: ['App registration', 'Command scaffolding', 'Deployment'],
      hoursIncluded: 0,
      stripeProductId: null,
      stripePriceId: null,
      appliesTo: ['discord'],
    },
  ],
}

const withFallbackPlans = (catalog: PlanCatalog): PlanCatalog => ({
  base:
    catalog.base.length > 0 ? catalog.base : [...FALLBACK_PLAN_CATALOG.base],
  addon:
    catalog.addon.length > 0 ? catalog.addon : [...FALLBACK_PLAN_CATALOG.addon],
  oneTime:
    catalog.oneTime.length > 0
      ? catalog.oneTime
      : [...FALLBACK_PLAN_CATALOG.oneTime],
})

type StepLabel =
  | 'Basics'
  | 'Brand'
  | 'Services'
  | 'Web App'
  | 'Discord'
  | 'Review'

const BASICS_SCHEMA = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Tell us who we are partnering with (2+ characters).'),
  email: z.string().trim().email('Enter a valid contact email.'),
  elevatorPitch: z
    .string()
    .trim()
    .min(
      10,
      'A short elevator pitch helps us tailor the initial copy (10+ characters).'
    )
    .max(280, 'Keep it concise—280 characters max.'),
  vertical: z
    .string()
    .trim()
    .min(1, 'Pick the closest vertical so we can recommend the right preset.'),
})

const BRAND_SCHEMA = z.object({
  logoUrl: z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.protocol === 'https:' || url.protocol === 'http:'
      } catch {
        return false
      }
    }, 'Provide a valid logo URL (https://...) or leave this blank for now.'),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/u, 'Use a 6-digit HEX color, e.g. #1E2E3E.'),
  font: z.enum(BRAND_FONTS, {
    errorMap: () => ({ message: 'Pick one of the supported typefaces.' }),
  }),
})

const SERVICES_SCHEMA = z
  .object({
    basePlanId: z.string().optional(),
    webApp: z.boolean(),
    discord: z.boolean(),
    oneTime: z.array(z.string()).optional(),
  })
  .refine(
    (value) =>
      value.webApp ||
      value.discord ||
      (Array.isArray(value.oneTime) && value.oneTime.length > 0),
    {
      message: 'Pick at least one service or one-time item to start with.',
      path: ['serviceSelection'],
    }
  )
  .refine(
    (value) => {
      // If user selected web or discord hosting, require a recurring base plan
      if (value.webApp || value.discord) {
        const id =
          typeof value.basePlanId === 'string' ? value.basePlanId.trim() : ''
        // Accept a non-empty plan id OR an explicit "no recurring plan" selection
        return id.length > 0 || id === NO_PLAN_VALUE
      }
      return true
    },
    {
      message:
        'Select your launch plan so we can tee up the right provisioning script.',
      path: ['basePlanId'],
    }
  )

const WEB_SCHEMA = z.object({
  domainIntent: z
    .string()
    .trim()
    .min(1, 'Tell us how you want to handle your domain.'),
  pages: z
    .array(z.string().trim().min(1))
    .min(1, 'Pick a preset so we know which pages to scaffold.'),
})

type BasicsTouched = Record<keyof WizardData['basics'], boolean>

type BrandTouched = Record<keyof WizardData['brand'], boolean>

type ServicesTouched = {
  basePlanId: boolean
  serviceSelection: boolean
}

type ServicesErrorKey = keyof WizardData['services'] | 'serviceSelection'

type WebTouched = {
  domainIntent: boolean
}

const INITIAL_BASICS_TOUCHED: BasicsTouched = {
  name: false,
  email: false,
  elevatorPitch: false,
  vertical: false,
}

const INITIAL_BRAND_TOUCHED: BrandTouched = {
  logoUrl: false,
  primaryColor: false,
  font: false,
}

const INITIAL_SERVICES_TOUCHED: ServicesTouched = {
  basePlanId: false,
  serviceSelection: false,
}

const INITIAL_WEB_TOUCHED: WebTouched = {
  domainIntent: false,
}

const MANUAL_PLAN_VALUE = '__manual__'
const NO_PLAN_VALUE = '__none__'
const PROGRESS_ENDPOINT = '/api/onboarding/progress'
const SERVER_PERSIST_TIMEOUT = 800
const BASE_PLAN_DETAILS_ID = 'onboarding-base-plan-details'

const isPlanCategory = (value: unknown): value is PlanCategory =>
  value === 'base' || value === 'addon' || value === 'one_time'

const normalizePlanRecord = (plan: Record<string, unknown>): PlanRecord => {
  const category = isPlanCategory(plan.category) ? plan.category : 'base'
  const features = Array.isArray(plan.features)
    ? plan.features.filter(
        (feature): feature is string => typeof feature === 'string'
      )
    : []

  return {
    _id: typeof plan._id === 'string' ? plan._id : '',
    name: typeof plan.name === 'string' ? plan.name : 'Unnamed plan',
    category,
    price: typeof plan.price === 'string' ? plan.price : null,
    interval: typeof plan.interval === 'string' ? plan.interval : null,
    description: typeof plan.description === 'string' ? plan.description : null,
    features,
    hoursIncluded:
      typeof plan.hoursIncluded === 'number' ? plan.hoursIncluded : null,
    stripeProductId:
      typeof plan.stripeProductId === 'string' ? plan.stripeProductId : null,
    stripePriceId:
      typeof plan.stripePriceId === 'string' ? plan.stripePriceId : null,
  }
}

const groupPlansByCategory = (plans: PlanRecord[]): PlanCatalog =>
  plans.reduce<PlanCatalog>(
    (acc, plan) => {
      if (plan.category === 'base') acc.base.push(plan)
      else if (plan.category === 'addon') acc.addon.push(plan)
      else acc.oneTime.push(plan)
      return acc
    },
    { base: [], addon: [], oneTime: [] }
  )

const formatIntervalLabel = (interval: string | null | undefined) => {
  if (!interval) return null
  switch (interval) {
    case 'month':
      return 'Monthly'
    case 'year':
      return 'Annual'
    default:
      return interval
  }
}

const describePlanOption = (plan: PlanRecord) => {
  const intervalLabel = formatIntervalLabel(plan.interval)
  const meta = [plan.price ?? undefined, intervalLabel ?? undefined].filter(
    Boolean
  ) as string[]
  return meta.length > 0 ? `${plan.name} — ${meta.join(' · ')}` : plan.name
}

const planAppliesTo = (
  plan: PlanRecord
): { web: boolean; discord: boolean } => {
  // Prefer explicit mapping from Sanity (appliesTo). If present, use it strictly.
  if (Array.isArray(plan.appliesTo) && plan.appliesTo.length > 0) {
    return {
      web: plan.appliesTo.includes('web'),
      discord: plan.appliesTo.includes('discord'),
    }
  }

  // Fallback deterministic inference for older/unnamed docs (keeps backward compatibility)
  const id = (plan._id || '').toLowerCase()
  const name = (plan.name || '').toLowerCase()
  const web = id.includes('web') || name.includes('web') || id.includes('site')
  const discord =
    id.includes('discord') || name.includes('discord') || name.includes('bot')
  return { web, discord }
}

const formatHoursIncluded = (hours: number | null) => {
  if (hours == null || hours <= 0) return null
  const unit = hours === 1 ? 'hour' : 'hours'
  return `${hours} ${unit} included`
}

type StepOrderInput = Pick<WizardData['services'], 'webApp' | 'discord'>

const computeStepOrder = ({ webApp, discord }: StepOrderInput): StepLabel[] => {
  const order: StepLabel[] = ['Basics', 'Brand', 'Services']
  if (webApp) order.push('Web App')
  if (discord) order.push('Discord')
  order.push('Review')
  return order
}

const mergeWizardData = (incoming: Partial<WizardData>): WizardData => ({
  basics: { ...DEFAULT_DATA.basics, ...(incoming.basics ?? {}) },
  brand: { ...DEFAULT_DATA.brand, ...(incoming.brand ?? {}) },
  services: { ...DEFAULT_DATA.services, ...(incoming.services ?? {}) },
  web: { ...DEFAULT_DATA.web, ...(incoming.web ?? {}) },
  discord: { ...DEFAULT_DATA.discord, ...(incoming.discord ?? {}) },
})

const clampStepIndex = (value: number, stepsLength: number) => {
  if (stepsLength <= 0) return 0
  return Math.min(Math.max(value, 0), stepsLength - 1)
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<WizardData>(DEFAULT_DATA)
  const [planCatalog, setPlanCatalog] = useState<PlanCatalog>(
    FALLBACK_PLAN_CATALOG
  )
  const { base: basePlanRecords } = planCatalog
  const [basicsTouched, setBasicsTouched] = useState<BasicsTouched>(
    INITIAL_BASICS_TOUCHED
  )
  const [brandTouched, setBrandTouched] = useState<BrandTouched>(
    INITIAL_BRAND_TOUCHED
  )
  const [servicesTouched, setServicesTouched] = useState<ServicesTouched>(
    INITIAL_SERVICES_TOUCHED
  )
  const [webTouched, setWebTouched] = useState<WebTouched>(INITIAL_WEB_TOUCHED)
  const [discordTouched, setDiscordTouched] = useState(false)
  const [showStepErrors, setShowStepErrors] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  const stepOrder = useMemo<StepLabel[]>(
    () =>
      computeStepOrder({
        webApp: data.services.webApp,
        discord: data.services.discord,
      }),
    [data.services.webApp, data.services.discord]
  )

  const currentStep = stepOrder[step] ?? 'Review'

  useEffect(() => {
    setStep((prev) => clampStepIndex(prev, stepOrder.length))
  }, [stepOrder])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(PROGRESS_ENDPOINT, { method: 'GET' })
        if (!cancelled && res.ok && res.status !== 204) {
          const payload = await res.json()
          const merged = mergeWizardData(payload.data ?? {})
          const targetStep = typeof payload.step === 'number' ? payload.step : 0
          const order = computeStepOrder({
            webApp: merged.services.webApp,
            discord: merged.services.discord,
          })
          setData(merged)
          setStep(clampStepIndex(targetStep, order.length))
          setHasHydrated(true)
          return
        }
      } catch {
        // Swallow server persistence errors; fall back to local storage
      }

      if (cancelled) return

      try {
        const raw = localStorage.getItem('onboarding-progress')
        const rawStep = localStorage.getItem('onboarding-step')
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<WizardData>
          const merged = mergeWizardData(parsed)
          const storedStep = rawStep ? Number(rawStep) : 0
          const order = computeStepOrder({
            webApp: merged.services.webApp,
            discord: merged.services.discord,
          })
          setData(merged)
          setStep(
            clampStepIndex(
              Number.isNaN(storedStep) ? 0 : storedStep,
              order.length
            )
          )
        } else if (rawStep) {
          const storedStep = Number(rawStep)
          if (!Number.isNaN(storedStep)) {
            const fallbackOrderLength = computeStepOrder({
              webApp: DEFAULT_DATA.services.webApp,
              discord: DEFAULT_DATA.services.discord,
            }).length
            setStep(clampStepIndex(storedStep, fallbackOrderLength))
          }
        }
      } catch {
        // Ignore localStorage issues
      }

      if (!cancelled) {
        setHasHydrated(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    if (basePlanRecords.length === 0) return

    setData((prev) => {
      const currentId = prev.services.basePlanId
      const hasMatch =
        typeof currentId === 'string' &&
        basePlanRecords.some((plan) => plan._id === currentId)

      if (hasMatch) return prev

      const fallbackId = basePlanRecords[0]?._id
      if (!fallbackId) return prev

      return {
        ...prev,
        services: {
          ...prev.services,
          basePlanId: fallbackId,
        },
      }
    })
  }, [hasHydrated, basePlanRecords])

  useEffect(() => {
    if (!hasHydrated) return
    try {
      localStorage.setItem('onboarding-progress', JSON.stringify(data))
      localStorage.setItem('onboarding-step', String(step))
    } catch {
      // Ignore storage write issues
    }
  }, [data, step, hasHydrated])

  useEffect(() => {
    if (!hasHydrated) return
    let cancelled = false
    const timeout = window.setTimeout(() => {
      if (cancelled) return
      void fetch(PROGRESS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data }),
      }).catch(() => {
        // Ignore persistence errors in the UI flow
      })
    }, SERVER_PERSIST_TIMEOUT)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [data, step, hasHydrated])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const result = await runPublicQuery(qPlans)
        if (cancelled) return

        if (!Array.isArray(result)) {
          setPlanCatalog(
            withFallbackPlans({
              base: [],
              addon: [],
              oneTime: [],
            })
          )
          return
        }

        const normalized = result
          .filter(
            (plan): plan is Record<string, unknown> =>
              typeof plan === 'object' && plan !== null
          )
          .map((plan) => normalizePlanRecord(plan))
          .filter((plan) => plan._id.length > 0)

        setPlanCatalog(withFallbackPlans(groupPlansByCategory(normalized)))
      } catch {
        if (!cancelled) {
          setPlanCatalog(
            withFallbackPlans({
              base: [],
              addon: [],
              oneTime: [],
            })
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setShowStepErrors(false)
  }, [step])

  const basicsValidation = useMemo(
    () => BASICS_SCHEMA.safeParse(data.basics),
    [data.basics]
  )

  const basicsErrors = useMemo(() => {
    if (basicsValidation.success) return {}
    return basicsValidation.error.formErrors.fieldErrors
  }, [basicsValidation]) as Record<
    keyof WizardData['basics'],
    string[] | undefined
  >

  const brandValidation = useMemo(
    () => BRAND_SCHEMA.safeParse(data.brand),
    [data.brand]
  )

  const brandErrors = useMemo(() => {
    if (brandValidation.success) return {}
    return brandValidation.error.formErrors.fieldErrors
  }, [brandValidation]) as Record<
    keyof WizardData['brand'],
    string[] | undefined
  >

  const servicesValidation = useMemo(
    () =>
      SERVICES_SCHEMA.safeParse({
        basePlanId: data.services.basePlanId ?? '',
        webApp: data.services.webApp,
        discord: data.services.discord,
      }),
    [data.services.basePlanId, data.services.discord, data.services.webApp]
  )

  const servicesErrors = useMemo(() => {
    if (servicesValidation.success) return {}
    return servicesValidation.error.formErrors.fieldErrors
  }, [servicesValidation]) as Record<ServicesErrorKey, string[] | undefined>

  const webValidation = useMemo(
    () =>
      WEB_SCHEMA.safeParse({
        domainIntent: data.web.domainIntent,
        pages: data.web.pages,
      }),
    [data.web.domainIntent, data.web.pages]
  )

  const webErrors = useMemo(() => {
    if (webValidation.success) return {}
    return webValidation.error.formErrors.fieldErrors
  }, [webValidation]) as Record<
    keyof z.infer<typeof WEB_SCHEMA>,
    string[] | undefined
  >

  const serviceSelectionValue =
    data.services.webApp && data.services.discord
      ? 'both'
      : data.services.webApp
        ? 'web'
        : data.services.discord
          ? 'discord'
          : ''

  const selectedBasePlan = useMemo(() => {
    if (!data.services.basePlanId) return undefined
    return basePlanRecords.find((plan) => plan._id === data.services.basePlanId)
  }, [data.services.basePlanId, basePlanRecords])

  const selectedBasePlanHours = useMemo(
    () => formatHoursIncluded(selectedBasePlan?.hoursIncluded ?? null),
    [selectedBasePlan]
  )

  const reviewBasePlanLabel = selectedBasePlan
    ? describePlanOption(selectedBasePlan)
    : data.services.basePlanId || '(not set yet)'

  const basePlanSelectValue = useMemo(() => {
    const currentId = data.services.basePlanId
    if (typeof currentId === 'undefined') return ''
    if (currentId === '') return MANUAL_PLAN_VALUE
    if (currentId === NO_PLAN_VALUE) return NO_PLAN_VALUE
    return basePlanRecords.some((plan) => plan._id === currentId)
      ? currentId
      : ''
  }, [basePlanRecords, data.services.basePlanId])

  const basePlanError =
    (servicesTouched.basePlanId || showStepErrors) &&
    servicesErrors.basePlanId?.[0]

  const serviceSelectionError =
    (servicesTouched.serviceSelection || showStepErrors) &&
    servicesErrors.serviceSelection?.[0]

  const webDomainError =
    (webTouched.domainIntent || showStepErrors) && webErrors.domainIntent?.[0]

  const discordNameError =
    (discordTouched || showStepErrors) &&
    data.services.discord &&
    !data.discord.botName.trim()
      ? 'Name your bot so we can stage Discord metadata.'
      : undefined

  const basePlanDescribedBy = [
    'onboarding-base-plan-hint',
    basePlanError ? 'onboarding-base-plan-error' : undefined,
    selectedBasePlan ? BASE_PLAN_DETAILS_ID : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const serviceSelectionDescribedBy = [
    'onboarding-service-selection-hint',
    serviceSelectionError ? 'onboarding-service-selection-error' : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const webDomainDescribedBy = [
    'onboarding-domain-intent-hint',
    webDomainError ? 'onboarding-domain-intent-error' : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'Basics':
        return basicsValidation.success
      case 'Brand':
        return brandValidation.success
      case 'Services':
        return servicesValidation.success
      case 'Web App':
        return webValidation.success
      case 'Discord':
        return data.services.discord
          ? Boolean(data.discord.botName.trim())
          : true
      default:
        return true
    }
  }, [
    basicsValidation.success,
    brandValidation.success,
    servicesValidation.success,
    webValidation.success,
    currentStep,
    data.services.discord,
    data.discord.botName,
  ])

  const next = () => {
    switch (currentStep) {
      case 'Basics':
        if (!basicsValidation.success) {
          setBasicsTouched({
            name: true,
            email: true,
            elevatorPitch: true,
            vertical: true,
          })
          setShowStepErrors(true)
          return
        }
        break
      case 'Brand':
        if (!brandValidation.success) {
          setBrandTouched({
            logoUrl: true,
            primaryColor: true,
            font: true,
          })
          setShowStepErrors(true)
          return
        }
        break
      case 'Services':
        if (!servicesValidation.success) {
          setServicesTouched({
            basePlanId: true,
            serviceSelection: true,
          })
          setShowStepErrors(true)
          return
        }
        break
      case 'Web App':
        if (!webValidation.success) {
          setWebTouched({ domainIntent: true })
          setShowStepErrors(true)
          return
        }
        break
      case 'Discord':
        if (data.services.discord && !data.discord.botName.trim()) {
          setDiscordTouched(true)
          setShowStepErrors(true)
          return
        }
        break
      default:
        break
    }

    setStep((s) => clampStepIndex(s + 1, stepOrder.length))
  }

  const prev = () => setStep((s) => clampStepIndex(s - 1, stepOrder.length))

  return (
    <section
      className="p-6 md:p-8 max-w-3xl"
      aria-labelledby="onboarding-heading"
    >
      <h1
        id="onboarding-heading"
        className="text-2xl font-semibold text-gray-900"
      >
        Onboarding
      </h1>
      <p className="mt-2 text-gray-700">
        Step {step + 1} of {stepOrder.length}: {currentStep}
      </p>

      <ol
        className="mt-4 flex flex-wrap items-center gap-3 text-sm"
        aria-label="Onboarding progress"
      >
        {stepOrder.map((label, index) => {
          const isCurrent = index === step
          const isCompleted = index < step
          return (
            <li key={label}>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium transition-colors ${isCurrent ? 'border-nile-blue-500 bg-nile-blue-50 text-nile-blue-900' : isCompleted ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-500'}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-nile-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                  aria-hidden="true"
                >
                  {isCompleted ? '' : index + 1}
                </span>
                <span>{label}</span>
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-6 space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        {currentStep === 'Basics' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              We&rsquo;ll use these details to tailor your initial site copy and
              provisioning defaults. You can refine everything later inside the
              client portal.
            </p>
            <div>
              <label
                htmlFor="onboarding-name"
                className="block text-sm font-medium text-gray-800"
              >
                Company or artist name
              </label>
              <input
                id="onboarding-name"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                placeholder="e.g. Skyline Creative Studio"
                value={data.basics.name}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, name: e.target.value },
                  }))
                }
                onBlur={() =>
                  setBasicsTouched((prev) => ({ ...prev, name: true }))
                }
                aria-invalid={
                  basicsTouched.name || showStepErrors
                    ? Boolean(basicsErrors.name?.length)
                    : undefined
                }
                aria-describedby={
                  basicsErrors.name && (basicsTouched.name || showStepErrors)
                    ? 'onboarding-name-error'
                    : undefined
                }
              />
              {(basicsTouched.name || showStepErrors) && basicsErrors.name && (
                <p
                  id="onboarding-name-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {basicsErrors.name[0]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="onboarding-email"
                className="block text-sm font-medium text-gray-800"
              >
                Contact email
              </label>
              <input
                id="onboarding-email"
                type="email"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                placeholder="you@company.com"
                value={data.basics.email}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, email: e.target.value },
                  }))
                }
                onBlur={() =>
                  setBasicsTouched((prev) => ({ ...prev, email: true }))
                }
                aria-invalid={
                  basicsTouched.email || showStepErrors
                    ? Boolean(basicsErrors.email?.length)
                    : undefined
                }
                aria-describedby={
                  basicsErrors.email && (basicsTouched.email || showStepErrors)
                    ? 'onboarding-email-error'
                    : undefined
                }
                autoComplete="email"
              />
              {(basicsTouched.email || showStepErrors) &&
                basicsErrors.email && (
                  <p
                    id="onboarding-email-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {basicsErrors.email[0]}
                  </p>
                )}
            </div>
            <div>
              <label
                htmlFor="onboarding-elevator"
                className="block text-sm font-medium text-gray-800"
              >
                Elevator pitch
              </label>
              <textarea
                id="onboarding-elevator"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                rows={4}
                maxLength={280}
                placeholder="What do you do, who do you serve, and what makes you stand out?"
                value={data.basics.elevatorPitch}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, elevatorPitch: e.target.value },
                  }))
                }
                onBlur={() =>
                  setBasicsTouched((prev) => ({ ...prev, elevatorPitch: true }))
                }
                aria-invalid={
                  basicsTouched.elevatorPitch || showStepErrors
                    ? Boolean(basicsErrors.elevatorPitch?.length)
                    : undefined
                }
                aria-describedby={
                  basicsErrors.elevatorPitch &&
                  (basicsTouched.elevatorPitch || showStepErrors)
                    ? 'onboarding-elevator-error'
                    : 'onboarding-elevator-hint'
                }
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span id="onboarding-elevator-hint">
                  This seeds your homepage hero copy.
                </span>
                <span>
                  {280 - data.basics.elevatorPitch.length} characters left
                </span>
              </div>
              {(basicsTouched.elevatorPitch || showStepErrors) &&
                basicsErrors.elevatorPitch && (
                  <p
                    id="onboarding-elevator-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {basicsErrors.elevatorPitch[0]}
                  </p>
                )}
            </div>
            <div>
              <label
                htmlFor="onboarding-vertical"
                className="block text-sm font-medium text-gray-800"
              >
                Primary vertical
              </label>
              <select
                id="onboarding-vertical"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={data.basics.vertical}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    basics: { ...d.basics, vertical: e.target.value },
                  }))
                }
                onBlur={() =>
                  setBasicsTouched((prev) => ({ ...prev, vertical: true }))
                }
                aria-invalid={
                  basicsTouched.vertical || showStepErrors
                    ? Boolean(basicsErrors.vertical?.length)
                    : undefined
                }
                aria-describedby={
                  basicsErrors.vertical &&
                  (basicsTouched.vertical || showStepErrors)
                    ? 'onboarding-vertical-error'
                    : undefined
                }
              >
                <option value="">Select a vertical</option>
                <option value="musician">Musician / Artist</option>
                <option value="bakery">Bakery / Food service</option>
                <option value="thrift">Thrift / Retail</option>
                <option value="brand">Brand / Creator</option>
                <option value="agency">Agency / Services</option>
                <option value="other">Other</option>
              </select>
              {(basicsTouched.vertical || showStepErrors) &&
                basicsErrors.vertical && (
                  <p
                    id="onboarding-vertical-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {basicsErrors.vertical[0]}
                  </p>
                )}
            </div>
          </div>
        )}

        {currentStep === 'Brand' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Upload brand assets so your launch kit feels on brand from day
              one. You can skip anything you don&rsquo;t have handywe&rsquo;ll
              use safe defaults.
            </p>
            <div>
              <label
                htmlFor="onboarding-logo-url"
                className="block text-sm font-medium text-gray-800"
              >
                Logo URL
              </label>
              <input
                id="onboarding-logo-url"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={data.brand.logoUrl}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    brand: { ...d.brand, logoUrl: e.target.value },
                  }))
                }
                onBlur={() =>
                  setBrandTouched((prev) => ({ ...prev, logoUrl: true }))
                }
                aria-invalid={
                  brandTouched.logoUrl || showStepErrors
                    ? Boolean(brandErrors.logoUrl?.length)
                    : undefined
                }
                aria-describedby={
                  brandErrors.logoUrl &&
                  (brandTouched.logoUrl || showStepErrors)
                    ? 'onboarding-logo-url-error'
                    : 'onboarding-logo-url-hint'
                }
                placeholder="https://cdn.yourdomain.com/logo.png"
              />
              <p
                id="onboarding-logo-url-hint"
                className="mt-1 text-xs text-gray-500"
              >
                Paste a hosted PNG/SVG. Leave blank if you&rsquo;d like us to
                stage a typographic logo.
              </p>
              {(brandTouched.logoUrl || showStepErrors) &&
                brandErrors.logoUrl && (
                  <p
                    id="onboarding-logo-url-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {brandErrors.logoUrl[0]}
                  </p>
                )}
            </div>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="onboarding-primary-color"
                  className="block text-sm font-medium text-gray-800"
                >
                  Primary color
                </label>
                <input
                  type="color"
                  id="onboarding-primary-color"
                  className="mt-1 h-10 w-full rounded-md border focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                  value={data.brand.primaryColor}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: { ...d.brand, primaryColor: e.target.value },
                    }))
                  }
                  onBlur={() =>
                    setBrandTouched((prev) => ({ ...prev, primaryColor: true }))
                  }
                  aria-invalid={
                    brandTouched.primaryColor || showStepErrors
                      ? Boolean(brandErrors.primaryColor?.length)
                      : undefined
                  }
                  aria-describedby={
                    brandErrors.primaryColor &&
                    (brandTouched.primaryColor || showStepErrors)
                      ? 'onboarding-primary-color-error'
                      : 'onboarding-primary-color-hint'
                  }
                />
                <p
                  id="onboarding-primary-color-hint"
                  className="mt-1 text-xs text-gray-500"
                >
                  We&rsquo;ll seed Tailwind tokens with this HEX value.
                </p>
                {(brandTouched.primaryColor || showStepErrors) &&
                  brandErrors.primaryColor && (
                    <p
                      id="onboarding-primary-color-error"
                      className="mt-1 text-xs text-red-600"
                    >
                      {brandErrors.primaryColor[0]}
                    </p>
                  )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="onboarding-font"
                  className="block text-sm font-medium text-gray-800"
                >
                  Font
                </label>
                <select
                  id="onboarding-font"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                  value={data.brand.font}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      brand: {
                        ...d.brand,
                        font: (e.target.value || BRAND_FONTS[0]) as BrandFont,
                      },
                    }))
                  }
                  onBlur={() =>
                    setBrandTouched((prev) => ({ ...prev, font: true }))
                  }
                  aria-invalid={
                    brandTouched.font || showStepErrors
                      ? Boolean(brandErrors.font?.length)
                      : undefined
                  }
                  aria-describedby={
                    brandErrors.font && (brandTouched.font || showStepErrors)
                      ? 'onboarding-font-error'
                      : undefined
                  }
                >
                  {BRAND_FONTS.map((fontOption) => (
                    <option key={fontOption} value={fontOption}>
                      {fontOption}
                    </option>
                  ))}
                </select>
                {(brandTouched.font || showStepErrors) && brandErrors.font && (
                  <p
                    id="onboarding-font-error"
                    className="mt-1 text-xs text-red-600"
                  >
                    {brandErrors.font[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'Services' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Choose the plan and products we should provision during checkout.
              We&rsquo;ll queue the right scripts and billing integrations based
              on this selection.
            </p>
            <div>
              <label
                htmlFor="onboarding-base-plan"
                className="block text-sm font-medium text-gray-800"
              >
                Base plan
              </label>
              <select
                id="onboarding-base-plan"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={basePlanSelectValue}
                onChange={(e) => {
                  const value = e.target.value
                  setServicesTouched((prev) => ({ ...prev, basePlanId: true }))
                  setData((d) => {
                    if (value === '') {
                      return {
                        ...d,
                        services: { ...d.services, basePlanId: undefined },
                      }
                    }
                    if (value === MANUAL_PLAN_VALUE) {
                      return {
                        ...d,
                        services: { ...d.services, basePlanId: '' },
                      }
                    }
                    return {
                      ...d,
                      services: { ...d.services, basePlanId: value },
                    }
                  })
                }}
                onBlur={() =>
                  setServicesTouched((prev) => ({ ...prev, basePlanId: true }))
                }
                aria-invalid={
                  servicesTouched.basePlanId || showStepErrors
                    ? Boolean(basePlanError)
                    : undefined
                }
                aria-describedby={basePlanDescribedBy}
              >
                <option value="">Select a base plan</option>
                {basePlanRecords.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {describePlanOption(plan)}
                  </option>
                ))}
                <option value={NO_PLAN_VALUE}>
                  No recurring plan (one-time only)
                </option>
                <option value={MANUAL_PLAN_VALUE}>
                  Enter plan ID manually
                </option>
              </select>
              <p
                id="onboarding-base-plan-hint"
                className="mt-1 text-xs text-gray-500"
              >
                Reference the same plan you&rsquo;ve configured in Stripe so
                billing stays in sync.
              </p>
              {selectedBasePlan && (
                <div
                  id={BASE_PLAN_DETAILS_ID}
                  className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700"
                >
                  <p className="font-medium text-gray-900">
                    {describePlanOption(selectedBasePlan)}
                  </p>
                  {selectedBasePlan.description && (
                    <p className="mt-1 text-gray-700">
                      {selectedBasePlan.description}
                    </p>
                  )}
                  {selectedBasePlanHours && (
                    <p className="mt-1 text-gray-600">
                      {selectedBasePlanHours}
                    </p>
                  )}
                  {selectedBasePlan.features.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                      {selectedBasePlan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {basePlanSelectValue === MANUAL_PLAN_VALUE && (
                <div className="mt-3">
                  <label
                    htmlFor="onboarding-base-plan-manual"
                    className="block text-xs font-medium text-gray-700"
                  >
                    Manual plan ID
                  </label>
                  <input
                    id="onboarding-base-plan-manual"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                    placeholder="plan_123..."
                    value={data.services.basePlanId ?? ''}
                    onChange={(e) =>
                      setData((d) => ({
                        ...d,
                        services: { ...d.services, basePlanId: e.target.value },
                      }))
                    }
                    onBlur={() =>
                      setServicesTouched((prev) => ({
                        ...prev,
                        basePlanId: true,
                      }))
                    }
                    aria-invalid={
                      servicesTouched.basePlanId || showStepErrors
                        ? Boolean(basePlanError)
                        : undefined
                    }
                    aria-describedby={basePlanDescribedBy}
                  />
                </div>
              )}
              {basePlanError && (
                <p
                  id="onboarding-base-plan-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {basePlanError}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="onboarding-service-selection"
                className="block text-sm font-medium text-gray-800"
              >
                Desired services
              </label>
              <select
                id="onboarding-service-selection"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={serviceSelectionValue}
                onChange={(e) => {
                  const value = e.target.value
                  setServicesTouched((prev) => ({
                    ...prev,
                    serviceSelection: true,
                  }))
                  const nextWebApp = value === 'web' || value === 'both'
                  const nextDiscord = value === 'discord' || value === 'both'
                  setData((d) => ({
                    ...d,
                    services: {
                      ...d.services,
                      webApp: nextWebApp,
                      discord: nextDiscord,
                    },
                    web: nextWebApp ? d.web : { ...DEFAULT_DATA.web },
                    discord: nextDiscord
                      ? d.discord
                      : { ...DEFAULT_DATA.discord },
                  }))
                  if (!nextWebApp) {
                    setWebTouched(INITIAL_WEB_TOUCHED)
                  }
                  if (!nextDiscord) {
                    setDiscordTouched(false)
                  }
                }}
                onBlur={() =>
                  setServicesTouched((prev) => ({
                    ...prev,
                    serviceSelection: true,
                  }))
                }
                aria-invalid={
                  servicesTouched.serviceSelection || showStepErrors
                    ? Boolean(serviceSelectionError)
                    : undefined
                }
                aria-describedby={serviceSelectionDescribedBy}
              >
                <option value="">Select services…</option>
                <option value="web">Web App</option>
                <option value="discord">Discord App</option>
                <option value="both">Both</option>
              </select>
              <p
                id="onboarding-service-selection-hint"
                className="mt-1 text-xs text-gray-500"
              >
                We&rsquo;ll stage checklists, integrations, and provisioning
                hooks for whichever services you choose.
              </p>
              {serviceSelectionError && (
                <p
                  id="onboarding-service-selection-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {serviceSelectionError}
                </p>
              )}
            </div>
            <div>
              <label
                id="onboarding-addons-label"
                className="block text-sm font-medium text-gray-800"
              >
                Add-ons
              </label>
              <div className="mt-2 grid gap-2">
                {planCatalog.addon
                  .filter((plan) => {
                    const applies = planAppliesTo(plan)
                    if (applies.web && applies.discord)
                      return data.services.webApp || data.services.discord
                    if (applies.web) return data.services.webApp
                    if (applies.discord) return data.services.discord
                    // if we can't determine, show by default
                    return data.services.webApp || data.services.discord
                  })
                  .map((plan) => {
                    const checked = data.services.addons.includes(plan._id)
                    return (
                      <label
                        key={plan._id}
                        className="flex items-start gap-3 rounded-md border px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          aria-checked={checked}
                          checked={checked}
                          onChange={() => {
                            setData((d) => {
                              const has = d.services.addons.includes(plan._id)
                              const next = has
                                ? d.services.addons.filter(
                                    (id) => id !== plan._id
                                  )
                                : [...d.services.addons, plan._id]
                              return {
                                ...d,
                                services: { ...d.services, addons: next },
                              }
                            })
                          }}
                        />
                        <div className="flex-1 text-sm text-gray-800">
                          <div className="font-medium">
                            {describePlanOption(plan)}
                          </div>
                          {plan.description && (
                            <div className="text-xs text-gray-600">
                              {plan.description}
                            </div>
                          )}
                          {plan.features.length > 0 && (
                            <details className="mt-2 text-xs text-gray-600">
                              <summary className="cursor-pointer font-medium text-xs text-gray-700">
                                Details
                              </summary>
                              <ul className="mt-1 list-disc pl-5 space-y-1">
                                {plan.features.map((f) => (
                                  <li key={f}>{f}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>

            <div>
              <label
                id="onboarding-one-time-label"
                className="block text-sm font-medium text-gray-800"
              >
                One-time items
              </label>
              <div className="mt-2 grid gap-2">
                {planCatalog.oneTime
                  .filter((plan) => {
                    const applies = planAppliesTo(plan)
                    if (applies.web && applies.discord)
                      return data.services.webApp || data.services.discord
                    if (applies.web) return data.services.webApp
                    if (applies.discord) return data.services.discord
                    return true
                  })
                  .map((plan) => {
                    const checked = data.services.oneTime.includes(plan._id)
                    return (
                      <label
                        key={plan._id}
                        className="flex items-start gap-3 rounded-md border px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          aria-checked={checked}
                          checked={checked}
                          onChange={() => {
                            setData((d) => {
                              const has = d.services.oneTime.includes(plan._id)
                              const next = has
                                ? d.services.oneTime.filter(
                                    (id) => id !== plan._id
                                  )
                                : [...d.services.oneTime, plan._id]
                              return {
                                ...d,
                                services: { ...d.services, oneTime: next },
                              }
                            })
                          }}
                        />
                        <div className="flex-1 text-sm text-gray-800">
                          <div className="font-medium">
                            {describePlanOption(plan)}
                          </div>
                          {plan.description && (
                            <div className="text-xs text-gray-600">
                              {plan.description}
                            </div>
                          )}
                          {plan.features.length > 0 && (
                            <details className="mt-2 text-xs text-gray-600">
                              <summary className="cursor-pointer font-medium text-xs text-gray-700">
                                Details
                              </summary>
                              <ul className="mt-1 list-disc pl-5 space-y-1">
                                {plan.features.map((f) => (
                                  <li key={f}>{f}</li>
                                ))}
                              </ul>
                            </details>
                          )}
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'Web App' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">
              Tell us how you want the initial marketing site scaffolded. You
              can customize every page once provisioning completes.
            </p>
            <div>
              <label
                className="block text-sm font-medium text-gray-800"
                htmlFor="onboarding-web-preset"
              >
                Website preset
              </label>
              <select
                id="onboarding-web-preset"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={(() => {
                  const set = new Set(data.web.pages)
                  if (
                    ['home', 'about', 'contact'].every((page) =>
                      set.has(page)
                    ) &&
                    set.size === 3
                  )
                    return 'minimal'
                  if (
                    ['home', 'about', 'contact', 'blog'].every((page) =>
                      set.has(page)
                    ) &&
                    set.size === 4
                  )
                    return 'blog'
                  if (
                    ['home', 'about', 'contact', 'music', 'shows'].every(
                      (page) => set.has(page)
                    ) &&
                    set.size === 5
                  )
                    return 'musician'
                  return 'custom'
                })()}
                onChange={(e) => {
                  const value = e.target.value
                  const presets: Record<string, string[]> = {
                    minimal: ['home', 'about', 'contact'],
                    blog: ['home', 'about', 'contact', 'blog'],
                    musician: ['home', 'about', 'contact', 'music', 'shows'],
                  }
                  setData((d) => ({
                    ...d,
                    web: { ...d.web, pages: presets[value] || d.web.pages },
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
            </div>
            <div>
              <label
                htmlFor="onboarding-domain-intent"
                className="block text-sm font-medium text-gray-800"
              >
                Domain intent
              </label>
              <select
                id="onboarding-domain-intent"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={data.web.domainIntent}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    web: { ...d.web, domainIntent: e.target.value },
                  }))
                }
                onBlur={() => setWebTouched({ domainIntent: true })}
                aria-invalid={
                  webTouched.domainIntent || showStepErrors
                    ? Boolean(webDomainError)
                    : undefined
                }
                aria-describedby={webDomainDescribedBy}
              >
                <option value="">Choose an option</option>
                <option value="have_domain">I have a domain</option>
                <option value="buy_domain">I want to buy a domain</option>
                <option value="temporary_subdomain">
                  Use a temporary subdomain
                </option>
              </select>
              <p
                id="onboarding-domain-intent-hint"
                className="mt-1 text-xs text-gray-500"
              >
                We&rsquo;ll prep DNS tasks or a temporary subdomain based on
                your choice.
              </p>
              {webDomainError && (
                <p
                  id="onboarding-domain-intent-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {webDomainError}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 'Discord' && data.services.discord && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="onboarding-discord-name"
                className="block text-sm font-medium text-gray-800"
              >
                Bot name
              </label>
              <input
                id="onboarding-discord-name"
                className="mt-1 w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-nile-blue-500 focus:outline-none focus:ring-2 focus:ring-nile-blue-200"
                value={data.discord.botName}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    discord: { ...d.discord, botName: e.target.value },
                  }))
                }
                onBlur={() => setDiscordTouched(true)}
                aria-invalid={discordNameError ? true : undefined}
                aria-describedby={
                  discordNameError
                    ? 'onboarding-discord-name-error'
                    : 'onboarding-discord-name-hint'
                }
                placeholder="TownesDev Bot"
              />
              <p
                id="onboarding-discord-name-hint"
                className="mt-1 text-xs text-gray-500"
              >
                We&rsquo;ll apply this name to the application metadata and
                default invite copy.
              </p>
              {discordNameError && (
                <p
                  id="onboarding-discord-name-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {discordNameError}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Intents and feature selection to follow.
            </p>
          </div>
        )}

        {currentStep === 'Review' && (
          <div className="space-y-2 text-sm text-gray-800">
            <p>
              <strong>Name:</strong> {data.basics.name || '(not set)'}
            </p>
            <p>
              <strong>Email:</strong> {data.basics.email || '(not set)'}
            </p>
            <p>
              <strong>Base plan:</strong> {reviewBasePlanLabel}
            </p>
            {data.services.addons.length > 0 && (
              <p>
                <strong>Add-ons:</strong>{' '}
                {data.services.addons
                  .map(
                    (id) =>
                      planCatalog.addon.find((p) => p._id === id)?.name || id
                  )
                  .join(', ')}
              </p>
            )}
            {data.services.oneTime.length > 0 && (
              <p>
                <strong>One-time items:</strong>{' '}
                {data.services.oneTime
                  .map(
                    (id) =>
                      planCatalog.oneTime.find((p) => p._id === id)?.name || id
                  )
                  .join(', ')}
              </p>
            )}
            <p>
              <strong>Web pages:</strong> {data.web.pages.join(', ')}
            </p>
            {data.services.discord && (
              <p>
                <strong>Bot:</strong> {data.discord.botName || '(unnamed)'}
              </p>
            )}
            <div className="pt-2">
              <div className="flex flex-wrap gap-3">
                <a
                  href="/app/plans"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Proceed to billing
                </a>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/clients/provision', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          web: {
                            pages: data.web.pages,
                            theme: {
                              primaryColor: data.brand.primaryColor,
                              font: data.brand.font,
                            },
                            vertical: data.basics.vertical,
                          },
                          discord: {
                            botName: data.discord.botName,
                            enabled: data.services.discord,
                          },
                        }),
                      })
                      if (!res.ok) throw new Error('Provisioning failed')
                      window.location.href = '/app'
                    } catch {
                      alert(
                        'Provisioning failed. Please try again from your dashboard later.'
                      )
                    }
                  }}
                  className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
                >
                  Finish & Provision
                </button>
              </div>
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
          disabled={!canGoNext || step === stepOrder.length - 1}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save & Continue
        </button>
        <button
          onClick={() => {
            setStep(0)
            setData(mergeWizardData({}))
            setBasicsTouched(INITIAL_BASICS_TOUCHED)
            setBrandTouched(INITIAL_BRAND_TOUCHED)
            setServicesTouched(INITIAL_SERVICES_TOUCHED)
            setWebTouched(INITIAL_WEB_TOUCHED)
            setDiscordTouched(false)
            setShowStepErrors(false)
            try {
              localStorage.removeItem('onboarding-progress')
              localStorage.removeItem('onboarding-step')
            } catch {
              // ignore storage failures
            }
            void fetch(PROGRESS_ENDPOINT, { method: 'DELETE' }).catch(() => {
              // ignore server persistence failures
            })
          }}
          className="ml-auto inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </section>
  )
}
