import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ error: 'Missing identity markers' });
    }

    console.log(`[SyncPro] Checking Stripe for: ${email}`);

    // 1. Search for a successful checkout session for this customer
    const sessions = await stripe.checkout.sessions.list({
      customer_details: { email },
      limit: 10
    });

    const successfulSession = sessions.data.find(s => s.payment_status === 'paid' || s.status === 'complete');

    if (!successfulSession) {
      // Fallback: Check for any payment intent for this customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        const payments = await stripe.paymentIntents.list({
          customer: customers.data[0].id,
          limit: 5
        });
        const hasPaid = payments.data.some(p => p.status === 'succeeded');
        if (!hasPaid) {
          return res.status(404).json({ error: 'No successful payment found for this email on Stripe.' });
        }
      } else {
        return res.status(404).json({ error: 'No customer record found on Stripe.' });
      }
    }

    console.log(`[SyncPro] Payment verified. Elevating user: ${userId}`);

    // 2. Force-Upgrade the user in Supabase
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        is_premium: true,
        premium_granted_at: new Date().toISOString(),
        sync_source: 'manual_failsafe'
      }
    });

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Institutional status synchronized successfully.' });
  } catch (err) {
    console.error('[SyncPro Error]', err);
    return res.status(500).json({ error: err.message });
  }
}
