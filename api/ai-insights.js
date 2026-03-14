export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { suburb, state, country, postcode, userContext, propertyType = 'house' } = req.body;
  
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
    Act as a senior property investment strategist with 20 years experience in the ${country} market.
    MANDATORY: Use the Google Search tool to find CURRENT 2025/2026 statistics for ${propertyType}s in ${suburb}, ${state}, ${country}.
    
    Your goal is to provide a professional-grade suburb profile grounded in these 6 Critical Parameters:
    1. Days on Market (DOM) & Vendor Discounting: Compare ${suburb} ${propertyType} DOM to the city average.
    2. Stock on Market (SOM%): Identify if scarcity exists (Goal: < 2%).
    3. Ripple Effect Potential: Compare ${suburb} median to neighboring suburbs.
    4. Infrastructure & Gentrification: Detail Tier 1 projects (2026-2030) and lifestyle catalysts.
    5. Building Approvals (Supply Trap): Identify if high new supply is diluting growth.
    6. Owner-Occupier vs Investor Ratio: Evaluate market stability.

    Your response must be STRICTLY for ${propertyType}s.
    
    ${userContext ? `The user providing the query has the following financial profile: \n${userContext}\nEvaluate if this ${suburb} ${propertyType} matches their unique goals.` : ""}

    Context: ${countryContext}
    
    MANDATORY: Return a strictly valid JSON response with these exact fields:
    - medianPrice: number
    - propertyType: string ("${propertyType}")
    - currency: local currency code
    - rentalYield: number (%)
    - investmentScore: number (0-100)
    - sentiment: "Bullish / Strong" | "Neutral / Monitor" | "Bearish / Slow"
    - strategistVerdict: "Capital Growth Play" | "Yield Play" | "Pass"
    - insights: 3 sentences of PURE DATA on infrastructure and catalysts.
    - strategistAnalysis: {
        domVsCityAvg: string (e.g., "15 days vs 28 city avg"),
        somPercentage: number (Stock on Market %),
        ripplepotential: string (Comparison to neighboring suburbs),
        supplyTrapRisk: "High" | "Medium" | "Low",
        redFlags: array of 2 strings,
        tenantFit: string (matching demographic to stock)
      }
    - indicators: { vacancyRate: number, listingsTrend: number (%), monthsSupply: number, dom: number, growth3mo: number (%), growth12mo: number (%), volumeTrend: number, landConstraint: number (scale 1-10) }
    - categoryScores: { affordability: number, lifestyle: number, transport: number, schools: number, safety: number }
    - historicalSeries: array of 5 years { year, value }
    - projects: array of 3 objects { title: string, desc: string }
    - demographics: array of objects { category, items: [{ label, value }] }

    MANDATORY: Return ONLY the JSON object. No preamble, no markdown.
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
      // Use stable v1 with Gemini 2.5 Flash (Confirmed 2026 Standard)
      response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyWithSearch)
      });
      
      let data;
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.warn("[AI Insights] Gemini 2.5 request failed. Retrying without tools...", err);
        
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
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
        // Robust cleanup for Markdown code blocks or leading/trailing whitespace
        let cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
        // Remove potential AI preamble or trailing text if JSON is embedded
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
        result = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("[AI Insights] Failed to parse AI JSON. Raw text:", text);
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

export const config = {
  maxDuration: 120,
};
