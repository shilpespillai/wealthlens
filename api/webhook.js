import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Disable body parsing — Stripe requires raw body for signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook Signature Error]', err.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.metadata?.email;

    if (!email) {
      console.error('[Webhook] No email in session', session.id);
      return res.status(400).json({ error: 'No email found in session' });
    }

    console.log(`[Webhook] Payment confirmed for: ${email}`);

    // Grant premium access in Supabase
    const { error } = await supabase.from('users').upsert({
      email,
      is_premium: true,
      premium_granted_at: new Date().toISOString(),
      stripe_customer_id: session.customer,
    }, { onConflict: 'email' });

    if (error) {
      console.error('[Webhook] Supabase error:', error);
      return res.status(500).json({ error: 'Failed to update user premium status' });
    }

    console.log(`[Webhook] Premium granted to: ${email}`);
  }

  return res.status(200).json({ received: true });
}
