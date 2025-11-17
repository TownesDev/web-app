import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface SuccessPageProps {
  searchParams: {
    session_id?: string
  }
}

async function verifySession(sessionId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout/verify?session_id=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      return null
    }

    const { session } = await response.json()
    return session
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  const session = await verifySession(sessionId)

  if (!session) {
    redirect('/app/onboarding')
  }

  // Extract plan details from session metadata
  const planName = session.metadata?.planName || 'Selected Plan'
  const planPrice = session.metadata?.planPrice || ''

  return (
    <section
      className="p-6 md:p-8 max-w-3xl mx-auto"
      aria-labelledby="success-heading"
    >
      {/* Success Icon and Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1
          id="success-heading"
          className="text-3xl font-bold text-gray-900 mb-3"
        >
          Payment Successful! 🎉
        </h1>

        <p className="text-lg text-gray-700">
          Welcome to TownesDev! Your project is being set up...
        </p>
      </div>

      {/* Plan Details Card */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Selected Plan
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">{planName}</span>
            {planPrice && (
              <span className="text-nile-blue-600 font-semibold">
                {planPrice}
              </span>
            )}
          </div>
          <div className="pt-2 border-t">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* What Happens Next Section */}
      <div className="bg-nile-blue-50 rounded-lg border border-nile-blue-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
          What Happens Next
        </h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-nile-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </span>
            <span>
              <strong>Check your email</strong> - You&apos;ll receive a
              confirmation email with your subscription details shortly.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-nile-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              2
            </span>
            <span>
              <strong>Project setup</strong> - Our team is provisioning your
              resources and will reach out to schedule an onboarding call.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-nile-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </span>
            <span>
              <strong>Get started</strong> - Access your client dashboard to
              track progress, manage assets, and view invoices.
            </span>
          </li>
        </ol>
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Link
          href="/app"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go to Dashboard
        </Link>
        <p className="mt-4 text-sm text-gray-600">
          Need help?{' '}
          <a
            href="mailto:support@townesdev.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Contact support
          </a>
        </p>
      </div>
    </section>
  )
}

export default async function OnboardingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/app/onboarding')
  }

  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      }
    >
      <SuccessContent sessionId={sessionId} />
    </Suspense>
  )
}
