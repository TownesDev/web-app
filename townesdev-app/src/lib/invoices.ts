import { getStripeClient } from './stripe'
import { sanityWrite } from './client'

interface EnsureInvoiceArgs {
  clientId: string
  planName: string
  subscriptionId: string
}

function formatCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export async function ensureInvoiceForSubscription({
  clientId,
  planName,
  subscriptionId,
}: EnsureInvoiceArgs) {
  const invoices = await getStripeClient().invoices.list({
    subscription: subscriptionId,
    limit: 1,
  })

  const stripeInvoice = invoices.data[0]
  if (!stripeInvoice) {
    console.log('No Stripe invoice available for subscription:', subscriptionId)
    return null
  }

  const existingInvoice = await sanityWrite.fetch(
    `*[_type=="invoice" && stripeInvoiceId==$stripeInvoiceId][0]{ _id }`,
    { stripeInvoiceId: stripeInvoice.id }
  )

  if (existingInvoice) {
    return existingInvoice._id
  }

  const lineItems = stripeInvoice.lines.data.map((line, index) => {
    const quantity = line.quantity || 1
    const amount = (line.amount ?? 0) / 100
    const unitPrice = amount / quantity

    return {
      _key: line.id || `${stripeInvoice.id}-${index}`,
      description: line.description || `${planName} Subscription`,
      quantity,
      unitPrice: formatCurrency(unitPrice),
      amount: formatCurrency(amount),
    }
  })

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = 0
  const totalAmount =
    typeof stripeInvoice.amount_due === 'number'
      ? stripeInvoice.amount_due / 100
      : formatCurrency(subtotal + taxAmount)

  const createdAt = new Date(
    (stripeInvoice.created || Date.now() / 1000) * 1000
  )
  const dueDate = stripeInvoice.due_date
    ? new Date(stripeInvoice.due_date * 1000)
    : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)

  const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = stripeInvoice.id.slice(-6).toUpperCase()
  const invoiceNumber = `INV-${dateStr}-${suffix}`

  const invoiceDoc = {
    _type: 'invoice',
    invoiceNumber,
    client: { _type: 'reference', _ref: clientId },
    issueDate: createdAt.toISOString(),
    dueDate: dueDate.toISOString(),
    currency: (stripeInvoice.currency || 'usd').toUpperCase(),
    subtotal: formatCurrency(subtotal),
    taxRate: 0,
    taxAmount: formatCurrency(taxAmount),
    totalAmount: formatCurrency(totalAmount),
    status: stripeInvoice.status === 'paid' ? 'paid' : 'pending',
    lineItems,
    stripeInvoiceId: stripeInvoice.id,
    stripeSubscriptionId: subscriptionId,
    notes: `Payment for ${planName} subscription`,
    terms: 'Payment processed via Stripe. Subscription will auto-renew.',
    createdBy: 'Stripe Integration',
    lastModified: new Date().toISOString(),
  }

  const created = await sanityWrite.create(invoiceDoc)
  return created._id || null
}
