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
      // Use the generic user_data vault for global settings
      const { data, error } = await supabase
        .from('user_data')
        .select('payload')
        .eq('key', 'global_app_pricing')
        .maybeSingle();

      const price = data?.payload?.price || "29.99";
      return res.status(200).json({ price });
    }

    if (req.method === 'POST') {
      const { price, adminEmail } = req.body;

      if (adminEmail !== 'admin@wealthlens.com') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Store in the global app settings vault
      const { error } = await supabase
        .from('user_data')
        .upsert({ 
          key: 'global_app_pricing', 
          payload: { price: price.toString(), updated_by: adminEmail }
        }, { onConflict: 'key' });

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
