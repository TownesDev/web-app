import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { getCurrentClient } from "../../../lib/auth";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.NEXT_PUBLIC_SANITY_AUTH_TOKEN,
});

export async function GET() {
  try {
    // Get the current authenticated client
    const currentClient = await getCurrentClient();

    if (!currentClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch incidents for the current client
    const incidents = await client.fetch(
      `*[_type=="incident" && client._ref==$clientId]|order(reportedAt desc){
        _id, title, severity, description, reportedAt, resolvedAt, status, hoursUsed, outOfScope
      }`,
      { clientId: currentClient._id }
    );

    return NextResponse.json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current authenticated client
    const currentClient = await getCurrentClient();

    if (!currentClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, severity, description } = await request.json();

    if (!title || !severity) {
      return NextResponse.json(
        { error: "Missing required fields: title and severity" },
        { status: 400 }
      );
    }

    // Validate severity
    const validSeverities = ["low", "medium", "high", "critical"];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        {
          error:
            "Invalid severity. Must be one of: low, medium, high, critical",
        },
        { status: 400 }
      );
    }

    const reportedAt = new Date().toISOString();

    // Create incident in Sanity
    const incident = await client.create({
      _type: "incident",
      title,
      severity,
      description: description || "",
      client: { _type: "reference", _ref: currentClient._id },
      reportedAt,
      status: "open",
    });

    console.log("✅ Incident created successfully:", incident._id);

    return NextResponse.json({
      success: true,
      message: "Incident reported successfully",
      incident: {
        _id: incident._id,
        title: incident.title,
        severity: incident.severity,
        description: incident.description,
        reportedAt: incident.reportedAt,
        status: incident.status,
      },
    });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the current authenticated client
    const currentClient = await getCurrentClient();

    if (!currentClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id and status" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be one of: open, in_progress, resolved, closed",
        },
        { status: 400 }
      );
    }

    // First verify the incident belongs to the current client
    const existingIncident = await client.getDocument(id);
    if (
      !existingIncident ||
      existingIncident.client._ref !== currentClient._id
    ) {
      return NextResponse.json(
        { error: "Incident not found or access denied" },
        { status: 404 }
      );
    }

    // Update the incident
    const updateData: { status: string; resolvedAt?: string } = { status };
    if (status === "resolved" || status === "closed") {
      updateData.resolvedAt = new Date().toISOString();
    }

    const updatedIncident = await client.patch(id).set(updateData).commit();

    console.log("✅ Incident updated successfully:", updatedIncident._id);

    return NextResponse.json({
      success: true,
      message: "Incident updated successfully",
      incident: updatedIncident,
    });
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current authenticated client
    const currentClient = await getCurrentClient();

    if (!currentClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    // First verify the incident belongs to the current client
    const existingIncident = await client.getDocument(id);
    if (
      !existingIncident ||
      existingIncident.client._ref !== currentClient._id
    ) {
      return NextResponse.json(
        { error: "Incident not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the incident
    await client.delete(id);

    console.log("✅ Incident deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Incident deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting incident:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
