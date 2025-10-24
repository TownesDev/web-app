#!/usr/bin/env node

/**
 * Sample Content Import Script for TownesDev Landing Page
 *
 * This script imports sample content into your Sanity Studio to populate
 * the enhanced landing page components.
 *
 * Usage:
 * 1. Make sure you're in the townesdev-app directory
 * 2. Run: node sample-content/import-sample-content.js
 *
 * Note: This will create sample documents in your Sanity project.
 * You can edit or delete them through the Studio interface later.
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Sanity client configuration
// Make sure your environment variables are set up correctly
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_AUTH_TOKEN, // This needs write permissions
  apiVersion: '2023-10-01',
  useCdn: false,
})

async function importSampleContent() {
  console.log(
    '🚀 Starting sample content import for TownesDev landing page...\n'
  )

  try {
    // Import Hero Section
    console.log('📝 Importing hero section content...')
    const heroData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'hero-section.json'), 'utf8')
    )
    for (const doc of heroData) {
      await client.createOrReplace(doc)
      console.log(`   ✅ Created/updated hero section: ${doc._id}`)
    }

    // Import Service Offerings
    console.log('\n🛠️  Importing service offerings...')
    const servicesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'service-offerings.json'), 'utf8')
    )
    for (const doc of servicesData) {
      await client.createOrReplace(doc)
      console.log(`   ✅ Created/updated service: ${doc.title}`)
    }

    // Import Testimonials
    console.log('\n💬 Importing client testimonials...')
    const testimonialsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'testimonials.json'), 'utf8')
    )
    for (const doc of testimonialsData) {
      await client.createOrReplace(doc)
      console.log(
        `   ✅ Created/updated testimonial: ${doc.clientName} - ${doc.companyWebsite?.replace('https://', '') || 'No website'}`
      )
    }

    // Import Contact Information
    console.log('\n📞 Importing contact information...')
    const contactData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'contact-info.json'), 'utf8')
    )
    for (const doc of contactData) {
      await client.createOrReplace(doc)
      console.log(`   ✅ Created/updated contact info: ${doc.primaryEmail}`)
    }

    console.log('\n🎉 Sample content import completed successfully!')
    console.log('\nNext steps:')
    console.log(
      '1. Visit your Sanity Studio at /studio to review the imported content'
    )
    console.log(
      '2. Refresh your localhost:3000 page to see the enhanced landing page'
    )
    console.log('3. Edit any content through the Studio interface as needed')
    console.log('\nThe landing page should now display:')
    console.log('• Hero section with TownesDev branding and metrics')
    console.log('• Service offerings showcase (6 services)')
    console.log('• Service plans (from your existing content)')
    console.log('• Client testimonials (5 testimonials)')
    console.log('• Contact section with business info')
  } catch (error) {
    console.error('❌ Error importing sample content:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Make sure SANITY_AUTH_TOKEN is set in your .env.local file')
    console.log('2. Ensure the token has write permissions')
    console.log('3. Verify NEXT_PUBLIC_SANITY_PROJECT_ID is correct')
    console.log("4. Check that you're in the correct directory (townesdev-app)")
  }
}

// Run the import function
importSampleContent()
