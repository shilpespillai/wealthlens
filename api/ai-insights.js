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
    MANDATORY: Use the Google Search tool to find CURRENT 2024/2025 statistics for: ${suburb}, ${state}, ${country}.
    Your response must be based on ACTIVE market listings, recent auction results, and current vacancy rates.

    ${userContext ? `The user providing the query has the following financial profile: \n${userContext}\nDirectly evaluate if this suburb is a good fit for their budget and goals.` : ""}

    Context: ${countryContext}
    
    CRITICAL INSTRUCTION: You must provide hyper-personalized advice utilizing REAL-TIME data. 
    MANDATORY: Use Google Search to retrieve the absolute latest 2024/2025 interest rates, inflation figures, and region-specific market news BEFORE responding.
    DO NOT use generic disclaimers. Every insight must be grounded in a specific current event or data point from your search results.
    - If you do not have current data for this specific locale, infer it from the nearest Tier 1 economic hub in ${state}, ${country}.
    - Prices and yields MUST be realistic for 2024/2025.
    
    Return a strictly valid JSON response with these exact fields:
    - medianPrice: number (current median house price in local units)
    - currency: local currency code
    - rentalYield: annual gross yield % (number)
    - investmentScore: score out of 100
    - sentiment: "Bullish / Strong" | "Neutral / Monitor" | "Bearish / Slow"
    - insights: 3 sentences of PURE DATA and LOCAL CATALYSTS. No fluff.
    - indicators: { vacancyRate: number, listingsTrend: number, monthsSupply: number, dom: number, growth3mo: number, growth12mo: number, volumeTrend: number, landConstraint: number }
    - categoryScores: { affordability: number, lifestyle: number, transport: number, schools: number, safety: number }
    - historicalSeries: array of 5 years { year, value }
    - projects: array of 3 specific CURRENT local developments.
    - demographics: array of objects { category, items: [{ label, value }] }

    Return ONLY valid JSON.
  `;

  try {
    let result;
    
    let response;
    
    const bodyWithSearch = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }]
    };

    const bodyWithoutSearch = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    if (geminiKey) {
      // Attempt v1beta with latest model (supports search tools)
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyWithSearch)
      });
      
      let data;
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn("[AI Insights] v1beta request failed (Status: " + response.status + "). Retrying without tools...", err);
        
        // Secondary fallback on v1beta without tools
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyWithoutSearch)
        });
        data = await response.json();
      } else {
        data = await response.json();
      }

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
