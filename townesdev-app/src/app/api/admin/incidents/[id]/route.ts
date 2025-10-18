import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/rbac/guards";
import { sanityWrite } from "@/lib/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require system write capability for incident management
    await requireCapability("system:write");

    const { id } = await params;
    const { assignee } = await request.json();

    // Validate assignee field (allow empty string to clear assignee)
    if (typeof assignee !== "string") {
      return NextResponse.json(
        { error: "Assignee must be a string" },
        { status: 400 }
      );
    }

    // Update the incident assignee in Sanity
    const result = await sanityWrite
      .patch(id)
      .set({
        assignee: assignee.trim(),
      })
      .commit();

    if (!result) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating incident assignee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
