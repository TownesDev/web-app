"use client";

import { useState } from "react";

interface Client {
  _id: string;
  name: string;
  email: string;
  status: string;
  botTenantId?: string;
  botApiKey?: string;
  selectedPlan?: {
    name: string;
  };
}

interface TenantProvisioningProps {
  clientId: string;
  client: Client;
}

export function TenantProvisioning({
  clientId,
  client,
}: TenantProvisioningProps) {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProvisionTenant = async () => {
    setIsProvisioning(true);
    setError(null);

    try {
      const response = await fetch("/api/bot/tenants/provision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to provision tenant");
      }

      // Refresh the page to show updated client data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProvisioning(false);
    }
  };

  if (client.botTenantId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">
            Bot Platform Tenant Active
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">
            <strong>Tenant ID:</strong> {client.botTenantId}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <strong>API Key:</strong>{" "}
            {client.botApiKey ? "••••••••" : "Not available"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-sm font-medium text-yellow-700">
          Bot Platform Not Configured
        </span>
      </div>

      <p className="text-sm text-gray-600">
        This client needs a bot platform tenant to manage Discord bots.
        Provisioning will create a tenant account and API credentials.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleProvisionTenant}
        disabled={isProvisioning}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 disabled:bg-nile-blue-400 disabled:cursor-not-allowed"
      >
        {isProvisioning ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Provisioning...
          </>
        ) : (
          "Provision Bot Tenant"
        )}
      </button>
    </div>
  );
}
