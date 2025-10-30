import { HeroSection } from '../../components/public/HeroSection'
import { ServiceOfferings } from '../../components/public/ServiceOfferings'
import { TestimonialsSection } from '../../components/public/TestimonialsSection'
import { AboutMeSection } from '../../components/public/AboutMeSection'
import { ContactSection } from '../../components/public/ContactSection'
import { PlanCard } from '../../components/PlanCard'
import { runPublicQuery } from '../../lib/public/client'
import { qLandingPageContent, qPlans } from '../../sanity/lib/queries'

// Revalidate marketing content every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  try {
    const [landingPageData, plansData] = await Promise.all([
      runPublicQuery(qLandingPageContent, {}),
      runPublicQuery(qPlans, {}),
    ])
    type MarketingPlan = {
      _id: string
      name: string
      price: string
      features: string[]
      description: string
    }
    const typedPlans: MarketingPlan[] = (plansData || []) as MarketingPlan[]

    return (
      <>
        <main className="min-h-screen">
          <section id="home">
            <HeroSection content={landingPageData?.hero} />
          </section>
          <section id="services" className="py-16">
            <ServiceOfferings
              services={landingPageData?.serviceOfferings || []}
            />
          </section>
          <section id="about" className="py-16">
            <AboutMeSection content={landingPageData?.about} />
          </section>
          <section id="plans" className="py-16 bg-transparent">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12 text-nile-blue-900">
                CHOOSE YOUR PLAN
              </h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {typedPlans.map((plan: MarketingPlan, index: number) => (
                  <PlanCard
                    key={plan._id}
                    name={plan.name}
                    price={plan.price}
                    features={plan.features}
                    description={plan.description}
                    planId={plan._id}
                    isPopular={index === 1}
                  />
                ))}
              </div>
            </div>
          </section>
          <section className="py-16">
            <TestimonialsSection
              testimonials={landingPageData?.testimonials || []}
            />
          </section>
          <section id="contact">
            <ContactSection contactInfo={landingPageData?.contact} />
          </section>
        </main>
      </>
    )
  } catch (error) {
    console.error('Failed to load landing page data:', error)

    // Fallback content if CMS fails
    return (
      <>
        <main className="min-h-screen">
          <section id="home">
            <HeroSection />
          </section>
          <section id="services" className="py-16">
            <ServiceOfferings services={[]} />
          </section>
          <section id="about" className="py-16">
            <AboutMeSection />
          </section>
          <section className="py-16">
            <TestimonialsSection testimonials={[]} />
          </section>
          <section id="contact">
            <ContactSection />
          </section>
        </main>
      </>
    )
  }
}
