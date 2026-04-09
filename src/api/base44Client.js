
// Mocked base44 instance holding required methods completely local to the browser
import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';

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
const callGeminiDirectly = async (prompt, type) => {
  const geminiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!geminiKey) return null;

  let systemContext = "Act as an elite, high-performance financial advisor.";
  if (type === 'pillar') systemContext = "Act as a fundamental stock analyst performing an 8-Pillar investigation.";
  
  const currentYear = new Date().getFullYear();
  const fullPrompt = `${systemContext}\n\nTask: ${prompt}\n\nMANDATORY: Return a strictly valid JSON response. No intro/outro.
    IF type is 'coach': { "assessment": "sharp 2-sentence mathematical evaluation", "tone": "encouraging|urgent|excellent", "recommendations": [{ "action": "specific task", "impact": "mathematical result", "priority": "high|medium|low" }], "key_insights": ["data-driven insight from prompt"], "closing_motivation": "compelling closing" }
    IF type is 'pillar': { "stockName": "Full Name", "currentPrice": number, "pillars": [{ "id": "pe|roic|rev|net_income|shares|fcf|liabilities|price_fcf", "passed": boolean, "current": "data value", "target": "threshold", "rationale": "one-sentence explanation" }], "summary": "2-sentence overview", "overallScore": number, "recommendation": "Verdict" }
    Return ONLY valid JSON.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
    });
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("[Gemini Bridge Error]", err);
    return null;
  }
};

export const base44 = {
  auth: {
    me: async () => {
      // In production, sync with Supabase session if enabled
      if (isProd && isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          return {
            ...session.user,
            ...session.user.user_metadata
          };
        }
      }

      // Mock dev user fallback
      const stored = localStorage.getItem('mockUser');
      if (stored) return JSON.parse(stored);
      return null;
    },
    updateMe: async (params) => {
      // In production, update Supabase metadata if enabled
      if (isProd && isSupabaseEnabled) {
        try {
          await supabase.auth.updateUser({
            data: params
          });
        } catch (err) {
          console.error("Supabase updateMe failed:", err);
        }
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
      if (!import.meta.env.PROD) {
        console.log(`[Mock Log] User navigated to: ${pageName}`);
      }
      return { success: true };
    }
  },

  app: {
    getPrice: async () => 29.99,
    updatePrice: async () => ({ success: true })
  },

  functions: {
    invoke: async (name, params) => {
      if (name === 'getInvestmentCoachAdvice') {
        const p = params || {};
        const prompt = `Client is investing $${p.monthlyContribution}/mo for ${p.years} years into ${p.instrument} at ${p.returnRate}% return. Provide analysis.`;
        const realData = await callGeminiDirectly(prompt, 'coach');
        if (realData) return { data: realData };

        // Fallback Mock
        return { 
          data: {
            assessment: `Your strategy to invest ${p.monthlyContribution ? '$'+p.monthlyContribution : 'extra capital'} into ${p.instrument || 'assets'} over ${p.years || 10} years is fundamentally solid.`,
            tone: 'encouraging',
            recommendations: [{ action: "Increase monthly additions", impact: "Yields 15% more wealth", priority: "high" }],
            key_insights: ["Compounding is your ally"],
            closing_motivation: "Stay consistent."
          } 
        };
      }

      if (name === 'getStockPillarAnalysis') {
        const ticker = (params?.symbol || 'STOCK').toUpperCase();
        const realData = await callGeminiDirectly(`8-Pillar fundamental analysis for ${ticker} over last 10 years.`, 'pillar');
        if (realData) return { data: realData };

        // Fallback Mock
        return {
          data: {
            stockName: ticker === 'AAPL' ? 'Apple Inc' : 'Global Growth Corp',
            currentPrice: 150.00,
            overallScore: 6,
            summary: `Analysis for ${ticker}. Ensure Gemini API key is valid for live data.`,
            recommendation: "Hold / Monitor",
            pillars: [
              { id: "pe", passed: true, current: "18.5", target: "< 22.0", rationale: "P/E is within ranges." },
              { id: "roic", passed: true, current: "14.2%", target: "> 9.0%", rationale: "Efficient capital use." },
              { id: "rev", passed: true, current: "+12.0%", target: "> 0%", rationale: "Revenue growth remains strong." },
              { id: "net_income", passed: true, current: "+8.5%", target: "> 0%", rationale: "Profits following growth." },
              { id: "shares", passed: false, current: "+1.2%", target: "< 0%", rationale: "Small dilution." },
              { id: "fcf", passed: true, current: "+15.0%", target: "> 0%", rationale: "Strong FCF growth." },
              { id: "liabilities", passed: true, current: "3.2 yrs", target: "< 5.0 yrs", rationale: "Manageable debt." },
              { id: "price_fcf", passed: false, current: "24.5", target: "< 20.0", rationale: "Elevated Valuation." }
            ]
          }
        };
      }

      if (name === 'checkSubscription') {
        return { data: { isActive: true } };
      }

      return { data: { success: true } };
    }
  },
  
  user: {
    loadData: async (key) => {
      console.log(`[Mock API] Loading: ${key}`);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    },
    saveData: async (key, data) => {
      console.log(`[Mock API] Saving: ${key}`);
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    }
  },

  integrations: {
    Core: { 
      InvokeLLM: async (p) => {
        const realData = await callGeminiDirectly(p.prompt, 'pillar');
        return realData || { summary: "Analysis complete." };
      }
    }
  }
};
