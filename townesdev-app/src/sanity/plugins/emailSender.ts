import { definePlugin } from "sanity";
import { Resend } from "resend";

// Get API key from environment or use a fallback for development
const getResendApiKey = () => {
  // Try different environment variable sources
  const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }
  return apiKey;
};

const resend = new Resend(getResendApiKey());

interface ClientData {
  name: string;
  selectedPlan?: { name: string };
  startDate?: string;
  slaStartTime?: string;
  maintenanceWindow?: string;
  status?: string;
}

interface EmailTemplate {
  name?: string;
  subject: string;
  body: string;
  htmlBody?: any[]; // Portable Text array
}

function replacePlaceholders(template: string, clientData: ClientData): string {
  return template
    .replace(/\{\{clientName\}\}/g, clientData.name || "Unknown Client")
    .replace(
      /\{\{planName\}\}/g,
      clientData.selectedPlan?.name || "Unknown Plan"
    )
    .replace(
      /\{\{startDate\}\}/g,
      clientData.startDate
        ? new Date(clientData.startDate).toLocaleDateString()
        : "Not set"
    )
    .replace(
      /\{\{slaStartTime\}\}/g,
      clientData.slaStartTime
        ? new Date(clientData.slaStartTime).toLocaleString()
        : "Not set"
    )
    .replace(
      /\{\{maintenanceWindow\}\}/g,
      clientData.maintenanceWindow || "Not set"
    )
    .replace(/\{\{status\}\}/g, clientData.status || "Unknown");
}

export async function sendEmail(
  template: EmailTemplate,
  clientData: ClientData,
  recipientEmail: string
): Promise<any> {
  console.log("📧 Client-side Email Debug Info:");
  console.log("To:", recipientEmail);
  console.log("Template:", template.name || "Unknown");
  console.log("Client Data:", clientData);

  try {
    console.log("🚀 Sending email via Next.js API route...");

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template,
        clientData,
        recipientEmail,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "API request failed");
    }

    console.log("✅ Email sent successfully via API!");
    console.log("API Response:", result);

    return result;
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    console.error("Error details:", {
      message: error?.message || "Unknown error",
      name: error?.name,
      stack: error?.stack,
    });

    throw new Error(
      `Failed to send email: ${error?.message || "Unknown error"}`
    );
  }
}

export const emailSender = definePlugin({
  name: "email-sender",
  // This plugin provides utility functions for sending emails
});
