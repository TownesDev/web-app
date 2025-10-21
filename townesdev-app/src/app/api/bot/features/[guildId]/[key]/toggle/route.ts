import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/rbac/guards";
import { getClient } from "@/lib/bot";
import { sanityWrite, runQuery } from "@/lib/client";

// Bot Platform API configuration
const BOT_API_URL = process.env.BOT_API_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; key: string }> }
) {
  try {
    // Require bot feature toggle capability
    await requireCapability("bot:features:toggle");

    const { guildId, key } = await params;
    const { clientId, action, config } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required" },
        { status: 400 }
      );
    }

    if (!["enable", "disable"].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "enable" or "disable"' },
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

    // Find the service asset for this guild
    const asset = await runQuery(
      `*[_type=="serviceAsset" && client._ref==$clientId && "guild:${guildId}" in externalIds][0]{
        _id,
        _type,
        name,
        type
      }`,
      { clientId }
    );

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Service asset not found for this guild" },
        { status: 404 }
      );
    }

    // Find existing entitlement
    const existingEntitlement = await runQuery(
      `*[_type=="entitlement" && client._ref==$clientId && asset._ref==$assetId && feature->key==$featureKey][0]{
        _id,
        status
      }`,
      {
        clientId,
        assetId: asset._id,
        featureKey: key,
      }
    );

    // Get feature details
    const feature = await runQuery(
      `*[_type=="feature" && key==$key][0]{
        _id,
        name,
        sku
      }`,
      { key }
    );

    if (!feature) {
      return NextResponse.json(
        { success: false, error: "Feature not found" },
        { status: 404 }
      );
    }

    // Call Bot Platform API to toggle feature
    const endpoint = action === "enable" ? "enable" : "disable";
    const botResponse = await fetch(
      `${BOT_API_URL}/assets/${guildId}/features/${key}/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": client.botApiKey,
        },
        body: JSON.stringify({
          config: config || {},
        }),
      }
    );

    if (!botResponse.ok) {
      const errorData = await botResponse.json();
      console.error("Bot platform feature toggle failed:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to toggle feature" },
        { status: 500 }
      );
    }

    const botData = await botResponse.json();

    // Update or create entitlement
    const entitlementData = {
      _type: "entitlement",
      client: {
        _type: "reference",
        _ref: clientId,
      },
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
      feature: {
        _type: "reference",
        _ref: feature._id,
      },
      status: action === "enable" ? "active" : "revoked",
      activatedAt: new Date().toISOString(),
    };

    if (existingEntitlement) {
      // Update existing entitlement
      await sanityWrite
        .patch(existingEntitlement._id)
        .set({
          status: entitlementData.status,
          activatedAt: entitlementData.activatedAt,
        })
        .commit();
    } else {
      // Create new entitlement
      await sanityWrite.create(entitlementData);
    }

    return NextResponse.json({
      success: true,
      data: {
        guildId,
        featureKey: key,
        action,
        status:
          botData.status || (action === "enable" ? "enabled" : "disabled"),
      },
    });
  } catch (error) {
    console.error("Bot feature toggle error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
