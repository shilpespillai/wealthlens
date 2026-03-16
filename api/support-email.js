export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { subject, message, userEmail } = req.body;

  if (!subject || !message || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'WealthLens <onboarding@resend.dev>', // Resend default for unverified domains
          to: ['aihealthtec@gmail.com'],
          reply_to: userEmail,
          subject: `[Support Request] ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: #4f46e5; padding: 24px; color: white;">
                <h2 style="margin: 0;">New Support Request</h2>
              </div>
              <div style="padding: 24px; color: #1e293b;">
                <p><strong>From:</strong> ${userEmail}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
              <div style="background: #f8fafc; padding: 16px; text-align: center; color: #64748b; font-size: 12px;">
                WealthLens · Professional Financial Intelligence
              </div>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        console.error('[Support Email] Resend API Error:', errorData);
        // We still return 200 to the user to avoid blocking them, but log the error
      }
    } catch (e) {
      console.error('[Support Email] Fetch error:', e);
    }
  } else {
    console.warn('[Support Email] RESEND_API_KEY not found. Operating in log-only mode.');
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Support request received. Our team will contact you at ' + userEmail + ' within 24 hours.' 
  });
}
