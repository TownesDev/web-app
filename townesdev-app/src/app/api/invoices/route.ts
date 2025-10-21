import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

// Generate invoice number
async function generateInvoiceNumber(client: any): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  // Query for the last invoice number this month
  const lastInvoice = await client.fetch(`
    *[_type == "invoice" && invoiceNumber match "INV-${year}-${month}-*"]
    | order(invoiceNumber desc)[0].invoiceNumber
  `)

  let nextNumber = 1
  if (lastInvoice) {
    // Extract the sequential number from the last invoice
    const parts = lastInvoice.split('-')
    if (parts.length === 3) {
      const lastNum = parseInt(parts[2])
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1
      }
    }
  }

  return `INV-${year}-${month}-${String(nextNumber).padStart(3, '0')}`
}

// Calculate line item amounts
function calculateLineItemAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100 // Round to 2 decimal places
}

// Calculate totals
function calculateTotals(lineItems: any[], taxRate?: number) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = taxRate
    ? Math.round(((subtotal * taxRate) / 100) * 100) / 100
    : 0
  const totalAmount = subtotal + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount,
    totalAmount: Math.round(totalAmount * 100) / 100,
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      clientId,
      lineItems,
      dueDate,
      notes,
      taxRate,
      currency = 'USD',
    } = await request.json()

    if (!clientId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: clientId and lineItems' },
        { status: 400 }
      )
    }

    // Get client data
    const clientData = await client.getDocument(clientId)
    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Process line items and calculate amounts
    const processedLineItems = lineItems.map((item: any) => ({
      ...item,
      amount: calculateLineItemAmount(item.quantity, item.unitPrice),
    }))

    // Calculate totals
    const { subtotal, taxAmount, totalAmount } = calculateTotals(
      processedLineItems,
      taxRate
    )

    // Create due date (default to 30 days from now)
    const issueDate = new Date()
    const calculatedDueDate = dueDate
      ? new Date(dueDate)
      : new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(client)

    // Create invoice in Sanity
    const invoice = await client.create({
      _type: 'invoice',
      invoiceNumber,
      client: { _type: 'reference', _ref: clientId },
      issueDate: issueDate.toISOString(),
      dueDate: calculatedDueDate.toISOString(),
      currency,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount,
      totalAmount,
      status: 'draft',
      lineItems: processedLineItems,
      notes: notes || '',
      terms:
        'Payment due within 30 days. Late payments may incur additional fees.',
      createdBy: 'System', // In production, get from authenticated user
      lastModified: issueDate.toISOString(),
    })

    console.log('✅ Invoice created successfully:', invoiceNumber)

    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      invoice: {
        _id: invoice._id,
        invoiceNumber,
        totalAmount,
        status: 'draft',
      },
    })
  } catch (error: any) {
    console.error('❌ Error creating invoice:', error)

    return NextResponse.json(
      {
        error: 'Failed to create invoice',
        message: error?.message || 'Unknown error',
        details: {
          message: error?.message,
          name: error?.name,
        },
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const preview = searchParams.get('preview') === 'true'

    if (!id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    const invoice = await client.fetch(
      `*[_type == "invoice" && _id == $id][0]{
        _id,
        invoiceNumber,
        issueDate,
        dueDate,
        currency,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        status,
        lineItems[]{
          description,
          quantity,
          unitPrice,
          amount
        },
        notes,
        terms,
        client->{
          name,
          email
        }
      }`,
      { id },
      {
        perspective: preview ? 'previewDrafts' : 'published',
      }
    )

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      invoice,
    })
  } catch (error: any) {
    console.error('❌ Error fetching invoice:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch invoice',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
