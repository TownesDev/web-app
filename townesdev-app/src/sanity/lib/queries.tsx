// src/sanity/lib/queries.ts
// GROQ (Graph-Relational Object Queries) used by Sanity client
// Each query is written to align with our schemaTypes definitions.

export const qSeoConfig = /* groq */ `
  *[_type == "seoConfig"][0]{
    siteTitle, metaDescription, keywords, favicon, ogImage, twitterImage,
    canonicalUrl, author, robots
  }
`;

// ────────────────  PUBLIC / MARKETING  ────────────────

export const qHero = /* groq */ `
  *[_type=="heroSection"][0]{
    headline, subheadline, ctaText, ctaUrl,
    secondaryCtaText, secondaryCtaUrl, backgroundImage
  }
`;

export const qProjects = /* groq */ `
  *[_type=="project"]|order(order asc){
    _id, title, slug, description, featured, order,
    images, technologies, projectUrl, githubUrl
  }
`;

export const qProjectBySlug = /* groq */ `
  *[_type=="project" && slug.current==$slug][0]{
    title, description, content, images, technologies, projectUrl, githubUrl
  }
`;

export const qAbout = /* groq */ `
  *[_type=="aboutMe"][0]{
    name, title, bio, skills, experience, education, profileImage
  }
`;

export const qContact = /* groq */ `
  *[_type=="contactInfo"][0]{
    email, phone, location, socialLinks, availability
  }
`;

export const qTestimonials = /* groq */ `
  *[_type=="testimonial"]|order(_createdAt desc){
    clientName, clientTitle, testimonial, rating, featured, clientImage
  }
`;

export const qPlans = /* groq */ `
  *[_type=="plan"]|order(_createdAt asc){
    _id, name, price, features, description
  }
`;

export const qOperationConfig = /* groq */ `
  *[_type=="operationConfig"][0]{
    overageRate, emergencyRate, reactivationFee
  }
`;

// ────────────────  CLIENT PORTAL  ────────────────

export const qClientByEmail = /* groq */ `
  *[_type=="client" && email==$email][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`;

export const qClientById = /* groq */ `
  *[_type=="client" && _id==$id][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`;

export const qClientByUserId = /* groq */ `
  *[_type=="client" && user._ref==$userId][0]{
    _id, name, email, status,
    startDate, maintenanceWindow,
    selectedPlan->{name,price,features}
  }
`;

export const qMonthlyRhythmByClient = /* groq */ `
  *[_type=="monthlyRhythm" && client._ref==$clientId]|order(month desc){
    _id, month, hoursUsed, hoursIncluded,
    week1Patch, week2Observability, week3Hardening, week4Report
  }
`;

export const qIncidentsByClient = /* groq */ `
  *[_type=="incident" && client._ref==$clientId]|order(reportedAt desc){
    _id, title, severity, description, reportedAt, resolvedAt, hoursUsed, outOfScope
  }
`;

export const qInvoicesByClient = /* groq */ `
  *[_type=="invoice" && client._ref==$clientId]|order(issueDate desc){
    _id, invoiceNumber, totalAmount, currency, status, issueDate, dueDate, previewUrl
  }
`;

export const qOffboardingByClient = /* groq */ `
  *[_type=="offboarding" && client._ref==$clientId][0]{
    offboardingDate, finalRunbookDelivered, latestBackupDelivered,
    autopayDisabled, stabilityPassOffered
  }
`;

// ────────────────  ADMIN / STAFF  ────────────────

export const qAllClients = /* groq */ `
  *[_type=="client"]|order(_createdAt desc){
    _id, name, email, status, selectedPlan->{name,price}
  }
`;

export const qAllInvoices = /* groq */ `
  *[_type=="invoice"]|order(issueDate desc){
    _id, invoiceNumber, client->{name}, totalAmount, currency, status
  }
`;

export const qEmailTemplates = /* groq */ `
  *[_type=="emailTemplate"]|order(name asc){
    _id, name, subject, purpose
  }
`;

export const qOperationSettings = /* groq */ `
  *[_type=="operationConfig"][0]{overageRate, emergencyRate, reactivationFee}
`;

export const qSeoSettings = qSeoConfig; // alias for clarity
