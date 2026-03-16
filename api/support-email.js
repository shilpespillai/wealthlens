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

  console.log('[Support Email] New Request:', { subject, userEmail, messageLength: message.length });

  // IMPLEMENTATION NOTE: 
  // To send real emails, you can use a service like SendGrid, Mailtrap, or Resend here.
  // Example with a hypothetical environment variable:
  // if (process.env.SENDGRID_API_KEY) {
  //   // Call SendGrid SDK...
  // }

  // For now, we return success to the UI to ensure the user flow is not blocked.
  // In a real production environment, this would trigger the mail server.

  return res.status(200).json({ 
    success: true, 
    message: 'Support request received. Our team will contact you at ' + userEmail + ' within 24 hours.' 
  });
}
