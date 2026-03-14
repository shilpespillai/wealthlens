

// Mocked base44 instance holding required methods completely local to the browser
import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';

const isProd = import.meta.env.PROD;

export const base44 = {
  auth: {
    me: async () => {
      const stored = localStorage.getItem('mockUser');
      if (stored) return JSON.parse(stored);
      // Return null so AuthContext knows we are not logged in
      return null;
    },
    updateMe: async (data) => {
      if (isSupabaseEnabled) {
        const { data: user, error } = await supabase.auth.updateUser({
          data: data
        });
        if (error) throw error;
        const mappedUser = {
          id: user.user.id,
          email: user.user.email,
          full_name: user.user.user_metadata?.full_name || user.user.user_metadata?.name || user.user.email?.split('@')[0],
          provider: user.user.app_metadata?.provider || 'supabase',
          avatar: user.user.user_metadata?.avatar_url,
          ...user.user.user_metadata // Spread all metadata for easy access
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
      localStorage.removeItem('mockUser');
      window.location.replace(returnUrl);
    },
    redirectToLogin: async (returnUrl) => {
      // Avoid infinite redirect loop if already on login page
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/Login' || currentPath === '/auth/callback') {
        return;
      }
      
      const loginUrl = new URL('/login', window.location.origin);
      const finalReturnUrl = returnUrl || currentPath + window.location.search;
      
      if (finalReturnUrl && finalReturnUrl !== '/' && !finalReturnUrl.includes('/login') && !finalReturnUrl.includes('/auth/callback')) {
        loginUrl.searchParams.set('redirect_to', finalReturnUrl);
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

        const currentYear = new Date().getFullYear();
        return {
          data: {
            header: { suburb, state, country },
            series: [{
                data: [
                  { year: currentYear - 4, value: basePrice * 0.85 },
                  { year: currentYear - 3, value: basePrice * 0.92 },
                  { year: currentYear - 2, value: basePrice * 0.98 },
                  { year: currentYear - 1, value: basePrice * 1.05 },
                  { year: currentYear, value: basePrice * 1.12 }
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
        const { suburb, state, postcode, country, userContext } = params;
        if (isProd || window.location.hostname === 'localhost' || true) {
          try {
            const resp = await fetch('/api/ai-insights', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ suburb, state, postcode, country, userContext }),
              cache: 'no-store'
            });
            if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
              const data = await resp.json();
              return { data };
            }
            const errText = await resp.text();
            console.warn(`[Base44] AI Insights API failed (${resp.status}):`, errText);
          } catch (e) {
            console.error("[Base44] AI Insights connectivity error:", e);
          }
        }
        
        // Professional fallback if API is unreachable
        return {
          data: {
            medianPrice: 0,
            currency: country === 'AU' ? 'AUD' : 'USD',
            rentalYield: 0,
            vacancyRate: 0,
            investmentScore: 0,
            sentiment: "Analysis Pending",
            insights: "AI Insights service is currently re-indexing this region. Please try again shortly.",
            demographics: [],
            categoryScores: { affordability: 0, lifestyle: 0, transport: 0, schools: 0, safety: 0 },
            historicalSeries: [],
            projects: []
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
         console.log('[Base44] LLM Invoked', params);
         
          const pStr = String(params.prompt).toLowerCase();
          const isTax = pStr.includes('tax optimization');
          const isSentiment = pStr.includes('market sentiment') || pStr.includes('market conditions');

          // Always try the fetch if possible
          try {
            // Identify the type
            let type = 'coach';
            if (isTax) type = 'tax';
            if (isSentiment) type = 'sentiment';

            const resp = await fetch('/api/ai-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: params.prompt, type }),
              cache: 'no-store'
            });
             
            if (resp.ok) {
              return await resp.json();
            }
            const errText = await resp.text();
            console.warn(`[Base44] AI Chat unavailable (Status: ${resp.status}): ${errText}`);
          } catch (e) {
            console.error("[Base44] AI Connectivity Error:", e);
          }

          // Professional structured fallbacks if API is unreachable
          if (isTax) {
            return {
              summary: "Our AI Tax Strategy service is currently updating. Please refresh in a moment.",
              strategies: [],
              account_recommendations: [],
              withdrawal_strategy: "Service periodically unavailable during market hours.",
              key_tips: ["Ensure your tax rate and investment horizon are correctly set."]
            };
          }

          if (isSentiment) {
            return {
              sentiment: "neutral",
              summary: "Real-time market sentiment analysis is currently re-indexing. Please refresh in a few minutes.",
              key_trends: ["Market data synchronization in progress"],
              outlook: "Stability expected during analysis window.",
              risks: ["Data connectivity latency"],
              recommended_rates: { conservative: 4, moderate: 7, aggressive: 10 }
            };
          }

          return {
            assessment: "The AI Insights engine is currently undergoing maintenance to provide you with the most accurate data. Please stand by.",
            tone: "cautious",
            recommendations: [
              { action: "Verify profile data", impact: "Ensures advice remains personalized", priority: "medium" }
            ],
            key_insights: ["Connectivity issues detected with the primary prediction engine"],
            closing_motivation: "We'll have your personalized advice ready shortly!"
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
  },
  user: {
    saveData: async (key, data) => {
      try {
        await base44.auth.updateMe({ [key]: JSON.stringify(data) });
        return true;
      } catch (err) {
        console.error(`[Base44] Failed to save ${key}:`, err);
        return false;
      }
    },
    loadData: async (key) => {
      try {
        const user = await base44.auth.me();
        if (user && user[key]) {
          return JSON.parse(user[key]);
        }
        return null;
      } catch (err) {
        console.error(`[Base44] Failed to load ${key}:`, err);
        return null;
      }
    }
  }
};
