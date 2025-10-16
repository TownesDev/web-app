"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading your dashboard. Please try
            again.
          </p>
          <button
            onClick={reset}
            className="bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
