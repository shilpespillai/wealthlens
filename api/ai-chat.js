export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, type } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!geminiKey) {
    return res.status(500).json({ 
      error: 'Gemini API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in environment variables.' 
    });
  }

  // System instructions based on the "type" of AI service requested
  let systemContext = "Act as a professional financial advisor and investment coach.";
  if (type === 'tax') {
    systemContext = "Act as a tax optimization expert and financial planner specialized in global taxation strategies.";
  } else if (type === 'sentiment') {
    systemContext = "Act as a market sentiment analyst and technical property researcher.";
  }

  const fullPrompt = `
    ${systemContext}
    
    User Query: ${prompt}
    
    Return a strictly valid JSON response. 
    IF type is 'coach': { "assessment": "string", "tone": "string", "recommendations": [{ "action": "string", "impact": "string", "priority": "string" }], "key_insights": ["string"], "closing_motivation": "string" }
    IF type is 'tax': { "summary": "string", "strategies": [{ "title": "string", "description": "string", "estimated_savings": "string", "timeframe": "string", "difficulty": "string" }], "account_recommendations": [{ "account_type": "string", "benefits": "string", "contribution_limits": "string" }], "withdrawal_strategy": "string", "key_tips": ["string"] }
    IF type is 'sentiment': { "sentiment": "bullish|neutral|bearish", "summary": "string", "key_trends": ["string"], "outlook": "string", "risks": ["string"], "recommended_rates": { "conservative": number, "moderate": number, "aggressive": number } }

    Ensure all numbers and advice are mathematically sound and personalized to the user's situation described in the prompt.
    Return ONLY valid JSON. No markdown, no explanation, no code blocks.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Gemini API failure');
    }
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = JSON.parse(text);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[AI Chat Error]', error);
    return res.status(500).json({ error: 'Failed to generate AI response', details: error.message });
  }
}
