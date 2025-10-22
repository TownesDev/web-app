"use client";

import { useState } from "react";

interface ReportGeneratorProps {
  clients: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

export function ReportGenerator({ clients }: ReportGeneratorProps) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate month options (current and previous months)
  const getMonthOptions = () => {
    const now = new Date();
    const months = [];
    
    // Current month
    months.push({
      value: `${getMonthName(now.getMonth())} ${now.getFullYear()}`,
      label: `${getMonthName(now.getMonth())} ${now.getFullYear()} (Current)`
    });
    
    // Previous month
    const prev = new Date(now);
    prev.setMonth(prev.getMonth() - 1);
    months.push({
      value: `${getMonthName(prev.getMonth())} ${prev.getFullYear()}`,
      label: `${getMonthName(prev.getMonth())} ${prev.getFullYear()}`
    });
    
    // 2 months ago
    const prev2 = new Date(now);
    prev2.setMonth(prev2.getMonth() - 2);
    months.push({
      value: `${getMonthName(prev2.getMonth())} ${prev2.getFullYear()}`,
      label: `${getMonthName(prev2.getMonth())} ${prev2.getFullYear()}`
    });

    return months;
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  const handleGenerateReport = async () => {
    if (!selectedClientId || !selectedMonth) {
      setError("Please select both a client and month");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/reports/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: selectedClientId,
          month: selectedMonth
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `Report_${selectedMonth.replace(' ', '_')}.pdf`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const monthOptions = getMonthOptions();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Generate Monthly Report
      </h2>
      
      <div className="space-y-4">
        {/* Client Selection */}
        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            id="client"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a client...</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name} ({client.email})
              </option>
            ))}
          </select>
        </div>

        {/* Month Selection */}
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
            Select Month
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a month...</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || !selectedClientId || !selectedMonth}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </span>
          ) : (
            'Generate PDF Report'
          )}
        </button>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Report Contents</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Monthly rhythm activities and hours</li>
            <li>• Incidents reported and resolved</li>
            <li>• Invoice and billing information</li>
            <li>• Executive summary with key metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}