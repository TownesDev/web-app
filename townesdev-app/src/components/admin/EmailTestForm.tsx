"use client";

import { useState, useEffect } from "react";
import { testEmailTemplate } from "@/lib/emailActions";
import { toast } from "sonner";
import { ptToPlainText } from "@/lib/email";

type PTBlock = {
  _type: string;
  style?: string;
  children?: { text?: string }[];
};

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlBody?: PTBlock[];
  purpose?: string;
}

interface EmailTestFormProps {
  initialTemplateName: string;
  availableTemplates: EmailTemplate[];
}

const TEMPLATE_PRESETS = {
  "Welcome Activation": {
    clientName: "John Doe",
    planName: "Gold Plan",
    startDate: "2025-01-15",
    slaStartTime: "2025-01-15T09:00:00Z",
    maintenanceWindow: "First Tuesday, 9-11 AM CT",
    status: "active"
  },
  "Retainer Proposal": {
    clientName: "Jane Smith",
    companyName: "Tech Solutions Inc.",
    retainerAmount: "$5,000",
    monthlyHours: "40",
    startDate: "2025-02-01",
    projectScope: "Full-stack web development and maintenance"
  },
  "Invoice Reminder": {
    clientName: "Bob Johnson",
    invoiceNumber: "INV-2025-001",
    amountDue: "$2,500",
    dueDate: "2025-01-30",
    services: "December 2024 retainer services"
  },
  "Project Update": {
    clientName: "Sarah Wilson",
    projectName: "E-commerce Platform",
    progressPercentage: "75%",
    nextMilestone: "Payment integration",
    completionDate: "2025-02-15",
    status: "on-track"
  },
  "Maintenance Notification": {
    clientName: "Mike Davis",
    maintenanceType: "Security updates",
    scheduledDate: "2025-01-20",
    duration: "2 hours",
    impact: "Brief service interruption",
    contactInfo: "support@townesdev.com"
  }
};

export default function EmailTestForm({
  initialTemplateName,
  availableTemplates,
}: EmailTestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateName);
  const [templateData, setTemplateData] = useState<EmailTemplate | null>(null);
  const [variables, setVariables] = useState<string>("");

  // Update variables when template changes
  useEffect(() => {
    const preset = TEMPLATE_PRESETS[selectedTemplate as keyof typeof TEMPLATE_PRESETS];
    if (preset) {
      setVariables(JSON.stringify(preset, null, 2));
    } else {
      // Default variables for unknown templates
      setVariables(JSON.stringify({
        clientName: "Test User",
        planName: "Test Plan",
        startDate: new Date().toISOString().split("T")[0],
        slaStartTime: new Date().toISOString(),
        maintenanceWindow: "First Tuesday, 9-11 AM CT"
      }, null, 2));
    }
  }, [selectedTemplate]);

  // Fetch template data when selection changes
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/email/template?name=${encodeURIComponent(selectedTemplate)}`);
        if (response.ok) {
          const data = await response.json();
          setTemplateData(data.template);
        } else {
          setTemplateData(null);
        }
      } catch (error) {
        console.error("Failed to fetch template:", error);
        setTemplateData(null);
      }
    };

    fetchTemplate();
  }, [selectedTemplate]);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const templateName = formData.get("templateName") as string;
      const to = formData.get("to") as string;
      const varsJson = formData.get("vars") as string;

      let vars: Record<string, unknown> = {};
      try {
        vars = varsJson ? JSON.parse(varsJson) : {};
      } catch {
        toast.error("Invalid JSON in variables field");
        return;
      }

      const result = await testEmailTemplate(templateName, to, vars);

      if (result.success) {
        toast.success("Email sent successfully!");
      } else {
        toast.error(`Failed to send email: ${result.message}`);
      }
    } catch (error) {
      toast.error("An error occurred while sending the email");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Test Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-4">
          Send Test Email
        </h2>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="templateName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Template Name
            </label>
            <select
              id="templateName"
              name="templateName"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 bg-white text-gray-900"
              required
            >
              {availableTemplates.map((template) => (
                <option key={template._id} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Recipient Email
            </label>
            <input
              type="email"
              id="to"
              name="to"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="test@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="vars"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Variables (JSON)
            </label>
            <textarea
              id="vars"
              name="vars"
              rows={6}
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:border-nile-blue-500 bg-white text-gray-900 placeholder-gray-500 font-mono text-sm"
              placeholder={`{
  "clientName": "John Doe",
  "planName": "Gold Plan",
  "startDate": "2025-01-15",
  "slaStartTime": "2025-01-15T09:00:00Z",
  "maintenanceWindow": "First Tuesday, 9-11 AM CT"
}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter variables as JSON. These will replace {"{{"}variableName{"}"}{" "}
              placeholders in the template.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-nile-blue-600 text-white py-2 px-4 rounded-md hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-nile-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Test Email"}
          </button>
        </form>
      </div>

      {/* Template Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-4">
          Template Preview
        </h2>

        {templateData ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Subject
              </h3>
              <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
                {templateData.subject || "No subject"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                Content
              </h3>
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border max-h-64 overflow-y-auto">
                {templateData.htmlBody && templateData.htmlBody.length > 0 ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">
                      {ptToPlainText(templateData.htmlBody)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No content in template
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Loading template &quot;{selectedTemplate}&quot;...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
