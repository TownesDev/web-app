/**
 * Tests for Stripe webhook duplicate suppression and event recording.
 */

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('short-circuits when event already processed', async () => {
    // Mock Sanity client to return an existing stripeEvent
    jest.mock('@/lib/client', () => ({
      runQuery: jest.fn().mockResolvedValue({ _id: 'evt.rec', status: 'success', processedAt: new Date().toISOString() }),
      sanityWrite: { mutate: jest.fn() },
    }))

    // Mock Stripe to return a verified event
    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: { constructEvent: jest.fn().mockImplementation(() => ({ id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } })) },
      }))
    })

    const { POST } = await import('../webhook/route')
    const { runQuery, sanityWrite } = (await import('@/lib/client')) as any

    const req = {
      text: async () => '{}',
      headers: { get: (_: string) => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    } as any

    const res = await POST(req)

    // Should have checked for existing event
    expect(runQuery).toHaveBeenCalled()
    // Should not have attempted to create a new stripeEvent record because it already existed
    expect(sanityWrite.mutate).not.toHaveBeenCalled()
  })

  it('creates a processing record when first seeing an event', async () => {
    jest.mock('@/lib/client', () => ({
      runQuery: jest.fn().mockResolvedValue(null),
      sanityWrite: { mutate: jest.fn().mockResolvedValue(true) },
    }))

    jest.mock('stripe', () => {
      return jest.fn().mockImplementation(() => ({
        webhooks: { constructEvent: jest.fn().mockImplementation(() => ({ id: 'evt_2', type: 'checkout.session.completed', data: { object: { id: 'cs_2', metadata: { planId: 'plan.x', clientId: 'client.1' } } } })) },
      }))
    })

    const { POST } = await import('../webhook/route')
    const { runQuery, sanityWrite } = (await import('@/lib/client')) as any

    const req = {
      text: async () => '{}',
      headers: { get: (_: string) => 'sig' },
      method: 'POST',
      url: 'http://localhost/api/stripe/webhook',
    } as any

    const res = await POST(req)

    // Should have attempted to create a stripeEvent processing record
    expect(sanityWrite.mutate).toHaveBeenCalled()
    const calledWith = (sanityWrite.mutate as jest.Mock).mock.calls[0][0]
    expect(Array.isArray(calledWith)).toBe(true)
    expect(JSON.stringify(calledWith)).toContain('stripeEvent')
  })
})
