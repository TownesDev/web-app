import { runQuery } from '@/lib/client'
import { qAllClients } from '@/sanity/lib/queries'
import AdminProvisionForm from './AdminProvisionForm'

async function getData() {
  const clients = await runQuery(qAllClients)
  return { clients }
}

export default async function AdminProvisionPage() {
  const { clients } = await getData()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Provision Client Projects
      </h1>
      <p className="mt-2 text-gray-700">
        Create a website/discord project for an existing client.
      </p>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm max-w-2xl">
        <AdminProvisionForm
          clients={
            clients as Array<{ _id: string; name?: string; email?: string }>
          }
        />
      </div>
    </div>
  )
}
