

// Mocked base44 instance holding required methods completely local to the browser
export const base44 = {
  auth: {
    me: async () => {
      const stored = localStorage.getItem('mockUser');
      if (stored) return JSON.parse(stored);
      // Return null so AuthContext knows we are not logged in
      return null;
    },
    updateMe: async (data) => {
      const user = JSON.parse(localStorage.getItem('mockUser')) || {};
      const updated = { ...user, ...data };
      localStorage.setItem('mockUser', JSON.stringify(updated));
      return updated;
    },
    logout: async (returnUrl = '/') => {
      localStorage.removeItem('mockUser');
      window.location.replace(returnUrl);
    },
    redirectToLogin: async (returnUrl = '/') => {
      // Avoid infinite redirect loop if already on login page
      if (window.location.pathname === '/login' || window.location.pathname === '/Login') {
        return;
      }
      
      const loginUrl = new URL('/login', window.location.origin);
      if (returnUrl && returnUrl !== '/') {
        loginUrl.searchParams.set('redirect_to', returnUrl);
      }
      window.location.href = loginUrl.toString();
    }
  },
  appLogs: {
    logUserInApp: async (pageName) => {
      console.log(`[Mock Base44] User visited page: ${pageName}`);
      return { success: true };
    }
  },
  entities: {
    SavedCalculation: {
      list: async () => {
        return JSON.parse(localStorage.getItem('mockSavedCalcs') || '[]');
      },
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
  functions: {
    invoke: async (name, params) => {
      console.log(`[Base44] Function invoked: ${name}`, params);
      
      // In production, call real Vercel API endpoints
      const isProd = import.meta.env.PROD;

      if (name === 'checkSubscription') {
        if (isProd) {
          try {
            const resp = await fetch(`/api/subscription-status?email=${encodeURIComponent(params.email)}`, { cache: 'no-store' });
            if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
              const data = await resp.json();
              return { data };
            }
          } catch (e) {
            console.error("[Base44] Subscription check failed:", e);
          }
        }
        // Dev mock: check localStorage
        const user = await base44.auth.me();
        const isAdmin = user?.email === 'admin@wealthlens.com';
        const isPremium = user?.isPremium === true;
        return { data: { isActive: isAdmin || isPremium } };
      }

      if (name === 'stripeCheckout') {
        if (isProd) {
          const resp = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
            cache: 'no-store'
          });
          const isJson = resp.headers.get("content-type")?.includes("application/json");
          const data = isJson ? await resp.json() : null;
          if (!resp.ok) {
            throw new Error(data?.error || `Checkout API error: ${resp.status}`);
          }
          return { data };
        }
        // Dev mock: simulate redirect
        return { data: { url: window.location.origin + '/calculator?checkout=success' } };
      }

      if (name === 'getDomainDemographics') {
        const { state, suburb, postcode, country } = params;
        const isAU = !country || country === 'AU';

        if (isAU && isProd) {
          try {
            const resp = await fetch(`/api/domain-proxy?endpoint=demographics&state=${state}&suburb=${suburb}&postcode=${postcode}`, { cache: 'no-store' });
            if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
              const data = await resp.json();
              return { data };
            }
            console.warn("[Base44] API returned non-JSON/Error (proxy missing). Falling back to mock.");
          } catch (e) {
            console.error("[Base44] Proxy fetch failed:", e);
          }
        }

        // Global/Dev mock: realistic demographics data
        return {
          data: {
            demographics: [
              { category: "Age", items: [{ label: "0-14", value: 18 }, { label: "15-64", value: 70 }, { label: "65+", value: 12 }] },
              { category: "Housing", items: [{ label: country === 'US' ? "Owned" : "Owned Outright", value: 30 }, { label: "Mortgage", value: 35 }, { label: "Rented", value: 35 }] },
              { category: "Family", items: [{ label: "Couple with children", value: 45 }, { label: "Couple without children", value: 40 }, { label: "Single parent", value: 15 }] }
            ]
          }
        };
      }

      if (name === 'getDomainPerformance') {
        const { state, suburb, postcode, country } = params;
        const isAU = !country || country === 'AU';

        if (isAU && isProd) {
          try {
            const resp = await fetch(`/api/domain-proxy?endpoint=performance&state=${state}&suburb=${suburb}&postcode=${postcode}`, { cache: 'no-store' });
            if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
              const data = await resp.json();
              return { data };
            }
            console.warn("[Base44] API returned non-JSON/Error (proxy missing). Falling back to mock.");
          } catch (e) {
            console.error("[Base44] Proxy fetch failed:", e);
          }
        }

        // Global/Dev mock: realistic performance statistics data
        const basePrice = country === 'US' ? 450000 : country === 'UK' ? 320000 : country === 'IN' ? 12000000 : 950000;
        const yieldRate = country === 'US' ? 5.5 : country === 'UK' ? 4.8 : country === 'IN' ? 2.5 : 3.8;

        return {
          data: {
            header: { suburb, state, country },
            series: [{
                data: [
                  { year: 2021, value: basePrice * 0.85 },
                  { year: 2022, value: basePrice * 0.92 },
                  { year: 2023, value: basePrice * 0.98 },
                  { year: 2024, value: basePrice * 1.05 },
                  { year: 2025, value: basePrice * 1.12 }
                ]
            }],
            statistics: {
              vacancyRate: 1.5 + Math.random(),
              listingsTrend: (Math.random() * 20) - 10,
              medianPrice: basePrice * 1.12,
              rentalYield: yieldRate,
              dom: 30 + Math.round(Math.random() * 20),
              monthsSupply: 3 + Math.random() * 2
            }
          }
        };
      }

      if (name === 'getGlobalAIInsights') {
        const { suburb, state, postcode, country } = params;
        if (isProd) {
          try {
            const resp = await fetch('/api/ai-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ suburb, state, postcode, country }),
              cache: 'no-store'
            });
            if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
              const data = await resp.json();
              return { data };
            }
          } catch (e) {
            console.error("[Base44] AI Insights fetch failed:", e);
          }
        }
        
        // Final fallback: High-quality local mock mirroring the AI structure
        const isAU = country === 'AU';
        const isUS = country === 'US';
        const isUK = country === 'UK';
        const fallbackPrice = isAU ? 950000 : isUS ? 480000 : isUK ? 380000 : 350000;
        const fallbackCurrency = isAU ? 'AUD' : isUS ? 'USD' : isUK ? 'GBP' : 'USD';
        const fallbackYield = isAU ? 3.8 : isUS ? 5.2 : isUK ? 4.1 : 5.0;
        const growth = isAU ? 0.062 : 0.045;

        return {
          data: {
            medianPrice: fallbackPrice,
            currency: fallbackCurrency,
            rentalYield: fallbackYield,
            vacancyRate: isAU ? 1.1 : 1.8,
            investmentScore: isAU ? 72 : 65,
            sentiment: isAU ? "Bullish / Strong" : "Neutral / Monitor",
            insights: isAU
              ? `${suburb} is a well-established suburb with strong owner-occupier demand and historically low vacancy rates. Proximity to key employment corridors and quality school catchments continues to underpin capital growth. Interest rate pressures remain a headwind but the market is showing resilience.`
              : `The property market in ${suburb} is showing resilience with steady demand from professional families. Low inventory is supporting current price levels despite high interest rates. Rental demand remains solid providing good yield support.`,
            demographics: [
              { category: "Age", items: [{ label: "0-14", value: 18 }, { label: "15-64", value: 70 }, { label: "65+", value: 12 }] },
              { category: "Housing", items: [{ label: "Owned", value: isAU ? 35 : 30 }, { label: "Mortgage", value: isAU ? 38 : 35 }, { label: "Rented", value: isAU ? 27 : 35 }] }
            ],
            categoryScores: {
              affordability: isAU ? 55 : 65,
              lifestyle: isAU ? 85 : 78,
              transport: isAU ? 78 : 72,
              schools: isAU ? 88 : 82,
              safety: isAU ? 90 : 85
            },
            historicalSeries: [
              { year: 2021, value: Math.round(fallbackPrice / (1 + growth * 4)) },
              { year: 2022, value: Math.round(fallbackPrice / (1 + growth * 3)) },
              { year: 2023, value: Math.round(fallbackPrice / (1 + growth * 2)) },
              { year: 2024, value: Math.round(fallbackPrice / (1 + growth)) },
              { year: 2025, value: fallbackPrice }
            ],
            projects: isAU 
              ? ["State Infrastructure Investment Program", "Local Library and Community Centre Upgrade", "Transport Link Enhancement"]
              : ["Local Transit Expansion", "New Commercial Hub", "State School Upgrade"]
          }
        };
      }

      if (name === 'sendSupportEmail') {
        return { data: { success: true } };
      }
      if (name === 'getStripeKey') {
         return { data: { publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo' } };
      }
      return { data: { success: true } };
    }
  },
  agents: {
    createConversation: async (params) => {
      console.log('[Mock Base44] Agent conversation created', params);
      return { id: 'conv-123', messages: [] };
    },
    subscribeToConversation: (id, callback) => {
       // Return a dummy unsubscribe function
       return () => {};
    },
    addMessage: async (conv, message) => {
      console.log(`[Mock Base44] Agent message sent: ${message.content}`);
      // Simulate an AI response delay
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            role: 'assistant',
            content: "Hello! I am running locally via the Antigravity mock agent. I can't answer financial questions right now, but your interface is fully working!"
          });
        }, 1000);
      });
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async (params) => {
         console.log('[Mock Base44] LLM Invoked', params);

         const promptStr = String(params.prompt).toLowerCase();

         // Detect currency to localize responses
         const currencyMatch = promptStr.match(/in ([a-z]{3}) currency|currency: ([a-z]{3})/i);
         const currency = currencyMatch ? (currencyMatch[1] || currencyMatch[2]).toUpperCase() : 'USD';
         
         let countryName = 'the US';
         let taxAccounts = { primary: 'Roth IRA', secondary: 'HSA', taxFree: 'tax free' };
         
         if (currency === 'GBP') {
             countryName = 'the UK';
             taxAccounts = { primary: 'Stocks & Shares ISA', secondary: 'SIPP', taxFree: 'tax free' };
         } else if (currency === 'EUR') {
             countryName = 'Europe';
             taxAccounts = { primary: 'tax-advantaged savings accounts', secondary: 'pension schemes', taxFree: 'tax-exempt' };
         } else if (currency === 'AUD') {
             countryName = 'Australia';
             taxAccounts = { primary: 'Superannuation', secondary: 'Investment Bonds', taxFree: 'tax free' };
         } else if (currency === 'CAD') {
             countryName = 'Canada';
             taxAccounts = { primary: 'TFSA', secondary: 'RRSP', taxFree: 'tax free' };
         } else if (currency === 'INR') {
             countryName = 'India';
             taxAccounts = { primary: 'PPF / ELSS', secondary: 'NPS', taxFree: 'tax-exempt' };
         }

         // Detect instrument for Market Sentiment
         const isStocks = promptStr.includes('stock') || promptStr.includes('etf');
         const isCrypto = promptStr.includes('crypto');
         const isProperty = promptStr.includes('property') || promptStr.includes('real estate');
         
         let instrumentName = 'the market';
         if (isStocks) instrumentName = 'equities';
         if (isCrypto) instrumentName = 'the crypto market';
         if (isProperty) instrumentName = 'the property market';

         // If it's the Market Sentiment prompt
         if (promptStr.includes('market conditions for') || promptStr.includes('market sentiment')) {
           return {
             sentiment: Math.random() > 0.5 ? "bullish" : "neutral", 
             summary: `The outlook for ${instrumentName} in ${countryName} is currently showing mixed signals but leans positive based on local economic indicators for ${currency}.`,
             key_trends: [`Local inflation trends impacting ${currency}`, `${instrumentName} adjusting to central bank policies in ${countryName}`, "Retail participation stabilizing"],
             outlook: `Cautiously optimistic for the next 6-12 months for ${currency} denominated assets.`,
             risks: ["Geopolitical tensions", `Unexpected rate hikes by the central bank in ${countryName}`],
             recommended_rates: { conservative: 4.5, moderate: 7.0, aggressive: 10.5 }
           };
         }

         // If it's the Tax Optimization prompt
         if (promptStr.includes('tax optimization expert')) {
           return {
             summary: `Given your projected returns in ${countryName}, focusing on ${currency} denominated tax sheltered accounts will dramatically improve your net take home.`,
             strategies: [
               { title: `Maximize ${taxAccounts.primary} Contributions`, description: `Contribute to ${taxAccounts.primary} before fully funding taxable brokerages in ${countryName}.`, estimated_savings: "Varies", timeframe: "Annually", difficulty: "Easy" },
               { title: "Tax Loss Harvesting", description: "Offset capital gains by selling underperforming assets strategically before the local financial year end.", estimated_savings: "Varies", timeframe: "End of Year", difficulty: "Moderate" }
             ],
             account_recommendations: [
               { account_type: taxAccounts.primary, benefits: `${taxAccounts.taxFree} growth and withdrawals`, contribution_limits: "Annual limit applies" },
               { account_type: taxAccounts.secondary, benefits: "Tax deferred growth for retirement", contribution_limits: "Subject to income" }
             ],
             withdrawal_strategy: `Pull from taxable accounts first, then tax deferred, and finally ${taxAccounts.taxFree} accounts to allow maximum compounding under ${countryName} tax laws.`,
             key_tips: [`Consult a local tax professional in ${countryName} before making major changes`, "Keep investments held longer than 1 year for long-term capital gains rates"]
           };
         }

         // Default/Fallback: Investment Coach prompt
         // Extract values from the prompt using regex to give realistic, hyper-personalized mock advice
         const getNum = (regex) => {
           const match = promptStr.match(regex);
           if (!match) return 0;
           return parseFloat(match[1].replace(/,/g, ''));
         };
         
         const initial = getNum(/initial capital: [^\d]*([\d,]+)/i) || getNum(/initial investment: [^\d]*([\d,]+)/i);
         const monthly = getNum(/monthly addition: [^\d]*([\d,]+)/i) || getNum(/monthly contribution: [^\d]*([\d,]+)/i);
         const horizon = getNum(/horizon: (\d+)/i) || getNum(/time horizon: (\d+)/i) || 20;
         const finalVal = getNum(/nominal final value: [^\d]*([\d,]+)/i) || getNum(/final value: [^\d]*([\d,]+)/i);
         const fees = getNum(/annual fees: ([\d.]+)/i);
         const expectedReturn = getNum(/assumed return: ([\d.]+)/i) || getNum(/expected return: ([\d.]+)/i);

         // Calculate a realistic impact: increasing contributions by 20%
         const extraMonthly = Math.round(monthly * 0.2) || 100;
         const rate = expectedReturn / 100 / 12;
         const months = horizon * 12;
         const futureValueExtra = Math.round(extraMonthly * ((Math.pow(1 + rate, months) - 1) / rate));
         
         // Calculate fee impact roughly
         const feeImpact = Math.round(finalVal * (fees / 100) * (horizon / 2));

         return {
           assessment: `Based on your ${horizon}-year horizon and ${expectedReturn}% target return in ${countryName}, your portfolio is well-positioned, but we can optimise it significantly.`,
           tone: "excellent",
           recommendations: [
             { 
               action: `Increase your monthly contribution by ${currency} ${extraMonthly.toLocaleString()}`, 
               impact: `This small change compounds to an extra ${currency} ${futureValueExtra.toLocaleString()} at year ${horizon}.`, 
               priority: "high" 
             },
             { 
               action: fees > 0.5 ? `Lower your ${fees}% annual fee` : "Reinvest all dividend yields automatically", 
               impact: fees > 0.5 ? `Current fees will drag your portfolio down by approximately ${currency} ${feeImpact.toLocaleString()} over ${horizon} years.` : "Accelerates compounding significantly in the final 5 years.", 
               priority: fees > 0.5 ? "urgent" : "medium" 
             },
             {
               action: `Utilize ${taxAccounts.primary} in ${countryName}`,
               impact: `Shields your ${currency} ${(finalVal - (initial + monthly * 12 * horizon)).toLocaleString()} projected profit from massive tax drag.`,
               priority: "high"
             }
           ],
           key_insights: [
             `Your largest risk is the ${fees}% fee compounding negatively against your ${expectedReturn}% gross return.`,
             `Your biggest opportunity is tax-advantaged compounding inside ${countryName}'s ${taxAccounts.taxFree} system.`
           ],
           closing_motivation: `You are on track to build serious wealth. Tweak these numbers today, and your future self will thank you!`
         };

      }
    }
  },
  // Added for Admin Pricing Controls
  app: {
    getPrice: async () => {
      const price = localStorage.getItem('appPremiumPrice') || '10';
      return parseInt(price, 10);
    },
    updatePrice: async (newPrice) => {
      localStorage.setItem('appPremiumPrice', newPrice.toString());
      return true;
    },
    // Call this after a successful Stripe payment to grant premium to the user
    grantPremium: async (email) => {
      const stored = localStorage.getItem('mockUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === email) {
          user.isPremium = true;
          localStorage.setItem('mockUser', JSON.stringify(user));
          return true;
        }
      }
      return false;
    }
  }
};
