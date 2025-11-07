import { PricingSegment } from '@/components/public/PricingSegment'
import { PricingTier } from '@/components/public/PricingCard'

export const metadata = {
  title: 'Pricing - TownesDev',
  description: 'Choose the perfect plan for your business needs. Transparent pricing for small businesses, Discord bots, and musicians.',
}

export const revalidate = 3600 // Revalidate every hour for marketing content

export default function PricingPage() {
  // Small Businesses Pricing Data
  const smallBusinessTiers: PricingTier[] = [
    {
      name: 'Starter',
      badge: 'Starter',
      oneTimePrice: '$1,000',
      monthlyPrice: '$99',
      features: [
        '3-5 pages',
        'Mobile-responsive design',
        'Contact form',
        'Basic SEO',
        'Monthly updates included',
      ],
    },
    {
      name: 'Professional',
      badge: 'Pro',
      oneTimePrice: '$2,500',
      monthlyPrice: '$199',
      features: [
        '5-10 pages',
        'Custom design',
        'CMS access',
        'SEO optimization',
        'Analytics',
        'Gallery/menu/services showcase',
        'Weekly updates',
        'Priority support',
      ],
    },
    {
      name: 'Premium',
      badge: 'Premium',
      oneTimePrice: '$5,000',
      monthlyPrice: '$399',
      features: [
        'Everything in Pro',
        'E-commerce (if needed)',
        'Booking/reservation system',
        'Custom features',
        'Daily monitoring',
        '4-hour support SLA',
      ],
    },
  ]

  // Discord Bots Pricing Data
  const discordBotsTiers: PricingTier[] = [
    {
      name: 'Community',
      badge: 'Community',
      oneTimePrice: '',
      monthlyPrice: '$0-49',
      features: [
        'Basic welcome messages',
        'Moderation tools',
        '1 server',
        'Up to 1000 members',
        'Community support (Discord server)',
      ],
    },
    {
      name: 'Guild',
      badge: 'Guild',
      oneTimePrice: '',
      monthlyPrice: '$99',
      features: [
        'Custom commands',
        'Role management',
        'Up to 3 servers',
        'Up to 5000 members',
        'Email support',
        '48hr response time',
        'Feature requests accepted',
      ],
    },
    {
      name: 'Enterprise',
      badge: 'Enterprise',
      oneTimePrice: '',
      monthlyPrice: '$299',
      features: [
        'Everything in Guild',
        'Custom feature development',
        'Unlimited servers',
        'Unlimited members',
        'Priority support',
        '12hr response time',
        'Dedicated Slack/Discord channel',
      ],
    },
  ]

  // Musicians Pricing Data
  const musiciansTiers: PricingTier[] = [
    {
      name: 'Solo Artist',
      badge: 'Solo',
      oneTimePrice: '$500',
      monthlyPrice: '$29',
      features: [
        'Single page site',
        'Music player integration (Spotify, etc.)',
        'Show dates',
        'Social links',
        'Contact/booking form',
      ],
    },
    {
      name: 'Band/Pro',
      badge: 'Band',
      oneTimePrice: '$1,200',
      monthlyPrice: '$79',
      features: [
        'Multi-page (bio, music, shows, contact)',
        'Merch integration (if needed)',
        'Mailing list signup',
        'Press kit download',
      ],
    },
    {
      name: 'Label/Management',
      badge: 'Label',
      oneTimePrice: '$2,500',
      monthlyPrice: '$199',
      features: [
        'Multi-artist showcase',
        'Advanced booking/tour management',
        'Analytics dashboard',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-nile-blue-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. All plans include hosting,
            maintenance, and ongoing support. No hidden fees.
          </p>
        </header>

        {/* Small Businesses Section */}
        <PricingSegment
          title="Small Businesses"
          description="Beautiful, professional websites for local businesses. Get online quickly with a modern, mobile-friendly site."
          tiers={smallBusinessTiers}
        />

        {/* Discord Bots Section */}
        <PricingSegment
          title="Online Communities (Discord Bots)"
          description="Custom Discord bot instances with hosting and maintenance. Engage your community with automated features."
          tiers={discordBotsTiers}
        />

        {/* Musicians Section */}
        <PricingSegment
          title="Indie Musicians"
          description="Beautiful, mobile-first musician websites. Showcase your music, connect with fans, and grow your presence."
          tiers={musiciansTiers}
        />

        {/* Footer CTA */}
        <aside className="text-center mt-16 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-nile-blue-900 mb-4">
            Need a custom solution?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact us for enterprise pricing or special requirements. We&apos;re
            happy to discuss your specific needs.
          </p>
          <a
            href="/contact"
            className="inline-block bg-sandy-brown-600 hover:bg-sandy-brown-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            aria-label="Contact us for custom pricing solutions"
          >
            Contact Us
          </a>
        </aside>
      </div>
    </div>
  )
}
