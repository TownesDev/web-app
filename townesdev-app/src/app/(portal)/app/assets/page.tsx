import { getCurrentClient } from "@/lib/auth";
import { runQuery } from "@/lib/client";
import { qAssetsByClient } from "@/sanity/lib/queries";
import Link from "next/link";

export default async function AssetsPage() {
  const client = await getCurrentClient();

  if (!client) {
    return <div>Access denied</div>;
  }

  const assets = await runQuery(qAssetsByClient, { clientId: client._id });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Assets</h1>
        <p className="text-gray-600 mt-2">
          Manage your Discord bots and web applications
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No assets found.</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact support to add your first asset.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset: any) => (
            <div
              key={asset._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {asset.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {asset.type.replace("_", " ")}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Active
                </span>
              </div>

              {asset.externalIds && asset.externalIds.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    External IDs:
                  </p>
                  <ul className="mt-1 text-sm text-gray-600">
                    {asset.externalIds.map((id: string, index: number) => (
                      <li key={index} className="truncate">
                        • {id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {asset.notes && (
                <p className="mt-4 text-sm text-gray-600">{asset.notes}</p>
              )}

              <div className="mt-6">
                <Link
                  href={`/app/features?asset=${asset._id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Features
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
