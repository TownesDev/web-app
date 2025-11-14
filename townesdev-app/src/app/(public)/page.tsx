import { HeroSection } from '../../components/public/HeroSection'
import { SegmentShowcase } from '../../components/public/SegmentShowcase'
import { AboutMeSection } from '../../components/public/AboutMeSection'
import { ContactSection } from '../../components/public/ContactSection'
import { PortfolioShowcase } from '../../components/public/PortfolioShowcase'
import { runPublicQuery } from '../../lib/public/client'
import { qLandingPageContent } from '../../sanity/lib/queries'

// Revalidate marketing content every 5 minutes
export const revalidate = 300

export default async function HomePage() {
  try {
    const landingPageData = await runPublicQuery(qLandingPageContent, {})

    return (
      <>
        <main className="min-h-screen">
          <section id="home">
            <HeroSection content={landingPageData?.hero} />
          </section>
          <section id="segments">
            <SegmentShowcase />
          </section>
          <section id="about" className="py-16">
            <AboutMeSection content={landingPageData?.about} />
          </section>
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-nile-blue-900 mb-6">
                WHY START WITH TOWNESDEV?
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Rapid Launch
                  </h3>
                  <p className="text-gray-700">
                    Get your project live in weeks, not months. We focus on
                    shipping working solutions fast.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🛠️</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Built for Growth
                  </h3>
                  <p className="text-gray-700">
                    Start small and scale up. Our systems grow with your
                    business without breaking.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Clear Communication
                  </h3>
                  <p className="text-gray-700">
                    No tech jargon. We explain everything in plain English and
                    keep you updated.
                  </p>
                </div>
              </div>
              <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-lg text-gray-700 italic">
                  &ldquo;We&rsquo;re building a client base one successful
                  project at a time. Join us as an early customer and help shape
                  our services.&rdquo;
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  — Donny Townes, Founder
                </p>
              </div>
            </div>
          </section>
          <section>
            <PortfolioShowcase />
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
          <section id="segments">
            <SegmentShowcase />
          </section>
          <section id="about" className="py-16">
            <AboutMeSection />
          </section>
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-nile-blue-900 mb-6">
                WHY START WITH TOWNESDEV?
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Rapid Launch
                  </h3>
                  <p className="text-gray-700">
                    Get your project live in weeks, not months. We focus on
                    shipping working solutions fast.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🛠️</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Built for Growth
                  </h3>
                  <p className="text-gray-700">
                    Start small and scale up. Our systems grow with your
                    business without breaking.
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-semibold text-nile-blue-900 mb-2">
                    Clear Communication
                  </h3>
                  <p className="text-gray-700">
                    No tech jargon. We explain everything in plain English and
                    keep you updated.
                  </p>
                </div>
              </div>
              <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-lg text-gray-700 italic">
                  &ldquo;We&rsquo;re building a client base one successful
                  project at a time. Join us as an early customer and help shape
                  our services.&rdquo;
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  — Donny Townes, Founder
                </p>
              </div>
            </div>
          </section>
          <section>
            <PortfolioShowcase />
          </section>
          <section id="contact">
            <ContactSection />
          </section>
        </main>
      </>
    )
  }
}
