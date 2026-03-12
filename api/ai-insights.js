export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { suburb, state, country, postcode, userContext } = req.body;
  
  if (!suburb || !country) {
    return res.status(400).json({ error: 'Missing required parameters: suburb and country' });
  }

  // Support both Gemini and OpenAI
  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    console.error("[AI Insights] API keys are missing in the environment variables.");
    return res.status(500).json({ 
      error: 'AI service configuration incomplete. Please verify API keys in the production environment.' 
    });
  }
  const isAustralia = country === 'AU';
  const countryContext = isAustralia 
    ? `This is an Australian suburb. Use AUD pricing. Include auction clearance rates, proximity to CBD, public transport scores, and state-specific market dynamics (e.g. stamp duty impacts, population growth corridors). Reference CoreLogic-style data patterns.`
    : `Use the local currency and regional market conventions for ${country}.`;

  const prompt = `
    Act as a senior real estate research director with 20 years experience in the ${country} market.
    SEARCH the internet for the latest 2024/2025 median house prices, rental yields, and vacancy rates for: ${suburb}, ${state}, ${country} (postcode: ${postcode || 'N/A'}).
    REFERENCE currently active local infrastructure projects and developments.

    ${userContext ? `The user providing the query has the following financial profile: \n${userContext}\nDirectly evaluate if this suburb is a good fit for their budget and goals.` : ""}

    Context: ${countryContext}
    
    CRITICAL INSTRUCTION: You must provide hyper-personalized advice. 
    SEARCH the internet for current 2024/2025 market trends, interest rates, and asset-specific news for the user's region before formulating your advice.
    DO NOT use generic disclaimers or "resilient market" filler. CALCULATE impacts based on real-world current events.
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
          tools: [{ google_search_retrieval: {} }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("[AI Insights] Gemini API Error:", data.error);
        return res.status(response.status).json({ 
          error: data.error?.message || 'Gemini API connection failed.' 
        });
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        console.warn("[AI Insights] No content returned from Gemini (Safety filter or empty response)");
        throw new Error('AI engine returned no analysis. The query might have been filtered.');
      }
      
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error("[AI Insights] Failed to parse AI JSON:", text);
        throw new Error('AI returned an invalid data format.');
      }
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
