/**
 * Email Template Queries
 * Functions for fetching email template data
 */

import { runAdminQueryNoCache } from '../lib/admin/client'
import { PTBlock } from '../lib/email'

export type EmailTemplateDoc = {
  _id: string
  name: string
  subject: string
  htmlBody: PTBlock[] // Portable Text blocks
}

const qTemplateByName = /* groq */ `
  *[_type == "emailTemplate" && name == $name][0]{
    _id, name, subject, htmlBody
  }
`

const qAllTemplates = /* groq */ `
  *[_type == "emailTemplate"]|order(name asc){
    _id, name, subject
  }
`

export async function getEmailTemplateByName(name: string) {
  // Use dynamic import for API route usage
  const { runQueryNoCache } = await import('../lib/client')
  return runQueryNoCache(qTemplateByName, { name })
}

export async function getAllEmailTemplates() {
  return runAdminQueryNoCache(qAllTemplates)
}
