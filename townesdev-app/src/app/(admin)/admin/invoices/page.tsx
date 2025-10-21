import { getAllInvoices } from '../../../../queries/invoices'
import InvoiceTable from '../../../../components/invoices/InvoiceTable'

export default async function AdminInvoicesPage() {
  const invoices = await getAllInvoices()

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-nile-blue-900 mb-4">
            All Invoices
          </h1>
          <p className="text-gray-600 mb-6">
            View and manage all client invoices.
          </p>
          <InvoiceTable invoices={invoices} isAdmin />
        </div>
      </div>
    </div>
  )
}
