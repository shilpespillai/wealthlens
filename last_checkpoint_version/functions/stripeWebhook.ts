import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.20";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    const base44 = createClientFromRequest(req);

    console.log(`Received Stripe event: ${event.type}`);

    // Handle checkout session completed (most reliable event)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status === "paid") {
        const email = session.customer_details?.email || session.customer_email;
        const customerId = session.customer;

        if (!email) {
          console.error("No email found in checkout session:", session.id);
          return Response.json({ received: true });
        }

        const purchaseData = {
          stripeCustomerId: customerId || session.id,
          stripePaymentId: session.payment_intent || session.id,
          email: email.toLowerCase().trim(),
          status: "completed",
          priceId: session.metadata?.priceId || "",
          purchasedAt: new Date(session.created * 1000).toISOString(),
        };

        // Check if purchase already exists
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripePaymentId: purchaseData.stripePaymentId,
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.Subscription.create(purchaseData);
          console.log(`Created subscription record for: ${email}`);
        } else {
          console.log(`Subscription already exists for payment: ${purchaseData.stripePaymentId}`);
        }
      }
    }

    // Also handle charge.succeeded as fallback
    if (event.type === "charge.succeeded") {
      const charge = event.data.object;
      const customerId = charge.customer;

      let email = charge.billing_details?.email;

      if (!email && customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        email = customer.email;
      }

      if (email) {
        email = email.toLowerCase().trim();
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripePaymentId: charge.id,
        });

        if (existing.length === 0) {
          await base44.asServiceRole.entities.Subscription.create({
            stripeCustomerId: customerId || charge.id,
            stripePaymentId: charge.id,
            email: email,
            status: "completed",
            priceId: charge.metadata?.priceId || "",
            purchasedAt: new Date(charge.created * 1000).toISOString(),
          });
          console.log(`Created subscription from charge for: ${email}`);
        }
      } else {
        console.error("No email found in charge:", charge.id);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});