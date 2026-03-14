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

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'premium_price')
        .single();

      // Default to 10 if not set or table missing
      const price = data?.value || "10";
      return res.status(200).json({ price });
    }

    if (req.method === 'POST') {
      const { price, adminEmail } = req.body;

      if (adminEmail !== 'admin@wealthlens.com') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'premium_price', value: price.toString() }, { onConflict: 'key' });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Pricing API Error]', err);
    // If table doesn't exist, just return default for GET, but error for POST
    if (req.method === 'GET') return res.status(200).json({ price: "10" });
    return res.status(500).json({ error: err.message });
  }
}
