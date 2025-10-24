import Image from 'next/image'
import Link from 'next/link'
import { HeroContent, BACKGROUND_GRADIENTS } from '../../types/cms'

interface HeroSectionProps {
  content?: HeroContent
}

export function HeroSection({ content }: HeroSectionProps) {
  // Fallback hero content with lighthouse logo
  const fallbackContent: HeroContent = {
    tagline: 'Code. Systems. Foundations.',
    headline: 'TOWNESDEV',
    subheadline:
      'Expert software engineering for Discord bots, automation systems, and scalable applications.',
    logoLight: {
      asset: { url: '/townesdev_logo_sub_light.svg' },
      alt: 'TownesDev Light Logo',
    },
    logoDark: {
      asset: { url: '/townesdev_logo_sub_dark.svg' },
      alt: 'TownesDev Dark Logo',
    },
    backgroundGradient: 'gradient-nile',
    primaryCtaText: 'Start Your Project',
    primaryCtaUrl: '/contact',
    secondaryCtaText: 'View Plans',
    secondaryCtaUrl: '/plans',
    featuredMetrics: [
      {
        label: 'Years Experience',
        value: '10+',
        description: 'Proven track record',
      },
      {
        label: 'Projects Delivered',
        value: '50+',
        description: 'Custom software projects',
      },
      {
        label: 'Client Satisfaction',
        value: '100%',
        description: 'Based on surveys',
      },
    ],
  }

  const heroContent = content || fallbackContent

  const {
    tagline,
    headline,
    subheadline,
    logoDark,
    backgroundGradient,
    primaryCtaText,
    primaryCtaUrl,
    secondaryCtaText,
    secondaryCtaUrl,
    featuredMetrics,
  } = heroContent

  const bgClass =
    BACKGROUND_GRADIENTS[backgroundGradient] ||
    BACKGROUND_GRADIENTS['gradient-nile']

  return (
    <section className={`py-20 px-4 bg-nile-blue-50 ${bgClass}`}>
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          {/* Logo Display - Always show lighthouse, prefer CMS logos if available */}
          <div className="relative w-[500px] h-[300px] mx-auto mb-6">
            <Image
              src={logoDark?.asset?.url || '/townesdev_logo_sub_dark.svg'}
              alt={logoDark?.alt || 'TownesDev Logo'}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Brand Tagline */}
          {tagline && (
            <div className="text-5xl md:text-6xl font-bold text-nile-blue-900 mb-4 font-heading">
              {tagline}
            </div>
          )}

          {/* Main Headline */}
          {headline && (
            <h1 className="text-3xl md:text-4xl font-semibold text-nile-blue-900 mb-4 font-heading">
              {headline}
            </h1>
          )}

          {/* Supporting Description */}
          {subheadline && (
            <p className="text-xl text-nile-blue-700  max-w-2xl mx-auto mb-8 font-body">
              {subheadline}
            </p>
          )}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {primaryCtaText && primaryCtaUrl && (
            <Link
              href={primaryCtaUrl}
              className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {primaryCtaText}
            </Link>
          )}
          {secondaryCtaText && secondaryCtaUrl && (
            <Link
              href={secondaryCtaUrl}
              className="border-2 border-nile-blue-700 text-nile-blue-700 hover:bg-nile-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors "
            >
              {secondaryCtaText}
            </Link>
          )}
        </div>

        {/* Featured Metrics */}
        {featuredMetrics && featuredMetrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {featuredMetrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-gray-200"
              >
                <div className="text-2xl font-bold text-nile-blue-900 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {metric.label}
                </div>
                {metric.description && (
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
