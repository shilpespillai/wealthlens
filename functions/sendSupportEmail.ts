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
      subject: `[WealthLens Support] ${subject}`,
      body: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 8px;">
  <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">💬 New Support Request</h1>
    <p style="color: #c7d2fe; margin: 4px 0 0; font-size: 13px;">WealthLens Support</p>
  </div>
  <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 80px; font-weight: bold;">From:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #111827;">${userEmail}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Subject:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #111827;">${subject}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #6b7280; font-weight: bold;">Date:</td>
        <td style="padding: 8px 0; font-size: 14px; color: #111827;">${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}</td>
      </tr>
    </table>
    <div style="background: #f3f4f6; border-left: 4px solid #4f46e5; border-radius: 4px; padding: 16px; margin-top: 8px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
      <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap; line-height: 1.6;">${message}</p>
    </div>
    <p style="margin: 20px 0 0; font-size: 12px; color: #9ca3af; text-align: center;">You can reply directly to this email to respond to the user.</p>
  </div>
</div>
      `,
      from_name: "WealthLens Support"
    });

    return Response.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending support email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});