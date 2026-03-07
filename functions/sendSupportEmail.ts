import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { subject, message, userEmail } = await req.json();

    if (!subject || !message || !userEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send support email to admin
    await base44.integrations.Core.SendEmail({
      to: "shilpeshpillai81@gmail.com",
      subject: `Support Request: ${subject}`,
      body: `From: ${userEmail}\n\nSubject: ${subject}\n\n${message}`,
      from_name: "WealthLens Support"
    });

    return Response.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending support email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});