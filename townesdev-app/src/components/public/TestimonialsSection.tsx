import Image from 'next/image'
import { ClientTestimonial } from '../../types/cms'

interface TestimonialsSectionProps {
  testimonials: ClientTestimonial[]
  title?: string
  subtitle?: string
}

export function TestimonialsSection({
  testimonials = [],
  title = 'What Our Clients Say',
  subtitle = "Real feedback from companies we've helped build better systems",
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null
  }

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

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial._id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface TestimonialCardProps {
  testimonial: ClientTestimonial
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const {
    clientName,
    clientTitle,
    companyWebsite,
    clientPhoto,
    testimonialText,
    pullQuote,
    rating,
    serviceType,
    projectDuration,
    keyResults,
  } = testimonial

  // Display pull quote if available, otherwise truncate testimonial text
  const displayText =
    pullQuote ||
    (testimonialText.length > 150
      ? `${testimonialText.substring(0, 150)}...`
      : testimonialText)

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Rating Stars */}
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-lg ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>

      {/* Testimonial Text */}
      <blockquote className="text-gray-700 mb-6 font-body leading-relaxed">
        &ldquo;{displayText}&rdquo;
      </blockquote>

      {/* Client Information */}
      <div className="flex items-center space-x-3 mb-4">
        {clientPhoto ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={clientPhoto.asset.url}
              alt={clientPhoto.alt || clientName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-nile-blue-100 flex items-center justify-center">
            <span className="text-nile-blue-600 font-semibold text-lg">
              {clientName.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <div className="font-semibold text-nile-blue-900">
            {companyWebsite ? (
              <a
                href={companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-nile-blue-700 transition-colors"
              >
                {clientName}
              </a>
            ) : (
              clientName
            )}
          </div>
          <div className="text-sm text-gray-600">{clientTitle}</div>
        </div>
      </div>

      {/* Project Details */}
      <div className="border-t border-gray-100 pt-4">
        {serviceType && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Service:
            </span>
            <span className="ml-2 text-sm text-gray-700">{serviceType}</span>
          </div>
        )}

        {projectDuration && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Duration:
            </span>
            <span className="ml-2 text-sm text-gray-700">
              {projectDuration}
            </span>
          </div>
        )}

        {keyResults && keyResults.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Key Results:
            </span>
            <ul className="mt-1 space-y-1">
              {keyResults.slice(0, 2).map((result, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 flex items-start"
                >
                  <span className="text-green-500 mr-2">✓</span>
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// Alternative minimal testimonial card for smaller spaces
export function TestimonialCardMinimal({ testimonial }: TestimonialCardProps) {
  const { clientName, clientTitle, pullQuote, testimonialText, rating } =
    testimonial

  const displayText = pullQuote || testimonialText

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-sm ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>

      <blockquote className="text-gray-700 text-sm mb-3 font-body">
        &ldquo;
        {displayText.length > 100
          ? `${displayText.substring(0, 100)}...`
          : displayText}
        &rdquo;
      </blockquote>

      <div className="text-xs">
        <div className="font-semibold text-nile-blue-900">{clientName}</div>
        <div className="text-gray-600">{clientTitle}</div>
      </div>
    </div>
  )
}
