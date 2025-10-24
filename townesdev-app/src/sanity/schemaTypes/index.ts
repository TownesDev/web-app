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
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'The price of the plan (e.g., $150/month)',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of features included in the plan',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of the plan',
      validation: (Rule) => Rule.required(),
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
    {
      name: 'stripeProductId',
      title: 'Stripe Product ID',
      type: 'string',
      description: 'Stripe product ID for this plan',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: "Stripe price ID for this plan's subscription",
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'hoursIncluded',
      title: 'Hours Included',
      type: 'number',
      description: 'Number of hours included in this retainer plan',
      validation: (Rule) => Rule.required().min(0),
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
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'stripeCustomerId',
      title: 'Stripe Customer ID',
      type: 'string',
      description: 'Stripe customer ID for billing',
      readOnly: true,
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
    {
      name: 'onboardingStatus',
      title: 'Onboarding Status',
      type: 'string',
      options: {
        list: [
          { title: 'Not Started', value: 'not_started' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Awaiting Payment', value: 'awaiting_payment' },
          { title: 'Completed', value: 'completed' },
        ],
      },
      initialValue: 'not_started',
      description:
        'Tracks the onboarding flow progress to gate access to the portal until complete',
    },
    {
      name: 'hasActiveSubscription',
      title: 'Has Active Subscription',
      type: 'boolean',
      initialValue: false,
      description:
        'Derived from Stripe webhooks; when false, portal will prompt to complete billing',
    },
    {
      name: 'botTenantId',
      title: 'Bot Platform Tenant ID',
      type: 'string',
      readOnly: true,
      description: 'Bot Platform tenant ID for Discord bot management',
    },
    {
      name: 'botApiKey',
      title: 'Bot Platform API Key',
      type: 'string',
      readOnly: true,
      hidden: true,
      description:
        'Server-only: Bot Platform API key for tenant authentication',
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
      name: 'monthDate',
      title: 'Month Date',
      type: 'datetime',
      description: 'Date for stable sorting (first day of the month)',
      hidden: true,
      initialValue: () => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      },
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
  preview: {
    select: {
      title: 'title',
      client: 'client.name',
      severity: 'severity',
      status: 'status',
      assignee: 'assignee',
      reportedAt: 'reportedAt',
    },
    prepare(selection: {
      title?: string
      client?: string
      severity?: string
      status?: string
      assignee?: string
      reportedAt?: string
    }) {
      const { title, client, severity, status, assignee, reportedAt } =
        selection
      const subtitle = client
        ? `${client} • ${severity} • ${status}`
        : `${severity} • ${status}`
      const assigneeText = assignee ? `Assigned to: ${assignee}` : 'Unassigned'

      return {
        title: title || 'Untitled Incident',
        subtitle: `${subtitle} • ${assigneeText}`,
        description: reportedAt
          ? `Reported: ${new Date(reportedAt).toLocaleDateString()}`
          : '',
      }
    },
  },
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          // Allow empty client for email incidents from unknown senders
          if (!value && context.document?.source === 'email') {
            return true
          }
          // Require client for all other incident types
          return value ? true : 'Client is required for non-email incidents'
        }),
      description:
        'The client this incident is for (optional for unknown email senders)',
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
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' },
        ],
      },
      validation: (Rule) => Rule.required(),
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
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Resolved', value: 'resolved' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'open',
      description: 'Current status of the incident',
    },
    {
      name: 'assignee',
      title: 'Assignee',
      type: 'string',
      description: 'Person assigned to handle this incident',
    },
    // Email-related fields for incidents created from inbound emails
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Manual', value: 'manual' },
          { title: 'Email', value: 'email' },
          { title: 'API', value: 'api' },
          { title: 'Bot', value: 'bot' },
        ],
      },
      initialValue: 'manual',
      description: 'How this incident was created',
    },
    {
      name: 'emailMessageId',
      title: 'Email Message ID',
      type: 'string',
      description: 'Original email message ID for tracking',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'senderEmail',
      title: 'Sender Email',
      type: 'string',
      description: 'Email address of the person who reported this incident',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'originalFrom',
      title: 'Original From',
      type: 'string',
      description: 'Original from address from the email',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'hasAttachments',
      title: 'Has Attachments',
      type: 'boolean',
      description: 'Whether the original email had attachments',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'isReply',
      title: 'Is Reply',
      type: 'boolean',
      description: 'Whether this was a reply to an existing thread',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'matchType',
      title: 'Match Type',
      type: 'string',
      options: {
        list: [
          { title: 'Exact Email', value: 'exact' },
          { title: 'Domain Match', value: 'domain' },
          { title: 'No Match', value: 'none' },
        ],
      },
      description: 'How the client was matched from the email',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'attachments',
      title: 'Attachments',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'filename',
              title: 'Filename',
              type: 'string',
            },
            {
              name: 'contentType',
              title: 'Content Type',
              type: 'string',
            },
            {
              name: 'size',
              title: 'Size (bytes)',
              type: 'number',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
            {
              name: 'isSafe',
              title: 'Is Safe',
              type: 'boolean',
            },
          ],
        },
      ],
      description: 'Email attachments information',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'metadata',
      title: 'Email Metadata',
      type: 'object',
      fields: [
        {
          name: 'attachmentCount',
          title: 'Attachment Count',
          type: 'number',
        },
        {
          name: 'attachmentSummary',
          title: 'Attachment Summary',
          type: 'object',
          fields: [
            {
              name: 'documentCount',
              title: 'Document Count',
              type: 'number',
            },
            {
              name: 'fileList',
              title: 'File List',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'hasUnsafe',
              title: 'Has Unsafe Files',
              type: 'boolean',
            },
            {
              name: 'imageCount',
              title: 'Image Count',
              type: 'number',
            },
            {
              name: 'safeCount',
              title: 'Safe File Count',
              type: 'number',
            },
            {
              name: 'totalCount',
              title: 'Total File Count',
              type: 'number',
            },
            {
              name: 'totalSize',
              title: 'Total Size',
              type: 'string',
            },
          ],
        },
      ],
      description: 'Email processing metadata',
      hidden: ({ document }) => document?.source !== 'email',
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Auto-generated tags based on email content',
      options: {
        list: [
          { title: 'Question', value: 'question' },
          { title: 'Bug Report', value: 'bug' },
          { title: 'Feature Request', value: 'feature' },
          { title: 'Urgent', value: 'urgent' },
          { title: 'Critical', value: 'critical' },
        ],
      },
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
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'subject',
      title: 'Subject Line',
      type: 'string',
      description: 'Email subject line',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'htmlBody',
      title: 'Email Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      description:
        'Rich text email content with formatting. Use placeholders like {{clientName}}, {{planName}}, {{startDate}}, {{slaStartTime}}, {{maintenanceWindow}}, {{status}} to dynamically insert client information.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'purpose',
      title: 'Purpose',
      type: 'text',
      description: 'When and why this template is used',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      description: 'When this template was created',
      readOnly: true,
    },
    {
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      description: 'When this template was last modified',
      readOnly: true,
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

// Landing Page Schemas - Enhanced for TownesDev Brand
export const serviceOffering: SchemaTypeDefinition = {
  name: 'serviceOffering',
  title: 'Service Offering',
  type: 'document',
  icon: () => '⚡',
  fields: [
    {
      name: 'title',
      title: 'Service Title',
      type: 'string',
      description: 'Name of the service (e.g., "Discord Bot Development")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'URL-friendly version of the service name',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief one-line description for cards/previews',
      validation: (Rule) => Rule.required().max(120),
    },
    {
      name: 'description',
      title: 'Detailed Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Comprehensive service description with rich content',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Service Icon',
      type: 'string',
      options: {
        list: [
          { title: '🤖 Bot/Automation', value: 'bot' },
          { title: '🌐 Web Development', value: 'web' },
          { title: '📱 Mobile Apps', value: 'mobile' },
          { title: '🛒 E-commerce', value: 'ecommerce' },
          { title: '⚙️ System Integration', value: 'integration' },
          { title: '🔧 Custom Solutions', value: 'custom' },
        ],
      },
      description: 'Icon category for visual representation',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Hero image for the service detail page',
    },
    {
      name: 'gallery',
      title: 'Service Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              title: 'Image Caption',
              type: 'string',
            },
          ],
        },
      ],
      description: 'Showcase images demonstrating the service',
      validation: (Rule) => Rule.max(8),
    },
    {
      name: 'technologies',
      title: 'Technologies & Tools',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Key technologies used in delivering this service',
      options: {
        list: [
          'TypeScript',
          'React',
          'Next.js',
          'Node.js',
          'Python',
          'Discord.js',
          'Sanity CMS',
          'Stripe',
          'Vercel',
          'AWS',
          'PostgreSQL',
          'MongoDB',
          'Tailwind CSS',
          'Figma',
          'Docker',
          'GitHub Actions',
        ],
      },
    },
    {
      name: 'keyFeatures',
      title: 'Key Features',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'feature', title: 'Feature Name', type: 'string' },
            { name: 'description', title: 'Feature Description', type: 'text' },
          ],
        },
      ],
      description: 'Main features/benefits of this service',
      validation: (Rule) => Rule.min(3).max(6),
    },
    {
      name: 'startingPrice',
      title: 'Starting Price',
      type: 'string',
      description: 'Starting price range (e.g., "From $2,500")',
    },
    {
      name: 'deliveryTimeframe',
      title: 'Delivery Timeframe',
      type: 'string',
      description: 'Typical project timeline (e.g., "4-6 weeks")',
    },
    {
      name: 'caseStudyUrl',
      title: 'Case Study URL',
      type: 'url',
      description: 'Link to detailed case study or portfolio piece',
    },
    {
      name: 'featured',
      title: 'Featured Service',
      type: 'boolean',
      description: 'Show this service prominently on homepage',
      initialValue: false,
    },
    {
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order for homepage display (lower numbers first)',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'status',
      title: 'Service Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active - Accepting New Projects', value: 'active' },
          { title: 'Limited Availability', value: 'limited' },
          { title: 'Coming Soon', value: 'coming-soon' },
          { title: 'Legacy - Maintenance Only', value: 'legacy' },
        ],
      },
      description: 'Current availability status for this service',
      initialValue: 'active',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'shortDescription',
      media: 'featuredImage',
    },
  },
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
      name: 'primaryEmail',
      title: 'Primary Email Address',
      type: 'string',
      description: 'Main business email address',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      description: 'Business phone number',
    },
    {
      name: 'businessHours',
      title: 'Business Hours',
      type: 'string',
      description:
        'When you are available for business (e.g., "Monday - Friday, 9 AM - 6 PM EST")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'responseTime',
      title: 'Response Time',
      type: 'string',
      description:
        'How quickly you typically respond (e.g., "Within 4 hours during business hours")',
    },
    {
      name: 'preferredContactMethod',
      title: 'Preferred Contact Method',
      type: 'string',
      options: {
        list: [
          { title: 'Email', value: 'email' },
          { title: 'Phone', value: 'phone' },
          { title: 'Calendar Booking', value: 'calendar' },
        ],
      },
      description: 'Your preferred way for clients to contact you',
    },
    {
      name: 'consultationCalendar',
      title: 'Consultation Calendar Link',
      type: 'url',
      description: 'Link to calendar booking system (e.g., Calendly, Acuity)',
    },
    {
      name: 'officeLocation',
      title: 'Office Location',
      type: 'string',
      description: 'Your business location or "Remote-first" description',
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'GitHub', value: 'github' },
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'Twitter', value: 'twitter' },
                  { title: 'Discord', value: 'discord' },
                  { title: 'Website', value: 'website' },
                ],
              },
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      description: 'Links to your social media profiles and websites',
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
      name: 'tagline',
      title: 'Brand Tagline',
      type: 'string',
      description: 'Brand tagline (e.g., "Code. Systems. Foundations.")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'headline',
      title: 'Main Headline',
      type: 'string',
      description: 'Primary value proposition headline',
      // Optional: remove `required` so editors can omit the main headline
      validation: (Rule) => Rule.max(100),
    },
    {
      name: 'subheadline',
      title: 'Supporting Description',
      type: 'text',
      description: 'Detailed value proposition and positioning statement',
      validation: (Rule) => Rule.required().max(300),
    },
    {
      name: 'logoLight',
      title: 'Logo (Light Mode)',
      type: 'image',
      description: 'TownesDev logo for light backgrounds',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'logoDark',
      title: 'Logo (Dark Mode)',
      type: 'image',
      description: 'TownesDev logo for dark backgrounds',
    },
    {
      name: 'backgroundGradient',
      title: 'Background Style',
      type: 'string',
      options: {
        list: [
          { title: 'Nile Blue Gradient', value: 'gradient-nile' },
          { title: 'Neutral Gradient', value: 'gradient-neutral' },
          { title: 'Brand Gradient', value: 'gradient-brand' },
          { title: 'Solid White', value: 'solid-white' },
        ],
      },
      description: 'Background styling for hero section',
      initialValue: 'gradient-nile',
    },
    {
      name: 'primaryCtaText',
      title: 'Primary CTA Text',
      type: 'string',
      description: 'Main call-to-action button text',
      validation: (Rule) => Rule.required(),
      initialValue: 'Start Your Project',
    },
    {
      name: 'primaryCtaUrl',
      title: 'Primary CTA URL',
      type: 'string',
      description: 'URL for primary call-to-action',
      validation: (Rule) => Rule.required(),
      initialValue: '/auth/signup',
    },
    {
      name: 'secondaryCtaText',
      title: 'Secondary CTA Text',
      type: 'string',
      description: 'Secondary call-to-action button text',
      initialValue: 'Client Portal',
    },
    {
      name: 'secondaryCtaUrl',
      title: 'Secondary CTA URL',
      type: 'string',
      description: 'URL for secondary call-to-action',
      initialValue: '/app',
    },
    {
      name: 'featuredMetrics',
      title: 'Featured Metrics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Metric Label', type: 'string' },
            { name: 'value', title: 'Metric Value', type: 'string' },
            { name: 'description', title: 'Description', type: 'string' },
          ],
        },
      ],
      description:
        'Key metrics to highlight (e.g., "99.9% Uptime", "50+ Projects")',
      validation: (Rule) => Rule.max(4),
    },
  ],
}

export const testimonial: SchemaTypeDefinition = {
  name: 'testimonial',
  title: 'Client Testimonial',
  type: 'document',
  icon: () => '⭐',
  fields: [
    {
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      description: 'Full name of the person providing the testimonial',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'clientTitle',
      title: 'Title & Company',
      type: 'string',
      description: 'Job title and company name (e.g., "CTO at TechCorp")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'companyWebsite',
      title: 'Company Website',
      type: 'url',
      description: 'Optional link to client company website',
    },
    {
      name: 'clientPhoto',
      title: 'Client Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Professional headshot of the client',
    },
    {
      name: 'testimonialText',
      title: 'Testimonial Content',
      type: 'text',
      description: 'The full testimonial text from the client',
      validation: (Rule) => Rule.required().min(50).max(500),
    },
    {
      name: 'pullQuote',
      title: 'Pull Quote',
      type: 'string',
      description: 'Short impactful quote for cards/previews (optional)',
      validation: (Rule) => Rule.max(150),
    },
    {
      name: 'rating',
      title: 'Star Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      description: 'Rating out of 5 stars',
    },
    {
      name: 'serviceType',
      title: 'Service Provided',
      type: 'string',
      options: {
        list: [
          'Discord Bot Development',
          'Web Application Development',
          'E-commerce Solutions',
          'Mobile App Development',
          'System Integration',
          'Custom Software Development',
          'Consulting & Strategy',
        ],
      },
      description: 'Primary service this testimonial relates to',
    },
    {
      name: 'projectDuration',
      title: 'Project Duration',
      type: 'string',
      description: 'How long the project took (e.g., "3 months", "6 weeks")',
    },
    {
      name: 'keyResults',
      title: 'Key Results Achieved',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Specific outcomes or metrics from the project',
      validation: (Rule) => Rule.max(4),
    },
    {
      name: 'featured',
      title: 'Featured Testimonial',
      type: 'boolean',
      description: 'Display prominently on homepage and key pages',
      initialValue: false,
    },
    {
      name: 'displayOrder',
      title: 'Display Priority',
      type: 'number',
      description: 'Order for displaying testimonials (lower numbers first)',
      validation: (Rule) => Rule.min(0),
    },
    {
      name: 'dateReceived',
      title: 'Date Received',
      type: 'date',
      description: 'When this testimonial was received',
    },
    {
      name: 'verified',
      title: 'Verified Testimonial',
      type: 'boolean',
      description: 'Confirmed authentic testimonial from real client',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'clientName',
      subtitle: 'clientTitle',
      media: 'clientPhoto',
      rating: 'rating',
    },
    prepare(selection) {
      const { title, subtitle, rating, media } = selection
      const stars = rating ? '⭐'.repeat(rating) : ''
      return {
        title: title || 'Anonymous',
        subtitle: `${subtitle || 'Unknown Company'} ${stars}`,
        media,
      }
    },
  },
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

export const serviceAsset: SchemaTypeDefinition = {
  name: 'serviceAsset',
  title: 'Service Asset',
  type: 'document',
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
      description: 'The client who owns this asset',
    },
    {
      name: 'type',
      title: 'Asset Type',
      type: 'string',
      options: {
        list: [
          { title: 'Discord Bot', value: 'discord_bot' },
          { title: 'Web App', value: 'web_app' },
        ],
      },
      validation: (Rule) => Rule.required(),
      description: 'Type of service asset',
    },
    {
      name: 'name',
      title: 'Asset Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Display name for the asset',
    },
    {
      name: 'externalIds',
      title: 'External IDs',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'External identifiers (bot app ID, domain, etc.)',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Inactive', value: 'inactive' },
          { title: 'Pending', value: 'pending' },
        ],
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
      description: 'Current status of the service asset',
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      description: 'Additional notes about the asset',
    },
  ],
}

export const feature: SchemaTypeDefinition = {
  name: 'feature',
  title: 'Feature',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Feature Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Display name of the feature',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'URL-friendly identifier',
    },
    {
      name: 'assetType',
      title: 'Asset Type',
      type: 'string',
      options: {
        list: [
          { title: 'Discord Bot', value: 'discord_bot' },
          { title: 'Web App', value: 'web_app' },
          { title: 'Mobile App', value: 'mobile_app' },
        ],
      },
      validation: (Rule) => Rule.required(),
      description: 'Type of asset this feature applies to',
    },
    {
      name: 'key',
      title: 'Feature Key',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description:
        "Unique key for the feature (e.g., 'welcome', 'moderation', 'xp')",
    },
    {
      name: 'summary',
      title: 'Summary',
      type: 'text',
      validation: (Rule) => Rule.required(),
      description: 'Brief description of the feature',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      description: 'Price in cents (e.g., 5000 for $50.00)',
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Unique stock keeping unit for Stripe',
    },
    {
      name: 'configKey',
      title: 'Config Key',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description:
        'Configuration key for enabling the feature (e.g., bot.commands.xp)',
    },
    {
      name: 'isPrivate',
      title: 'Private Feature',
      type: 'boolean',
      initialValue: false,
      description: 'Hide from public catalog if true',
    },
  ],
}

export const entitlement: SchemaTypeDefinition = {
  name: 'entitlement',
  title: 'Entitlement',
  type: 'document',
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
      description: 'The client who purchased this entitlement',
    },
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'serviceAsset' }],
      validation: (Rule) => Rule.required(),
      description: 'The asset this entitlement applies to',
    },
    {
      name: 'feature',
      title: 'Feature',
      type: 'reference',
      to: [{ type: 'feature' }],
      validation: (Rule) => Rule.required(),
      description: 'The feature being entitled',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Revoked', value: 'revoked' },
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
      description: 'Current status of the entitlement',
    },
    {
      name: 'activatedAt',
      title: 'Activated At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'When the entitlement was activated',
    },
    {
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
      description: 'Stripe payment intent ID for tracking',
    },
  ],
}

export const retainer: SchemaTypeDefinition = {
  name: 'retainer',
  title: 'Retainer',
  type: 'document',
  fields: [
    {
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
      description: 'The client this retainer applies to',
    },
    {
      name: 'plan',
      title: 'Plan',
      type: 'reference',
      to: [{ type: 'plan' }],
      validation: (Rule) => Rule.required(),
      description: 'The plan being retained',
    },
    {
      name: 'stripeSubId',
      title: 'Stripe Subscription ID',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Stripe subscription ID',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Canceled', value: 'canceled' },
          { title: 'Past Due', value: 'past_due' },
        ],
      },
      validation: (Rule) => Rule.required(),
      description: 'Current subscription status',
    },
    {
      name: 'periodStart',
      title: 'Period Start',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'Start of current billing period',
    },
    {
      name: 'periodEnd',
      title: 'Period End',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'End of current billing period',
    },
    {
      name: 'hoursIncluded',
      title: 'Hours Included',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      description: 'Total hours included in the retainer',
    },
    {
      name: 'hoursUsed',
      title: 'Hours Used',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
      description: 'Hours used so far in the current period',
    },
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'serviceAsset' }],
      description:
        'Optional: Specific asset this retainer applies to (leave empty for client-wide retainer)',
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
    serviceAsset,
    feature,
    entitlement,
    retainer,
    // Landing Page schemas - Enhanced for TownesDev Brand
    serviceOffering,
    aboutMe,
    contactInfo,
    heroSection,
    testimonial,
  ],
}
