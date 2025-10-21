import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_READ_TOKEN',
      'SANITY_WRITE_TOKEN',
      'RESEND_API_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
    ]

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    )

    if (missingVars.length > 0) {
      console.warn('Missing environment variables:', missingVars)
      return NextResponse.json(
        {
          status: 'warning',
          message: 'Some environment variables are missing',
          missing: missingVars,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'All required environment variables are configured',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
