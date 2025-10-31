/**
 * Tests for Stripe webhook duplicate suppression and event recording.
 */

type JsonResponse = <T>(
  body: T,
  opts?: { status?: number }
) => { body: T; status: number }

interface MockRequest {
  text(): Promise<string>
  headers: { get(key: string): string | null }
  method: string
  url: string
}

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('short-circuits when event already processed', async () => {
    // Mock Next.js server bindings to avoid Request runtime dependency
    jest.mock('next/server', () => ({
      NextRequest: class {},
      NextResponse: {
        json: ((body, opts) => ({
          body,
          status: opts?.status ?? 200,
        })) as JsonResponse,
      },
    }))

    // Mock other dependencies to avoid pulling real Sanity/Resend/entitlements
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
    jest.mock('@/lib/entitlements', () => ({
      ensureClientAsset: jest.fn().mockResolvedValue({ _id: 'asset.1' }),
      ensureFeature: jest.fn().mockResolvedValue({ _id: 'feature.1' }),
      mapPlanToFeature: jest.fn().mockReturnValue(null),
    }))
    jest.mock('@/lib/admin/client', () => ({
      runAdminQuery: jest.fn().mockResolvedValue([]),
    }))
    jest.mock('@/sanity/lib/queries', () => ({ qPlanFeatureMappings: [] }))

    // Mock Sanity client to return an existing stripeEvent
    const mockLogInfo = jest.fn()
    const mockLogError = jest.fn()
    jest.mock('@/lib/structuredLogger', () => ({
      logInfo: mockLogInfo,
      logError: mockLogError,
    }))

    jest.mock('@/lib/client', () => ({
      runQuery: jest.fn().mockResolvedValue({
        _id: 'evt.rec',
        status: 'success',
        processedAt: new Date().toISOString(),
      }),
      sanityWrite: { mutate: jest.fn() },
    }))

    // Mock Stripe to return a verified event
    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: jest.fn().mockImplementation(() => ({
            id: 'evt_1',
            type: 'checkout.session.completed',
            data: { object: { id: 'cs_1' } },
          })),
        },
      }))
    })

    const { POST } = await import('../webhook/route')
    const clientModule = await import('@/lib/client')
    const loggerModule = await import('@/lib/structuredLogger')
    const { runQuery, sanityWrite } = clientModule
    const { logInfo } = loggerModule

    const req: MockRequest = {
      text: async () => '{}',
      headers: { get: () => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    }

    await POST(req as unknown as import('next/server').NextRequest)

    // Should have checked for existing event and logged duplicate suppression
    expect(runQuery).toHaveBeenCalled()
    expect(logInfo).toHaveBeenCalledWith(
      expect.stringContaining('webhook.duplicate_suppressed'),
      expect.objectContaining({ eventId: 'evt_1' })
    )
    // We should have attempted the createIfNotExists call (atomic), even if the
    // document pre-existed; sanityWrite.mutate should have been invoked.
    expect(sanityWrite.mutate).toHaveBeenCalled()
  })

  it('creates a processing record when first seeing an event', async () => {
    // Mock Next.js server bindings to avoid Request runtime dependency
    jest.mock('next/server', () => ({
      NextRequest: class {},
      NextResponse: {
        json: ((body, opts) => ({
          body,
          status: opts?.status ?? 200,
        })) as JsonResponse,
      },
    }))

    // Mock other dependencies to avoid pulling real Sanity/Resend/entitlements
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
    jest.mock('@/lib/entitlements', () => ({
      ensureClientAsset: jest.fn().mockResolvedValue({ _id: 'asset.1' }),
      ensureFeature: jest.fn().mockResolvedValue({ _id: 'feature.1' }),
      mapPlanToFeature: jest.fn().mockReturnValue(null),
    }))
    jest.mock('@/lib/admin/client', () => ({
      runAdminQuery: jest.fn().mockResolvedValue([]),
    }))
    jest.mock('@/sanity/lib/queries', () => ({ qPlanFeatureMappings: [] }))

    const mockLogInfo2 = jest.fn()
    const mockLogError2 = jest.fn()
    jest.mock('@/lib/structuredLogger', () => ({
      logInfo: mockLogInfo2,
      logError: mockLogError2,
    }))

    jest.mock('@/lib/client', () => ({
      runQuery: jest.fn().mockResolvedValue(null),
      sanityWrite: { mutate: jest.fn().mockResolvedValue(true) },
    }))

    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: jest.fn().mockImplementation(() => ({
            id: 'evt_2',
            type: 'checkout.session.completed',
            data: {
              object: {
                id: 'cs_2',
                metadata: { planId: 'plan.x', clientId: 'client.1' },
              },
            },
          })),
        },
      }))
    })

    const { POST } = await import('../webhook/route')
    const clientModule = await import('@/lib/client')
    const loggerModule = await import('@/lib/structuredLogger')
    const { sanityWrite } = clientModule
    const { logInfo: logInfo2 } = loggerModule

    const req: MockRequest = {
      text: async () => '{}',
      headers: { get: () => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    }

    await POST(req as unknown as import('next/server').NextRequest)

    // Should have attempted to create a stripeEvent processing record
    expect(sanityWrite.mutate).toHaveBeenCalled()
    const mutateMock = sanityWrite.mutate as jest.Mock
    const calledWith = mutateMock.mock.calls[0][0]
    expect(Array.isArray(calledWith)).toBe(true)
    expect(JSON.stringify(calledWith)).toContain('stripeEvent')
    // Should have logged processing completed
    expect(logInfo2).toHaveBeenCalledWith(
      expect.stringContaining('webhook.processing_completed'),
      expect.objectContaining({ eventId: 'evt_2' })
    )
  })
})
