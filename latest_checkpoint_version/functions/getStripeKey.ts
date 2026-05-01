Deno.serve(async (req) => {
  try {
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!publishableKey) {
      return Response.json(
        { error: "Stripe publishable key not configured" },
        { status: 500 }
      );
    }
    
    return Response.json({ publishableKey });
  } catch (error) {
    console.error("Error retrieving Stripe key:", error);
    return Response.json(
      { error: "Failed to retrieve Stripe key" },
      { status: 500 }
    );
  }
});