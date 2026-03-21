/**
 * Regression tests for Stripe webhook idempotency and stuck-processing handling.
 */

export {}

type JsonRespLocal = <T>(
  body: T,
  opts?: { status?: number }
) => { body: T; status: number }
type Mutation = {
  createIfNotExists?: Record<string, unknown>
  create?: Record<string, unknown>
  patch?: { id: string; set?: Record<string, unknown> }
}

interface MockRequest {
  text(): Promise<string>
  headers: { get(key: string): string | null }
  method: string
  url: string
}

let consoleLogSpy: jest.SpyInstance
let consoleWarnSpy: jest.SpyInstance
let consoleErrorSpy: jest.SpyInstance

describe('Stripe webhook regression - concurrency & stuck processing', () => {
  beforeEach(() => {
    jest.resetModules()
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('only one worker proceeds when two deliveries race for the same event', async () => {
    jest.mock('next/server', () => ({
      NextRequest: class {},
      NextResponse: {
        json: ((body, opts) => ({
          body,
          status: opts?.status ?? 200,
        })) as JsonRespLocal,
      },
    }))

    jest.mock('../../../../queries/emailTemplates', () => ({
      getEmailTemplateByName: jest.fn().mockResolvedValue(null),
    }))
    jest.mock('../../../../lib/email', () => ({
      ptToHtml: jest.fn(),
      ptToPlainText: jest.fn(),
      mergeVars: jest.fn((s: string) => s),
    }))
    jest.mock('../../../../lib/resendClient', () => ({
      resend: { emails: { send: jest.fn() } },
      EMAIL_FROM: 'noreply@example.com',
    }))
    jest.mock('@/lib/admin/client', () => ({
      runAdminQuery: jest.fn().mockResolvedValue([]),
    }))
    jest.mock('@/sanity/lib/queries', () => ({ qPlanFeatureMappings: [] }))

    const mockLogInfo = jest.fn()
    const mockLogError = jest.fn()
    jest.mock('@/lib/structuredLogger', () => ({
      logInfo: mockLogInfo,
      logError: mockLogError,
    }))

    // In-memory simulation of Sanity dataset for stripeEvent + retainer creation tracking
    const docs: Record<string, unknown> = {}
    const retainerCreates: Array<Record<string, unknown>> = []

    const sanityWrite = {
      mutate: jest
        .fn()
        .mockImplementation(async (mutations: Array<unknown>) => {
          for (const m of mutations) {
            const mm = m as Mutation
            if (mm.createIfNotExists) {
              const doc = mm.createIfNotExists
              const id = String(doc._id)
              if (!docs[id]) {
                docs[id] = { ...doc }
              }
            } else if (mm.create) {
              const createDoc = mm.create as Record<string, unknown>
              if (createDoc && String(createDoc['_type']) === 'retainer') {
                retainerCreates.push(createDoc)
              }
            } else if (mm.patch) {
              const id = mm.patch.id
              docs[id] = {
                ...((docs[id] as Record<string, unknown>) || {}),
                ...(mm.patch.set || {}),
              }
            }
          }
          return true
        }),
    }

    const runQuery = jest
      .fn()
      .mockImplementation(
        async (q: string, params?: Record<string, unknown> | undefined) => {
          // Fetch plan
          if (q.includes(`*[_type=="plan"`)) {
            return {
              _id: String(params?.id || 'plan.x'),
              name: 'Plan X',
              hoursIncluded: 10,
            }
          }

          // Read by _id
          if (q.includes(`*[_id==$id]`) || q.includes(`*[_id==$id][0]`)) {
            const key = String(params?.id || '')
            return (
              (docs as Record<string, Record<string, unknown>>)[key] || null
            )
          }

          // Generic retainer existence check - return null to force create
          if (q.includes(`*[_type=="retainer"`)) return null

          return null
        }
      )

    jest.mock('@/lib/client', () => ({ runQuery, sanityWrite }))

    // Mock entitlements to be no-ops
    jest.mock('@/lib/entitlements', () => ({
      ensureClientAsset: jest.fn().mockResolvedValue({ _id: 'asset.1' }),
      ensureFeature: jest.fn().mockResolvedValue({ _id: 'feature.1' }),
      mapPlanToFeature: jest.fn().mockReturnValue(null),
    }))

    // Mock Stripe to return identical event for both invocations
    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: jest.fn().mockImplementation(() => ({
            id: 'evt_race',
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_race',
                metadata: { planId: 'plan.x', clientId: 'client.1' },
                session: 'cs_race',
                subscription: 'sub_race',
              },
            },
          })),
        },
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'sub_race',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 3600,
          }),
        },
      }))
    })

    const { POST } = await import('../webhook/route')

    const req: MockRequest = {
      text: async () => '{}',
      headers: { get: () => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    }

    // First invocation
    await POST(req as unknown as import('next/server').NextRequest)
    // Second invocation (simulating quick retry / concurrent delivery)
    await POST(req as unknown as import('next/server').NextRequest)

    // Only one retainer create should exist across both deliveries
    expect(retainerCreates.length).toBe(1)
    // We should have logged duplicate suppression for the second delivery
    expect(mockLogInfo).toHaveBeenCalled()
    const calledWithDup = mockLogInfo.mock.calls.some((c: unknown) =>
      String((c as unknown[])?.[0] || '').includes(
        'webhook.duplicate_suppressed'
      )
    )
    expect(calledWithDup).toBe(true)
  })

  it('reclaims a stale processing doc when no active lock remains', async () => {
    jest.mock('next/server', () => ({
      NextRequest: class {},
      NextResponse: {
        json: ((body: unknown, opts?: { status?: number }) => ({
          body,
          status: opts?.status ?? 200,
        })) as JsonRespLocal,
      },
    }))

    const mockLogInfo2 = jest.fn()
    const mockLogError2 = jest.fn()
    jest.mock('@/lib/structuredLogger', () => ({
      logInfo: mockLogInfo2,
      logError: mockLogError2,
    }))

    const docs: Record<string, unknown> = {}
    const retainerCreates: Array<Record<string, unknown>> = []

    const sanityWrite = {
      mutate: jest
        .fn()
        .mockImplementation(async (mutations: Array<unknown>) => {
          for (const m of mutations) {
            const mm = m as Mutation
            if (mm.createIfNotExists) {
              const doc = mm.createIfNotExists
              const id = String(doc._id)
              if (!docs[id]) docs[id] = { ...doc }
            } else if (mm.create) {
              const createDoc = mm.create as Record<string, unknown>
              if (createDoc && String(createDoc['_type']) === 'retainer') {
                retainerCreates.push(createDoc)
              }
            } else if (mm.patch) {
              const id = mm.patch.id
              docs[id] = {
                ...((docs[id] as Record<string, unknown>) || {}),
                ...(mm.patch.set || {}),
              }
            }
          }
          return true
        }),
    }

    const runQuery = jest
      .fn()
      .mockImplementation(
        async (q: string, params?: Record<string, unknown> | undefined) => {
          if (q.includes(`*[_type=="plan"`)) {
            return {
              _id: String(params?.id || 'plan.x'),
              name: 'Plan X',
              hoursIncluded: 10,
            }
          }
          if (q.includes(`*[_id==$id]`) || q.includes(`*[_id==$id][0]`)) {
            const key = String(params?.id || '')
            return (
              (docs as Record<string, Record<string, unknown>>)[key] || null
            )
          }
          if (q.includes(`*[_type=="retainer"`)) return null
          return null
        }
      )

    jest.mock('@/lib/client', () => ({ runQuery, sanityWrite }))
    jest.mock('../../../../queries/emailTemplates', () => ({
      getEmailTemplateByName: jest.fn().mockResolvedValue(null),
    }))
    jest.mock('../../../../lib/email', () => ({
      ptToHtml: jest.fn(),
      ptToPlainText: jest.fn(),
      mergeVars: jest.fn((s: string) => s),
    }))
    jest.mock('../../../../lib/resendClient', () => ({
      resend: { emails: { send: jest.fn() } },
      EMAIL_FROM: 'noreply@example.com',
    }))
    jest.mock('@/lib/admin/client', () => ({
      runAdminQuery: jest.fn().mockResolvedValue([]),
    }))
    jest.mock('@/sanity/lib/queries', () => ({ qPlanFeatureMappings: [] }))
    jest.mock('@/lib/entitlements', () => ({
      ensureClientAsset: jest.fn().mockResolvedValue({ _id: 'asset.1' }),
      ensureFeature: jest.fn().mockResolvedValue({ _id: 'feature.1' }),
      mapPlanToFeature: jest.fn().mockReturnValue(null),
    }))

    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: jest.fn().mockImplementation(() => ({
            id: 'evt_stuck',
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_stuck',
                metadata: { planId: 'plan.x', clientId: 'client.1' },
                subscription: 'sub_stuck',
              },
            },
          })),
        },
        subscriptions: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'sub_stuck',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 3600,
          }),
        },
      }))
    })

    // Pre-seed a stale processing doc with no usable lock metadata.
    const stuckId = `stripeEvent.evt_stuck`
    docs[stuckId] = {
      _id: stuckId,
      eventId: 'evt_stuck',
      status: 'processing',
      createdAt: '2000-01-01T00:00:00.000Z',
    }

    const { POST } = await import('../webhook/route')

    const req: MockRequest = {
      text: async () => '{}',
      headers: { get: () => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    }

    await POST(req as unknown as import('next/server').NextRequest)

    // Handler should reclaim the stale lock and continue safely.
    expect(retainerCreates.length).toBe(1)
    const lockClaimed = mockLogInfo2.mock.calls.some((c: unknown) =>
      String((c as unknown[])?.[0] || '').includes('webhook.lock_claimed')
    )
    expect(lockClaimed).toBe(true)
  })
})
