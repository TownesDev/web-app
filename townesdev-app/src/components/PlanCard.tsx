'use client'

import React from "react";

interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  description: string;
  isPopular?: boolean;
}

export function PlanCard({
  name,
  price,
  features,
  description,
  isPopular = false,
}: PlanCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg p-6 border-2 flex flex-col ${isPopular ? "border-blue-500 relative" : "border-gray-200"}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">${price}</div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <ul className="space-y-3 mb-6 flex flex-col flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg
              className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
          </li>
        ))}
      </ul>

      <button
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isPopular
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}
