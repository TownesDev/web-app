import { definePlugin } from 'sanity'
import { sendEmail } from './emailSender'

export const clientAutomation = definePlugin({
  name: 'client-automation',
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'client') {
        return [
          ...prev,
          (props: any) => ({
            label: 'Activate Client & Create Documents',
            onHandle: async () => {
              try {
                // Get client data first
                const clientData = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(props.id)
                const clientName = clientData?.name || 'Unknown Client'
                const sanitizedName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')

                // Create kickoff checklist
                await context.getClient({ apiVersion: '2024-01-01' }).create({
                  _type: 'kickoffChecklist',
                  _id: `kickoff-${sanitizedName}`,
                  client: { _type: 'reference', _ref: props.id },
                  accessConfirmed: false,
                  baselineSnapshot: '',
                  uptimeMonitoring: false,
                  runbook: '',
                  contactTree: '',
                  statusTemplate: '',
                })

                // Create initial monthly rhythm
                const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
                const sanitizedMonth = currentMonth.toLowerCase().replace(/[^a-z0-9]/g, '-')
                await context.getClient({ apiVersion: '2024-01-01' }).create({
                  _type: 'monthlyRhythm',
                  _id: `monthly-${sanitizedName}-${sanitizedMonth}`,
                  client: { _type: 'reference', _ref: props.id },
                  month: currentMonth,
                  week1Patch: '',
                  week2Observability: '',
                  week3Hardening: '',
                  week4Report: '',
                  hoursUsed: 0,
                  hoursIncluded: 0,
                })

                // Update client status to Active
                await context.getClient({ apiVersion: '2024-01-01' }).patch(props.id).set({ status: 'Active' }).commit()

                // Send welcome email
                try {
                  const emailTemplates = await context.getClient({ apiVersion: '2024-01-01' }).fetch('*[_type == "emailTemplate" && name == "Welcome Activation"][0]')
                  if (emailTemplates && clientData) {
                    const clientEmail = clientData.email || 'client@example.com' // You'll need to add email field to client schema
                    await sendEmail(
                      { subject: emailTemplates.subject, body: emailTemplates.body },
                      {
                        name: clientName,
                        selectedPlan: clientData.selectedPlan,
                        startDate: clientData.startDate,
                        slaStartTime: clientData.slaStartTime,
                        maintenanceWindow: clientData.maintenanceWindow,
                        status: 'Active'
                      },
                      clientEmail
                    )
                  }
                } catch (emailError) {
                  console.error('Error sending welcome email:', emailError)
                  // Don't fail the entire process if email fails
                }

                props.onComplete()
              } catch (error) {
                console.error('Error creating documents:', error)
                alert('Error creating documents. Check console for details.')
              }
            },
            tone: 'positive',
          }),
          (props: any) => ({
            label: 'View Kickoff Checklist',
            onHandle: async () => {
              const clientData = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(props.id)
              const clientName = clientData?.name || 'Unknown Client'
              const sanitizedName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              const kickoffId = `kickoff-${sanitizedName}`
              window.open(`/admin/intent/edit/id=${kickoffId};type=kickoffChecklist/`, '_blank')
            },
            tone: 'primary',
            disabled: props.published?.status !== 'Active',
          }),
          (props: any) => ({
            label: 'View Monthly Rhythm',
            onHandle: async () => {
              const clientData = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(props.id)
              const clientName = clientData?.name || 'Unknown Client'
              const sanitizedName = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
              const sanitizedMonth = currentMonth.toLowerCase().replace(/[^a-z0-9]/g, '-')
              const monthlyId = `monthly-${sanitizedName}-${sanitizedMonth}`
              window.open(`/admin/intent/edit/id=${monthlyId};type=monthlyRhythm/`, '_blank')
            },
            tone: 'primary',
            disabled: props.published?.status !== 'Active',
          }),
          (props: any) => ({
            label: 'Create Invoice',
            onHandle: async () => {
              try {
                const clientData = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(props.id)
                const clientName = clientData?.name || 'Unknown Client'

                // Check if dark mode is active
                const isDarkMode = document.documentElement.classList.contains('dark') ||
                                  document.body.classList.contains('dark') ||
                                  window.matchMedia('(prefers-color-scheme: dark)').matches

                // Create invoice creation modal
                const modal = document.createElement('div')
                modal.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: ${isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10000;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `

                const modalContent = document.createElement('div')
                modalContent.style.cssText = `
                  background: ${isDarkMode ? '#1f2937' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                  padding: 24px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px ${isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'};
                  min-width: 450px;
                  max-width: 550px;
                  border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
                `

                const title = document.createElement('h3')
                title.textContent = 'Create Invoice'
                title.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; font-weight: 600;'

                // Add Sanity Studio icon
                const sanityIcon = document.createElement('span')
                sanityIcon.innerHTML = '💰'
                sanityIcon.style.cssText = 'margin-right: 8px; font-size: 20px; vertical-align: middle;'
                title.insertBefore(sanityIcon, title.firstChild)

                // Invoice Type Selection
                const typeLabel = document.createElement('label')
                typeLabel.textContent = 'Invoice Type:'
                typeLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                const typeSelect = document.createElement('select')
                typeSelect.style.cssText = `
                  width: 100%;
                  padding: 8px 12px;
                  border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                  border-radius: 4px;
                  margin-bottom: 16px;
                  font-size: 14px;
                  background: ${isDarkMode ? '#374151' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                `

                const typeOptions = [
                  { value: 'retainer', text: 'Retainer Invoice (Monthly Plan)' },
                  { value: 'incident', text: 'Incident Invoice (Service Work)' },
                  { value: 'custom', text: 'Custom Invoice (Manual Entry)' }
                ]

                typeOptions.forEach(option => {
                  const optionEl = document.createElement('option')
                  optionEl.value = option.value
                  optionEl.textContent = option.text
                  typeSelect.appendChild(optionEl)
                })

                // Dynamic form fields container
                const formContainer = document.createElement('div')
                formContainer.id = 'invoice-form-container'

                // Update form based on type selection
                const updateForm = () => {
                  formContainer.innerHTML = ''

                  if (typeSelect.value === 'retainer') {
                    // Retainer invoice - auto-populate from plan
                    const planInfo = document.createElement('div')
                    planInfo.style.cssText = `
                      padding: 12px;
                      background: ${isDarkMode ? '#374151' : '#f8fafc'};
                      border: 1px solid ${isDarkMode ? '#4b5563' : '#e2e8f0'};
                      border-radius: 4px;
                      margin-bottom: 16px;
                      font-size: 14px;
                    `
                    planInfo.textContent = 'This will create an invoice based on the client\'s selected plan.'
                    formContainer.appendChild(planInfo)

                  } else if (typeSelect.value === 'incident') {
                    // Incident invoice - select incident
                    const incidentLabel = document.createElement('label')
                    incidentLabel.textContent = 'Select Incident:'
                    incidentLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                    const incidentSelect = document.createElement('select')
                    incidentSelect.style.cssText = `
                      width: 100%;
                      padding: 8px 12px;
                      border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                      border-radius: 4px;
                      margin-bottom: 16px;
                      font-size: 14px;
                      background: ${isDarkMode ? '#374151' : 'white'};
                      color: ${isDarkMode ? '#f9fafb' : '#111827'};
                    `

                    const defaultOption = document.createElement('option')
                    defaultOption.value = ''
                    defaultOption.textContent = 'Select an incident...'
                    incidentSelect.appendChild(defaultOption)

                    formContainer.appendChild(incidentLabel)
                    formContainer.appendChild(incidentSelect)

                  } else if (typeSelect.value === 'custom') {
                    // Custom invoice - manual entry
                    const descLabel = document.createElement('label')
                    descLabel.textContent = 'Description:'
                    descLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                    const descInput = document.createElement('input')
                    descInput.type = 'text'
                    descInput.placeholder = 'Service description'
                    descInput.style.cssText = `
                      width: 100%;
                      padding: 8px 12px;
                      border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                      border-radius: 4px;
                      margin-bottom: 12px;
                      font-size: 14px;
                      background: ${isDarkMode ? '#374151' : 'white'};
                      color: ${isDarkMode ? '#f9fafb' : '#111827'};
                    `

                    const qtyLabel = document.createElement('label')
                    qtyLabel.textContent = 'Quantity:'
                    qtyLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                    const qtyInput = document.createElement('input')
                    qtyInput.type = 'number'
                    qtyInput.value = '1'
                    qtyInput.min = '0.01'
                    qtyInput.step = '0.01'
                    qtyInput.style.cssText = `
                      width: 100%;
                      padding: 8px 12px;
                      border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                      border-radius: 4px;
                      margin-bottom: 12px;
                      font-size: 14px;
                      background: ${isDarkMode ? '#374151' : 'white'};
                      color: ${isDarkMode ? '#f9fafb' : '#111827'};
                    `

                    const priceLabel = document.createElement('label')
                    priceLabel.textContent = 'Unit Price ($):'
                    priceLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                    const priceInput = document.createElement('input')
                    priceInput.type = 'number'
                    priceInput.min = '0'
                    priceInput.step = '0.01'
                    priceInput.placeholder = '0.00'
                    priceInput.style.cssText = `
                      width: 100%;
                      padding: 8px 12px;
                      border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                      border-radius: 4px;
                      margin-bottom: 16px;
                      font-size: 14px;
                      background: ${isDarkMode ? '#374151' : 'white'};
                      color: ${isDarkMode ? '#f9fafb' : '#111827'};
                    `

                    formContainer.appendChild(descLabel)
                    formContainer.appendChild(descInput)
                    formContainer.appendChild(qtyLabel)
                    formContainer.appendChild(qtyInput)
                    formContainer.appendChild(priceLabel)
                    formContainer.appendChild(priceInput)
                  }
                }

                typeSelect.addEventListener('change', updateForm)
                updateForm() // Initialize form

                const buttonContainer = document.createElement('div')
                buttonContainer.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;'

                const cancelButton = document.createElement('button')
                cancelButton.textContent = 'Cancel'
                cancelButton.style.cssText = `
                  padding: 8px 16px;
                  border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                  background: ${isDarkMode ? '#374151' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                `
                cancelButton.onclick = () => document.body.removeChild(modal)

                const createButton = document.createElement('button')
                createButton.textContent = 'Create Invoice'
                createButton.style.cssText = `
                  padding: 8px 16px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                `
                createButton.onclick = async () => {
                  let lineItems: any[] = []

                  if (typeSelect.value === 'retainer') {
                    // Retainer invoice
                    const planData = clientData?.selectedPlan
                    if (!planData) {
                      alert('Client has no selected plan. Please assign a plan first.')
                      return
                    }

                    // Get plan details
                    const planDetails = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(planData._ref)
                    if (!planDetails) {
                      alert('Plan details not found.')
                      return
                    }

                    lineItems = [{
                      description: `Monthly Retainer - ${planDetails.name}`,
                      quantity: 1,
                      unitPrice: parseFloat(planDetails.price.replace('$', '').replace('/month', '')),
                      reference: null
                    }]

                  } else if (typeSelect.value === 'incident') {
                    alert('Incident invoice generation coming soon!')
                    return

                  } else if (typeSelect.value === 'custom') {
                    // Get form values
                    const descInput = formContainer.querySelector('input[type="text"]') as HTMLInputElement
                    const qtyInput = formContainer.querySelector('input[type="number"]:nth-of-type(1)') as HTMLInputElement
                    const priceInput = formContainer.querySelector('input[type="number"]:nth-of-type(2)') as HTMLInputElement

                    const description = descInput?.value?.trim()
                    const quantity = parseFloat(qtyInput?.value || '0')
                    const unitPrice = parseFloat(priceInput?.value || '0')

                    if (!description || !unitPrice || quantity <= 0) {
                      alert('Please fill in all required fields with valid values.')
                      return
                    }

                    lineItems = [{
                      description,
                      quantity,
                      unitPrice,
                      reference: null
                    }]
                  }

                  try {
                    document.body.removeChild(modal)

                    // Generate invoice via API
                    const response = await fetch('/api/invoices', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        clientId: props.id,
                        lineItems,
                        currency: 'USD',
                        taxRate: 0, // Default no tax
                        notes: `Invoice for ${clientName}`
                      }),
                    })

                    const result = await response.json()

                    if (!response.ok) {
                      throw new Error(result.error || 'Failed to create invoice')
                    }

                    alert(`Invoice created successfully!\nInvoice Number: ${result.invoice.invoiceNumber}\nTotal: $${result.invoice.totalAmount}`)

                    // Open the invoice in Sanity
                    window.open(`/admin/intent/edit/id=${result.invoice._id};type=invoice/`, '_blank')

                  } catch (error) {
                    console.error('Error creating invoice:', error)
                    alert('Error creating invoice. Check console for details.')
                  }
                }

                buttonContainer.appendChild(cancelButton)
                buttonContainer.appendChild(createButton)

                modalContent.appendChild(title)
                modalContent.appendChild(typeLabel)
                modalContent.appendChild(typeSelect)
                modalContent.appendChild(formContainer)
                modalContent.appendChild(buttonContainer)

                modal.appendChild(modalContent)
                document.body.appendChild(modal)

                // Focus on type select
                typeSelect.focus()

              } catch (error) {
                console.error('Error opening invoice creation modal:', error)
                alert('Error opening invoice creation modal. Check console for details.')
              }
            },
            tone: 'primary',
          }),
          (props: any) => ({
            label: 'Send Email Template',
            onHandle: async () => {
              try {
                const clientData = await context.getClient({ apiVersion: '2024-01-01' }).getDocument(props.id)
                const clientName = clientData?.name || 'Unknown Client'

                // Get all email templates
                const emailTemplates = await context.getClient({ apiVersion: '2024-01-01' }).fetch('*[_type == "emailTemplate"]')

                if (emailTemplates.length === 0) {
                  alert('No email templates found. Please create an email template first.')
                  return
                }

                // Check if dark mode is active
                const isDarkMode = document.documentElement.classList.contains('dark') ||
                                  document.body.classList.contains('dark') ||
                                  window.matchMedia('(prefers-color-scheme: dark)').matches

                // Create a custom modal with dropdown selection
                const modal = document.createElement('div')
                modal.style.cssText = `
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: ${isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 10000;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `

                const modalContent = document.createElement('div')
                modalContent.style.cssText = `
                  background: ${isDarkMode ? '#1f2937' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                  padding: 24px;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px ${isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'};
                  min-width: 400px;
                  max-width: 500px;
                  border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};
                `

                const title = document.createElement('h3')
                title.textContent = 'Send Email Template'
                title.style.cssText = 'margin: 0 0 16px 0; font-size: 18px; font-weight: 600;'

                // Add Sanity Studio icon to modal
                const sanityIcon = document.createElement('span')
                sanityIcon.innerHTML = '🎨' // You can replace this with any icon or emoji
                sanityIcon.style.cssText = 'margin-right: 8px; font-size: 20px; vertical-align: middle;'
                title.insertBefore(sanityIcon, title.firstChild)

                const label = document.createElement('label')
                label.textContent = 'Select Email Template:'
                label.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                const select = document.createElement('select')
                select.style.cssText = `
                  width: 100%;
                  padding: 8px 12px;
                  border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                  border-radius: 4px;
                  margin-bottom: 16px;
                  font-size: 14px;
                  background: ${isDarkMode ? '#374151' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                `

                // Add template options
                emailTemplates.forEach((template: any) => {
                  const option = document.createElement('option')
                  option.value = template._id
                  option.textContent = template.name
                  select.appendChild(option)
                })

                const emailLabel = document.createElement('label')
                emailLabel.textContent = 'Recipient Email:'
                emailLabel.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 500;'

                const emailInput = document.createElement('input')
                emailInput.type = 'email'
                emailInput.value = clientData?.email || ''
                emailInput.placeholder = 'client@example.com'
                emailInput.style.cssText = `
                  width: 100%;
                  padding: 8px 12px;
                  border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                  border-radius: 4px;
                  margin-bottom: 20px;
                  font-size: 14px;
                  background: ${isDarkMode ? '#374151' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                `

                const buttonContainer = document.createElement('div')
                buttonContainer.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end;'

                const cancelButton = document.createElement('button')
                cancelButton.textContent = 'Cancel'
                cancelButton.style.cssText = `
                  padding: 8px 16px;
                  border: 1px solid ${isDarkMode ? '#4b5563' : '#ccc'};
                  background: ${isDarkMode ? '#374151' : 'white'};
                  color: ${isDarkMode ? '#f9fafb' : '#111827'};
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                `
                cancelButton.onclick = () => document.body.removeChild(modal)

                const sendButton = document.createElement('button')
                sendButton.textContent = 'Send Email'
                sendButton.style.cssText = `
                  padding: 8px 16px;
                  background: #007bff;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 500;
                `
                sendButton.onclick = async () => {
                  const selectedTemplateId = select.value
                  const recipientEmail = emailInput.value.trim()

                  if (!selectedTemplateId || !recipientEmail) {
                    alert('Please select a template and enter an email address.')
                    return
                  }

                  const selectedTemplate = emailTemplates.find((t: any) => t._id === selectedTemplateId)
                  if (!selectedTemplate) {
                    alert('Selected template not found.')
                    return
                  }

                  try {
                    document.body.removeChild(modal)

                    await sendEmail(
                      {
                        name: selectedTemplate.name,
                        subject: selectedTemplate.subject,
                        body: selectedTemplate.body,
                        htmlBody: selectedTemplate.htmlBody
                      },
                      {
                        name: clientName,
                        selectedPlan: clientData?.selectedPlan,
                        startDate: clientData?.startDate,
                        slaStartTime: clientData?.slaStartTime,
                        maintenanceWindow: clientData?.maintenanceWindow,
                        status: clientData?.status
                      },
                      recipientEmail
                    )

                    alert('Email sent successfully!')
                  } catch (error) {
                    console.error('Error sending email:', error)
                    alert('Error sending email. Check console for details.')
                  }
                }

                buttonContainer.appendChild(cancelButton)
                buttonContainer.appendChild(sendButton)

                modalContent.appendChild(title)
                modalContent.appendChild(label)
                modalContent.appendChild(select)
                modalContent.appendChild(emailLabel)
                modalContent.appendChild(emailInput)
                modalContent.appendChild(buttonContainer)

                modal.appendChild(modalContent)
                document.body.appendChild(modal)

                // Focus on select
                select.focus()
              } catch (error) {
                console.error('Error opening email dialog:', error)
                alert('Error opening email dialog. Check console for details.')
              }
            },
            tone: 'primary',
          }),
        ]
      }
      return prev
    },
  },
})