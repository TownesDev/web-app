interface Asset {
  _id: string;
  name: string;
  type: string;
  externalIds: string[];
  status: string;
  _createdAt: string;
}

interface Entitlement {
  _id: string;
  asset: {
    _ref: string;
  };
  feature: {
    name: string;
    key: string;
    sku: string;
  };
  status: string;
  activatedAt: string;
  stripePaymentIntentId?: string;
}

interface FeatureManagementProps {
  clientId: string;
  assets: Asset[];
  entitlements: Entitlement[];
}

export function FeatureManagement({
  assets,
  entitlements,
}: FeatureManagementProps) {
  // Group entitlements by asset
  const entitlementsByAsset = entitlements.reduce(
    (acc, entitlement) => {
      const assetId = entitlement.asset._ref;
      if (!acc[assetId]) {
        acc[assetId] = [];
      }
      acc[assetId].push(entitlement);
      return acc;
    },
    {} as Record<string, Entitlement[]>
  );

  return (
    <div className="space-y-6">
      {assets.map((asset) => {
        const assetEntitlements = entitlementsByAsset[asset._id] || [];
        const extractedGuildId = asset.externalIds
          ?.find((id) => id.startsWith("guild:"))
          ?.replace("guild:", "");

        return (
          <div
            key={asset._id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <h4 className="font-medium text-gray-900 mb-3">
              {asset.name} {extractedGuildId && `(Guild: ${extractedGuildId})`}
            </h4>

            {assetEntitlements.length === 0 ? (
              <p className="text-sm text-gray-500">
                No features enabled for this guild.
              </p>
            ) : (
              <div className="space-y-2">
                {assetEntitlements.map((entitlement) => (
                  <div
                    key={entitlement._id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {entitlement.feature.name}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({entitlement.feature.key})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          entitlement.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entitlement.status}
                      </span>
                      {entitlement.stripePaymentIntentId && (
                        <span className="text-xs text-gray-500">Paid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Feature toggling is available in the client&apos;s portal at{" "}
                <a
                  href={`/app/features?asset=${asset._id}`}
                  className="text-nile-blue-600 hover:text-nile-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /app/features?asset={asset._id}
                </a>
              </p>
            </div>
          </div>
        );
      })}

      {assets.length === 0 && (
        <p className="text-sm text-gray-500">
          No Discord guilds registered. Register a guild above to manage
          features.
        </p>
      )}
    </div>
  );
}
