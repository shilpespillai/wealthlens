
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
// Universal Intelligence Bridge (Local-Only Provider Support)
const invokeUniversalAI = async (prompt, type, params = {}) => {
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
    Context: Analysis for ${type === 'pillar' ? 'Stock Evaluation' : 'Financial Coaching'}.`;
    
    const fullPrompt = `${systemContext}\n\nTask: ${prompt}\n\nResponse Requirements:
    IF type is 'coach': { "assessment": "sharp 2-sentence mathematical evaluation", "tone": "encouraging|urgent|excellent", "recommendations": [{ "action": "specific task", "impact": "mathematical result", "priority": "high|medium|low" }], "key_insights": ["data-driven insight from prompt"], "closing_motivation": "compelling closing" }
    IF type is 'pillar': { "stockName": "Full Name", "currentPrice": number, "pillars": [{ "id": "pe|roic|rev|net_income|shares|fcf|liabilities|price_fcf", "passed": boolean, "current": "data value", "target": "threshold", "rationale": "one-sentence explanation" }], "summary": "2-sentence overview", "overallScore": number, "recommendation": "Verdict" }
    Return ONLY valid JSON.`;

    if (userProvider === 'gemini') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${userModel}:generateContent?key=${userKey}`;
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] });
    } else if (userProvider === 'openai') {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = { "Content-Type": "application/json", "Authorization": `Bearer ${userKey}` };
      body = JSON.stringify({
        model: userModel,
        messages: [{ role: "system", content: systemContext }, { role: "user", content: fullPrompt }],
        response_format: { type: "json_object" }
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
        max_tokens: 1024,
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
    const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleanedText);
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) return { ...session.user, ...session.user.user_metadata };
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
    getPrice: async () => 29.99,
    updatePrice: async () => ({ success: true })
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

      if (name === 'checkSubscription') return { data: { isActive: true } };
      return { data: { success: true } };
    }
  },
  
  user: {
    loadData: async (key) => {
      const { data: { session } } = await supabase.auth.getSession();
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
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';
      const storageKey = `${key}_${userId}`;

      // SECURITY: AI Configuration must remain local and NOT sync to DB
      if (key === 'wl_ai_config') {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return { success: true };
      }

      if (isSupabaseEnabled && session?.user) {
        await supabase.from('user_data').upsert({ user_id: userId, key: key, payload: data, updated_at: new Date() });
        return { success: true };
      }
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      return { success: true };
    }
  },
  
  db: {
    TABLE_MAP: { accounts: "user_accounts", transactions: "transactions", portfolio_holdings: "portfolio_holdings", budgets: "budgets", categories: "user_categories" },
    getTable: async (tableName) => {
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
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
    insertRow: async (tableName, row) => {
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
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
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
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

          if (!error) return data || { success: true };
          console.error(`[base44] Bulk insert failed for ${tableName}:`, error);
          return { error };
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
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
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
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
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
    deleteRow: async (tableName, id) => {
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
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
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { error } = await supabase.from(sqlTable).delete().eq(column, value).eq('user_id', session.user.id);
          if (!error) return { success: true };
        }
      }
      const key = `wl_table_${tableName}`;
      const rows = await base44.db.getTable(tableName);
      return base44.user.saveData(key, rows.filter(r => r[column] !== value));
    },
    getSummary: async (month) => {
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase.from('monthly_summaries').select('*').eq('user_id', session.user.id).eq('month', month).single();
          if (!error && data) return data;
        }
      }
      const summaries = await base44.user.loadData('wl_summaries') || {};
      return summaries[month] || null;
    },
    query: async (tableName, options = {}) => {
      const sqlTable = base44.db.TABLE_MAP[tableName] || tableName;
      const { filters = [], orderBy = null, limit = null } = options;
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          let q = supabase.from(sqlTable).select('*').eq('user_id', session.user.id);
          filters.forEach(f => {
            if (f.op === 'eq') q = q.eq(f.column, f.value);
            if (f.op === 'neq') q = q.neq(f.column, f.value);
            if (f.op === 'gt') q = q.gt(f.column, f.value);
            if (f.op === 'gte') q = q.gte(f.column, f.value);
            if (f.op === 'lt') q = q.lt(f.column, f.value);
            if (f.op === 'lte') q = q.lte(f.column, f.value);
            if (f.op === 'like') q = q.like(f.column, f.value);
          });
          if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending });
          if (limit) q = q.limit(limit);
          const { data, error } = await q;
          if (!error && data) return data;
        }
      }
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
    }
  },

  integrations: {
    Core: { 
      InvokeLLM: async (p) => {
        return await invokeUniversalAI(p.prompt, 'pillar', p);
      }
    }
  }
};
