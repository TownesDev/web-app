import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface PortfolioExample {
  name: string
  description: string
  type: string
  url: string
  features: string[]
  color: {
    bg: string
    text: string
    border: string
  }
}

const examples: PortfolioExample[] = [
  {
    name: 'Sweet Sunrise Bakery',
    description:
      'A professional small business website showcasing fresh baked goods with an inviting, warm design.',
    type: 'Small Business Website',
    url: '/examples/bakery',
    features: [
      'Mobile-responsive design',
      'Multi-page layout',
      'Contact form',
      'Menu/product showcase',
      'Google Maps integration',
    ],
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
    },
  },
  {
    name: 'The Midnight Collective',
    description:
      'An engaging musician/band website with music player integration, tour dates, and social media connectivity.',
    type: 'Musician Website',
    url: '/examples/musician',
    features: [
      'Modern dark design',
      'Music player mockup',
      'Tour dates section',
      'Social media links',
      'Newsletter signup',
    ],
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-300',
    },
  },
]

export function PortfolioShowcase() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-nile-blue-900 mb-4">
            Live Portfolio Examples
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what&apos;s possible. These fully-functional demo sites showcase
            the quality and versatility of our web development services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {examples.map((example) => (
            <div
              key={example.name}
              className={`${example.color.bg} rounded-lg shadow-lg overflow-hidden border-2 ${example.color.border} hover:shadow-xl transition-shadow`}
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700 border border-gray-300">
                    {example.type}
                  </span>
                </div>

                <h3 className={`text-2xl font-bold ${example.color.text} mb-3`}>
                  {example.name}
                </h3>

                <p className="text-gray-700 mb-4">{example.description}</p>

                <div className="mb-6">
                  <p className="font-semibold text-gray-900 mb-2 text-sm">
                    Features:
                  </p>
                  <ul className="space-y-1">
                    {example.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-gray-700 flex items-center gap-2"
                      >
                        <span className="text-green-600">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={example.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Live Demo
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold text-nile-blue-900 mb-3">
            Ready to Get Started?
          </h3>
          <p className="text-gray-700 mb-6">
            These examples are just the beginning. Let&apos;s create something
            amazing for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Your Project
            </Link>
            <Link
              href="/plans"
              className="border-2 border-nile-blue-700 text-nile-blue-700 hover:bg-nile-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
