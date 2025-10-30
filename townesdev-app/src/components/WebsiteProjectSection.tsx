import { runQuery } from '@/lib/client'
import Link from 'next/link'

interface WebsiteProject {
  _id: string
  siteSlug: string
  status?: string
}

export async function WebsiteProjectSection({
  clientId,
}: {
  clientId: string
}) {
  // Fetch website project by client
  const project = (await runQuery(
    `*[_type=="websiteProject" && client._ref==$clientId][0]{ _id, siteSlug, status }`,
    { clientId }
  )) as WebsiteProject | null

  // Fetch service asset for web app
  const asset = await runQuery(
    `*[_type=="serviceAsset" && client._ref==$clientId && type=="web_app"][0]{ _id, status }`,
    { clientId }
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Website Project
      </h2>
      {project ? (
        <div className="text-gray-800 space-y-2">
          <p>
            Status:{' '}
            <span className="font-medium capitalize">
              {project.status || 'unknown'}
            </span>
          </p>
          <div className="flex gap-3">
            <Link
              href={`/preview/${project.siteSlug}`}
              className="inline-flex items-center rounded-md px-3 py-2 text-white shadow-sm"
              style={{ backgroundColor: '#1E2E3E' }}
            >
              Open Preview
            </Link>
            {asset?._id ? (
              <span className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
                Asset Linked
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Asset missing (will be linked automatically)
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-700">
          <p className="mb-3">No website project found for this client.</p>
          <Link
            href="/admin/provision"
            className="inline-flex items-center rounded-md px-3 py-2 text-white shadow-sm"
            style={{ backgroundColor: '#1E2E3E' }}
          >
            Provision Website Project
          </Link>
        </div>
      )}
    </div>
  )
}
