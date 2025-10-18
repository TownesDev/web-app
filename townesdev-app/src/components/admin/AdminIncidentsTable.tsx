"use client";

/**
 * Admin Incidents Table Component
 * Displays incidents with Client | Title | Severity | Status | Assignee columns
 * Includes severity and status filtering functionality
 * Supports inline editing of assignee field
 */

import { useState, useMemo } from "react";

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

interface AdminIncidentsTableProps {
  incidents: Incident[];
}

type SeverityFilter = "all" | "low" | "medium" | "high" | "critical";
type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";

export default function AdminIncidentsTable({
  incidents,
}: AdminIncidentsTableProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingAssignee, setEditingAssignee] = useState<string | null>(null);
  const [assigneeValue, setAssigneeValue] = useState("");

  // Filter incidents based on severity and status
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const severityMatch =
        severityFilter === "all" || incident.severity === severityFilter;
      const statusMatch =
        statusFilter === "all" || incident.status === statusFilter;
      return severityMatch && statusMatch;
    });
  }, [incidents, severityFilter, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-nile-blue-100 text-nile-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditAssignee = (incidentId: string, currentAssignee?: string) => {
    setEditingAssignee(incidentId);
    setAssigneeValue(currentAssignee || "");
  };

  const handleSaveAssignee = async () => {
    if (!editingAssignee) return;

    try {
      const response = await fetch(`/api/admin/incidents/${editingAssignee}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignee: assigneeValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assignee");
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating assignee:", error);
      alert("Failed to update assignee. Please try again.");
    } finally {
      setEditingAssignee(null);
      setAssigneeValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignee(null);
    setAssigneeValue("");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="severity-filter"
            className="text-sm font-medium text-gray-700"
          >
            Severity:
          </label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value as SeverityFilter)
            }
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-nile-blue-500 focus:outline-none focus:ring-1 focus:ring-nile-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-700"
          >
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-nile-blue-500 focus:outline-none focus:ring-1 focus:ring-nile-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <span className="text-sm text-gray-500">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resolved
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No incidents found
                </td>
              </tr>
            ) : (
              filteredIncidents.map((incident) => (
                <tr key={incident._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {incident.client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {incident.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}
                    >
                      {incident.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(incident.reportedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(incident.resolvedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAssignee === incident._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={assigneeValue}
                          onChange={(e) => setAssigneeValue(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-nile-blue-500 focus:outline-none focus:ring-1 focus:ring-nile-blue-500"
                          placeholder="Enter assignee name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveAssignee();
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveAssignee}
                          className="text-nile-blue-600 hover:text-nile-blue-900 text-sm font-medium"
                          aria-label="Save assignee"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        className="text-sm text-gray-900 cursor-pointer hover:text-nile-blue-600"
                        onClick={() =>
                          handleEditAssignee(incident._id, incident.assignee)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleEditAssignee(incident._id, incident.assignee);
                          }
                        }}
                        aria-label={`Edit assignee for ${incident.title}`}
                      >
                        {incident.assignee || "—"}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
