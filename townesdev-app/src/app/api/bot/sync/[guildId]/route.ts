import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/rbac/guards";
import { getClient } from "@/lib/bot";

// Bot Platform API configuration
const BOT_API_URL = process.env.BOT_API_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    // Require bot asset management capability
    await requireCapability("bot:assets:manage");

    const { guildId } = await params;
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      );
    }

    // Verify client exists and has bot tenant
    const client = await getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    if (!client.botTenantId || !client.botApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Client does not have bot tenant provisioned",
        },
        { status: 400 }
      );
    }

    // Call Bot Platform API to sync guild state
    const botResponse = await fetch(`${BOT_API_URL}/assets/${guildId}/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": client.botApiKey,
      },
    });

    if (!botResponse.ok) {
      const errorData = await botResponse.json();
      console.error("Bot platform sync failed:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to sync guild" },
        { status: 500 }
      );
    }

    const botData = await botResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        guildId,
        syncedAt: new Date().toISOString(),
        status: botData.status || "synced",
      },
    });
  } catch (error) {
    console.error("Bot sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
