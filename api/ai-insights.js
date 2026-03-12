export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { suburb, state, country, postcode, userContext } = req.body;
  
  if (!suburb || !country) {
    return res.status(400).json({ error: 'Missing required parameters: suburb and country' });
  }

  // ... (rest of the setup)
  const isAustralia = country === 'AU';
  const countryContext = isAustralia 
    ? `This is an Australian suburb. Use AUD pricing. Include auction clearance rates, proximity to CBD, public transport scores, and state-specific market dynamics (e.g. stamp duty impacts, population growth corridors). Reference CoreLogic-style data patterns.`
    : `Use the local currency and regional market conventions for ${country}.`;

  const prompt = `
    Act as a senior real estate research director with 20 years experience in the ${country} market.
    Perform a deep-dive analysis for: ${suburb}, ${state}, ${country} (postcode: ${postcode || 'N/A'}).

    ${userContext ? `The user providing the query has the following financial profile: \n${userContext}\nDirectly evaluate if this suburb is a good fit for their budget and goals.` : ""}

    Context: ${countryContext}
    
    CRITICAL: 
    - NEVER use generic filler like "well-established suburb" or "showing resilience" unless you can provide a specific local catalyst (e.g. a new rail link, rezoning, or industrial hub expansion).
    - If you do not have current data for this specific locale, infer it from the nearest Tier 1 economic hub in ${state}, ${country}.
    - Prices and yields MUST be realistic for 2024/2025.
    
    Return a strictly valid JSON response with these exact fields:
    - medianPrice: number (current median house price in local units)
    - currency: local currency code
    - rentalYield: annual gross yield % (number)
    - vacancyRate: vacancy rate % (number)
    - investmentScore: score out of 100
    - sentiment: "Bullish / Strong" | "Neutral / Monitor" | "Bearish / Slow"
    - insights: 3 sentences of PURE DATA and LOCAL CATALYSTS. No fluff.
    - demographics: array of objects { category, items: [{ label, value }] }
    - historicalSeries: array of 5 years { year, value }
    - projects: array of 3 specific CURRENT local developments.

    Return ONLY valid JSON.
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
