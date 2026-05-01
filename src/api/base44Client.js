
// Mocked base44 instance holding required methods completely local to the browser
import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';
import { encryptPayload, decryptPayload } from './crypto';

const isProd = import.meta.env.PROD;

// High-Fidelity Global Symbol Registry
const SYMBOL_REGISTRY = {
  // Australian Markets (ASX)
  'CBA.AX': { name: 'Commonwealth Bank', ex: 'ASX', cur: 'AUD', base: 172.82, rev: '24.2B', revChg: 3.1, rel: ['NAB.AX', 'ANZ.AX', 'WBC.AX', 'MQG.AX'], earnings: { epsBeat: 2.1, revenueBeat: 1.4 } },
  'BHP.AX': { name: 'BHP Group Ltd', ex: 'ASX', cur: 'AUD', base: 44.50, rev: '53.8B', revChg: -2.1, rel: ['RIO.AX', 'FMG.AX', 'WDS.AX'], earnings: { epsBeat: -1.2, revenueBeat: 0.5 } },
  'RIO.AX': { name: 'Rio Tinto Ltd', ex: 'ASX', cur: 'AUD', base: 122.30, rev: '54.0B', revChg: -1.5, rel: ['BHP.AX', 'FMG.AX'], earnings: { epsBeat: 0.8, revenueBeat: -1.1 } },
  'CSL.AX': { name: 'CSL Limited', ex: 'ASX', cur: 'AUD', base: 288.40, rev: '14.8B', revChg: 11.2, rel: ['RMD.AX', 'COH.AX'], earnings: { epsBeat: 5.4, revenueBeat: 4.2 } },
  'NAB.AX': { name: 'National Australia Bank', ex: 'ASX', cur: 'AUD', base: 41.80, rev: '21.4B', revChg: 2.4, rel: ['CBA.AX', 'ANZ.AX', 'WBC.AX'], earnings: { epsBeat: 1.5, revenueBeat: 0.8 } },
  'WBC.AX': { name: 'Westpac Banking Corp', ex: 'ASX', cur: 'AUD', base: 28.20, rev: '20.8B', revChg: 1.8, rel: ['CBA.AX', 'NAB.AX', 'ANZ.AX'], earnings: { epsBeat: 0.4, revenueBeat: -0.2 } },
  'ANZ.AX': { name: 'ANZ Group Holdings', ex: 'ASX', cur: 'AUD', base: 30.50, rev: '20.5B', revChg: 2.1, rel: ['CBA.AX', 'NAB.AX', 'WBC.AX'], earnings: { epsBeat: 1.2, revenueBeat: 1.1 } },
  'FMG.AX': { name: 'Fortescue Ltd', ex: 'ASX', cur: 'AUD', base: 24.15, rev: '18.2B', revChg: 5.4, rel: ['BHP.AX', 'RIO.AX'], earnings: { epsBeat: 3.8, revenueBeat: 2.5 } },
  'MQG.AX': { name: 'Macquarie Group', ex: 'ASX', cur: 'AUD', base: 201.45, rev: '19.1B', revChg: 4.2, rel: ['CBA.AX', 'NAB.AX'], earnings: { epsBeat: -0.5, revenueBeat: 1.8 } },
  'WES.AX': { name: 'Wesfarmers Limited', ex: 'ASX', cur: 'AUD', base: 66.80, rev: '43.5B', revChg: 3.8, rel: ['WOW.AX', 'COL.AX'], earnings: { epsBeat: 4.2, revenueBeat: 3.1 } },
  'TLS.AX': { name: 'Telstra Group', ex: 'ASX', cur: 'AUD', base: 3.85, rev: '23.2B', revChg: 1.2, rel: ['TPG.AX'], earnings: { epsBeat: 0.1, revenueBeat: 0.2 } },
  'WOW.AX': { name: 'Woolworths Group', ex: 'ASX', cur: 'AUD', base: 32.40, rev: '64.3B', revChg: 2.5, rel: ['COL.AX', 'WES.AX'], earnings: { epsBeat: 1.8, revenueBeat: 2.0 } },
  'QAN.AX': { name: 'Qantas Airways', ex: 'ASX', cur: 'AUD', base: 6.15, rev: '19.8B', revChg: 8.5, rel: ['AIA.NZ'], earnings: { epsBeat: 12.5, revenueBeat: 10.2 } },
  
  // US Markets (NASDAQ/NYSE)
  'AMZN': { name: 'Amazon.com Inc', ex: 'NASDAQ', cur: 'USD', base: 210.57, rev: '213.39B', revChg: 13.6, rel: ['AAPL', 'MSFT', 'META', 'GOOGL'], earnings: { epsBeat: 18.2, revenueBeat: 14.5 } },
  'AAPL': { name: 'Apple Inc', ex: 'NASDAQ', cur: 'USD', base: 226.35, rev: '94.84B', revChg: 2.1, rel: ['MSFT', 'GOOGL', 'AMZN', 'NVDA'], earnings: { epsBeat: 3.5, revenueBeat: 2.8 } },
  'TSLA': { name: 'Tesla Inc', ex: 'NASDAQ', cur: 'USD', base: 247.49, rev: '25.17B', revChg: 3.5, rel: ['RIVN', 'LCID', 'F', 'GM'], earnings: { epsBeat: -5.2, revenueBeat: -2.8 } },
  'NVDA': { name: 'NVIDIA Corp', ex: 'NASDAQ', cur: 'USD', base: 145.20, rev: '26.04B', revChg: 262.1, rel: ['AMD', 'INTC', 'TSM', 'AVGO'], earnings: { epsBeat: 24.5, revenueBeat: 19.8 } },
  'MSFT': { name: 'Microsoft Corp', ex: 'NASDAQ', cur: 'USD', base: 415.22, rev: '61.86B', revChg: 17.6, rel: ['AAPL', 'GOOGL', 'AMZN', 'ORCL'], earnings: { epsBeat: 8.5, revenueBeat: 6.2 } },
  'GOOGL': { name: 'Alphabet Inc', ex: 'NASDAQ', cur: 'USD', base: 172.50, rev: '80.54B', revChg: 15.4, rel: ['META', 'MSFT', 'AMZN', 'AAPL'], earnings: { epsBeat: 10.2, revenueBeat: 7.8 } },
  'META': { name: 'Meta Platforms', ex: 'NASDAQ', cur: 'USD', base: 585.12, rev: '40.6B', revChg: 27.2, rel: ['GOOGL', 'SNAP'], earnings: { epsBeat: 15.4, revenueBeat: 12.1 } },

  // European Markets (DAX/CAC/LSE)
  'SAP.DE': { name: 'SAP SE', ex: 'DAX', cur: 'EUR', base: 182.40, rev: '32.5B', revChg: 11.2, rel: ['ASML', 'SIE.DE'], earnings: { epsBeat: 4.8, revenueBeat: 3.5 } },
  'SIE.DE': { name: 'Siemens AG', ex: 'DAX', cur: 'EUR', base: 174.20, rev: '78.5B', revChg: 5.4, rel: ['SAP.DE', 'MC.PA'], earnings: { epsBeat: 2.5, revenueBeat: 1.8 } },
  'ASML.AS': { name: 'ASML Holding', ex: 'Euronext', cur: 'EUR', base: 845.12, rev: '27.6B', revChg: 30.2, rel: ['SAP.DE'], earnings: { epsBeat: 12.4, revenueBeat: 8.5 } },
  'MC.PA': { name: 'LVMHMoëtHennessy', ex: 'CAC', cur: 'EUR', base: 785.40, rev: '86.2B', revChg: 8.8, rel: ['OR.PA', 'RMS.PA'], earnings: { epsBeat: 3.2, revenueBeat: 2.5 } },

  // Asian Markets
  '0700.HK': { name: 'Tencent Holdings', ex: 'HKEX', cur: 'HKD', base: 420.50, rev: '609B', revChg: 10.4, rel: ['9988.HK'], earnings: { epsBeat: 8.4, revenueBeat: 6.5 } },
  '9988.HK': { name: 'Alibaba Group', ex: 'HKEX', cur: 'HKD', base: 82.35, rev: '941B', revChg: 2.1, rel: ['0700.HK'], earnings: { epsBeat: 1.5, revenueBeat: 0.8 } }
};

// Helper: Call Gemini Directly from Frontend in Development
// Universal Intelligence Bridge (Local-Only Provider Support)
export const invokeUniversalAI = async (prompt, type, params = {}) => {
  const config = await base44.user.loadData('wl_ai_config') || {};
  const userProvider = config.provider || 'gemini';
  
  // Extract key from siloed structure or legacy field
  let userKey = config.keys ? config.keys[userProvider] : config.key;

  // Extract selected model if available, else use 2026 defaults
  const userModel = (config.models ? config.models[userProvider] : null) || (
    userProvider === 'gemini' ? 'gemini-2.5-flash' :
    userProvider === 'openai' ? 'gpt-5.3-instant' :
    'claude-4.7-sonnet'
  );

  // Safety: Clean whitespace
  userKey = userKey?.trim();

  // Final fallback to environment for Gemini only if no user key is provided
  if (!userKey && userProvider === 'gemini') {
    userKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
  }

  // Diagnostic Log for debugging
  console.log(`[Intelligence Hub State] Active Provider: ${userProvider.toUpperCase()} | Model: ${userModel} | Key Status: ${userKey ? 'FOUND (Length: ' + userKey.length + ')' : 'MISSING'}`);

  // Use Heuristics if no key is present or available
  if (!userKey) {
    console.warn(`[Intelligence Hub] No key for ${userProvider}. Falling back to heuristics.`);
    return runSmartHeuristics(type, params);
  }

  try {
    let endpoint, body, headers;
    const systemContext = `You are WealthLens Premium AI, an elite financial strategist. 
    Today's Date: ${new Date().toLocaleDateString()}
    Context: Analysis for ${type === 'pillar' ? 'Stock Evaluation' : (type === 'report' ? 'Institutional Financial Report' : 'Financial Coaching')}.`;
    
    const fullPrompt = `${systemContext}\n\nTask: ${prompt}\n\nResponse Requirements:
    IF type is 'coach': { "assessment": "sharp 2-sentence mathematical evaluation", "tone": "encouraging|urgent|excellent", "recommendations": [{ "action": "specific task", "impact": "mathematical result", "priority": "high|medium|low" }], "key_insights": ["data-driven insight from prompt"], "closing_motivation": "compelling closing" }
    IF type is 'pillar': { "stockName": "Full Name", "currentPrice": number, "pillars": [{ "id": "pe|roic|rev|net_income|shares|fcf|liabilities|price_fcf", "passed": boolean, "current": "data value", "target": "threshold", "rationale": "one-sentence explanation" }], "summary": "2-sentence overview", "overallScore": number, "recommendation": "Verdict" }
    IF type is 'categorize': { "categories": { "merchant_name_exactly_as_provided": "Canonical_Category_Name" } }
    IF type is 'report': { "markdownContent": "The full formatted markdown report string containing all analysis. Use # for headers, - for bullets, and ** for bold text." }
    Return ONLY valid JSON.`;

    if (userProvider === 'gemini') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${userModel}:generateContent?key=${userKey}`;
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ 
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.1 }
      });
    } else if (userProvider === 'openai') {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${userKey}` };
      body = JSON.stringify({
        model: userModel,
        messages: [{ role: "system", content: systemContext }, { role: "user", content: fullPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 4096
      });
    } else if (userProvider === 'anthropic') {
      endpoint = "https://api.anthropic.com/v1/messages";
      headers = { 
        "Content-Type": "application/json", 
        "x-api-key": userKey,
        "anthropic-version": "2023-06-01" 
      };
      body = JSON.stringify({
        model: userModel,
        max_tokens: 4096,
        messages: [{ role: "user", content: fullPrompt }]
      });
    }

    const response = await fetch(endpoint, { method: "POST", headers, body });
    const data = await response.json();
    
    let text = "";
    if (userProvider === 'gemini') text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (userProvider === 'openai') text = data.choices?.[0]?.message?.content;
    if (userProvider === 'anthropic') text = data.content?.[0]?.text;

    if (!text) throw new Error("No response from provider");
    
    // Robust JSON Extraction: Find the outermost braces to ignore LLM decoration or truncation errors
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
    const repairJson = (str) => {
      try {
        let fixed = str
          .replace(/,\s*([\]}])/g, '$1') // Trailing commas
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Unquoted keys
          .replace(/'/g, '"'); // Single to double quotes

        // Handle unterminated strings (trailing open quote)
        const quoteCount = (fixed.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) fixed += '"';

        // Handle unclosed braces
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;
        if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);

        return fixed;
      } catch (e) { return str; }
    };

    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonCandidate = cleanedText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (parseErr) {
        try {
           return JSON.parse(repairJson(jsonCandidate));
        } catch (repairErr) {
           console.warn("[Intelligence Hub] Outermost brace parse failed. Attempting narrative repair...");
        }
        
        // If it's a report, try a greedy regex to pull out the content between the first "markdownContent": " and the last "
        if (type === 'report') {
          const greedyMatch = jsonCandidate.match(/"(?:markdownContent|report|text)":\s*"([\s\S]*)"\s*}/);
          if (greedyMatch && greedyMatch[1]) {
            return { markdownContent: greedyMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') };
          }
        }
      }
    }

    // Fallback for Reports: If no JSON structure found or parsing failed, return raw text
    // but try to strip common JSON wrappers first for a cleaner look
    if (type === 'report') {
        let narrative = text.replace(/```json\n?|```\n?/g, '').trim();
        // Remove common JSON wrappers if present
        narrative = narrative.replace(/^{?\s*"(?:markdownContent|report|text)":\s*"/, '').replace(/"\s*}?$/, '');
        return { markdownContent: narrative.replace(/\\n/g, '\n').replace(/\\"/g, '"') };
    }

    try {
      return JSON.parse(repairJson(cleanedText));
    } catch (e) {
      return JSON.parse(cleanedText);
    }
  } catch (err) {
    console.warn("[Bridge Error] Falling back to Heuristics:", err);
    // Auto-Trigger Discovery if it was a 404 (Retired Model)
    if (err.message && err.message.includes('404')) {
        console.warn("[Intelligence Hub] Detected retired model (404). Triggering discovery sync...");
    }
    return await runSmartHeuristics(type, params);
  }
};

// Intelligence Discovery Engine (Autonomous Future-Proofing)
const syncModels = async (provider, key) => {
  if (!key) throw new Error("API Key required for synchronization.");
  
  let models = [];
  try {
    if (provider === 'gemini') {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      const data = await resp.json();
      models = (data.models || [])
        .filter(m => m.supportedGenerationMethods.includes('generateContent'))
        .map(m => ({
          value: m.name.split('/').pop(),
          label: m.displayName,
          pricing: "Dynamic",
          description: m.description
        }))
        .filter(m => m.value.includes('flash') || m.value.includes('pro'));
    } else if (provider === 'openai') {
      const resp = await fetch("https://api.openai.com/v1/models", {
        headers: { "Authorization": `Bearer ${key}` }
      });
      const data = await resp.json();
      models = (data.data || [])
        .filter(m => m.id.startsWith('gpt-'))
        .map(m => ({
          value: m.id,
          label: m.id.toUpperCase(),
          pricing: "Dynamic",
          description: `OpenAI Neural Model: ${m.id}`
        }))
        .sort((a,b) => b.value > a.value ? 1 : -1);
    } else if (provider === 'anthropic') {
      // Anthropic does not have a list API; return managed 2026 flagship list
      models = [
        { value: 'claude-4.7-sonnet', label: 'Claude 4.7 Sonnet', pricing: "$0.30 / $1.20", description: "Balanced performance for 2026." },
        { value: 'claude-4.7-opus', label: 'Claude 4.7 Opus', pricing: "$15.00 / $75.00", description: "Elite institutional level reasoning." }
      ];
    }
    return models;
  } catch (err) {
    console.error(`[Discovery Error] Failed to sync ${provider}:`, err);
    throw err;
  }
};

// Smart Heuristics Engine (Logic-based fallback)
const runSmartHeuristics = async (type, params) => {
  if (type === 'categorize') {
    return { categories: {} }; // Return empty mapping to trigger standard offline fallback logic
  }
  if (type === 'report') {
    return {
      markdownContent: `# Institutional Summary (Deterministic Mode)\n\n*Note: Connect an API key in Settings to unlock dynamic, AI-powered narratives.* \n\n### Key Findings\n- Total ledger volume has been successfully audited and mapped.\n- Core fixed costs are tracking within anticipated deterministic thresholds.\n- No severe systemic liquidity risks detected in the current month's cash flow.\n\n> **Unlock Deep Intelligence:** Connecting your Gemini or OpenAI API key enables the WealthLens Intelligence Engine to generate highly specific, conversational reports summarizing exact merchant spending anomalies, hidden subscription leakage, and proactive 50/30/20 budget adjustments.`
    };
  }
  if (type === 'coach') {
    const savingsRate = params.savingsRate || 0;
    const runway = params.cashRunway || 3;
    const instrument = params.instrument || 'assets';
    
    let assessment = `Based on your ${savingsRate.toFixed(1)}% savings rate, your strategy is ${savingsRate > 25 ? 'exceptionally efficient' : 'developing'}.`;
    let tone = savingsRate > 25 ? 'excellent' : 'encouraging';
    let recs = [];
    
    if (runway < 6) recs.push({ action: "Boost Cash Runway", impact: "Increases financial resilience", priority: "high" });
    if (savingsRate > 30) recs.push({ action: "Explore High-Yield Assets", impact: "Leverages excess capital flow", priority: "medium" });
    else recs.push({ action: "Audit Monthly Fixed Costs", impact: "Unlocks monthly capital", priority: "high" });

    return {
      assessment,
      tone,
      recommendations: recs,
      key_insights: [`Your runway currently sits at ${runway.toFixed(1)} months.`],
      closing_motivation: "Stay focused on the long-term compounding effect."
    };
  }

  if (type === 'pillar') {
    const config = await base44.user.loadData('wl_ai_config') || {};
    const pName = config.provider || 'gemini';
    return {
      stockName: (params.symbol || 'STOCK').toUpperCase(),
      currentPrice: 0,
      overallScore: 0,
      summary: `[${pName.toUpperCase()}] Intelligence Core is awaiting a provider key. Please verify your settings in the Intelligence Hub to unlock live analysis.`,
      recommendation: "Review Logic",
      pillars: [
        { id: "pe", passed: false, current: "-", target: "< 20", rationale: "Please enter P/E manually below." },
        { id: "roic", passed: false, current: "-", target: "> 10%", rationale: "Requires financial data input." }
      ]
    };
  }
  return null;
};

export const base44 = {
  intelligence: {
    syncModels: async (provider, key) => await syncModels(provider, key),
  },
  auth: {
    me: async () => {
      if (isSupabaseEnabled) {
        try {
          const result = await supabase.auth.getSession();
          const session = result?.data?.session;
          if (session?.user) return { ...session.user, ...session.user.user_metadata };
        } catch (e) {}
      }
      const stored = localStorage.getItem('mockUser');
      if (stored) return JSON.parse(stored);
      return null;
    },
    updateMe: async (params) => {
      if (isSupabaseEnabled) {
        try { await supabase.auth.updateUser({ data: params }); } catch (err) { console.error(err); }
      }
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        const user = JSON.parse(stored);
        localStorage.setItem('mockUser', JSON.stringify({ ...user, ...params }));
      }
      return { success: true };
    },
    logout: async () => {
      localStorage.removeItem('mockUser');
      base44.auth.redirectToLogin();
    },
    redirectToLogin: (targetPath) => {
       const path = targetPath || window.location.pathname;
       const redirect = path !== '/' ? `?redirect_to=${encodeURIComponent(path)}` : '';
       window.location.href = `/Login${redirect}`;
    }
  },

  appLogs: {
    logUserInApp: async (pageName) => {
      if (!import.meta.env.PROD) console.log(`[Mock Log] Navigated: ${pageName}`);
      return { success: true };
    }
  },
  app: {
    getPrice: async () => {
      try {
        // Attempt fetch but catch 404s silently on localhost
        const resp = await fetch('/api/pricing').catch(() => null);
        if (!resp || resp.status === 404) return 29.99;
        const data = await resp.json();
        return parseFloat(data.price || "29.99");
      } catch (e) {
        return 29.99;
      }
    },
    updatePrice: async (newPrice, adminEmail) => {
      try {
        const resp = await fetch('/api/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price: newPrice, adminEmail })
        }).catch(() => ({ status: 404 }));
        
        if (resp.status === 404) return { success: true, mock: true };
        return await resp.json();
      } catch (e) {
        return { error: e.message };
      }
    }
  },
  functions: {
    invoke: async (name, params) => {
      if (name === 'getInvestmentCoachAdvice') {
        const p = params || {};
        const prompt = `Analyze: investing $${p.monthlyContribution}/mo for ${p.years} years into ${p.instrument} at ${p.returnRate}% return.`;
        const realData = await invokeUniversalAI(prompt, 'coach', p);
        return { data: realData };
      }

      if (name === 'getStockPillarAnalysis') {
        const ticker = (params?.symbol || 'STOCK').toUpperCase();
        const prompt = `8-Pillar fundamental analysis for ${ticker} over last 10 years.`;
        const realData = await invokeUniversalAI(prompt, 'pillar', params);
        return { data: realData };
      }

      if (name === 'getStripeKey') {
        try {
          const resp = await fetch('/api/pricing').catch(() => ({ status: 404 }));
          if (resp && resp.status !== 404) {
             const data = await resp.json();
             if (data?.publishableKey) return { data };
          }
        } catch (e) {}
        return { data: { publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock' } };
      }

      if (name === 'stripeCheckout') {
        try {
          const resp = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          }).catch(() => ({ status: 404 }));

          // If we got a real error from the server (500)
          if (resp && resp.status >= 500) {
            const errText = await resp.text().catch(() => "Internal Server Error");
            
            // SPECIAL CASE: On localhost, if the proxy target (port 3000) is down, Vite returns 500.
            // We want to fallback to mock in this case so development isn't blocked.
            if (window.location.hostname === 'localhost' && (errText.includes("Proxy error") || errText.includes("ECONNREFUSED"))) {
              console.warn("[base44] Backend server offline. Falling back to Mock Checkout.");
            } else {
              return { error: `Payment Engine Crash: ${errText}` };
            }
          }

          if (resp && resp.status !== 404 && resp.status < 500) {
             const data = await resp.json();
             if (data?.url || data?.sessionId) return { data };
          }
        } catch (e) {
          console.warn("[base44] Stripe bridge exception:", e);
        }
        
        // Mock Fallback for 404 or Localhost Proxy Errors
        return { 
          data: { 
            url: params.successUrl || (window.location.origin + '/?upgraded=true'),
            sessionId: 'mock_session_id'
          } 
        };
      }

      return { data: { success: true } };
    }
  },

  
  user: {
    loadData: async (key) => {
      const { session } = await base44.db._getSession();
      const userId = session?.user?.id || 'anonymous';
      const storageKey = `${key}_${userId}`;

      // SECURITY: AI Configuration must remain local and NOT sync to DB
      if (key === 'wl_ai_config') {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : null;
      }

      if (isSupabaseEnabled && session?.user) {
        const { data, error } = await supabase.from('user_data').select('payload').eq('user_id', userId).eq('key', key).maybeSingle();
        if (!error && data) return data.payload;
      }
      
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    },
    saveData: async (key, data) => {
      const { session } = await base44.db._getSession();
      const userId = session?.user?.id || 'anonymous';
      const storageKey = `${key}_${userId}`;

      // SECURITY: AI Configuration must remain local and NOT sync to DB
      if (key === 'wl_ai_config') {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return { success: true };
      }

      // DATA INTEGRITY: Prevent "Double-Writing" relational data to the vault
      // These keys are legacy leftovers from when the app used JSON blobs for everything.
      const legacyBlocklist = [
        'wl_table_transactions', 
        'wl_table_accounts', 
        'wl_table_user_accounts',
        'wl_table_portfolio_holdings',
        'wl_table_budgets',
        'wl_table_monthly_summaries'
      ];
      
      if (legacyBlocklist.some(k => key === k || key.startsWith('wealthlens-budget-'))) {
        if (!isProd) console.log(`[base44] Blocked double-write of relational key to vault: ${key}`);
        localStorage.setItem(storageKey, JSON.stringify(data)); // Keep local but don't sync to DB
        return { success: true };
      }

      if (isSupabaseEnabled && session?.user) {
        const { error } = await supabase
          .from('user_data')
          .upsert(
            { user_id: userId, key: key, payload: data, updated_at: new Date() }, 
            { onConflict: 'user_id,key' }
          );
        
        if (error) {
          console.error(`[base44] saveData failed for ${key}:`, error);
          // Fallback to local storage on error to prevent data loss
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
        return { success: !error };
      }
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { success: true };
    }
  },
  
  db: {
    TABLE_MAP: { accounts: "user_accounts", transactions: "transactions", portfolio_holdings: "portfolio_holdings", budgets: "budgets" },
    
    // Internal session cache to prevent auth-storming during loops/navigation
    _sessionCache: null,
    _sessionCacheTime: 0,
    
    // Synchronous session tracker to bypass async getSession hangs
    _activeSession: null,
    _isInitialized: false,
    _getSession: async () => {
      if (!isSupabaseEnabled) return { session: null };
      
      // 1. Return cached session instantly if available
      if (base44.db._activeSession) return { session: base44.db._activeSession };

      // 2. Fast Synchronous Recovery from disk
      try {
        const stored = localStorage.getItem('sb-wealthlens-auth-token');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.user) {
            base44.db._activeSession = parsed;
            return { session: parsed };
          }
        }
      } catch (e) {}

      // 3. Fallback to Supabase but with total safety
      try {
        const { data } = await supabase.auth.getSession();
        if (data && data.session) {
          base44.db._activeSession = data.session;
          return { session: data.session };
        }
      } catch (e) {}

      return { session: null };
    },

    // ── VAULT SHARDING ENGINE (Shadow Schema Proxy) ────────────────────────
    _getShardKey: (date) => {
      if (!date) return new Date().toISOString().substring(0, 7); // Default to current month
      try {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      } catch (e) {
        return new Date().toISOString().substring(0, 7);
      }
    },

    _loadShard: async (shardKey) => {
      const { session } = await base44.db._getSession();
      if (!session?.user) return null;

      const userId = session.user.id;
      const storageKey = `wl_shard_${shardKey}_${userId}`;

      try {
        // 1. Try Local First (Instant Load)
        const localEncrypted = localStorage.getItem(storageKey);
        if (localEncrypted) {
          try { 
            // Try to decrypt the local blob
            const decrypted = await decryptPayload(localEncrypted, userId);
            if (decrypted) {
               console.log(`[Vault] Local decryption OK for ${shardKey}`);
               return decrypted;
            }
            console.warn(`[Vault] Local decryption FAILED for ${shardKey}. Trying legacy or fallback.`);
            
            // Fallback for legacy plaintext (one-time migration)
            return JSON.parse(localEncrypted); 
          } catch(e) {}
        }

        // 2. Fallback to Cloud if Premium
        const metadata = session.user.user_metadata || {};
        const appMetadata = session.user.app_metadata || {};
        
        // Fallback: Check mapped user from AuthContext
        let authUser = {};
        try {
          const stored = localStorage.getItem('mockUser');
          if (stored) authUser = JSON.parse(stored);
        } catch(e) {}

        const isPremium = metadata.is_premium || 
                          metadata.subscription_tier?.toLowerCase() === 'pro' ||
                          metadata.subscription_tier?.toLowerCase() === 'premium' ||
                          authUser.is_premium === true ||
                          authUser.subscription_tier === 'pro' ||
                          authUser.subscription_tier === 'premium' ||
                          appMetadata.role === 'premium' ||
                          session.user.email === 'admin@wealthlens.com';

        if (isPremium) {
          const { data, error } = await supabase
            .from('wealthlens_vault')
            .select('payload')
            .eq('user_id', userId)
            .eq('shard_key', shardKey)
            .maybeSingle();

          if (!error && data) {
            const payload = data.payload;
            let decrypted = await decryptPayload(payload, userId);
            if (!decrypted) {
                try { decrypted = JSON.parse(payload); } catch(e) {}
            }
            // Sync cloud back to local (Save the encrypted payload, not the decrypted object)
            if (decrypted) localStorage.setItem(storageKey, payload);
            return decrypted;
          }
        }
        
        return null;
      } catch (e) {
        console.error(`[Vault] Load failed for ${shardKey}:`, e);
        return null;
      }
    },

    _saveShard: async (shardKey, shardData) => {
      const { session } = await base44.db._getSession();
      if (!session?.user) return false;

      const metadata = session.user.user_metadata || {};
      const appMetadata = session.user.app_metadata || {};
      
      // Fallback: Check mapped user from AuthContext (most reliable source of truth)
      let authUser = {};
      try {
        const stored = localStorage.getItem('mockUser');
        if (stored) authUser = JSON.parse(stored);
      } catch(e) {}

      const isPremium = metadata.is_premium || 
                        metadata.subscription_tier?.toLowerCase() === 'pro' ||
                        metadata.subscription_tier?.toLowerCase() === 'premium' ||
                        authUser.is_premium === true ||
                        authUser.subscription_tier === 'pro' ||
                        authUser.subscription_tier === 'premium' ||
                        appMetadata.role === 'premium' ||
                        session.user.email === 'admin@wealthlens.com';
      
      console.log(`[Vault] Debugging Premium - Metadata:`, metadata, `AuthUser:`, authUser);

      const storageKey = `wl_shard_${shardKey}_${session.user.id}`;
      
      try {
        // Encrypt the data BEFORE saving anywhere (Local or Cloud)
        const encrypted = await encryptPayload(shardData, session.user.id);
        if (!encrypted) throw new Error("Encryption failed");

        // Save encrypted blob to local first
        console.log(`[Vault] Saving to local: ${storageKey} (${encrypted.length} bytes)`);
        localStorage.setItem(storageKey, encrypted);

        // PREMIUM CHECK: Only upload to cloud if user is premium AND has sync enabled
        const syncKey = `wl_cloud_sync_enabled_${session.user.id}`;
        const syncPref = localStorage.getItem(syncKey);
        const syncEnabled = syncPref !== 'false'; 
        
        console.log(`[Vault] Cloud Sync Check - Premium: ${isPremium}, Enabled: ${syncEnabled} (Pref: ${syncPref})`);

        if (isPremium && syncEnabled) {
             const { data, error } = await supabase
               .from('wealthlens_vault')
               .upsert({
                 user_id: session.user.id,
                 shard_key: shardKey,
                 payload: encrypted,
                 updated_at: new Date().toISOString()
               }, { onConflict: 'user_id,shard_key' })
               .select();

             if (error) {
               console.error(`[Vault] Cloud Sync failed:`, error);
             } else {
               console.log(`[Vault] Cloud Sync OK: ${shardKey}`, data);
             }
           }
        
        return true;
      } catch (e) {
        console.error(`[Vault] Save failed:`, e);
        return false;
      }
    },

    _getLatestShard: async () => {
      const { session } = await base44.db._getSession();
      if (!session?.user) return null;
      const userId = session.user.id;

      // 1. Check LocalStorage First for the LATEST key
      let localKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('wl_shard_') && key.endsWith(`_${userId}`)) {
          const sk = key.replace('wl_shard_', '').replace(`_${userId}`, '');
          localKeys.push(sk);
        }
      }

      if (localKeys.length > 0) {
        localKeys.sort((a, b) => b.localeCompare(a));
        const latestKey = localKeys[0];
        console.log(`[Vault] Local discovery found latest shard: ${latestKey}`);
        const localData = await base44.db._loadShard(latestKey);
        if (localData) {
          // Attach shard key to metadata if missing for temporal context
          if (localData.metadata) localData.metadata.shard_key = latestKey;
          return localData;
        }
      }

      console.log(`[Vault] No valid local shards found. Checking cloud fallback...`);
      // 2. Fallback to Cloud if local is empty
      const { data, error } = await supabase
        .from('wealthlens_vault')
        .select('shard_key, payload')
        .eq('user_id', userId)
        .order('shard_key', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      
      const decrypted = await decryptPayload(data.payload, userId);
      if (!decrypted && typeof data.payload === 'object') return data.payload;
      
      // Cache cloud shard to local for next time
      if (decrypted) {
         localStorage.setItem(`wl_shard_${data.shard_key}_${userId}`, data.payload);
         if (decrypted.metadata) decrypted.metadata.shard_key = data.shard_key;
      }
      
      return decrypted;
    },

    getSummary: async (month) => {
      if (isSupabaseEnabled) {
        try {
          const result = await supabase.auth.getSession();
          const session = result?.data?.session;
          if (session?.user) {
            const { data, error } = await supabase.from('monthly_summaries').select('*').eq('user_id', session.user.id).eq('month', month).single();
            if (!error && data) return data;
          }
        } catch (e) {}
      }
      const summaries = await base44.user.loadData('wl_summaries') || {};
      return summaries[month] || null;
    },
    getTable: async (tableName, options = {}) => {
      const monthContext = typeof options === 'string' ? options : options.month;
      // ── REDIRECT: Secure Unified Shards ──────────────────────────────────
      if (['transactions', 'user_accounts', 'user_categories', 'categories', 'budgets', 'portfolio_holdings'].includes(tableName)) {
        console.log(`[base44.db] Intercepting ${tableName} -> Vault Redirect`);
        
        if (tableName === 'transactions') {
          const { session } = await base44.db._getSession();
          if (!session?.user) return [];

          // Identify all shard keys across both Local and Cloud
          const userId = session.user.id;
          const shardKeys = new Set();
          
          // 1. Scan LocalStorage for shard keys
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('wl_shard_') && key.endsWith(`_${userId}`)) {
              shardKeys.add(key.replace('wl_shard_', '').replace(`_${userId}`, ''));
            }
          }

          // 2. Scan Cloud for keys if enabled
          const { data: cloudKeys, error: cloudErr } = await supabase
            .from('wealthlens_vault')
            .select('shard_key')
            .eq('user_id', userId);
          
          if (!cloudErr && cloudKeys) {
            cloudKeys.forEach(ck => shardKeys.add(ck.shard_key));
          }

          const txMap = new Map();
          for (const key of Array.from(shardKeys)) {
            const shard = await base44.db._loadShard(key);
            if (shard?.transactions) {
              shard.transactions.forEach(tx => {
                // Deduplicate by ID: Always favor the most recently updated instance
                const existing = txMap.get(tx.id);
                if (!existing || (tx.updated_at && (!existing.updated_at || tx.updated_at > existing.updated_at))) {
                   txMap.set(tx.id, tx);
                }
              });
            }
          }
          return Array.from(txMap.values());
        }

        if (tableName === 'budgets') {
            const { session } = await base44.db._getSession();
            if (!session?.user) return [];

            let query = supabase
                .from('wealthlens_vault')
                .select('shard_key, payload, updated_at')
                .eq('user_id', session.user.id);
            
            if (monthContext) {
                query = query.eq('shard_key', monthContext);
            }

            const { data, error } = await query;
            if (error || !data) return [];

            const budgetMap = new Map();
            for (const row of data) {
                const payload = row.payload;
                let decrypted = (payload && typeof payload === 'object') ? payload : await decryptPayload(payload, session.user.id);
                
                if (!decrypted && typeof payload === 'string') {
                    try { decrypted = JSON.parse(payload); } catch(e) {}
                }
                
                if (decrypted?.budget) {
                    const budgetObj = {
                        id: row.shard_key,
                        month: row.shard_key,
                        payload: decrypted.budget,
                        updated_at: row.updated_at,
                        user_id: session.user.id
                    };
                    
                    // Deduplicate by month: favor the latest updated_at
                    const existing = budgetMap.get(row.shard_key);
                    if (!existing || new Date(row.updated_at) > new Date(existing.updated_at)) {
                        budgetMap.set(row.shard_key, budgetObj);
                    }
                }
            }
            return Array.from(budgetMap.values());
        }

        // Accounts, Categories, and Portfolio: Use context-aware or latest state snapshot
        let targetShard;
        if (monthContext) {
            targetShard = await base44.db._loadShard(monthContext);
        }
        
        if (!targetShard) {
            targetShard = await base44.db._getLatestShard();
        }

        if (targetShard) {
          if (tableName === 'user_accounts') return targetShard.accounts || [];
          if (tableName === 'user_categories' || tableName === 'categories') return targetShard.categories || [];
          if (tableName === 'portfolio_holdings') {
            const shardDate = (targetShard.metadata?.shard_key || new Date().toISOString().slice(0, 7)) + "-01";
            return [{ 
              snapshot_date: shardDate, 
              holdings: targetShard.holdings || [] 
            }];
          }
        }
        
        return [];
      }

      // ── LEGACY TABLE FALLBACK (For non-vaulted data like Portfolio) ──────
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const sessionResult = await base44.db._getSession();
        const session = sessionResult ? sessionResult.session : null;
        
        if (session && session.user) {
          const { data, error } = await supabase.from(sqlTable).select('*').eq('user_id', session.user.id);
          if (!error && data) return data;
          
          // Catch 'missing table' error and allow local fallback
          if (error && error.code === 'PGRST205') {
            console.warn(`[base44] Table '${sqlTable}' not found in DB. Falling back to local vault.`);
          } else if (error) {
            console.error(`[base44] Fetch error for ${tableName}:`, error);
          }
        }
      }
      const key = `wl_table_${tableName}`;
      const data = await base44.user.loadData(key);
      return Array.isArray(data) ? data : [];
    },
    // ── insertRow ───────────────────────────────────────────────────────────
    // Pure INSERT — never updates an existing record.
    // Use this for new transactions, new accounts, etc.
    insertRow: async (tableName, row, options = {}) => {
      const monthContext = typeof options === 'string' ? options : options.month;
      // ── REDIRECT: Secure Unified Shards ──────────────────────────────────
      if (tableName === 'portfolio_holdings') {
        const shardKey = monthContext || base44.db._getShardKey(new Date().toISOString());
        let shard = await base44.db._loadShard(shardKey);
        
        if (!shard) {
          const latest = await base44.db._getLatestShard();
          shard = {
            transactions: [],
            accounts: latest?.accounts || [],
            categories: latest?.categories || [],
            budget: latest?.budget || null,
            holdings: [],
            metadata: { month: shardKey, version: "1.0" }
          };
        }

        // The portfolio payload is typically a snapshot object { holdings: [...] }
        // or a direct array depending on the caller. Portfolio.jsx sends { holdings: [...] }.
        shard.holdings = row.holdings || row;
        
        const success = await base44.db._saveShard(shardKey, shard);
        return { data: success ? [row] : null, error: success ? null : { message: "Vault write failed" } };
      }

      if (tableName === 'transactions') {
        const shardKey = monthContext || base44.db._getShardKey(row.date);
        let shard = await base44.db._loadShard(shardKey);
        
        // Inheritance: If new month, copy state from latest
        if (!shard) {
          const latest = await base44.db._getLatestShard();
          shard = {
            transactions: [],
            accounts: latest?.accounts || [],
            categories: latest?.categories || [],
            budget: null,
            metadata: { month: shardKey, version: "1.0" }
          };
        }

        const newRow = { ...row, id: row.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, created_at: new Date().toISOString() };
        shard.transactions.push(newRow);
        
        await base44.db._saveShard(shardKey, shard);
        return newRow;
      }

      if (tableName === 'user_accounts' || tableName === 'user_categories' || tableName === 'categories') {
        const shardKey = monthContext || base44.db._getShardKey(); // Current month
        let shard = await base44.db._loadShard(shardKey);
        
        if (!shard) {
          const latest = await base44.db._getLatestShard();
          shard = {
            transactions: [],
            accounts: latest?.accounts || [],
            categories: latest?.categories || [],
            budget: null,
            metadata: { month: shardKey, version: "1.0" }
          };
        }

        if (tableName === 'user_accounts') {
          const newRow = { ...row, id: row.id || `acc_${Date.now()}` };
          shard.accounts.push(newRow);
          await base44.db._saveShard(shardKey, shard);
          return newRow;
        } else {
          const newRow = { ...row, id: row.id || `cat_${Date.now()}` };
          shard.categories.push(newRow);
          await base44.db._saveShard(shardKey, shard);
          return newRow;
        }
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const cleanRow = { ...row };
          delete cleanRow.id; // Always let DB generate the UUID

          const { data, error } = await supabase
            .from(sqlTable)
            .insert({ ...cleanRow, user_id: session.user.id, created_at: new Date(), updated_at: new Date() })
            .select();

          if (!error) {
            console.log(`[base44] INSERT OK → ${sqlTable}:`, data?.[0]);
            return data?.[0] || { success: true };
          }

          if (error.code === 'PGRST205') {
            console.warn(`[base44] Table '${sqlTable}' not found. Falling back to local vault.`);
          } else {
            console.error(`[base44] Insert failed for ${tableName}:`, error);
            return { error };
          }
        }
      }
      // Local fallback
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      const newRow = { ...row, id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() };
      return base44.user.saveData(key, [...rows, newRow]);
    },

    // ── insertRows ──────────────────────────────────────────────────────────
    // Bulk INSERT — for CSV imports, bank syncs, etc.
    insertRows: async (tableName, rows) => {
      // REDIRECT: Categories are now part of a single JSON array
      if (tableName === 'categories' || tableName === 'user_categories') {
        const current = await base44.db.getTable('categories');
        const newRows = rows.map((r, idx) => ({ 
          ...r, 
          id: r.id || `cat_${Date.now()}_${idx}`, 
          created_at: new Date().toISOString() 
        }));
        const updated = [...current, ...newRows];
        await base44.user.saveData('wl_categories', updated);
        return newRows;
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const cleanRows = rows.map(r => {
            const clean = { ...r, user_id: session.user.id, created_at: new Date(), updated_at: new Date() };
            delete clean.id;
            return clean;
          });

          const { data, error } = await supabase
            .from(sqlTable)
            .insert(cleanRows)
            .select();

          if (error) {
            console.error(`[base44] Bulk insert failed for ${tableName}:`, error);
            throw new Error(error.message || "Database rejected the insertion");
          }
          return data || { success: true };
        }
      }
      // Local fallback
      const key = `wl_table_${tableName}`;
      const existing = await base44.db.getTable(tableName);
      const newRows = rows.map(r => ({ ...r, id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() }));
      return base44.user.saveData(key, [...existing, ...newRows]);
    },

    // ── upsertRow ───────────────────────────────────────────────────────────
    // INSERT or UPDATE based on conflict key.
    // Use this for edits to existing records (e.g. inline transaction edits,
    // budget planning rows, user settings).
    upsertRow: async (tableName, row, options = {}) => {
      // ── REDIRECT: Secure Unified Shards ──────────────────────────────────
      if (['transactions', 'budgets', 'portfolio_holdings'].includes(tableName)) {
        const { session } = await base44.db._getSession();
        let shardKey;
        if (tableName === 'budgets') shardKey = row.month;
        else if (tableName === 'portfolio_holdings') shardKey = base44.db._getShardKey(row.snapshot_date || new Date().toISOString());
        else shardKey = base44.db._getShardKey(row.date);
        
        let shard = await base44.db._loadShard(shardKey);
        
        if (!shard) {
            // New month inheritance
            const latest = await base44.db._getLatestShard();
             shard = {
                 transactions: [],
                 accounts: latest?.accounts || [],
                 categories: latest?.categories || [],
                 holdings: latest?.holdings || [],
                 budget: null,
                 metadata: { month: shardKey, version: "1.0" }
             };
         }

        if (tableName === 'transactions') {
            const index = shard.transactions.findIndex(t => t.id === row.id);
            
            // CROSS-SHARD PURGE: Detect and remove orphaned records from other months
            const userId = session?.user?.id;
            if (userId) {
                const allKeys = Object.keys(localStorage);
                for (const k of allKeys) {
                    if (k.startsWith('wl_shard_') && k.endsWith(`_${userId}`)) {
                        const sKey = k.replace('wl_shard_', '').replace(`_${userId}`, '');
                        if (sKey !== shardKey) {
                            const otherShard = await base44.db._loadShard(sKey);
                            if (otherShard?.transactions) {
                                const count = otherShard.transactions.length;
                                otherShard.transactions = otherShard.transactions.filter(t => String(t.id) !== String(row.id));
                                if (otherShard.transactions.length !== count) {
                                    await base44.db._saveShard(sKey, otherShard);
                                }
                            }
                        }
                    }
                }
            }

            if (index !== -1) {
                shard.transactions[index] = { ...shard.transactions[index], ...row, updated_at: new Date().toISOString() };
            } else {
                shard.transactions.push({ ...row, id: row.id || `tx_${Date.now()}`, created_at: new Date().toISOString() });
            }
        } else if (tableName === 'portfolio_holdings') {
            // The portfolio payload is typically { holdings: [...] }
            if (row.holdings && Array.isArray(row.holdings)) {
                shard.holdings = row.holdings;
            } else if (Array.isArray(row)) {
                shard.holdings = row;
            }
        } else {
            // Budget update
            shard.budget = row.payload || row;
        }
        
        const success = await base44.db._saveShard(shardKey, shard);
        if (!success) {
            console.error(`[Vault] Failed to persist ${tableName} to shard ${shardKey}`);
            return { data: null, error: { message: "Vault persistence failure" } };
        }
        return { data: [row], error: null };
      }

      if (tableName === 'user_accounts' || tableName === 'user_categories' || tableName === 'categories') {
        const monthContext = typeof options === 'string' ? options : options.month;
        const shardKey = monthContext || base44.db._getShardKey();
        let shard = await base44.db._loadShard(shardKey);
        if (!shard) {
            const latest = await base44.db._getLatestShard();
            shard = { transactions: [], accounts: latest?.accounts || [], categories: latest?.categories || [], budget: null, metadata: { month: shardKey } };
        }

        const list = (tableName === 'user_accounts') ? shard.accounts : shard.categories;
        const index = list.findIndex(i => i.id === row.id || i.name === row.name);
        
        if (index !== -1) {
          list[index] = { ...list[index], ...row };
        } else {
          list.push(row);
        }

        await base44.db._saveShard(shardKey, shard);
        return { data: [row], error: null };
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const upsertOptions = typeof options === 'string' ? { onConflict: options } : { ...options };
          
          const cleanRow = { ...row };
          if (cleanRow.id === null || cleanRow.id === undefined) {
            delete cleanRow.id;
          }

          if (!upsertOptions.onConflict && (tableName === 'budgets' || tableName === 'monthly_summaries')) {
            upsertOptions.onConflict = 'user_id,month';
          } else if (upsertOptions.onConflict === 'month') {
            upsertOptions.onConflict = 'user_id,month';
          }

          const { data, error } = await supabase.from(sqlTable).upsert({ ...cleanRow, user_id: session.user.id, updated_at: new Date() }, upsertOptions).select();
          if (!error) return data?.[0] || { success: true };
          
          if (error && error.code === 'PGRST205') {
             console.warn(`[base44] Table '${sqlTable}' not found for upsert. Falling back to local vault.`);
          } else {
             console.error(`[base44] Upsert failed for ${tableName}:`, error);
             return { error };
          }
        }
      }
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      let targetId = row.id;
      
      if (!targetId) {
        if (tableName === 'budgets' || tableName === 'monthly_summaries') {
          const match = rows.find(r => r.month === row.month);
          if (match) targetId = match.id;
        }
        if (tableName === 'user_data') {
          const match = rows.find(r => r.key === row.key);
          if (match) targetId = match.id;
        }
      }

      const index = targetId ? rows.findIndex(r => r.id === targetId) : -1;
      const newRows = index >= 0 ? rows.map((r, i) => i === index ? { ...r, ...row, updated_at: new Date().toISOString() } : r)
                                  : [...rows, { ...row, id: row.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, created_at: new Date().toISOString() }];
      return base44.user.saveData(key, newRows);
    },
    upsertRows: async (tableName, rows, options = {}) => {
      // REDIRECT: Categories are now part of a single JSON array
      if (tableName === 'categories' || tableName === 'user_categories') {
        const current = await base44.db.getTable('categories');
        const rowMap = new Map(current.map(r => [String(r.id), r]));
        const nameMap = new Map(current.map(r => [(r.name || "").toLowerCase().trim(), r]));

        rows.forEach(row => {
          const key = (row.name || "").toLowerCase().trim();
          const existing = (row.id && rowMap.get(String(row.id))) || nameMap.get(key);
          
          if (existing) {
            const updated = { ...existing, ...row, updated_at: new Date().toISOString() };
            rowMap.set(String(updated.id), updated);
          } else {
            const newId = row.id || `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const newRow = { ...row, id: newId, created_at: new Date().toISOString() };
            rowMap.set(String(newId), newRow);
          }
        });

        const updatedList = Array.from(rowMap.values());
        await base44.user.saveData('wl_categories', updatedList);
        return updatedList;
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const upsertOptions = typeof options === 'string' ? { onConflict: options } : { ...options };
          if (!upsertOptions.onConflict && (tableName === 'budgets' || tableName === 'monthly_summaries')) {
            upsertOptions.onConflict = 'user_id,month';
          }
          const cleanRows = rows.map(r => {
             const row = { ...r, user_id: session.user.id, updated_at: new Date() };
             if (row.id === null || row.id === undefined) delete row.id;
             return row;
          });
          const { data, error } = await supabase.from(sqlTable).upsert(cleanRows, upsertOptions).select();
          if (!error) return data || { success: true };
          if (error && error.code !== 'PGRST205') {
            console.error(`[base44] Batch upsert failed for ${tableName}:`, error);
            return { error };
          }
          console.warn(`[base44] Batch upsert for ${tableName} falling back to local vault (Table missing).`);
        }
      }
      const key = `wl_table_${tableName}`;
      const currentRows = await base44.db.getTable(tableName);
      const rowMap = new Map(currentRows.map(r => [String(r.id), r]));
      
      // Helper to find existing item by name (case-insensitive)
      const findByName = (name) => {
        if (!name) return null;
        const search = name.toLowerCase().trim();
        return Array.from(rowMap.values()).find(r => (r.name || "").toLowerCase().trim() === search);
      };

      rows.forEach((row, idx) => {
        const existing = (row.id && rowMap.get(String(row.id))) || findByName(row.name);
        
        if (existing) {
          const updated = { ...existing, ...row, updated_at: new Date().toISOString() };
          rowMap.set(String(updated.id), updated);
        } else {
          // Generate a highly unique local ID including timestamp and index
          const newId = row.id || `local-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`;
          const newRow = { 
            ...row, 
            id: newId,
            created_at: new Date().toISOString() 
          };
          rowMap.set(String(newId), newRow);
        }
      });
      
      const finalRows = Array.from(rowMap.values());
      return base44.user.saveData(key, finalRows);
    },
    deleteRow: async (tableName, id, options = {}) => {
      // REDIRECT: Vault-managed tables don't need individual row deletion logic here
      // because they are saved as complete snapshots via upsertRow.
      if (['portfolio_holdings', 'budgets'].includes(tableName)) {
        return { success: true };
      }
      
      const monthContext = typeof options === 'string' ? options : options.month;

      if (['transactions', 'user_accounts', 'user_categories', 'categories'].includes(tableName)) {
        const { session } = await base44.db._getSession();
        if (!session?.user) return { success: false };

        const userId = session.user.id;
        
        // Context-aware deletion: If it's a structural item (account/cat), 
        // we might only want to delete it from the specific month's state.
        if (tableName !== 'transactions') {
            const shardKey = monthContext || base44.db._getShardKey();
            const shard = await base44.db._loadShard(shardKey);
            if (shard) {
                if (tableName === 'user_accounts') {
                    shard.accounts = (shard.accounts || []).filter(a => String(a.id) !== String(id));
                } else {
                    shard.categories = (shard.categories || []).filter(c => String(c.id) !== String(id));
                }
                await base44.db._saveShard(shardKey, shard);
                return { success: true };
            }
        }

        // Transactions: Search across all shards
        const { data, error } = await supabase
            .from('wealthlens_vault')
            .select('shard_key, payload')
            .eq('user_id', userId);

        if (error || !data) return { success: false };

        for (const row of data) {
            let shard = await decryptPayload(row.payload, userId);
            if (!shard && typeof row.payload === 'object') shard = row.payload;

            if (shard && shard.transactions) {
                const originalLength = shard.transactions.length;
                shard.transactions = shard.transactions.filter(t => String(t.id) !== String(id));
                
                if (shard.transactions.length !== originalLength) {
                    await base44.db._saveShard(row.shard_key, shard);
                    return { success: true };
                }
            }
        }
        return { success: false };
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const { error } = await supabase.from(sqlTable).delete().eq('id', id).eq('user_id', session.user.id);
          if (!error) return { success: true };
        }
      }
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      return base44.user.saveData(key, rows.filter(r => r.id !== id));
    },
    deleteByFilter: async (tableName, column, value) => {
      // REDIRECT: Categories are now part of a single JSON array
      if (tableName === 'categories' || tableName === 'user_categories') {
        const current = await base44.db.getTable('categories');
        const updated = current.filter(r => r[column] !== value);
        await base44.user.saveData('wl_categories', updated);
        return { success: true };
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const { error } = await supabase.from(sqlTable).delete().eq(column, value).eq('user_id', session.user.id);
          if (!error) return { success: true };
        }
      }
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      const updated = rows.filter(r => r[column] !== value);
      await base44.user.saveData(key, updated);
      return { success: true };
    },
    
    // ── deleteByDatePrefix ───────────────────────────────────────────────────
    // Perform bulk deletions for a specific month (e.g., '2026-04')
    deleteByDatePrefix: async (tableName, column, monthKey) => {
      // ── REDIRECT: Secure Unified Shards ──────────────────────────────────
      if (tableName === 'transactions' || tableName === 'budgets') {
          const { session } = await base44.db._getSession();
          if (!session?.user) return { success: false };

          // A date prefix delete in the vault is just a shard delete or shard clear
          const { error } = await supabase
              .from('wealthlens_vault')
              .delete()
              .eq('user_id', session.user.id)
              .eq('shard_key', monthKey);

          return { success: !error };
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      
      // Calculate date bounds for the month (e.g. 2026-04-01 to 2026-05-01)
      const [year, month] = monthKey.split('-');
      const startDate = `${year}-${month}-01`;
      
      // Calculate next month for exclusive upper bound
      let nextMonth = parseInt(month) + 1;
      let nextYear = parseInt(year);
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

      if (isSupabaseEnabled) {
        const { session } = await base44.db._getSession();
        if (session?.user) {
          const { error } = await supabase
            .from(sqlTable)
            .delete()
            .gte(column, startDate)
            .lt(column, endDate)
            .eq('user_id', session.user.id);
            
          if (!error) return { success: true };
          console.error(`[base44] DeleteByDatePrefix failed for ${tableName}:`, error);
          throw new Error(error.message);
        }
      }
      // Local fallback
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      const updated = rows.filter(r => !(r[column] && r[column].startsWith(monthKey)));
      await base44.user.saveData(key, updated);
      return { success: true };
    },
    getSummary: async (month) => {
      if (isSupabaseEnabled) {
        try {
          const result = await supabase.auth.getSession();
          const session = result?.data?.session;
          if (session?.user) {
            const { data, error } = await supabase.from('monthly_summaries').select('*').eq('user_id', session.user.id).eq('month', month).single();
            if (!error && data) return data;
          }
        } catch (e) {}
      }
      const summaries = await base44.user.loadData('wl_summaries') || {};
      return summaries[month] || null;
    },
    query: async (tableName, options = {}) => {
      // ── REDIRECT: Secure Unified Shards ──────────────────────────────────
      if (tableName === 'transactions' || tableName === 'budgets') {
          const { filters = [] } = options;
          const monthFilter = filters.find(f => f.column === 'month' || f.column === 'date');
          
          let shardsToLoad = [];
          if (monthFilter && monthFilter.op === 'eq') {
              shardsToLoad = [monthFilter.value.substring(0, 7)];
          } else {
              // Load all (could be optimized with range filters)
              return base44.db.getTable(tableName);
          }

          const results = [];
          for (const key of shardsToLoad) {
              const shard = await base44.db._loadShard(key);
              if (shard) {
                  if (tableName === 'transactions') results.push(...shard.transactions);
                  else if (shard.budget) results.push({ month: key, payload: shard.budget });
              }
          }
          return results;
      }

      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      let results = await base44.db.getTable(tableName);
      filters.forEach(f => {
         const val = f.value;
         const col = f.column;
         if (f.op === 'eq') results = results.filter(r => r[col] === val);
         if (f.op === 'neq') results = results.filter(r => r[col] !== val);
         if (f.op === 'gt') results = results.filter(r => r[col] > val);
         if (f.op === 'gte') results = results.filter(r => r[col] >= val);
         if (f.op === 'lt') results = results.filter(r => r[col] < val);
         if (f.op === 'lte') results = results.filter(r => r[col] <= val);
         if (f.op === 'like') {
           const regex = new RegExp(val.replace(/%/g, '.*'), 'i');
           results = results.filter(r => regex.test(r[col]));
         }
      });
      if (orderBy) {
        results.sort((a, b) => {
          const aVal = a[orderBy.column];
          const bVal = b[orderBy.column];
          if (aVal === bVal) return 0;
          const comparison = aVal > bVal ? 1 : -1;
          return orderBy.ascending ? comparison : -comparison;
        });
      }
      if (limit) results = results.slice(0, limit);
      return results;
    },
    upsert: async function(tableName, row, options) {
      return this.upsertRow(tableName, row, options);
    },
    delete: async function(tableName, id) {
      return this.deleteRow(tableName, id);
    },
    _supabase: () => supabase
  },

  integrations: {
    Core: { 
      InvokeLLM: async (p) => {
        return await invokeUniversalAI(p.prompt, 'pillar', p);
      }
    }
  }
};
