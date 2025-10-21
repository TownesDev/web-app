import { type SchemaTypeDefinition } from 'sanity'

export const plan: SchemaTypeDefinition = {
  name: 'plan',
  title: 'Plan',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Plan Name',
      type: 'string',
      description: 'The name of the plan (e.g., Bronze, Silver, Gold)',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'The price of the plan (e.g., $150/month)',
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of features included in the plan',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the plan',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'text',
      description: 'The full markdown content of the plan',
    },
    {
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload the plan file (e.g., .md)',
    },
  ],
}

export const operationConfig: SchemaTypeDefinition = {
  name: 'operationConfig',
  title: 'Operation Configuration',
  type: 'document',
  fields: [
    {
      name: 'overageRate',
      title: 'Overage Rate',
      type: 'string',
      description: 'Overage rate (e.g., $90/hour (business hours))',
    },
    {
      name: 'emergencyRate',
      title: 'Emergency Rate',
      type: 'string',
      description: 'Emergency rate (e.g., $140/hour (nights/weekends))',
    },
    {
      name: 'reactivationFee',
      title: 'Reactivation Fee',
      type: 'string',
      description: 'Reactivation fee for immediate SLA (e.g., $150)',
    },
  ],
}

export const user: SchemaTypeDefinition = {
  name: 'user',
  title: 'User',
  type: 'document',
  icon: () => '👤',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
      description: 'User email address (unique identifier)',
    },
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: "User's full name",
    },
    {
      name: 'password',
      title: 'Password Hash',
      type: 'string',
      hidden: true,
      description: 'Hashed password (not visible in studio)',
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Admin', value: 'admin' },
          { title: 'Client', value: 'client' },
          { title: 'User', value: 'user' },
        ],
      },
      initialValue: 'user',
      description: 'User role for access control',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
      description: 'Account creation timestamp',
    },
    {
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime',
      readOnly: true,
      description: 'Last login timestamp',
    },
    {
      name: 'isActive',
      title: 'Active Account',
      type: 'boolean',
      initialValue: true,
      description: 'Whether the account is active',
    },
  ],
}

export const client: SchemaTypeDefinition = {
  name: 'client',
  title: 'Client',
  type: 'document',
  icon: () => '👥',
  fields: [
    {
      name: 'name',
      title: 'Client Name',
      type: 'string',
      description: 'Name of the client',
    },
    {
      name: 'user',
      title: 'Associated User',
      type: 'reference',
      to: [{ type: 'user' }],
      description: 'Link this client to a registered user account',
    },
    {
      name: 'selectedPlan',
      title: 'Selected Plan',
      type: 'reference',
      to: [{ type: 'plan' }],
      description: 'The plan selected by the client',
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'When the retainer starts',
    },
    {
      name: 'slaStartTime',
      title: 'SLA Start Time',
      type: 'datetime',
      description: 'When SLA coverage begins',
    },
    {
      name: 'maintenanceWindow',
      title: 'Maintenance Window',
      type: 'string',
      description:
        'Monthly maintenance window (e.g., first Tuesday, 9:00–11:00 AM CT)',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      description: 'Client email address for communications',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['Active', 'Inactive', 'Cancelled'],
      },
      description: 'Current status of the client retainer',
    },
  ],
}

export const kickoffChecklist: SchemaTypeDefinition = {
  name: 'kickoffChecklist',
  title: 'Kickoff Checklist',
  type: 'document',
  preview: {
    select: {
      title: 'client.name',
      subtitle: '_createdAt',
      client: 'client',
    },
    prepare(selection: {
      title?: string
      subtitle?: string
      client?: { name?: string }
    }) {
      const { title, subtitle, client } = selection
      return {
        title: title ? `Kickoff: ${title}` : 'Kickoff Checklist',
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : '',
        description: client?.name || '',
      }
    },
  },
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      description: 'The client this checklist is for',
    },
    {
      name: 'accessConfirmed',
      title: 'Access Confirmed',
      type: 'boolean',
      description:
        'Repo, hosting, monitoring, error logs, Discord application portal access confirmed',
    },
    {
      name: 'baselineSnapshot',
      title: 'Baseline Snapshot',
      type: 'text',
      description:
        'Code tag, database backup, environment variables, and secrets',
    },
    {
      name: 'maintenanceWindow',
      title: 'Maintenance Window',
      type: 'string',
      description: 'Defined monthly maintenance window',
    },
    {
      name: 'uptimeMonitoring',
      title: 'Uptime Monitoring',
      type: 'boolean',
      description: 'Uptime monitoring set up (Silver/Gold only)',
    },
    {
      name: 'runbook',
      title: 'Runbook',
      type: 'text',
      description:
        'Deploy steps, rollback steps, secret rotation, incident severity levels',
    },
    {
      name: 'contactTree',
      title: 'Contact Tree',
      type: 'text',
      description: 'Primary and alternate contacts, communications policy',
    },
    {
      name: 'statusTemplate',
      title: 'Status Template',
      type: 'text',
      description:
        'Monthly Change Log, Incidents, Next Patch Targets, Time Used vs Included Hours',
    },
  ],
}

export const monthlyRhythm: SchemaTypeDefinition = {
  name: 'monthlyRhythm',
  title: 'Monthly Rhythm',
  type: 'document',
  preview: {
    select: {
      title: 'client.name',
      subtitle: 'month',
      client: 'client',
    },
    prepare(selection: {
      title?: string
      subtitle?: string
      client?: { name?: string }
    }) {
      const { title, subtitle, client } = selection
      return {
        title: title ? `${subtitle}: ${title}` : `Monthly Rhythm - ${subtitle}`,
        subtitle: 'Monthly maintenance cycle',
        description: client?.name || '',
      }
    },
  },
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      description: 'The client this monthly rhythm is for',
    },
    {
      name: 'month',
      title: 'Month',
      type: 'string',
      description: 'The month this rhythm covers (e.g., January 2024)',
    },
    {
      name: 'week1Patch',
      title: 'Week 1 - Patch and Review',
      type: 'text',
      description:
        'Dependencies updated, API deprecations reviewed, smoke tests, deployment',
    },
    {
      name: 'week2Observability',
      title: 'Week 2 - Observability',
      type: 'text',
      description: 'Logs and alerts reviewed, thresholds tuned, tokens rotated',
    },
    {
      name: 'week3Hardening',
      title: 'Week 3 - Hardening',
      type: 'text',
      description:
        'Small findings addressed (lint, types, deprecations) within included hours',
    },
    {
      name: 'week4Report',
      title: 'Week 4 - Report',
      type: 'text',
      description:
        'Monthly report covering changes, uptime, risks, and recommendations',
    },
    {
      name: 'hoursUsed',
      title: 'Hours Used',
      type: 'number',
      description: 'Total hours used this month',
    },
    {
      name: 'hoursIncluded',
      title: 'Hours Included',
      type: 'number',
      description: 'Hours included in the plan',
    },
  ],
}

export const incident: SchemaTypeDefinition = {
  name: 'incident',
  title: 'Incident',
  type: 'document',
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      description: 'The client this incident is for',
    },
    {
      name: 'title',
      title: 'Incident Title',
      type: 'string',
      description: 'Brief title of the incident',
    },
    {
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: ['P1', 'P2', 'P3'],
      },
      description: 'Incident severity level',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Detailed description of the incident',
    },
    {
      name: 'reportedAt',
      title: 'Reported At',
      type: 'datetime',
      description: 'When the incident was reported',
    },
    {
      name: 'resolvedAt',
      title: 'Resolved At',
      type: 'datetime',
      description: 'When the incident was resolved',
    },
    {
      name: 'workflow',
      title: 'Workflow',
      type: 'text',
      description:
        'Triage -> reproduce -> hotfix or rollback -> verification -> post-mortem',
    },
    {
      name: 'hoursUsed',
      title: 'Hours Used',
      type: 'number',
      description: 'Hours spent resolving this incident',
    },
    {
      name: 'outOfScope',
      title: 'Out of Scope',
      type: 'boolean',
      description: 'Whether this was determined to be out of scope',
    },
  ],
}

export const offboarding: SchemaTypeDefinition = {
  name: 'offboarding',
  title: 'Offboarding',
  type: 'document',
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      description: 'The client being offboarded',
    },
    {
      name: 'offboardingDate',
      title: 'Offboarding Date',
      type: 'datetime',
      description: 'When the offboarding process started',
    },
    {
      name: 'autopayDisabled',
      title: 'Autopay Disabled',
      type: 'boolean',
      description: 'Whether autopay has been disabled',
    },
    {
      name: 'finalRunbookDelivered',
      title: 'Final Runbook Delivered',
      type: 'boolean',
      description: 'Whether the final runbook was delivered',
    },
    {
      name: 'latestBackupDelivered',
      title: 'Latest Backup Delivered',
      type: 'boolean',
      description: 'Whether the latest backup was delivered',
    },
    {
      name: 'currentEnvironmentNotes',
      title: 'Current Environment Notes',
      type: 'text',
      description: 'Current environment notes delivered',
    },
    {
      name: 'accessTokensRemoved',
      title: 'Access Tokens Removed',
      type: 'boolean',
      description: 'Whether TownesDev access tokens and secrets were removed',
    },
    {
      name: 'stabilityPassOffered',
      title: 'Stability Pass Offered',
      type: 'boolean',
      description: 'Whether a fixed-fee stability pass was offered before exit',
    },
  ],
}

export const emailTemplate: SchemaTypeDefinition = {
  name: 'emailTemplate',
  title: 'Email Template',
  type: 'document',
  icon: () => '📧',
  fields: [
    {
      name: 'name',
      title: 'Template Name',
      type: 'string',
      description:
        'Name of the email template (e.g., Retainer Proposal, Welcome Activation)',
    },
    {
      name: 'subject',
      title: 'Subject Line',
      type: 'string',
      description: 'Email subject line',
    },
    {
      name: 'body',
      title: 'Email Body (Text)',
      type: 'text',
      rows: 10,
      description:
        'The plain text email content. Use placeholders like {{clientName}}, {{planName}}, {{startDate}}, {{slaStartTime}}, {{maintenanceWindow}}, {{status}} to dynamically insert client information.',
    },
    {
      name: 'htmlBody',
      title: 'Email Body (HTML)',
      type: 'array',
      of: [{ type: 'block' }],
      description:
        'Optional rich text HTML version of the email. If provided, this will be sent as HTML email. Use placeholders like {{clientName}} in the text.',
    },
    {
      name: 'purpose',
      title: 'Purpose',
      type: 'text',
      description: 'When and why this template is used',
    },
  ],
}

export const seoConfig: SchemaTypeDefinition = {
  name: 'seoConfig',
  title: 'SEO Configuration',
  type: 'document',
  fields: [
    {
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'The main title of your website',
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'A brief description of your website for search engines',
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords for SEO',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'The favicon for your website',
    },
    {
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social media sharing',
    },
    {
      name: 'twitterImage',
      title: 'Twitter Card Image',
      type: 'image',
      description: 'Image for Twitter sharing',
    },
    {
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'The canonical URL of your website',
    },
    {
      name: 'author',
      title: 'Author',
      type: 'string',
      description: 'Author of the website',
    },
    {
      name: 'robots',
      title: 'Robots Meta',
      type: 'string',
      description: 'Robots meta tag (e.g., index, follow)',
    },
  ],
}

// Landing Page Schemas
export const project: SchemaTypeDefinition = {
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: () => '📁',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      description: 'The title of the project',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL-friendly version of the title',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of the project',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Detailed project content',
    },
    {
      name: 'images',
      title: 'Project Images',
      type: 'array',
      of: [{ type: 'image' }],
      description: 'Images showcasing the project',
    },
    {
      name: 'technologies',
      title: 'Technologies Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Technologies and tools used in this project',
    },
    {
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
      description: 'Link to live project or demo',
    },
    {
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
      description: 'Link to GitHub repository',
    },
    {
      name: 'featured',
      title: 'Featured Project',
      type: 'boolean',
      description: 'Whether this is a featured project on the homepage',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which projects should be displayed',
    },
  ],
}

export const aboutMe: SchemaTypeDefinition = {
  name: 'aboutMe',
  title: 'About Me',
  type: 'document',
  icon: () => '👤',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Your full name',
    },
    {
      name: 'title',
      title: 'Professional Title',
      type: 'string',
      description: 'Your professional title (e.g., Full Stack Developer)',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Your professional bio and background',
    },
    {
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
      description: 'Your professional headshot',
    },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Your technical skills and expertise',
    },
    {
      name: 'experience',
      title: 'Experience',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'company', title: 'Company', type: 'string' },
            { name: 'position', title: 'Position', type: 'string' },
            { name: 'startDate', title: 'Start Date', type: 'date' },
            { name: 'endDate', title: 'End Date', type: 'date' },
            { name: 'description', title: 'Description', type: 'text' },
          ],
        },
      ],
      description: 'Your work experience',
    },
    {
      name: 'education',
      title: 'Education',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'institution', title: 'Institution', type: 'string' },
            { name: 'degree', title: 'Degree', type: 'string' },
            { name: 'graduationDate', title: 'Graduation Date', type: 'date' },
          ],
        },
      ],
      description: 'Your educational background',
    },
  ],
}

export const contactInfo: SchemaTypeDefinition = {
  name: 'contactInfo',
  title: 'Contact Information',
  type: 'document',
  icon: () => '📧',
  fields: [
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: 'Your contact email address',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Your phone number',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Your current location',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', title: 'Platform', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'icon', title: 'Icon', type: 'string' },
          ],
        },
      ],
      description: 'Your social media profiles',
    },
    {
      name: 'availability',
      title: 'Availability Status',
      type: 'string',
      options: {
        list: ['Available', 'Busy', 'Not Available'],
      },
      description: 'Your current availability for new projects',
    },
  ],
}

export const heroSection: SchemaTypeDefinition = {
  name: 'heroSection',
  title: 'Hero Section',
  type: 'document',
  icon: () => '🎯',
  fields: [
    {
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Main headline for the hero section',
    },
    {
      name: 'subheadline',
      title: 'Subheadline',
      type: 'string',
      description: 'Supporting text under the headline',
    },
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      description: 'Background image for the hero section',
    },
    {
      name: 'ctaText',
      title: 'Call to Action Text',
      type: 'string',
      description: 'Text for the main call-to-action button',
    },
    {
      name: 'ctaUrl',
      title: 'Call to Action URL',
      type: 'string',
      description: 'URL for the call-to-action button',
    },
    {
      name: 'secondaryCtaText',
      title: 'Secondary CTA Text',
      type: 'string',
      description: 'Text for secondary call-to-action',
    },
    {
      name: 'secondaryCtaUrl',
      title: 'Secondary CTA URL',
      type: 'string',
      description: 'URL for secondary call-to-action',
    },
  ],
}

export const testimonial: SchemaTypeDefinition = {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: () => '📝',
  fields: [
    {
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      description: 'Name of the person giving the testimonial',
    },
    {
      name: 'clientTitle',
      title: 'Client Title/Company',
      type: 'string',
      description: "Client's job title or company name",
    },
    {
      name: 'clientImage',
      title: 'Client Image',
      type: 'image',
      description: 'Photo of the client',
    },
    {
      name: 'testimonial',
      title: 'Testimonial Text',
      type: 'text',
      description: 'The testimonial content',
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      description: 'Rating out of 5 stars',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Whether to feature this testimonial prominently',
    },
  ],
}

export const invoice: SchemaTypeDefinition = {
  name: 'invoice',
  title: 'Invoice',
  type: 'document',
  icon: () => '💰',
  preview: {
    select: {
      title: 'invoiceNumber',
      subtitle: 'client.name',
      totalAmount: 'totalAmount',
      currency: 'currency',
      status: 'status',
    },
    prepare(selection: {
      title?: string
      subtitle?: string
      totalAmount?: number
      currency?: string
      status?: string
    }) {
      const { title, subtitle, totalAmount, currency, status } = selection
      return {
        title: title || 'Invoice',
        subtitle: `${subtitle} - ${status}`,
        description: `${currency} ${totalAmount?.toFixed(2) || '0.00'}`,
      }
    },
  },
  fields: [
    // Invoice Identification
    {
      name: 'invoiceNumber',
      title: 'Invoice Number',
      type: 'string',
      readOnly: true,
      description: 'Auto-generated unique invoice identifier',
    },
    {
      name: 'previewUrl',
      title: 'Preview URL',
      type: 'url',
      readOnly: true,
      description: 'URL to view the invoice in browser',
    },
    {
      name: 'stripeInvoiceId',
      title: 'Stripe Invoice ID',
      type: 'string',
      readOnly: true,
      description: 'Corresponding Stripe invoice identifier',
    },

    // Client Information
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
      description: 'Client being invoiced',
    },

    // Invoice Details
    {
      name: 'issueDate',
      title: 'Issue Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'Date the invoice was created',
      initialValue: () => new Date().toISOString(),
    },
    {
      name: 'dueDate',
      title: 'Due Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'Payment due date',
      initialValue: () => {
        // Default to 30 days from now
        const now = new Date()
        now.setDate(now.getDate() + 30)
        return now.toISOString()
      },
    },

    // Financial Information
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: ['USD', 'EUR', 'GBP'],
        layout: 'radio',
      },
      initialValue: 'USD',
      description: 'Invoice currency',
    },
    {
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      readOnly: true,
      description: 'Pre-tax total of all line items',
    },
    {
      name: 'taxRate',
      title: 'Tax Rate (%)',
      type: 'number',
      description: 'Tax rate as percentage (e.g., 8.25 for 8.25%)',
    },
    {
      name: 'taxAmount',
      title: 'Tax Amount',
      type: 'number',
      readOnly: true,
      description: 'Calculated tax amount',
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      readOnly: true,
      description: 'Final amount including tax',
    },

    // Status and Payment
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Sent', value: 'sent' },
          { title: 'Viewed', value: 'viewed' },
          { title: 'Paid', value: 'paid' },
          { title: 'Overdue', value: 'overdue' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'draft',
      description: 'Current invoice status',
    },
    {
      name: 'paymentDate',
      title: 'Payment Date',
      type: 'date',
      readOnly: true,
      description: 'Date payment was received',
    },
    {
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      readOnly: true,
      description: 'Payment method used (from Stripe)',
    },

    // Line Items
    {
      name: 'lineItems',
      title: 'Line Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'description',
              title: 'Description',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule) => Rule.required().min(0.01),
            },
            {
              name: 'unitPrice',
              title: 'Unit Price',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'amount',
              title: 'Amount',
              type: 'number',
              readOnly: true,
              description: 'Calculated: quantity × unitPrice',
            },
            {
              name: 'reference',
              title: 'Reference',
              type: 'reference',
              to: [
                { type: 'incident' },
                { type: 'monthlyRhythm' },
                { type: 'offboarding' },
              ],
              description: 'Related business entity',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
      description: 'Individual invoice line items',
    },

    // Additional Information
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional notes or terms',
    },
    {
      name: 'terms',
      title: 'Payment Terms',
      type: 'text',
      description: 'Payment terms and conditions',
    },

    // Metadata
    {
      name: 'createdBy',
      title: 'Created By',
      type: 'string',
      readOnly: true,
      description: 'User who created the invoice',
    },
    {
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      readOnly: true,
    },
  ],
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    user,
    seoConfig,
    operationConfig,
    plan,
    client,
    kickoffChecklist,
    monthlyRhythm,
    incident,
    offboarding,
    emailTemplate,
    invoice,
    // Landing Page schemas
    project,
    aboutMe,
    contactInfo,
    heroSection,
    testimonial,
  ],
}
