import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { runQuery } from "@/lib/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.featureId) {
          // Handle feature purchase
          await handleFeaturePurchase(session);
        } else if (session.metadata?.planId) {
          // Handle plan subscription
          await handlePlanSubscription(session);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleFeaturePurchase(session: Stripe.Checkout.Session) {
  const { featureId, assetId, clientId } = session.metadata!;

  // Create entitlement
  await runQuery(
    `create({
      _type: "entitlement",
      client: { _type: "reference", _ref: $clientId },
      asset: { _type: "reference", _ref: $assetId },
      feature: { _type: "reference", _ref: $featureId },
      status: "active",
      activatedAt: $activatedAt,
      stripePaymentIntentId: $paymentIntentId
    })`,
    {
      clientId,
      assetId,
      featureId,
      activatedAt: new Date().toISOString(),
      paymentIntentId: session.payment_intent as string,
    }
  );
}

async function handlePlanSubscription(session: Stripe.Checkout.Session) {
  const { planId } = session.metadata!;

  // For now, just log - we'll handle client.selectedPlan updates
  // when we have the client ID from the session
  console.log("Plan subscription created:", { planId, sessionId: session.id });
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update invoice status in Sanity
  if (invoice.metadata?.invoiceId) {
    await runQuery(
      `*[_type=="invoice" && _id==$invoiceId][0]{
        _id
      }`,
      { invoiceId: invoice.metadata.invoiceId }
    ).then((existingInvoice) => {
      if (existingInvoice) {
        return runQuery(`patch($invoiceId, { status: "paid" })`, {
          invoiceId: invoice.metadata!.invoiceId,
        });
      }
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update client plan or retainer status
  // This would need client identification from subscription metadata
  console.log("Subscription updated:", subscription.id, subscription.status);
}
