
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

export const base44 = {
  auth: {
    me: async () => {
      if (isSupabaseEnabled) {
        try {
          const { data, error } = await supabase.auth.getUser();
          if (data?.user) {
            const user = data.user;
            return {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
              provider: user.app_metadata?.provider || 'supabase',
              avatar: user.user_metadata?.avatar_url,
              ...user.user_metadata
            };
          }
        } catch (e) {
          console.warn("[Base44] Supabase auth check failed.");
        }
      }
      if (!isProd) {
        const stored = localStorage.getItem('mockUser');
        if (stored) return JSON.parse(stored);
      }
      return null;
    },
    updateMe: async (data) => {
      if (isSupabaseEnabled) {
        const { data: user, error } = await supabase.auth.updateUser({ data });
        if (error) throw error;
        const mappedUser = {
          id: user.user.id,
          email: user.user.email,
          full_name: user.user.user_metadata?.full_name || user.user.user_metadata?.name || user.user.email?.split('@')[0],
          provider: user.user.app_metadata?.provider || 'supabase',
          avatar: user.user.user_metadata?.avatar_url,
          ...user.user.user_metadata
        };
        localStorage.setItem('mockUser', JSON.stringify(mappedUser));
        return mappedUser;
      }
      const user = JSON.parse(localStorage.getItem('mockUser')) || {};
      const updated = { ...user, ...data };
      localStorage.setItem('mockUser', JSON.stringify(updated));
      return updated;
    },
    logout: async (returnUrl = '/') => {
      if (isSupabaseEnabled) await supabase.auth.signOut();
      localStorage.removeItem('mockUser');
      window.location.replace(returnUrl);
    }
  },
  
  appLogs: {
    logUserInApp: async (pageName) => ({ success: true })
  },
  
  entities: {
    SavedCalculation: {
      list: async () => JSON.parse(localStorage.getItem('mockSavedCalcs') || '[]'),
      create: async (data) => {
        const calcs = JSON.parse(localStorage.getItem('mockSavedCalcs') || '[]');
        const newCalc = { ...data, id: 'calc-' + Date.now(), created_at: new Date().toISOString() };
        calcs.push(newCalc);
        localStorage.setItem('mockSavedCalcs', JSON.stringify(calcs));
        return newCalc;
      },
      delete: async (id) => {
        let calcs = JSON.parse(localStorage.getItem('mockSavedCalcs') || '[]');
        calcs = calcs.filter(c => c.id !== id);
        localStorage.setItem('mockSavedCalcs', JSON.stringify(calcs));
        return true;
      }
    }
  },

  // Convenience methods
  fetchIndices: async (p) => base44.functions.invoke('fetchIndices', p),
  fetchRegionalMovers: async (p) => base44.functions.invoke('fetchRegionalMovers', p),
  fetchMarketNews: async (p) => base44.functions.invoke('fetchMarketNews', p),

  functions: {
    invoke: async (name, params) => {
      const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
      
      const jitter = (val) => val + (Math.random() - 0.5) * (val * 0.01);
      
      const generateOHLC = (symbol, currentPrice, prevClose) => {
        const points = [];
        const count = 40;
        const startPrice = prevClose || currentPrice * 0.99;
        const endPrice = currentPrice;
        // Generalized dynamic peak logic (no symbol hardcoding)
        const volatility = 0.015; // 1.5% daily variance
        const peakPrice = Math.max(startPrice, endPrice) * (1 + (Math.random() * volatility));

        for (let i = 0; i < count; i++) {
          const hour = 10 + Math.floor(i / (count/6));
          const minute = Math.floor((i % (count/6)) * (60 / (count/6)));
          const timeStr = `${hour}:${minute < 10 ? '0' + minute : minute} ${hour >= 12 ? 'pm' : 'am'}`;
          const progress = i / count;
          let targetClose;
          if (progress < 0.25) targetClose = startPrice + (progress / 0.25) * (peakPrice - startPrice);
          else targetClose = peakPrice - ((progress - 0.25) / 0.75) * (peakPrice - endPrice);

          const o = i === 0 ? startPrice : points[i-1].close;
          const c = targetClose + (Math.random() - 0.5) * (targetClose * 0.002);
          const h = Math.max(o, c) + (Math.random() * (targetClose * 0.001));
          const l = Math.min(o, c) - (Math.random() * (targetClose * 0.001));
          points.push({ time: timeStr, open: o, high: h, low: l, close: c });
        }
        return points;
      };

      const fetchFinnhub = async (endpoint, symbol) => {
        try {
          if (!FINNHUB_KEY) return null;
          const res = await fetch(`https://finnhub.io/api/v1/${endpoint}?symbol=${symbol}&token=${FINNHUB_KEY}`);
          return await res.json();
        } catch (e) { return null; }
      };

      if (name === 'fetchMarketNews') {
        const pool = [
          { category: 'RETIREMENT', title: 'Unconventional wisdom: Funding your dream retirement', summary: 'An effective investment strategy for retirement must deal with several challenges while catering for your unique circumstances.', source: 'Mark LaMonica, CFA', publishedAt: '27 March 2026', url: 'https://www.morningstar.com.au' },
          { category: 'PERSONAL-FINANCE', title: 'You can beat the stock market by avoiding its worst days. But you won\'t', summary: 'We put a viral post on X to the sniff test. It didn\'t pass.', source: 'Jeffrey Ptak, CFA', publishedAt: '27 March 2026', url: 'https://www.morningstar.com.au' },
          { category: 'STOCKS', title: 'ASX energy producers: Energy prices rise sharply as global tensions flare', summary: 'Our view on the chaotic energy markets and why long-term views remain unchanged.', source: 'Mark Taylor', publishedAt: '27 March 2026', url: 'https://www.morningstar.com.au' },
          { category: 'PERSONAL-FINANCE', title: 'Future Focus: Tax alpha is becoming more important than market returns', summary: 'As valuations temper and market returns become subdued, focus on keeping more of what you earn.', source: 'Shani Jayamanne', publishedAt: '24 March 2026', url: 'https://www.morningstar.com.au' },
          { category: 'MACRO', title: 'Central Bank Pivot: Why the next 6 months are critical for global debt', summary: 'Analyzing the trajectory of interest rates across the US and EU as inflation hits target bands.', source: 'Institutional Strategy Team', publishedAt: '02 April 2026', url: '#' },
          { category: 'TECH', title: 'The Generative AI Capex Cycle: Who wins the second phase of deployment?', summary: 'Moving beyond infrastructure to application-layer profitability in the Silicon Valley ecosystem.', source: 'Tech Alpha Research', publishedAt: '01 April 2026', url: '#' },
          { category: 'CRYPTO', title: 'Bitcoin ETFs and the Institutional Wall: A new era of liquidity', summary: 'How spot ETFs are fundamentally changing the volatility profile of digital assets.', source: 'Crypto Insights Hub', publishedAt: '01 April 2026', url: '#' },
          { category: 'ENERGY', title: 'Renewable Storage: The lithium vs sodium battery race intensifies', summary: 'A deep dive into the battery chemistries powering the next generation of grid storage.', source: 'Energy Transition Desk', publishedAt: '31 March 2026', url: '#' },
          { category: 'LOGISTICS', title: 'Supply Chain Resilience: Redefining global trade routes in 2026', summary: 'How near-shoring and automation are transforming the cost of global distribution.', source: 'Global Trade Monitor', publishedAt: '30 March 2026', url: '#' }
        ];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return { data: { articles: shuffled.slice(0, 4) } };
      }

      if (name === 'fetchLiveMarketData') {
        const region = params?.region || 'au';
        const regionMap = {
          au: { i1: { sym: '^AXJO', name: 'ASX 200', f: 7750 }, i2: { sym: '^AORD', name: 'All Ordinaries', f: 8010 }, i3: { sym: '^DJI', name: 'DOW (Proxy)', f: 39127 }, bitcoin: { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', f: 66903 } },
          us: { i1: { sym: '^GSPC', name: 'S&P 500', f: 5123 }, i2: { sym: '^IXIC', name: 'NASDAQ', f: 16248 }, i3: { sym: '^DJI', name: 'DOW Jones', f: 39127 }, bitcoin: { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', f: 66903 } },
          eu: { i1: { sym: '^GDAXI', name: 'DAX 40', f: 18175 }, i2: { sym: '^FTSE', name: 'FTSE 100', f: 7930 }, i3: { sym: '^FCHI', name: 'CAC 40', f: 8150 }, bitcoin: { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', f: 66903 } },
          asia: { i1: { sym: '^N225', name: 'Nikkei 225', f: 40168 }, i2: { sym: '^HSI', name: 'Hang Seng', f: 16541 }, i3: { sym: '^STI', name: 'Straits Times', f: 3222 }, bitcoin: { sym: 'BINANCE:BTCUSDT', name: 'Bitcoin', f: 66903 } }
        };
        const config = regionMap[region] || regionMap.au;
        const results = await Promise.all([fetchFinnhub('quote', config.i1.sym), fetchFinnhub('quote', config.i2.sym), fetchFinnhub('quote', config.i3.sym), fetchFinnhub('quote', config.bitcoin.sym)]);
        const [r1, r2, r3, r4] = results;
        const format = (l, f) => l?.c ? { value: l.c, change: l.d, changePercent: l.dp } : { value: jitter(f), change: jitter(f*0.005), changePercent: 1.2 * (Math.random()>0.5?1:-1) };
        return { data: { stocks: { [config.i1.name]: format(r1, config.i1.f), [config.i2.name]: format(r2, config.i2.f), [config.i3.name]: format(r3, config.i3.f) }, crypto: { [config.bitcoin.name]: format(r4, config.bitcoin.f) } } };
      }

      if (name === 'fetchRegionalMovers') {
        const region = params?.region || 'au';
        const moverConfigs = {
          au: ['BHP.AX', 'CBA.AX', 'RIO.AX', 'CSL.AX', 'NAB.AX', 'WBC.AX', 'ANZ.AX', 'FMG.AX', 'MQG.AX', 'WES.AX', 'TLS.AX', 'WOW.AX', 'TCL.AX', 'GMG.AX', 'QAN.AX'],
          us: ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'UNH', 'JNJ', 'XOM', 'V', 'JPM', 'WMT', 'MA', 'PG', 'HD', 'CVX', 'ABBV', 'LLY', 'PEP'],
          eu: ['ASML.AS', 'MC.PA', 'OR.PA', 'SAP.DE', 'SIE.DE', 'DTE.DE', 'AIR.PA', 'BNP.PA', 'RMS.PA', 'SAN.MC', 'ITX.MC', 'HSBA.L', 'BP.L', 'ULVR.L', 'AZN.L'],
          asia: ['7203.T', '6758.T', '9984.T', '0700.HK', '9988.HK', '3690.HK', '2318.HK', '1299.HK', '600519.SS', '601398.SS', '601939.SS', 'D05.SI', 'O39.SI']
        };
        const symbols = moverConfigs[region] || moverConfigs.au;
        const quotes = await Promise.all(symbols.map(s => fetchFinnhub('quote', s)));
        const movers = symbols.map((s, i) => {
          const q = quotes[i];
          const reg = SYMBOL_REGISTRY[s];
          if (q?.c) {
            return { symbol: s, price: q.c, change: q.d, changePercent: q.dp, name: reg?.name || s.split('.')[0] };
          }
          const base = reg?.base || 100;
          return { symbol: s, price: jitter(base), change: jitter(base * 0.005), changePercent: 1.2 * (Math.random() > 0.5 ? 1 : -1), name: reg?.name || s.split('.')[0] };
        });
        return { data: { actives: movers.slice(0, 10), gainers: [...movers].sort((a,b)=>b.changePercent-a.changePercent).slice(0,10), losers: [...movers].sort((a,b)=>a.changePercent-b.changePercent).slice(0,10) } };
      }

      if (name === 'fetchIndices') {
        const region = params?.region || 'au';
        const indices = {
           au: [{ name: 'ASX 200', price: 7750, change: 45, changePercent: 0.58 }, { name: 'All Ords', price: 8010, change: 42, changePercent: 0.53 }],
           us: [{ name: 'S&P 500', price: 5123, change: 12, changePercent: 0.24 }, { name: 'NASDAQ', price: 16248, change: -45, changePercent: -0.28 }]
        };
        return { data: { indices: indices[region] || indices.au } };
      }

      if (name === 'getSecurityDetails') {
        const symbol = (params?.symbol || 'XAO').toUpperCase();
        const reg = SYMBOL_REGISTRY[symbol] || null;
        const live = await fetchFinnhub('quote', symbol);
        let price = live?.c || jitter(reg?.base || 100);
        let pc = live?.pc || price * (1 + (Math.random() - 0.5) * 0.02); // 2% daily variance fallback
        return { 
          data: { 
            symbol, name: reg?.name || symbol, exchange: reg?.ex || 'Global', currency: reg?.cur || 'USD', 
            price, change: price - pc, changePercent: ((price-pc)/pc)*100, high: Math.max(price, pc) * 1.01, 
            low: Math.min(price, pc) * 0.99, open: pc, prevClose: pc, 
            historicalOHLC: generateOHLC(symbol, price, pc), 
            financials: { revenue: reg?.rev || 'N/A', revenueChange: reg?.revChg || 0 }, 
            earnings: reg?.earnings || { epsBeat: 0, revenueBeat: 0 },
            related: reg?.rel || [] 
          } 
        };
      }

      return { data: { success: true } };
    }
  },

  agents: {
    createConversation: async (p) => ({ id: 'conv-123', messages: [] }),
    addMessage: async (c, m) => {
      await new Promise(r => setTimeout(r, 1000));
      return { role: 'assistant', content: "I'm your WealthLens assistant. How can I help?" };
    }
  },

  integrations: {
    Core: { invokeLLM: async (p) => ({ summary: "Analysis in progress..." }) }
  }
};
