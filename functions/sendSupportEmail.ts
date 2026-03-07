import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { subject, message, userEmail } = await req.json();

    if (!subject || !message || !userEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send confirmation to the user who submitted the support request
    await base44.integrations.Core.SendEmail({
      to: userEmail,
      subject: `We received your message: ${subject}`,
      body: `Hi,\n\nThank you for reaching out! We have received your support request and will get back to you shortly.\n\n---\nYour message:\nSubject: ${subject}\n\n${message}\n\n---\nThe WealthLens Team`,
      from_name: "WealthLens Support"
    });

    return Response.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending support email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});