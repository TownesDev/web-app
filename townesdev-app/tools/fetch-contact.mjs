import dotenv from 'dotenv'
// Load both .env.local and .env for flexibility
dotenv.config({ path: '.env.local' })
dotenv.config()
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_READ_TOKEN,
  perspective: 'published',
})

const qContact = `*[_type=="contactInfo" && _id == "contactInfo"][0]{
  _id,
  primaryEmail,
  phoneNumber,
  businessHours,
  responseTime,
  preferredContactMethod,
  consultationCalendar,
  officeLocation,
  socialLinks[]{platform, url}
}`

const qList = `*[_type=="contactInfo"]{_id, primaryEmail, _updatedAt} | order(_updatedAt desc)`

try {
  const list = await client.fetch(qList)
  console.log('All contactInfo docs (newest first):', list)
  const data = await client.fetch(qContact)
  console.log('Selected ContactInfo (by id=contactInfo):', data)
} catch (err) {
  console.error('Error fetching contact:', err)
}
