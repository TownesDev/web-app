"use client";

import { useState } from "react";
import PlanModal from "./PlanModal";

interface Client {
  _id: string;
  name: string;
  email: string;
  status: string;
  startDate?: string;
  maintenanceWindow?: string;
  selectedPlan?: {
    name: string;
    price: string;
    features: string[];
    description?: string;
    content?: string;
  };
}

interface ClientInfoGridProps {
  client: Client;
}

export default function ClientInfoGrid({ client }: ClientInfoGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <PlanModal
        plan={client.selectedPlan || null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-nile-blue-500">
          <h2 className="text-lg font-semibold text-nile-blue-900 mb-2">
            Plan
          </h2>
          <p className="text-nile-blue-700 font-medium">
            {client.selectedPlan?.name || "No plan selected"}
          </p>
          <p className="text-nile-blue-600 text-sm mb-2">
            {client.selectedPlan?.price || ""}
          </p>
          {client.selectedPlan?.features && (
            <ul className="text-sm text-gray-600 mb-3">
              {client.selectedPlan.features
                .slice(0, 2)
                .map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="text-nile-blue-500 mr-1">•</span>
                    {feature}
                  </li>
                ))}
              {client.selectedPlan.features.length > 2 && (
                <li className="text-nile-blue-600 font-medium">
                  +{client.selectedPlan.features.length - 2} more
                </li>
              )}
            </ul>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-nile-blue-600 hover:text-nile-blue-800 text-sm font-medium"
          >
            View Details →
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-green-900 mb-2">Status</h2>
          <p
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              client.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {client.status}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-sandy-brown-500">
          <h2 className="text-lg font-semibold text-sandy-brown-900 mb-2">
            Maintenance Window
          </h2>
          <p className="text-sandy-brown-700">
            {client.maintenanceWindow || "Not set"}
          </p>
        </div>
      </div>
    </>
  );
}
