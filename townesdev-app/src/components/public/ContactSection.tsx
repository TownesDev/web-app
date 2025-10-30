import Link from 'next/link'
import { ContactInfo } from '../../types/cms'

interface ContactSectionProps {
  contactInfo?: ContactInfo
  title?: string
  subtitle?: string
  showFullForm?: boolean
}

export function ContactSection({
  contactInfo,
  title = 'Ready to Build Better Systems?',
  subtitle = "Let's discuss how we can help your team deliver more reliable software",
  showFullForm = false,
}: ContactSectionProps) {
  // Fallback contact info
  const fallbackContact: ContactInfo = {
    _id: 'fallback',
    primaryEmail: 'hello@townesdev.com',
    phoneNumber: '+1 (555) 123-4567',
    businessHours: 'Monday - Friday, 9 AM - 6 PM EST',
    responseTime: 'Within 24 hours',
    preferredContactMethod: 'email',
    consultationCalendar: 'https://calendly.com/townesdev',
    officeLocation: 'Remote-First Development Team',
  }

  const contact = contactInfo || fallbackContact

  const {
    primaryEmail,
    phoneNumber,
    businessHours,
    responseTime,
    preferredContactMethod,
    consultationCalendar,
    officeLocation,
    socialLinks,
  } = contact

  return (
    <section className="py-20 px-4 bg-nile-blue-900 text-nile-blue-100">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 font-heading text-nile-blue-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-nile-blue-100 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Primary Contact */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-nile-blue-100 font-heading">
                Get In Touch
              </h3>
              <div className="space-y-4">
                <ContactMethod
                  icon="📧"
                  label="Email"
                  value={primaryEmail}
                  href={`mailto:${primaryEmail}`}
                  isPreferred={preferredContactMethod === 'email'}
                />

                {phoneNumber && (
                  <ContactMethod
                    icon="📞"
                    label="Phone"
                    value={phoneNumber}
                    href={`tel:${phoneNumber}`}
                    isPreferred={preferredContactMethod === 'phone'}
                  />
                )}

                {consultationCalendar && (
                  <ContactMethod
                    icon="📅"
                    label="Schedule Consultation"
                    value="Book a free 30-minute call"
                    href={consultationCalendar}
                    isExternal
                    isPreferred={preferredContactMethod === 'calendar'}
                  />
                )}
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-nile-blue-100 font-heading">
                Business Hours
              </h3>
              <div className="space-y-2 text-nile-blue-200">
                <p>{businessHours}</p>
                {responseTime && (
                  <p className="text-sm">
                    <span className="text-sandy-brown-400">
                      Typical response:
                    </span>{' '}
                    {responseTime}
                  </p>
                )}
                {officeLocation && (
                  <p className="text-sm">
                    <span className="text-sandy-brown-400">Based in:</span>{' '}
                    {officeLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-nile-blue-100 font-heading">
                  Connect With Us
                </h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-nile-blue-100 hover:text-sandy-brown-600 transition-colors"
                      aria-label={social.platform}
                    >
                      <span className="text-2xl">
                        {getSocialIcon(social.platform)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form or CTA */}
          <div>
            {showFullForm ? (
              <ContactForm />
            ) : (
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-nile-blue-900 font-heading">
                  Start Your Project
                </h3>
                <p className="text-nile-blue-800 mb-6">
                  Ready to discuss your development needs? Let&rsquo;s talk
                  about how we can help your team build more reliable systems
                  and deliver better software.
                </p>

                <div className="space-y-4">
                  <Link
                    href="/contact"
                    className="block w-full bg-sandy-brown-500 hover:bg-sandy-brown-600 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200"
                  >
                    Send Us a Message
                  </Link>

                  {consultationCalendar && (
                    <a
                      href={consultationCalendar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-transparent border-2 border-nile-blue-900 text-nile-blue-900 hover:bg-nile-blue-900 hover:text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors duration-200"
                    >
                      Schedule Free Consultation
                    </a>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  No commitment required • Free initial consultation
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

interface ContactMethodProps {
  icon: string
  label: string
  value: string
  href: string
  isExternal?: boolean
  isPreferred?: boolean
}

function ContactMethod({
  icon,
  label,
  value,
  href,
  isExternal,
  isPreferred,
}: ContactMethodProps) {
  return (
    <div className="flex items-start space-x-3">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-sandy-brown-400 uppercase tracking-wide">
            {label}
          </span>
          {isPreferred && (
            <span className="text-xs bg-sandy-brown-500 text-white px-2 py-1 rounded-full">
              Preferred
            </span>
          )}
        </div>
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-nile-blue-100 hover:text-sandy-brown-600 transition-colors font-medium"
        >
          {value}
        </a>
      </div>
    </div>
  )
}

// Simple contact form component
function ContactForm() {
  return (
    <form className="bg-white rounded-lg p-8 border border-gray-200">
      <h3 className="text-xl font-semibold mb-6 text-nile-blue-900 font-heading">
        Send Us a Message
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 bg-white border border-nile-blue-300 rounded-lg text-nile-blue-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sandy-brown-400 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 bg-white border border-nile-blue-300 rounded-lg text-nile-blue-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sandy-brown-400 focus:border-transparent"
            placeholder="john@company.com"
          />
        </div>

        <div>
          <label
            htmlFor="project"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Project Type
          </label>
          <select
            id="project"
            name="project"
            className="w-full px-4 py-3 bg-white border border-nile-blue-300 rounded-lg text-nile-blue-900 focus:outline-none focus:ring-2 focus:ring-sandy-brown-400 focus:border-transparent"
          >
            <option value="">Select a service</option>
            <option value="custom-development">Custom Development</option>
            <option value="system-architecture">System Architecture</option>
            <option value="devops-automation">DevOps & Automation</option>
            <option value="api-integration">API Integration</option>
            <option value="maintenance">Maintenance & Support</option>
            <option value="consultation">Consultation Only</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Project Details
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="w-full px-4 py-3 bg-white border border-nile-blue-300 rounded-lg text-nile-blue-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sandy-brown-400 focus:border-transparent resize-none"
            placeholder="Tell us about your project requirements, timeline, and goals..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-sandy-brown-500 hover:bg-sandy-brown-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Send Message
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        We&rsquo;ll get back to you within 24 hours
      </p>
    </form>
  )
}

// Helper function for social media icons
function getSocialIcon(platform: string): string {
  const icons: Record<string, string> = {
    github: '📊',
    linkedin: '💼',
    twitter: '🐦',
    discord: '💬',
    email: '📧',
    website: '🌐',
  }
  return icons[platform.toLowerCase()] || '🔗'
}
