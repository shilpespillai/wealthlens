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
    const userId = session.metadata?.userId;
    const email = session.customer_details?.email || session.metadata?.email;

    if (!userId) {
      console.error('[Webhook] No userId in session metadata', session.id);
      return res.status(400).json({ error: 'No userId found in session metadata' });
    }

    console.log(`[Webhook] Payment confirmed for userId: ${userId} (${email})`);

    // Grant premium access in Supabase Auth Metadata (The fastest way for frontend to see it)
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        is_premium: true,
        premium_granted_at: new Date().toISOString(),
        stripe_customer_id: session.customer,
      }
    });

    if (error) {
      console.error('[Webhook] Supabase Auth error:', error);
      return res.status(500).json({ error: 'Failed to update user premium metadata' });
    }

    console.log(`[Webhook] Premium granted to userId: ${userId}`);
  }

  return res.status(200).json({ received: true });
}
