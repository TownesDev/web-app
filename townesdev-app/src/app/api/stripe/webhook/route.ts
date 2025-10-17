import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { runQuery, sanityWrite } from "@/lib/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    console.error(
      `Webhook signature verification failed.`,
      err instanceof Error ? err.message : String(err)
    );
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
  await sanityWrite.mutate([
    {
      create: {
        _type: "entitlement",
        client: { _type: "reference", _ref: clientId },
        asset: { _type: "reference", _ref: assetId },
        feature: { _type: "reference", _ref: featureId },
        status: "active",
        activatedAt: new Date().toISOString(),
        stripePaymentIntentId: session.payment_intent as string,
      },
    },
  ]);
}

async function handlePlanSubscription(session: Stripe.Checkout.Session) {
  const { planId, clientId, assetId } = session.metadata!;

  if (!planId || !clientId) {
    console.error("Missing planId or clientId in subscription metadata");
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Check if retainer already exists (idempotency)
    const existingRetainer = await runQuery(
      `*[_type=="retainer" && stripeSubId==$stripeSubId][0]`,
      { stripeSubId: subscription.id }
    );

    if (existingRetainer) {
      console.log("Retainer already exists for subscription:", subscription.id);
      return;
    }

    // Get plan details
    const plan = await runQuery(
      `*[_type=="plan" && _id==$planId][0]{
        _id,
        name,
        hoursIncluded
      }`,
      { planId }
    );

    if (!plan) {
      console.error("Plan not found:", planId);
      return;
    }

    // Create retainer
    const retainerData = {
      _type: "retainer",
      client: { _type: "reference", _ref: clientId },
      plan: { _type: "reference", _ref: planId },
      stripeSubId: subscription.id,
      status:
        subscription.status === "active"
          ? "active"
          : subscription.status === "canceled"
            ? "canceled"
            : "past_due",
      periodStart: new Date(
        (
          subscription as unknown as Stripe.Subscription & {
            current_period_start: number;
            current_period_end: number;
          }
        )["current_period_start"] * 1000
      ).toISOString(),
      periodEnd: new Date(
        (
          subscription as unknown as Stripe.Subscription & {
            current_period_start: number;
            current_period_end: number;
          }
        )["current_period_end"] * 1000
      ).toISOString(),
      hoursIncluded: plan.hoursIncluded || 0,
      hoursUsed: 0,
      ...(assetId && { asset: { _type: "reference", _ref: assetId } }),
    };

    await sanityWrite.mutate([
      {
        create: retainerData,
      },
    ]);

    console.log("Retainer created for subscription:", subscription.id);
  } catch (error) {
    console.error("Error creating retainer:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update invoice status in Sanity
  if (invoice.metadata?.invoiceId) {
    const existingInvoice = await runQuery(
      `*[_type=="invoice" && _id==$invoiceId][0]{
        _id
      }`,
      { invoiceId: invoice.metadata.invoiceId }
    );

    if (existingInvoice) {
      await sanityWrite.mutate([
        {
          patch: {
            id: invoice.metadata.invoiceId,
            set: {
              status: "paid",
            },
          },
        },
      ]);
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update retainer with new subscription details
    const result = await runQuery(
      `*[_type=="retainer" && stripeSubId==$stripeSubId][0]`,
      { stripeSubId: subscription.id }
    );

    if (result) {
      await sanityWrite.mutate([
        {
          patch: {
            id: result._id,
            set: {
              status:
                subscription.status === "active"
                  ? "active"
                  : subscription.status === "canceled"
                    ? "canceled"
                    : "past_due",
              periodStart: new Date(
                (
                  subscription as unknown as Stripe.Subscription & {
                    current_period_start: number;
                    current_period_end: number;
                  }
                )["current_period_start"] * 1000
              ).toISOString(),
              periodEnd: new Date(
                (
                  subscription as unknown as Stripe.Subscription & {
                    current_period_start: number;
                    current_period_end: number;
                  }
                )["current_period_end"] * 1000
              ).toISOString(),
            },
          },
        },
      ]);

      console.log("Retainer updated for subscription:", subscription.id);
    } else {
      console.warn("No retainer found for subscription:", subscription.id);
    }
  } catch (error) {
    console.error("Error updating retainer:", error);
  }
}
