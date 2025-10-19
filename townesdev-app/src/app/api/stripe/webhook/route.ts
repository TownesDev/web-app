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

    // Send welcome email to client
    try {
      console.log(`Sending welcome email to client ${clientId} for plan ${planId}`);
      await sendWelcomeEmail(clientId, planId);
      console.log(`Welcome email sent successfully to client ${clientId}`);
    } catch (emailError) {
      console.error(`Failed to send welcome email to client ${clientId}:`, emailError);
      // Don't fail the webhook if email fails
    }
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

async function sendWelcomeEmail(clientId: string, planId: string) {
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
      console.warn(`Missing client (${!!client}), plan (${!!plan}), or email (${client?.email}) for welcome email to client ${clientId}`);
      return;
    }

    // Get email template
    const template = await getEmailTemplateByName("Welcome Activation");
    if (!template) {
      console.warn(`Welcome Activation email template not found for client ${clientId}`);
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
    console.log(`Welcome email sent successfully to ${client.email}:`, String(result));
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error; // Re-throw to be caught by caller
  }
}
