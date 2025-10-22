import Image from 'next/image'
import { PlanCard } from '../../components/PlanCard'
import { runPublicQuery } from '../../lib/public/client'
import { qPlans } from '../../sanity/lib/queries'
import { draftMode } from 'next/headers'

interface Plan {
  _id: string
  name: string
  price: string
  features: string[]
  description: string
  stripeProductId?: string
  stripePriceId?: string
  hoursIncluded?: number
}

async function getPlans(): Promise<Plan[]> {
  const { isEnabled } = await draftMode()
  const plans = await runPublicQuery(qPlans, {}, isEnabled)
  return plans
}

export const revalidate = 3600 // Revalidate every hour for marketing content

export default async function Home() {
  const plans = await getPlans()

  return (
    <div className="min-h-screen bg-gradient-to-br from-nile-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="relative w-[500px] h-[300px] mx-auto mb-6">
              <Image
                src="/townesdev_logo_sub_light.svg"
                alt="TownesDev Logo"
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/townesdev_logo_sub_dark.svg"
                alt="TownesDev Logo"
                fill
                className="object-contain hidden dark:block"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-nile-blue-900 mb-4 font-heading">
              Code. Systems. Foundations.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Independent development studio building structured, reliable, and
              purpose-driven digital systems. Where craftsmanship meets clarity
              in every project.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Your Project
            </a>
            <a
              href="/app"
              className="border-2 border-nile-blue-600 text-nile-blue-600 hover:bg-nile-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Client Portal
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-nile-blue-900 mb-12 font-heading">
            What We Build
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-nile-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-nile-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                Structured Systems
              </h3>
              <p className="text-gray-600">
                Robust architectures that scale with your business needs.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-sandy-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-sandy-brown-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                Reliable Solutions
              </h3>
              <p className="text-gray-600">
                Dependable software that performs when it matters most.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-nile-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-nile-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                Clear Communication
              </h3>
              <p className="text-gray-600">
                Transparent processes with regular updates and feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-nile-blue-900 mb-4 font-heading">
              Service Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your business needs. All plans include
              our core development services with different levels of support and
              customization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan._id}
                name={plan.name}
                price={plan.price}
                features={plan.features}
                description={plan.description}
                isPopular={index === 1} // Make the middle plan "popular"
                planId={plan._id}
              />
            ))}
          </div>

          <div className="text-center">
            <a
              href="/plans"
              className="text-nile-blue-600 hover:text-nile-blue-700 font-semibold text-lg transition-colors"
            >
              View All Plans →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-nile-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 font-heading">
            Ready to Build Something Great?
          </h2>
          <p className="text-xl mb-8 text-nile-blue-100">
            Let&apos;s discuss your project and create a foundation for success.
          </p>
          <a
            href="/auth/signup"
            className="bg-sandy-brown-500 hover:bg-sandy-brown-600 text-nile-blue-900 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Get Started Today
          </a>
        </div>
      </section>
    </div>
  )
}
