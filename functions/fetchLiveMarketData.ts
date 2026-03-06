import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch live market data from LLM with web search
    const now = new Date().toISOString();
    const marketData = await base44.integrations.Core.InvokeLLM({
      prompt: `It is currently ${now}. Provide the LATEST real-time market data as of right now. Search the web for current prices. Get live data from today's market:
{
  "stocks": {
    "sp500": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    },
    "nasdaq": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    },
    "dow": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    }
  },
  "crypto": {
    "bitcoin": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    },
    "ethereum": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    }
  },
  "commodities": {
    "gold": {
      "value": number,
      "change": number,
      "changePercent": number,
      "unit": "USD per oz",
      "lastUpdated": "ISO timestamp"
    },
    "oil": {
      "value": number,
      "change": number,
      "changePercent": number,
      "unit": "USD per barrel",
      "lastUpdated": "ISO timestamp"
    }
  },
  "forex": {
    "eurusd": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    },
    "gbpusd": {
      "value": number,
      "change": number,
      "changePercent": number,
      "lastUpdated": "ISO timestamp"
    }
  },
  "interest_rates": {
    "fed_rate": {
      "value": number,
      "description": "Current Federal Funds Rate",
      "lastUpdated": "ISO timestamp"
    }
  }
}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          stocks: { type: "object" },
          crypto: { type: "object" },
          commodities: { type: "object" },
          forex: { type: "object" },
          interest_rates: { type: "object" }
        }
      }
    });

    return Response.json(marketData);
  } catch (error) {
    console.error('Market data fetch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});