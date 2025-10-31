import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const COOKIE_KEY = 'td-onboarding-progress'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const MAX_STEP_INDEX = 5

const partialWizardDataSchema = z
  .object({
    basics: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        elevatorPitch: z.string().optional(),
        vertical: z.string().optional(),
      })
      .optional(),
    brand: z
      .object({
        logoUrl: z.string().optional(),
        primaryColor: z.string().optional(),
        font: z.string().optional(),
      })
      .optional(),
    services: z
      .object({
        basePlanId: z.string().optional(),
        addons: z.array(z.string()).optional(),
        webApp: z.boolean().optional(),
        discord: z.boolean().optional(),
      })
      .optional(),
    web: z
      .object({
        pages: z.array(z.string()).optional(),
        domainIntent: z.string().optional(),
        links: z.record(z.string()).optional(),
      })
      .optional(),
    discord: z
      .object({
        botName: z.string().optional(),
        intents: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .partial()

const payloadSchema = z.object({
  step: z.number().int().min(0).max(MAX_STEP_INDEX).optional(),
  data: partialWizardDataSchema.optional(),
})

type Payload = z.infer<typeof payloadSchema>

type ErrorBody = { error: string }

export async function GET() {
  const store = await cookies()
  const value = store.get(COOKIE_KEY)?.value

  if (!value) {
    return new NextResponse(null, { status: 204 })
  }

  try {
    const parsed = payloadSchema.parse(JSON.parse(value))
    return NextResponse.json(parsed satisfies Payload)
  } catch {
    const response = new NextResponse(null, { status: 204 })
    response.cookies.delete(COOKIE_KEY)
    return response
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = payloadSchema.parse(json)

    const response = NextResponse.json({ ok: true })
    response.cookies.set({
      name: COOKIE_KEY,
      value: JSON.stringify(parsed satisfies Payload),
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? 'Invalid onboarding progress payload.'
        : 'Unable to persist onboarding progress.'
    return NextResponse.json({ error: message } satisfies ErrorBody, {
      status: 400,
    })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete(COOKIE_KEY)
  return response
}
