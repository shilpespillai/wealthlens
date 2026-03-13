export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { endpoint, state, suburb, postcode } = req.query;
  const apiKey = process.env.DOMAIN_API_KEY;

  if (!apiKey) {
    console.error("[Domain Proxy] DOMAIN_API_KEY is not set in environment variables.");
    return res.status(500).json({ 
      error: 'Domain API integration is not configured. Please add DOMAIN_API_KEY to your Vercel Environment Variables.',
      setup_required: true 
    });
  }

  try {
    let url = '';
    if (endpoint === 'demographics') {
      url = `https://api.domain.com.au/v2/demographics/${state}/${suburb}/${postcode}`;
    } else if (endpoint === 'performance') {
      url = `https://api.domain.com.au/v2/suburbPerformanceStatistics/${state}/${suburb}/${postcode}?propertyCategory=house&periodSize=years&totalPeriods=5`;
    } else {
      return res.status(400).json({ error: 'Invalid endpoint' });
    }

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Domain Proxy Error]', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
