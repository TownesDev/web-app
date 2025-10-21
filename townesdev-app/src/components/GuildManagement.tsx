'use client'

import { useState } from 'react'

interface Client {
  _id: string
  name: string
  email: string
  status: string
  botTenantId?: string
  botApiKey?: string
  selectedPlan?: {
    name: string
  }
}

interface Asset {
  _id: string
  name: string
  type: string
  externalIds: string[]
  status: string
  _createdAt: string
}

interface GuildManagementProps {
  clientId: string
  client: Client
  assets: Asset[]
}

export function GuildManagement({ clientId, assets }: GuildManagementProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [guildId, setGuildId] = useState('')
  const [guildName, setGuildName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRegisterGuild = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRegistering(true)
    setError(null)

    try {
      const response = await fetch(`/api/bot/assets/${guildId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          guildName: guildName.trim() || `Guild ${guildId}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register guild')
      }

      // Refresh the page to show updated assets
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleSyncGuild = async (guildId: string) => {
    try {
      const response = await fetch(`/api/bot/sync/${guildId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync guild')
      }

      // Could show a success message here
      alert('Guild synced successfully')
    } catch (err) {
      alert(
        `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Guilds */}
      {assets.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Registered Guilds
          </h3>
          <div className="space-y-3">
            {assets.map((asset) => {
              const extractedGuildId = asset.externalIds
                ?.find((id) => id.startsWith('guild:'))
                ?.replace('guild:', '')

              return (
                <div
                  key={asset._id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{asset.name}</h4>
                    <p className="text-sm text-gray-600">
                      Guild ID: {extractedGuildId}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {asset.status}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        extractedGuildId && handleSyncGuild(extractedGuildId)
                      }
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Sync
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Register New Guild */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Register New Guild
        </h3>

        <form onSubmit={handleRegisterGuild} className="space-y-4">
          <div>
            <label
              htmlFor="guildId"
              className="block text-sm font-medium text-gray-700"
            >
              Discord Guild ID
            </label>
            <input
              type="text"
              id="guildId"
              value={guildId}
              onChange={(e) => setGuildId(e.target.value)}
              placeholder="123456789012345678"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-nile-blue-500 focus:border-nile-blue-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              You can find the Guild ID by enabling Developer Mode in Discord
              and right-clicking on the server name.
            </p>
          </div>

          <div>
            <label
              htmlFor="guildName"
              className="block text-sm font-medium text-gray-700"
            >
              Guild Name (Optional)
            </label>
            <input
              type="text"
              id="guildName"
              value={guildName}
              onChange={(e) => setGuildName(e.target.value)}
              placeholder="My Awesome Server"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-nile-blue-500 focus:border-nile-blue-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isRegistering}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 disabled:bg-nile-blue-400 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
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
                Registering...
              </>
            ) : (
              'Register Guild'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
