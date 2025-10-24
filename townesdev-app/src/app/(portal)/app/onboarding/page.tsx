export default function OnboardingPage() {
  return (
    <section className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">Complete your onboarding</h1>
      <p className="mt-2 text-gray-600">
        You’re almost there. Finish the onboarding steps to unlock your client portal.
      </p>
      <div className="mt-6 space-x-3">
        <a
          href="/app/plans"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Choose a plan
        </a>
        <a
          href="/app"
          className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Back to dashboard
        </a>
      </div>
    </section>
  )
}
