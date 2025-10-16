'use client'

import { createClient } from '@sanity/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_AUTH_TOKEN!,
})

interface Invoice {
  _id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  status: string
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  notes?: string
  terms?: string
  client?: {
    name: string
    email: string
  }
}

interface InvoicePreviewProps {
  id: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

function InvoicePreviewComponent() {
  const params = useParams()
  console.log('InvoicePreviewComponent rendered with params:', params)

  // Handle the case where params.id might be an array from catch-all routes
  const tool = params.tool as string[]
  const id = tool?.[1] ? decodeURIComponent(tool[1]).split(';')[1] : undefined
  console.log('Extracted tool array:', tool)
  console.log('Extracted ID:', id)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        console.log('Fetching invoice with ID:', id)
        const result = await client.fetch<Invoice | null>(
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
            perspective: 'previewDrafts'
          }
        )
        console.log('Fetched invoice:', result)
        setInvoice(result)
      } catch (err) {
        console.error('Failed to load invoice:', err)
        setError('Failed to load invoice')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    } else {
      console.log('No ID provided')
      setIsLoading(false)
    }
  }, [id])

  if (isLoading) {
    return <div>Loading invoice...</div>
  }

  if (error) {
    return <div>Error loading invoice: {error}</div>
  }

  if (!invoice) {
    return <div>Invoice {id} not found</div>
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">INVOICE</h1>
              <p className="text-blue-100 mt-2">Invoice #{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(invoice.totalAmount, invoice.currency)}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">From</h2>
              <div className="text-gray-700">
                <p className="font-medium">TownesDev</p>
                <p>Professional Software Development</p>
                <p>support@townesdev.com</p>
              </div>
            </div>

            {/* To */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.client?.name}</p>
                <p>{invoice.client?.email}</p>
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Invoice Date</h3>
              <p className="mt-1 text-gray-900">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Due Date</h3>
              <p className="mt-1 text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Currency</h3>
              <p className="mt-1 text-gray-900">{invoice.currency}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.lineItems?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(item.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-sm text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-300 pt-2">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="border-t border-gray-200 pt-6">
              {invoice.notes && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Payment Terms</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            Thank you for your business! Payment is due within the specified terms.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePreview() {
  return <InvoicePreviewComponent />
}
