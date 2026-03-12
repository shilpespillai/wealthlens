export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { suburb, state, country, postcode } = req.body;
  
  if (!suburb || !country) {
    return res.status(400).json({ error: 'Missing required parameters: suburb and country' });
  }

  // Support both Gemini and OpenAI
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return res.status(500).json({ 
      error: 'AI API keys not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY in environment variables.' 
    });
  }

  const isAustralia = country === 'AU';
  const countryContext = isAustralia 
    ? `This is an Australian suburb. Use AUD pricing. Include auction clearance rates, proximity to CBD, public transport scores, and state-specific market dynamics (e.g. stamp duty impacts, population growth corridors). Reference CoreLogic-style data patterns.`
    : `Use the local currency and regional market conventions for ${country}.`;

  const prompt = `
    Act as a professional global property investment analyst with deep expertise in ${country} real estate markets.
    Analyze the property market for: ${suburb}, ${state}, ${country} (postcode: ${postcode || 'N/A'}).

    Context: ${countryContext}
    
    Return a strictly valid JSON response with these exact fields:
    - medianPrice: current median house price as a number (e.g. 1250000 for AUD or 450000 for USD)
    - currency: local currency code (e.g. "AUD", "USD", "GBP", "INR", "SGD")
    - rentalYield: estimated annual gross rental yield as a percentage number (e.g. 4.5)
    - vacancyRate: current vacancy rate as a percentage number (e.g. 1.2)
    - investmentScore: a score out of 100 representing investment potential
    - sentiment: a short market sentiment phrase (e.g. "Bullish / Strong", "Neutral / Monitor", "Bearish / Slow")
    - insights: a 3-sentence professional summary of local market conditions, key growth drivers, and risks
    - demographics: array of objects with { category: string, items: [{ label: string, value: number }] }
    - historicalSeries: array of 5 objects representing last 5 years: [{ year: number, value: number }]
    - projects: array of 3 strings describing major local infrastructure or development projects

    Use 2024/2025 data. If you don't have exact figures, provide your best professional estimate based on regional trends.
    Return ONLY valid JSON. No markdown, no explanation, no code blocks.
  `;

  try {
    let result;
    
    if (geminiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      result = JSON.parse(text);
    } else {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });
      const data = await response.json();
      result = JSON.parse(data.choices?.[0]?.message?.content);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('[AI Insights Error]', error);
    return res.status(500).json({ error: 'Failed to generate AI insights', details: error.message });
  }
}
