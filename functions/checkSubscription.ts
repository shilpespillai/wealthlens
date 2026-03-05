import { createClientFromRequest } from "npm:@base44/sdk@0.8.20";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const purchases = await base44.asServiceRole.entities.Subscription.filter({
      email: email,
      status: "completed",
    });

    const isActive = purchases.length > 0;

    return Response.json({
      isActive,
      purchase: isActive ? purchases[0] : null,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});