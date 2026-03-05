import Stripe from "npm:stripe@14.21.0";
import { createClientFromRequest } from "npm:@base44/sdk@0.8.20";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { priceId, successUrl, cancelUrl } = await req.json();

    // Validate required parameters
    if (!priceId || !successUrl || !cancelUrl) {
      return Response.json(
        { error: "Missing required parameters: priceId, successUrl, cancelUrl" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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

    console.log(`Checkout session created: ${session.id}`);

    return Response.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    return Response.json(
      { error: `Checkout failed: ${error.message}` },
      { status: 500 }
    );
  }
});