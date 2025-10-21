import { getCurrentClient } from '../../../../lib/auth'
import { getInvoicesByClient } from '../../../../queries/invoices'
import InvoiceTable from '../../../../components/invoices/InvoiceTable'
import { notFound } from 'next/navigation'

export default async function InvoicesPage() {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  const invoices = await getInvoicesByClient(client._id)

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-nile-blue-900 mb-4">
            Your Invoices
          </h1>
          <p className="text-gray-600 mb-6">
            View and manage all your invoices.
          </p>
          <InvoiceTable invoices={invoices} />
        </div>
      </div>
    </div>
  )
}
