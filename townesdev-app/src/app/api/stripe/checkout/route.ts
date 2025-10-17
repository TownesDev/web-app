import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getClientByUserId,
  getPlanById,
  getOrCreateCustomer,
  stripe,
} from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const { planId, assetId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // Get the authenticated user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get client by user ID
    const client = await getClientByUserId(session.id);
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get plan details
    const plan = await getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Validate plan has Stripe configuration
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: "Plan not configured for payments" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(client);

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/plans?canceled=true`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          planId,
          clientId: client._id,
          ...(assetId && { assetId }),
        },
      },
      metadata: {
        planId,
        clientId: client._id,
        userId: session.id,
        ...(assetId && { assetId }),
      },
    };

    const checkoutSession =
      await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
