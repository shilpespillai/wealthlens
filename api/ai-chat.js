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
  let systemContext = "Act as an elite, high-performance financial advisor.";
  if (type === 'tax') {
    systemContext = "Act as a world-class tax optimization expert specialized in global taxation and wealth preservation.";
  } else if (type === 'sentiment') {
    systemContext = "Act as a forensic market researcher and senior property analyst.";
  }

  const fullPrompt = `
    ${systemContext}
    
    CRITICAL INSTRUCTION: You must provide hyper-personalized advice. 
    DO NOT use generic disclaimers or "resilient market" filler unless supported by the specific data in the prompt.
    COMPUTE calculations the user can't easily do. Use the EXACT currency and amounts provided.
    
    User Detail & Task: ${prompt}
    
    Return a strictly valid JSON response. 
    IF type is 'coach': { "assessment": "sharp 2-sentence mathematical evaluation", "tone": "encouraging|urgent|excellent", "recommendations": [{ "action": "specific task", "impact": "mathematical result of this task", "priority": "high|medium|low" }], "key_insights": ["data-driven insight from prompt"], "closing_motivation": "compelling closing" }
    IF type is 'tax': { "summary": "impact-focused summary", "strategies": [{ "title": "strategy name", "description": "detailed how-to", "estimated_savings": "approx amount in user currency", "timeframe": "string", "difficulty": "Easy|Moderate|Complex" }], "account_recommendations": [{ "account_type": "string", "benefits": "tax savings focus", "contribution_limits": "current info" }], "withdrawal_strategy": "string", "key_tips": ["advanced tip"] }
    IF type is 'sentiment': { "sentiment": "bullish|neutral|bearish", "summary": "1-sentence summary of the specific asset and currency", "key_trends": ["specific trigger/event"], "outlook": "growth projections", "risks": ["downside triggers"], "recommended_rates": { "conservative": number, "moderate": number, "aggressive": number } }

    Ensure all advice is mathematically sound and DIRECTLY references the numbers/scenarios provided.
    Return ONLY valid JSON.
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
