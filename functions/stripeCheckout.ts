import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.20";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceId, successUrl, cancelUrl, email } = await req.json();

    // Validate required parameters
    if (!priceId || !successUrl || !cancelUrl || !email) {
      return Response.json(
        { error: "Missing required parameters: priceId, successUrl, cancelUrl, email" },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    });

    console.log(`Checkout session created: ${session.id} for customer: ${customerId}`);

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json(
      { error: `Checkout failed: ${error.message}` },
      { status: 500 }
    );
  }
});