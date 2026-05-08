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
    console.log('[Webhook] Attempting signature verification...');
    console.log('[Webhook] Secret Length:', process.env.STRIPE_WEBHOOK_SECRET?.length || 0);
    console.log('[Webhook] Signature Header Present:', !!sig);
    
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[Webhook] Signature Verified! Event Type:', event.type);
  } catch (err) {
    console.error('[Webhook Signature Error] FAILED:', err.message);
    console.log('[Webhook] Expected Secret Starts With:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 7));
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Check both client_reference_id and metadata for the userId (Stripe redundancy)
    const userId = session.client_reference_id || session.metadata?.userId;

    if (!userId) {
      console.error('[Webhook] Missing userId in session (checked client_reference_id and metadata):', session.id);
      return res.status(400).json({ error: 'Missing userId' });
    }

    console.log(`[Webhook] Success! Promoting user ${userId} to PRO...`);

    // 1. Update Auth Metadata (Master Identity)
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { 
        is_premium: true,
        premium_granted_at: new Date().toISOString(),
        stripe_customer_id: session.customer 
      },
      app_metadata: { 
        is_premium: true, 
        subscription_tier: 'pro' 
      }
    });

    if (authError) {
      console.error('[Webhook] Auth Update Error:', authError.message);
    }

    // 2. Update User Data Vault (Feature Locks & Profile)
    // We attempt to fetch existing profile to merge, or fallback to a new one
    const { data: existingData } = await supabase
      .from('user_data')
      .select('payload')
      .eq('user_id', userId)
      .eq('key', 'profile')
      .maybeSingle();

    const newPayload = { 
      ...(existingData?.payload || {}), 
      is_premium: true, 
      updated_at: new Date().toISOString() 
    };

    const { error: vaultError } = await supabase
      .from('user_data')
      .upsert({
        user_id: userId,
        key: 'profile',
        payload: newPayload
      }, { onConflict: 'user_id,key' });

    if (vaultError) {
      console.error('[Webhook] Vault Update Error:', vaultError.message);
    }

    console.log(`[Webhook] User ${userId} successfully promoted to PRO in all systems.`);
  }

  return res.status(200).json({ received: true });
}
