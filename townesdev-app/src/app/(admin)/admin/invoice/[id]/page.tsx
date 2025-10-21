import { notFound } from 'next/navigation'

interface AdminInvoicePageProps {
  params: Promise<{ id: string }>
}

async function getInvoice(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoices?id=${id}`,
    {
      cache: 'no-store', // Ensure fresh data
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error('Failed to fetch invoice')
  }

  const data = await response.json()

  return data.invoice
}

export default async function AdminInvoicePage({
  params,
}: AdminInvoicePageProps) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-nile-blue-900 mb-4">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-600 mb-6">
            Invoice details for {invoice.client?.name || 'Client'}
          </p>

          <div className="border-t pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Invoice Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {invoice.invoiceNumber}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Total Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {invoice.currency} {invoice.totalAmount}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Issue Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {invoice.client?.name || 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
