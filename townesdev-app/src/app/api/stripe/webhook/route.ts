import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { runQuery, sanityWrite } from "@/lib/client";
import { getEmailTemplateByName } from "../../../../queries/emailTemplates";
import { ptToHtml, ptToPlainText, mergeVars } from "../../../../lib/email";
import { resend, EMAIL_FROM } from "../../../../lib/resendClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  console.log("🔄 Webhook received:", request.method, request.url);

  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook event verified:", event.type);
  } catch (err: unknown) {
    console.error(
      `❌ Webhook signature verification failed.`,
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

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
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

  console.log("🔍 Processing plan subscription:", { planId, clientId, assetId, subscriptionId: session.subscription });

  if (!planId || !clientId) {
    console.error("Missing planId or clientId in subscription metadata");
    return;
  }

  if (!session.subscription) {
    console.error("No subscription ID in session");
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    console.log("🔍 Retrieved subscription:", {
      id: subscription.id,
      status: subscription.status,
      current_period_start: (
        subscription as unknown as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }
      ).current_period_start,
      current_period_end: (
        subscription as unknown as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }
      ).current_period_end,
    });

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
    const periodStartTimestamp = (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number;
        current_period_end: number;
      }
    )["current_period_start"];

    const periodEndTimestamp = (
      subscription as unknown as Stripe.Subscription & {
        current_period_start: number;
        current_period_end: number;
      }
    )["current_period_end"];

    console.log("🔍 Period timestamps:", { periodStartTimestamp, periodEndTimestamp });

    // Handle case where timestamps might be missing or invalid
    let periodStart: string;
    let periodEnd: string;

    try {
      if (periodStartTimestamp && periodStartTimestamp > 0) {
        periodStart = new Date(periodStartTimestamp * 1000).toISOString();
      } else {
        console.warn("⚠️ Invalid or missing periodStartTimestamp, using current date");
        periodStart = new Date().toISOString();
      }

      if (periodEndTimestamp && periodEndTimestamp > 0) {
        periodEnd = new Date(periodEndTimestamp * 1000).toISOString();
      } else {
        console.warn("⚠️ Invalid or missing periodEndTimestamp, using date 30 days from now");
        periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    } catch (dateError) {
      console.error("❌ Error creating dates:", dateError);
      console.error("❌ Timestamp values:", { periodStartTimestamp, periodEndTimestamp });
      return;
    }

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
      periodStart: periodStart,
      periodEnd: periodEnd,
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

    // Send welcome email to client
    try {
      console.log(
        `📧 Sending welcome email to client ${clientId} for plan ${planId}`
      );
      await sendWelcomeEmail(clientId, planId);
      console.log(`✅ Welcome email sent successfully to client ${clientId}`);
    } catch (emailError) {
      console.error(
        `❌ Failed to send welcome email to client ${clientId}:`,
        emailError
      );
      // Don't fail the webhook if email fails
    }
  } catch (error) {
    console.error("Error creating retainer:", error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("🎯 Handling subscription created:", subscription.id);

  // Get client and plan from subscription metadata or customer
  // This might be more complex - we may need to store metadata on the subscription
  // For now, let's just log that we received it
  console.log("📧 Subscription created - ready to send welcome email");

  // TODO: Extract client/plan info and send welcome email
  // This would require storing clientId and planId in subscription metadata
}
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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("🎯 Handling subscription created:", subscription.id);

  // Get client and plan from subscription metadata or customer
  // This might be more complex - we may need to store metadata on the subscription
  // For now, let's just log that we received it
  console.log("📧 Subscription created - ready to send welcome email");

  // TODO: Extract client/plan info and send welcome email
  // This would require storing clientId and planId in subscription metadata
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

async function sendWelcomeEmail(clientId: string, planId: string) {
  console.log(`🔍 Fetching client and plan data for welcome email...`);

  try {
    // Get client and plan details
    const [client, plan] = await Promise.all([
      runQuery(
        `*[_type=="client" && _id==$clientId][0]{
          _id,
          name,
          email,
          startDate,
          slaStartTime,
          maintenanceWindow
        }`,
        { clientId }
      ),
      runQuery(
        `*[_type=="plan" && _id==$planId][0]{
          _id,
          name
        }`,
        { planId }
      ),
    ]);

    if (!client || !plan || !client.email) {
      console.warn(
        `Missing client (${!!client}), plan (${!!plan}), or email (${client?.email}) for welcome email to client ${clientId}`
      );
      return;
    }

    // Get email template
    const template = await getEmailTemplateByName("Welcome Activation");
    if (!template) {
      console.warn(
        `Welcome Activation email template not found for client ${clientId}`
      );
      return;
    }

    // Prepare variables for template
    const vars = {
      clientName: client.name || "Valued Client",
      planName: plan.name || "Your Plan",
      startDate: client.startDate
        ? new Date(client.startDate).toLocaleDateString()
        : "As soon as possible",
      slaStartTime: client.slaStartTime
        ? new Date(client.slaStartTime).toLocaleString()
        : "To be determined",
      maintenanceWindow: client.maintenanceWindow || "To be scheduled",
    };

    // Render email content
    const subject = mergeVars(template.subject || "", vars);
    const htmlRaw = ptToHtml(template.htmlBody);
    const textRaw = ptToPlainText(template.htmlBody);

    const html = mergeVars(htmlRaw, vars);
    const text = mergeVars(textRaw, vars);

    // Send email
    const emailPayload = {
      from: EMAIL_FROM,
      to: [client.email],
      subject,
      text: text || "Welcome to TownesDev!",
      ...(html && { html }),
    };

    const result = await resend.emails.send(emailPayload);
    console.log(
      `Welcome email sent successfully to ${client.email}:`,
      String(result)
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error; // Re-throw to be caught by caller
  }
}
