import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { runQuery } from "@/lib/client";
import { qFeaturesByType } from "@/sanity/lib/queries";
import { Stripe } from 'stripe'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    const client = await getCurrentClient();
    if (!client) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { featureId, assetId } = await request.json();

    if (!featureId || !assetId) {
      return NextResponse.json(
        { error: "Missing featureId or assetId" },
        { status: 400 }
      );
    }

    // Verify the feature exists and get its details
    const features = await runQuery(
      `*[_type=="feature" && _id==$featureId][0]{
        _id, name, price, sku, assetType
      }`,
      { featureId }
    );

    if (!features) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    // Verify the asset belongs to the client
    const asset = await runQuery(
      `*[_type=="serviceAsset" && _id==$assetId && client._ref==$clientId][0]{
        _id, type
      }`,
      { assetId, clientId: client._id }
    );

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found or access denied" },
        { status: 404 }
      );
    }

    // Check if asset type matches feature type
    const assetTypeMap = { discord_bot: "bot", web_app: "app" };
    if (
      assetTypeMap[asset.type as keyof typeof assetTypeMap] !==
      features.assetType
    ) {
      return NextResponse.json(
        { error: "Feature not compatible with asset type" },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session 
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: features.name,
            },
            unit_amount: features.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/features/${assetId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/features/${assetId}?canceled=true`,
      metadata: {
        featureId: features._id,
        assetId: asset._id,
        clientId: client._id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout feature error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
