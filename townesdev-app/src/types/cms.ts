// Enhanced TypeScript interfaces for TownesDev public website CMS content
// Aligned with enhanced Sanity schemas for brand positioning

export interface HeroContent {
  tagline: string
  headline?: string
  subheadline: string
  logoLight?: {
    asset: {
      url: string
    }
    alt?: string
  }
  logoDark?: {
    asset: {
      url: string
    }
    alt?: string
  }
  backgroundGradient:
    | 'gradient-nile'
    | 'gradient-neutral'
    | 'gradient-brand'
    | 'solid-white'
  primaryCtaText: string
  primaryCtaUrl: string
  secondaryCtaText?: string
  secondaryCtaUrl?: string
  featuredMetrics?: Array<{
    label: string
    value: string
    description: string
  }>
}

export interface ServiceOffering {
  _id: string
  title: string
  slug: {
    current: string
  }
  shortDescription: string
  description?: unknown[] // Rich text blocks
  icon: 'bot' | 'web' | 'mobile' | 'ecommerce' | 'integration' | 'custom'
  featuredImage?: {
    asset: {
      url: string
    }
    alt?: string
  }
  gallery?: Array<{
    asset: {
      url: string
    }
    caption?: string
    alt?: string
  }>
  technologies?: string[]
  keyFeatures?: Array<{
    feature: string
    description: string
  }>
  startingPrice?: string
  deliveryTimeframe?: string
  caseStudyUrl?: string
  featured: boolean
  displayOrder: number
  status: 'active' | 'limited' | 'coming-soon' | 'legacy'
}

export interface ClientTestimonial {
  _id: string
  clientName: string
  clientTitle: string
  companyWebsite?: string
  clientPhoto?: {
    asset: {
      url: string
    }
    alt?: string
  }
  testimonialText: string
  pullQuote?: string
  rating: 1 | 2 | 3 | 4 | 5
  serviceType?: string
  projectDuration?: string
  keyResults?: string[]
  featured: boolean
  dateReceived?: string
  verified: boolean
}

export interface AboutContent {
  name: string
  title: string
  bio?: unknown[] // Rich text blocks
  skills?: string[]
  experience?: Array<{
    position: string
    company: string
    startDate: string
    endDate?: string
    description: string
  }>
  education?: Array<{
    institution: string
    degree: string
    graduationDate: string
  }>
  profileImage?: {
    asset: {
      url: string
    }
    alt?: string
  }
}

export interface ContactInfo {
  _id: string
  primaryEmail: string
  phoneNumber?: string
  businessHours: string
  responseTime?: string
  preferredContactMethod?: 'email' | 'phone' | 'calendar'
  consultationCalendar?: string
  officeLocation?: string
  socialLinks?: Array<{
    platform: string
    url: string
  }>
}

// Icon mapping for service offerings
export const SERVICE_ICONS = {
  bot: '🤖',
  web: '🌐',
  mobile: '📱',
  ecommerce: '🛒',
  integration: '⚙️',
  custom: '🔧',
} as const

// Background gradient classes
export const BACKGROUND_GRADIENTS = {
  'gradient-nile': 'bg-gradient-to-br-from-nile-blue-50-to-white',
  'gradient-neutral': 'bg-gradient-to-br from-gray-50 to-white',
  'gradient-brand':
    'bg-gradient-to-br from-nile-blue-50 via-sandy-brown-50 to-white',
  'solid-white': 'bg-white',
} as const

// Service status styling
export const SERVICE_STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  limited: 'bg-yellow-100 text-yellow-800',
  'coming-soon': 'bg-blue-100 text-blue-800',
  legacy: 'bg-gray-100 text-gray-800',
} as const

// Utility type for CMS image with Sanity asset structure
export interface SanityImage {
  asset: {
    url: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  alt?: string
  caption?: string
}

// Homepage sections data structure
export interface HomepageData {
  hero: HeroContent
  featuredServices: ServiceOffering[]
  featuredTestimonials: ClientTestimonial[]
  about?: AboutContent
  contact?: ContactInfo
}

// Combined interface for full landing page content
export interface LandingPageContent {
  hero?: HeroContent
  serviceOfferings?: ServiceOffering[]
  testimonials?: ClientTestimonial[]
  about?: AboutContent
  contact?: ContactInfo
}
