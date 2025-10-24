# TownesDev Landing Page Sample Content

This directory contains sample content to populate your enhanced TownesDev landing page with realistic data.

## Content Files

### `hero-section.json`

- **Purpose**: Main hero section with tagline, headlines, CTAs, and featured metrics
- **Key Features**: "Code. Systems. Foundations." branding, conversion-focused copy, business metrics
- **Schema**: `heroSection`

### `service-offerings.json`

- **Purpose**: Complete service portfolio showcasing TownesDev's capabilities
- **Services Included**:
  1. Custom Software Development ($15,000+)
  2. System Architecture & Design ($8,000+)
  3. DevOps & Automation ($5,000+)
  4. API Integration & Middleware ($3,000+)
  5. Maintenance & Support ($2,500/month)
  6. Technical Consultation ($150/hour)
- **Schema**: `serviceOffering`

### `testimonials.json`

- **Purpose**: Client testimonials with specific results and company information
- **Featured Clients**: 5 testimonials from different service types
- **Key Elements**: Star ratings, pull quotes, project results, company details
- **Schema**: `testimonial`

### `contact-info.json`

- **Purpose**: Business contact information and preferences
- **Includes**: Email, phone, business hours, calendar booking, social links
- **Schema**: `contactInfo`

## How to Import

### Option 1: Manual Import (Recommended)

1. Go to `/studio` in your browser
2. Navigate to each content type (Hero Section, Service Offering, etc.)
3. Create new documents using the sample data as reference
4. Copy/paste the content and adjust as needed

### Option 2: Programmatic Import

1. Ensure you have `SANITY_AUTH_TOKEN` with write permissions in `.env.local`
2. Run: `node sample-content/import-sample-content.js`
3. Check the console for success/error messages

## Expected Landing Page Result

After importing this content, your landing page should display:

1. **Hero Section**: TownesDev branding with business metrics and clear CTAs
2. **Service Showcase**: 6 professional service offerings with pricing and features
3. **Service Plans**: Your existing Sanity plans (unchanged)
4. **Client Testimonials**: 3 featured testimonials with specific results
5. **Contact Section**: Professional contact form and business information

## Customization

All content is designed to be easily customizable:

- **Replace placeholder metrics** with your actual business data
- **Update service pricing** based on your current rates
- **Modify testimonials** with real client feedback (when available)
- **Adjust contact information** to match your business details
- **Customize CTAs** to point to your preferred conversion paths

## Content Strategy Notes

This sample content follows TownesDev's positioning:

- **Technical Excellence**: Emphasis on clean code, architecture, and reliability
- **Business Results**: Specific metrics and outcomes in testimonials
- **Professional Approach**: Enterprise-level service descriptions and pricing
- **Trust Building**: Detailed testimonials with company information and results

Feel free to edit any content through the Sanity Studio interface to better match your specific business needs and voice.
