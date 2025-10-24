import { ContactSection } from '../../../components/public/ContactSection'
import { runPublicQuery } from '../../../lib/public/client'
import { qContact } from '../../../sanity/lib/queries'
import { ContactInfo } from '../../../types/cms'
import { draftMode } from 'next/headers'

async function getContactInfo(): Promise<ContactInfo | null> {
  const { isEnabled } = await draftMode()

  try {
    const contact = (await runPublicQuery(
      qContact,
      {},
      isEnabled
    )) as ContactInfo
    return contact
  } catch (error) {
    console.error('Failed to fetch contact info:', error)
    return null
  }
}

// Make contact updates propagate faster on the public site
export const revalidate = 300 // Revalidate every 5 minutes

export default async function ContactPage() {
  const contact = await getContactInfo()

  // Fallback contact info if CMS is unavailable
  const fallbackContact: ContactInfo = {
    _id: 'fallback',
    primaryEmail: 'hello@townesdev.com',
    businessHours: 'Monday - Friday, 9 AM - 6 PM EST',
    responseTime: 'Within 24 hours',
    preferredContactMethod: 'email',
    officeLocation: 'Remote-first, based in the United States',
  }

  const contactInfo = contact || fallbackContact

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <section className="py-12 px-4 bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-nile-blue-900 mb-4 font-heading">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to discuss your project? We&rsquo;d love to hear about your
              goals and explore how we can help bring your vision to life.
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-nile-blue-900 mb-6 font-heading">
                  Send Us a Message
                </h2>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Project Type *
                    </label>
                    <select
                      id="project"
                      name="project"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a service</option>
                      <option value="custom-development">
                        Custom Development
                      </option>
                      <option value="system-architecture">
                        System Architecture
                      </option>
                      <option value="devops-automation">
                        DevOps & Automation
                      </option>
                      <option value="api-integration">API Integration</option>
                      <option value="maintenance">Maintenance & Support</option>
                      <option value="consultation">Consultation Only</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Project Budget (Optional)
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-5k">Under $5,000</option>
                      <option value="5k-15k">$5,000 - $15,000</option>
                      <option value="15k-50k">$15,000 - $50,000</option>
                      <option value="50k-plus">$50,000+</option>
                      <option value="ongoing">Ongoing Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="timeline"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Timeline (Optional)
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP / Rush</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="1-3-months">1-3 months</option>
                      <option value="3-6-months">3-6 months</option>
                      <option value="6-plus-months">6+ months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Project Details *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about your project requirements, goals, current challenges, and any specific technologies or integrations you need..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-nile-blue-600 hover:bg-nile-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Send Message
                  </button>
                </form>

                <p className="text-sm text-gray-500 mt-4">
                  * Required fields. We&rsquo;ll get back to you within 24
                  hours.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-nile-blue-900 mb-4 font-heading">
                    Contact Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <a
                          href={`mailto:${contactInfo.primaryEmail}`}
                          className="text-nile-blue-600 hover:text-nile-blue-700 transition-colors"
                        >
                          {contactInfo.primaryEmail}
                        </a>
                        {contactInfo.preferredContactMethod === 'email' && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Preferred
                          </span>
                        )}
                      </div>
                    </div>

                    {contactInfo.phoneNumber && (
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">📞</span>
                        <div>
                          <div className="font-medium text-gray-900">Phone</div>
                          <a
                            href={`tel:${contactInfo.phoneNumber}`}
                            className="text-nile-blue-600 hover:text-nile-blue-700 transition-colors"
                          >
                            {contactInfo.phoneNumber}
                          </a>
                          {contactInfo.preferredContactMethod === 'phone' && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Preferred
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {contactInfo.consultationCalendar && (
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Schedule Call
                          </div>
                          <a
                            href={contactInfo.consultationCalendar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-nile-blue-600 hover:text-nile-blue-700 transition-colors"
                          >
                            Book a free consultation
                          </a>
                          {contactInfo.preferredContactMethod ===
                            'calendar' && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Preferred
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-nile-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-nile-blue-900 mb-3">
                    Business Hours
                  </h3>
                  <p className="text-nile-blue-700 mb-2">
                    {contactInfo.businessHours}
                  </p>
                  {contactInfo.responseTime && (
                    <p className="text-sm text-nile-blue-600">
                      <span className="font-medium">Response time:</span>{' '}
                      {contactInfo.responseTime}
                    </p>
                  )}
                  {contactInfo.officeLocation && (
                    <p className="text-sm text-nile-blue-600 mt-2">
                      <span className="font-medium">Location:</span>{' '}
                      {contactInfo.officeLocation}
                    </p>
                  )}
                </div>

                <div className="bg-sandy-brown-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-sandy-brown-900 mb-3">
                    What Happens Next?
                  </h3>
                  <ol className="text-sm text-sandy-brown-700 space-y-2">
                    <li className="flex items-start">
                      <span className="font-bold mr-2">1.</span>
                      We&rsquo;ll review your project details and respond within
                      24 hours
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">2.</span>
                      Schedule a free consultation to discuss your needs in
                      detail
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">3.</span>
                      Receive a custom proposal with timeline and pricing
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2">4.</span>
                      Start building your solution with our expert team
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alternative Contact Section */}
        <ContactSection
          contactInfo={contactInfo}
          title="Prefer a Different Way to Connect?"
          subtitle="Choose the method that works best for you"
          showFullForm={false}
        />
      </div>
    </>
  )
}

export async function generateMetadata() {
  return {
    title: 'Contact Us - TownesDev',
    description:
      'Get in touch with TownesDev to discuss your custom software development needs. We build reliable systems and foundations for your business.',
    openGraph: {
      title: 'Contact Us - TownesDev',
      description:
        'Ready to build better systems? Contact our development team today.',
      type: 'website',
    },
  }
}
