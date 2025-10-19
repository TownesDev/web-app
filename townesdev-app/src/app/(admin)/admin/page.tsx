/**
 * Admin Home Page
 * Displays overview dashboard with clients and incidents for staff users
 */

import { requireCapability } from "@/lib/rbac/guards";
import { getAllClients } from "@/queries/clients";
import { getAllIncidents } from "@/queries/incidents";
import { getRecentMonthlyRhythms } from "@/queries/monthlyRhythm";
import AdminClientsTable from "@/components/admin/AdminClientsTable";
import Link from "next/link";
import { AlertTriangle, Users, TrendingUp, Clock, Calendar } from "lucide-react";

interface Client {
  _id: string;
  name: string;
  email: string;
  status: string;
  selectedPlan?: {
    name: string;
    price: string;
  };
}

interface Incident {
  _id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  reportedAt?: string;
  resolvedAt?: string;
  assignee?: string;
  client: {
    name: string;
  };
}

interface MonthlyRhythm {
  _id: string;
  month: string;
  hoursUsed?: number;
  hoursIncluded?: number;
  _updatedAt?: string;
  client: {
    name: string;
  };
}

export default async function AdminPage() {
  // Require clients:read capability (staff/admin only)
  await requireCapability("clients:read");

  // Fetch all clients and incidents
  const [clients, incidents] = await Promise.all([
    getAllClients() as Promise<Client[]>,
    getAllIncidents() as Promise<Incident[]>,
  ]);

  // Fetch recent monthly rhythms
  const recentRhythms = await getRecentMonthlyRhythms(5) as MonthlyRhythm[];

  // Calculate quick stats
  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;
  const openIncidents = incidents.filter(
    (incident) => incident.status === "open"
  ).length;
  const inProgressIncidents = incidents.filter(
    (incident) => incident.status === "in_progress"
  ).length;
  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  // Calculate monthly rhythm stats
  const totalRhythmEntries = recentRhythms.length;
  const activeRhythmsThisMonth = recentRhythms.filter((rhythm) => {
    const rhythmMonth = rhythm.month.toLowerCase();
    const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).toLowerCase();
    return rhythmMonth === currentMonth;
  }).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-nile-blue-700">
          Monitor system activity and manage clients and incidents
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-nile-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-nile-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Clients
              </p>
              <p className="text-2xl font-bold text-nile-blue-900">
                {activeClients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Open Incidents
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {openIncidents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">
                {inProgressIncidents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Critical Issues
              </p>
              <p className="text-2xl font-bold text-red-900">
                {criticalIncidents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Rhythms
              </p>
              <p className="text-2xl font-bold text-green-900">
                {activeRhythmsThisMonth}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
              Recent Incidents
            </h2>
            <p className="text-sm text-gray-600">
              Latest incident reports across all clients
            </p>
          </div>
          <Link
            href="/admin/incidents"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
          >
            View All Incidents
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No incidents
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No incident reports have been filed yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => (
              <div
                key={incident._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      incident.severity === "critical"
                        ? "bg-red-500"
                        : incident.severity === "high"
                          ? "bg-orange-500"
                          : incident.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {incident.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {incident.client.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      incident.status === "open"
                        ? "bg-blue-100 text-blue-800"
                        : incident.status === "in_progress"
                          ? "bg-nile-blue-100 text-nile-blue-800"
                          : incident.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {incident.status.replace("_", " ")}
                  </span>
                  <span className="text-sm text-gray-500">
                    {incident.reportedAt
                      ? new Date(incident.reportedAt).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Monthly Rhythms */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
              Recent Monthly Rhythms
            </h2>
            <p className="text-sm text-gray-600">
              Latest monthly maintenance updates across all clients
            </p>
          </div>
          <Link
            href="/admin/clients"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
          >
            Manage Rhythms
          </Link>
        </div>

        {recentRhythms.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No rhythm entries yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Monthly rhythm entries will appear here once created.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRhythms.map((rhythm) => (
              <div
                key={rhythm._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-nile-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-nile-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rhythm.month}
                    </p>
                    <p className="text-sm text-gray-500">
                      {rhythm.client.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {rhythm.hoursUsed || 0} / {rhythm.hoursIncluded || 0} hours
                    </p>
                    <p className="text-xs text-gray-500">
                      {rhythm._updatedAt
                        ? new Date(rhythm._updatedAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <Link
                    href={`/admin/clients/${rhythm.client._id}/rhythm`}
                    className="text-nile-blue-600 hover:text-nile-blue-900 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clients Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
              Clients
            </h2>
            <p className="text-sm text-gray-600">
              View and manage all client accounts
            </p>
          </div>
          <Link
            href="/admin/clients"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
          >
            Manage Clients
          </Link>
        </div>

        <AdminClientsTable clients={clients} />
      </div>
    </div>
  );
}
