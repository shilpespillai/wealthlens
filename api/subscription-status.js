import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required', isActive: false });
  }

  try {
    // Admin always gets premium
    if (email === 'admin@wealthlens.com') {
      return res.status(200).json({ isActive: true, isAdmin: true });
    }

    const { data, error } = await supabase
      .from('users')
      .select('is_premium, email')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found, which is normal for new users
      console.error('[Subscription Check Error]', error);
      return res.status(500).json({ error: 'Database error', isActive: false });
    }

    return res.status(200).json({ isActive: data?.is_premium || false });
  } catch (err) {
    console.error('[Subscription Check Error]', err);
    return res.status(500).json({ error: err.message, isActive: false });
  }
}
