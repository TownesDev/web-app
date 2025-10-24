// src/sanity/lib/queries.ts
// GROQ (Graph-Relational Object Queries) used by Sanity client
// Each query is written to align with our schemaTypes definitions.

export const qSeoConfig = /* groq */ `
  *[_type == "seoConfig"][0]{
    siteTitle, metaDescription, keywords, favicon, ogImage, twitterImage,
    canonicalUrl, author, robots
  }
`

// ────────────────  PUBLIC / MARKETING - Enhanced for TownesDev Brand  ────────────────

export const qHero = /* groq */ `
  *[_type=="heroSection"][0]{
    tagline,
    headline, 
    subheadline, 
    logoLight{alt, asset->{url, metadata{lqip,dimensions}}},
    logoDark{alt, asset->{url, metadata{lqip,dimensions}}},
    backgroundGradient,
    primaryCtaText, 
    primaryCtaUrl,
    secondaryCtaText, 
    secondaryCtaUrl, 
    featuredMetrics[]{
      label,
      value,
      description
    }
  }
`

export const qServiceOfferings = /* groq */ `
  *[_type=="serviceOffering" && status == "active"]|order(displayOrder asc){
    _id, 
    title, 
    slug,
    shortDescription, 
    icon,
    featuredImage{alt, asset->{url, metadata{lqip,dimensions}}},
    keyFeatures[]{
      feature,
      description
    },
    technologies,
    startingPrice,
    deliveryTimeframe,
    featured,
    displayOrder,
    status
  }
`

export const qServiceOfferingBySlug = /* groq */ `
  *[_type=="serviceOffering" && slug.current==$slug][0]{
    title, 
    shortDescription,
    description, 
    icon,
    featuredImage{alt, asset->{url, metadata{lqip,dimensions}}},
    gallery[]{
      ..., caption,
      asset->{url, metadata{lqip,dimensions}}
    },
    technologies, 
    keyFeatures[]{
      feature,
      description
    },
    startingPrice,
    deliveryTimeframe,
    caseStudyUrl,
    status
  }
`

export const qFeaturedServices = /* groq */ `
  *[_type=="serviceOffering" && featured == true && status == "active"]|order(displayOrder asc)[0...3]{
    _id,
    title,
    shortDescription,
    icon,
    featuredImage{alt, asset->{url, metadata{lqip,dimensions}}},
    startingPrice,
    deliveryTimeframe
  }
`

export const qAbout = /* groq */ `
  *[_type=="aboutMe"][0]{
    name, 
    title, 
    bio, 
    skills, 
    experience, 
    education, 
    profileImage{alt, asset->{url, metadata{lqip,dimensions}}}
  }
`

export const qContact = /* groq */ `
  *[_type=="contactInfo" && _id == "contactInfo"][0]{
    _id,
    primaryEmail,
    phoneNumber,
    businessHours,
    responseTime,
    preferredContactMethod,
    consultationCalendar,
    officeLocation,
    socialLinks[]{
      platform,
      url
    }
  }
`

export const qTestimonials = /* groq */ `
  *[_type=="testimonial" && verified == true]|order(displayOrder asc, dateReceived desc){
    _id,
    clientName, 
    clientTitle, 
    companyWebsite,
    clientPhoto{alt, asset->{url, metadata{lqip,dimensions}}},
    testimonialText,
    pullQuote,
    rating, 
    serviceType,
    projectDuration,
    keyResults,
    featured,
    dateReceived
  }
`

export const qFeaturedTestimonials = /* groq */ `
  *[_type=="testimonial" && featured == true && verified == true]|order(displayOrder asc)[0...3]{
    _id,
    clientName,
    clientTitle,
    clientPhoto{alt, asset->{url, metadata{lqip,dimensions}}},
    pullQuote,
    testimonialText,
    rating,
    serviceType
  }
`

export const qPlans = /* groq */ `
  *[_type=="plan"]|order(_createdAt asc){
    _id, name, price, features, description, stripeProductId, stripePriceId, hoursIncluded
  }
`

export const qOperationConfig = /* groq */ `
  *[_type=="operationConfig"][0]{
    overageRate, emergencyRate, reactivationFee
  }
`

// ────────────────  CLIENT PORTAL  ────────────────

export const qClientByEmail = /* groq */ `
  *[_type=="client" && email==$email][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`

export const qClientById = /* groq */ `
  *[_type=="client" && _id==$id][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`

export const qClientByUserId = /* groq */ `
  *[_type=="client" && user._ref==$userId][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`

export const qUserById = /* groq */ `
  *[_type=="user" && _id==$id][0]{
    _id, email, name, role
  }
`

export const qMonthlyRhythmByClient = /* groq */ `
  *[_type=="monthlyRhythm" && client._ref==$clientId]
    | order(coalesce(monthDate, _createdAt) desc){
      _id, month, monthDate, hoursUsed, hoursIncluded,
      week1Patch, week2Observability, week3Hardening, week4Report
    }
`

export const qMonthlyRhythmForClientMonth = /* groq */ `
  *[_type == "monthlyRhythm" && client._ref == $clientId && month == $month][0]{
    _id, month, hoursUsed, hoursIncluded,
    week1Patch, week2Observability, week3Hardening, week4Report
  }
`

export const qIncidentsByClient = /* groq */ `
  *[_type=="incident" && client._ref==$clientId]|order(reportedAt desc){
    _id, title, severity, description, reportedAt, resolvedAt, status, hoursUsed, outOfScope
  }
`

export const qAllIncidents = /* groq */ `
  *[_type=="incident"]|order(reportedAt desc){
    _id, title, severity, description, reportedAt, resolvedAt, status, hoursUsed, outOfScope, assignee,
    client->{name}
  }
`

export const qInvoicesByClient = /* groq */ `
  *[_type=="invoice" && client._ref==$clientId]|order(issueDate desc){
    _id, invoiceNumber, totalAmount, currency, status, issueDate, dueDate, previewUrl
  }
`

export const qAssetsByClient = /* groq */ `
  *[_type=="serviceAsset" && client._ref==$clientId]|order(_createdAt desc){
    _id, name, type, externalIds, notes
  }
`

export const qFeaturesByType = /* groq */ `
  *[_type=="feature" && assetType==$assetType && isPrivate!=true]|order(name asc){
    _id, name, slug, summary, price, sku, configKey, key
  }
`

export const qEntitlementsByAsset = /* groq */ `
  *[_type=="entitlement" && asset._ref==$assetId && status=="active"]{
    _id, feature->{name, configKey}, activatedAt
  }
`

export const qOffboardingByClient = /* groq */ `
  *[_type=="offboarding" && client._ref==$clientId][0]{
    offboardingDate, finalRunbookDelivered, latestBackupDelivered,
    autopayDisabled, stabilityPassOffered
  }
`

// ────────────────  ADMIN / STAFF  ────────────────

export const qAllClients = /* groq */ `
  *[_type=="client"]|order(_createdAt desc){
    _id, name, email, status, selectedPlan->{name,price}
  }
`

export const qAllInvoices = /* groq */ `
  *[_type=="invoice"]|order(issueDate desc){
    _id, invoiceNumber, client->{name}, totalAmount, currency, status
  }
`

export const qEmailTemplates = /* groq */ `
  *[_type=="emailTemplate"]|order(name asc){
    _id, name, subject, purpose, htmlBody
  }
`

export const qOperationSettings = /* groq */ `
  *[_type=="operationConfig"][0]{overageRate, emergencyRate, reactivationFee}
`

export const qSeoSettings = qSeoConfig // alias for clarity

// Combined landing page content query
export const qLandingPageContent = /* groq */ `
{
  "hero": *[_type=="heroSection"][0]{
    tagline,
    headline, 
    subheadline, 
  logoLight{alt, asset->{url, metadata{lqip,dimensions}}},
  logoDark{alt, asset->{url, metadata{lqip,dimensions}}},
    backgroundGradient,
    primaryCtaText, 
    primaryCtaUrl,
    secondaryCtaText, 
    secondaryCtaUrl, 
    featuredMetrics[]{
      label,
      value,
      description
    }
  },
  "serviceOfferings": *[_type=="serviceOffering" && status == "active"]|order(displayOrder asc)[0...6]{
    _id, 
    title, 
    slug,
    shortDescription, 
    icon,
  featuredImage{alt, asset->{url, metadata{lqip,dimensions}}},
    keyFeatures[]{
      feature,
      description
    },
    technologies,
    startingPrice,
    deliveryTimeframe,
    featured,
    displayOrder,
    status
  },
  "testimonials": *[_type=="testimonial" && featured == true]|order(_createdAt desc)[0...3]{
    _id,
    clientName,
    clientTitle,
    companyWebsite,
  clientPhoto{alt, asset->{url, metadata{lqip,dimensions}}},
    testimonialText,
    pullQuote,
    rating,
    serviceType,
    projectDuration,
    keyResults,
    featured
  },
  "contact": *[_type=="contactInfo" && _id == "contactInfo"][0]{
    _id,
    primaryEmail,
    phoneNumber,
    businessHours,
    responseTime,
    preferredContactMethod,
    consultationCalendar,
    officeLocation,
    socialLinks[]{
      platform,
      url
    }
  },
  "about": *[_type=="aboutMe"][0]{
    _id,
    name,
    title,
    bio,
    skills,
    experience,
    education,
    profileImage{alt, asset->{url, metadata{lqip,dimensions}}}
  }
}
`
