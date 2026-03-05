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

    // Handle subscription events
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const customer = await stripe.customers.retrieve(customerId);

      const subscriptionData = {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        email: customer.email,
        status: subscription.status,
        priceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      };

      // Check if subscription exists
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripeSubscriptionId: subscription.id,
      });

      if (existing.length > 0) {
        // Update existing
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, subscriptionData);
        console.log(`Updated subscription: ${subscription.id}`);
      } else {
        // Create new
        await base44.asServiceRole.entities.Subscription.create(subscriptionData);
        console.log(`Created subscription: ${subscription.id}`);
      }
    }

    // Handle cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        stripeSubscriptionId: subscription.id,
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
          status: "canceled",
          canceledAt: new Date().toISOString(),
        });
        console.log(`Canceled subscription: ${subscription.id}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
});