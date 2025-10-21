'use client'

interface Invoice {
  _id: string
  invoiceNumber: string
  totalAmount: number
  currency: string
  status: string
  issueDate: string
  dueDate: string
  previewUrl?: string
  client?: {
    name: string
  }
}

interface InvoiceTableProps {
  invoices: Invoice[]
  isAdmin?: boolean
}

export default function InvoiceTable({ invoices, isAdmin }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-nile-blue-400 mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No invoices yet
        </h3>
        <p className="text-gray-500">
          Your invoices will appear here once they are available.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200" role="table">
        <caption className="sr-only">
          {isAdmin ? 'All client invoices' : 'Your invoices'} - showing invoice
          number, status, amount, and preview links
        </caption>
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Invoice Number
            </th>
            {isAdmin && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Client
              </th>
            )}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total Amount
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <th
                scope="row"
                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {invoice.invoiceNumber}
              </th>
              {isAdmin && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.client?.name || 'Unknown'}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.status === 'Paid'
                      ? 'bg-green-100 text-green-800'
                      : invoice.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                  role="status"
                  aria-label={`Invoice status: ${invoice.status}`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  aria-label={`Amount: ${invoice.currency} ${invoice.totalAmount}`}
                >
                  {invoice.currency} {invoice.totalAmount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <a
                  href={
                    isAdmin
                      ? `/admin/invoice/${invoice._id}`
                      : `/app/invoice/${invoice._id}`
                  }
                  className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
                  aria-label={`View invoice ${invoice.invoiceNumber} details`}
                >
                  View Details
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
