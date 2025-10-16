// app/web/townesdev-app/src/app/(portal)/app/page.tsx

import { getCurrentClient} from "../../../lib/auth";
import { getInvoicesByClient } from "../../../queries/invoices";
import InvoiceTable from "../../../components/invoices/InvoiceTable";
import { notFound } from "next/navigation";

export default async function ClientDashboard() {
  const client = await getCurrentClient();

  console.log("Fetching client data...");
  console.log("Client data:", client);

  // If no client data, show 404 page
  if (!client) {
    notFound();
  }

  const invoices = await getInvoicesByClient(client._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome, {client.name}
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Invoices
            </h2>
            <InvoiceTable invoices={invoices} />
          </div>
        </div>
      </div>
    </div>
  );
}
