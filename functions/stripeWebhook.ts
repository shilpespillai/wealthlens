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
      return Response.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    const base44 = createClientFromRequest(req);

    // Handle successful payment
    if (event.type === "charge.succeeded") {
      const charge = event.data.object;
      const customerId = charge.customer;

      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId);

        const purchaseData = {
          stripeCustomerId: customerId,
          stripePaymentId: charge.id,
          email: customer.email,
          status: "completed",
          priceId: charge.metadata.priceId || "",
          purchasedAt: new Date(charge.created * 1000).toISOString(),
        };

        // Check if purchase already exists
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripePaymentId: charge.id,
        });

        if (existing.length === 0) {
          // Create new purchase record
          await base44.asServiceRole.entities.Subscription.create(purchaseData);
          console.log(`Created purchase record: ${charge.id}`);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});