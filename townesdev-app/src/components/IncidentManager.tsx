"use client";

import { useState } from "react";
import { toast } from "sonner";
import IncidentList from "./IncidentList";
import IncidentForm from "./IncidentForm";
import ConfirmationModal from "./ConfirmationModal";

interface Incident {
  _id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description?: string;
  reportedAt: string;
  resolvedAt?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  hoursUsed?: number;
  outOfScope?: boolean;
}

interface IncidentManagerProps {
  initialIncidents: Incident[];
}

export default function IncidentManager({
  initialIncidents,
}: IncidentManagerProps) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "resolve" | "delete" | null;
    incident: { id: string; title: string } | null;
  }>({
    isOpen: false,
    type: null,
    incident: null,
  });

  const refreshIncidents = async () => {
    try {
      const response = await fetch("/api/incidents", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      }
    } catch (error) {
      console.error("Failed to refresh incidents:", error);
    }
  };

  const handleFormSuccess = () => {
    // Refresh the incidents list after successful form submission
    refreshIncidents();
  };

  const handleStatusUpdate = async (id: string, title: string) => {
    setModalState({
      isOpen: true,
      type: "resolve",
      incident: { id, title },
    });
  };

  const handleDelete = async (id: string, title: string) => {
    setModalState({
      isOpen: true,
      type: "delete",
      incident: { id, title },
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      type: null,
      incident: null,
    });
  };

  const handleModalConfirm = async () => {
    if (!modalState.incident) return;

    const { id, title } = modalState.incident;

    if (modalState.type === "resolve") {
      try {
        const response = await fetch("/api/incidents", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status: "resolved" }),
        });

        if (response.ok) {
          toast.success("Incident marked as resolved!");
          refreshIncidents();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to update incident status");
        }
      } catch (error) {
        console.error("Failed to update incident status:", error);
        toast.error("Failed to update incident status");
      }
    } else if (modalState.type === "delete") {
      try {
        const response = await fetch(`/api/incidents?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Incident deleted successfully!");
          refreshIncidents();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to delete incident");
        }
      } catch (error) {
        console.error("Failed to delete incident:", error);
        toast.error("Failed to delete incident");
      }
    }

    handleModalClose();
  };

  return (
    <div className="space-y-8">
      <IncidentForm onSuccess={handleFormSuccess} />

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-nile-blue-900 mb-4">
          Your Incidents
        </h1>
        <p className="text-gray-600 mb-6">
          Track and manage your support incidents here.
        </p>
        <IncidentList
          incidents={incidents}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={
          modalState.type === "resolve"
            ? "Mark Incident as Resolved"
            : "Delete Incident"
        }
        message={
          modalState.type === "resolve"
            ? `Are you sure you want to mark "${modalState.incident?.title}" as resolved? This will update the incident status and cannot be easily undone.`
            : `Are you sure you want to delete "${modalState.incident?.title}"? This action cannot be undone and all incident data will be lost.`
        }
        confirmText={
          modalState.type === "resolve" ? "Mark as Resolved" : "Delete"
        }
        confirmButtonClass={
          modalState.type === "resolve"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-red-600 hover:bg-red-700 text-white"
        }
      />
    </div>
  );
}
