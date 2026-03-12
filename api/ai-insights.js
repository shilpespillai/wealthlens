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

  const prompt = `
    Act as a professional global property investment analyst. 
    Analyze the property market for: ${suburb}, ${state}, ${country} (${postcode || 'N/A'}).
    
    Return a strictly valid JSON response containing the following fields:
    - medianPrice: estimated current median house price (number)
    - currency: the local currency code (e.g., USD, AUD, GBP, INR)
    - rentalYield: estimated annual rental yield percentage (number, e.g., 4.5)
    - vacancyRate: estimated current vacancy rate percentage (number, e.g., 1.2)
    - investmentScore: a score out of 100 representing investment potential (number)
    - sentiment: a 2-word market sentiment (e.g., "Bullish / Strong", "Neutral / Monitor", "Bearish / Slow")
    - insights: a 3-sentence summary of the local market conditions, growth drivers, and risks.
    - demographics: an array of objects with { category: string, items: { label: string, value: number }[] }
    - historicalSeries: an array of 5 objects representing the last 5 years with { year: number, value: number }
    - projects: an array of 3 major infrastructure or development projects in the area.

    Ensure the data is as realistic as possible for the year 2024/2025.
    If you do not have specific data, provide your best professional estimate based on regional trends.
    Return ONLY JSON. No markdown formatting.
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
