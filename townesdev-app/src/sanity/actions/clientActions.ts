import { DocumentActionComponent } from 'sanity'
import { sendEmail } from '../plugins/emailSender'
import { createClient } from '@sanity/client'

export const previewInvoice: DocumentActionComponent = (props) => {
  const { draft, published } = props

  const doc = draft || published
  if (!doc || doc._type !== 'invoice') {
    return null
  }

  const handlePreview = () => {
    const baseUrl = window.location.origin.replace('/admin', '')
    const previewUrl = `${baseUrl}/app/invoice/${doc._id}`
    window.open(previewUrl, '_blank')
  }

  return {
    label: 'Preview Invoice',
    onHandle: handlePreview,
    tone: 'primary',
  }
}

export const sendStatusUpdateEmail: DocumentActionComponent = (props) => {
  const { draft, published } = props

  const doc = draft || published
  if (!doc || doc._type !== 'invoice') {
    return null
  }

  const handleSendEmail = async () => {
    try {
      // Get client data using Sanity client
      const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
        apiVersion: '2024-01-01',
        useCdn: false,
        token: process.env.NEXT_PUBLIC_SANITY_AUTH_TOKEN!,
      })
      const clientDoc = await client.getDocument((doc as any).client._ref)

      if (!clientDoc?.email) {
        alert('No email address found for this client')
        return
      }

      const invoiceDoc = doc as any
      const emailTemplate = {
        name: 'Invoice Status Update',
        subject: `Invoice ${invoiceDoc.invoiceNumber} Status Update`,
        body: `Dear {{clientName}},

Your invoice ${invoiceDoc.invoiceNumber} status has been updated to: ${String(invoiceDoc.status || '').toUpperCase()}

Invoice Details:
- Invoice Number: ${invoiceDoc.invoiceNumber}
- Amount: ${invoiceDoc.currency} ${Number(invoiceDoc.totalAmount || 0).toFixed(2)}
- Due Date: ${invoiceDoc.dueDate ? new Date(String(invoiceDoc.dueDate)).toLocaleDateString() : 'Not set'}
- Status: ${String(invoiceDoc.status || '').toUpperCase()}

You can view your invoice at: ${invoiceDoc.previewUrl || 'Link will be provided'}

Thank you for your business!

Best regards,
TownesDev Team`
      }

      const clientInfo = {
        name: clientDoc.name || 'Valued Client',
        email: clientDoc.email
      }

      await sendEmail(emailTemplate, clientInfo, clientDoc.email)
      alert(`Status update email sent to ${clientDoc.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email. Check console for details.')
    }
  }

  return {
    label: 'Send Status Update Email',
    onHandle: handleSendEmail,
    tone: 'positive',
  }
}

export const activateClient: DocumentActionComponent = (props) => {
  const { draft, published, onComplete } = props

  // Only show action if document is not published or status is not Active
  if (published?.status === 'Active') {
    return null
  }

  const handleActivate = async () => {
    try {
      // Here we would create the related documents
      // For now, we'll just show the action button
      alert('Client activation would create kickoff checklist and monthly rhythm documents')
      onComplete()
    } catch (error) {
      console.error('Error activating client:', error)
    }
  }

  return {
    label: 'Activate Client',
    onHandle: handleActivate,
    tone: 'positive',
  }
}