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
    const ADMIN_ID = 'a400d55d-ce84-4ad7-8715-88648d133668'; // System Admin ID
    const PRICING_KEY = 'wl_public_app_pricing';

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_data')
        .select('payload')
        .eq('user_id', ADMIN_ID)
        .eq('key', PRICING_KEY)
        .maybeSingle();

      const price = data?.payload?.price || "29.99";
      return res.status(200).json({ price });
    }

    if (req.method === 'POST') {
      const { price, adminEmail } = req.body;

      if (!price || adminEmail !== 'admin@wealthlens.com') {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      // Store in the global app settings vault with admin ID
      const { error } = await supabase
        .from('user_data')
        .upsert({ 
          user_id: ADMIN_ID,
          key: PRICING_KEY, 
          payload: { 
            price: (price || "29.99").toString(), 
            updated_by: adminEmail, 
            updated_at: new Date().toISOString() 
          }
        }, { onConflict: 'user_id,key' });

      if (error) {
        console.error('[Pricing API] Database Error:', error.message);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Pricing API Error]', err);
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
