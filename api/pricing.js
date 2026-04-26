import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Safety Check: Missing Config
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.warn('[Pricing API] Missing Supabase Configuration. Using defaults.');
    if (req.method === 'GET') return res.status(200).json({ price: "29.99" });
    return res.status(500).json({ error: 'System configuration missing' });
  }

  try {
    if (req.method === 'GET') {
      // Per User instruction, public.users is the source of truth
      const { data, error } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('email', 'system_price@wealthlens.com')
        .maybeSingle();

      const price = data?.stripe_customer_id || "29.99";
      return res.status(200).json({ price });
    }

    if (req.method === 'POST') {
      const { price, adminEmail } = req.body;

      if (adminEmail !== 'admin@wealthlens.com') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('users')
        .upsert({ 
          email: 'system_price@wealthlens.com', 
          stripe_customer_id: price.toString(),
          is_premium: false 
        }, { onConflict: 'email' });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Pricing API Error]', err);
    if (req.method === 'GET') return res.status(200).json({ price: "29.99" });
    return res.status(500).json({ error: err.message });
  }
}
