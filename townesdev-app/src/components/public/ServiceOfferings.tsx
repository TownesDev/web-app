import Image from 'next/image'
import Link from 'next/link'
import {
  ServiceOffering,
  SERVICE_ICONS,
  SERVICE_STATUS_STYLES,
} from '../../types/cms'

interface ServiceOfferingsProps {
  services: ServiceOffering[]
  title?: string
  subtitle?: string
  showAll?: boolean
}

export function ServiceOfferings({
  services = [],
  title = 'What We Build',
  subtitle = 'Structured, reliable, and purpose-driven digital systems',
  showAll = false,
}: ServiceOfferingsProps) {
  const displayServices = showAll ? services : services.slice(0, 3)

  return (
    <section className="py-20 px-4 bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-nile-blue-900 mb-4 font-heading">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-nile-blue-700 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>

        {/* View All Link */}
        {!showAll && services.length > 3 && (
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="text-nile-blue-600 hover:text-nile-blue-700 font-semibold text-lg transition-colors"
            >
              View All Services →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

interface ServiceCardProps {
  service: ServiceOffering
}

function ServiceCard({ service }: ServiceCardProps) {
  const {
    title,
    slug,
    shortDescription,
    icon,
    featuredImage,
    technologies,
    keyFeatures,
    startingPrice,
    deliveryTimeframe,
    status,
  } = service

  const serviceIcon = SERVICE_ICONS[icon] || '⚡'
  const statusStyle =
    SERVICE_STATUS_STYLES[status] || SERVICE_STATUS_STYLES.active

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Service Image or Icon */}
      <div className="relative h-48 bg-gray-50">
        {featuredImage ? (
          <Image
            src={featuredImage.asset.url}
            alt={featuredImage.alt || title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-nile-blue-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">{serviceIcon}</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status !== 'active' && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle}`}
            >
              {status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-nile-blue-900 font-heading">
            {title}
          </h3>
        </div>

        <p className="text-gray-700 mb-4 font-body">{shortDescription}</p>

        {/* Key Features */}
        {keyFeatures && keyFeatures.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Key Features:
            </h4>
            <ul className="space-y-1">
              {keyFeatures.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start"
                >
                  <span className="text-nile-blue-600 mr-2">•</span>
                  {feature.feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {tech}
                </span>
              ))}
              {technologies.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                  +{technologies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing and Timeline */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          {startingPrice && (
            <div>
              <span className="font-semibold">{startingPrice}</span>
            </div>
          )}
          {deliveryTimeframe && (
            <div>
              <span>{deliveryTimeframe}</span>
            </div>
          )}
        </div>

        {/* Learn More Button */}
        <Link
          href={`/services/${slug.current}`}
          className="block w-full text-center bg-nile-blue-600 hover:bg-nile-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}
