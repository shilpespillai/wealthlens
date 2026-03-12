import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch live market data from LLM with web search
    const now = new Date().toISOString();
    const marketData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `It is currently ${now}. Search the web RIGHT NOW for the latest real-time prices of these financial instruments. 
      
CRITICAL: Use accurate current prices. As of early 2026:
- Bitcoin (BTC) trades around $80,000-$100,000 USD (NOT thousands in the hundreds, NOT sub-$10,000)
- Ethereum (ETH) trades around $2,000-$4,000 USD
- S&P 500 is around 5,500-6,000+
- Gold is around $2,500-$3,000 per oz
- Oil is around $65-$85 per barrel

Search for the actual current prices now and return accurate data. Do NOT use outdated or fabricated values.

Return a JSON object with this exact structure:
{
  "stocks": {
    "sp500": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" },
    "nasdaq": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" },
    "dow": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" }
  },
  "crypto": {
    "bitcoin": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" },
    "ethereum": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" }
  },
  "commodities": {
    "gold": { "value": number, "change": number, "changePercent": number, "unit": "USD per oz", "lastUpdated": "ISO timestamp" },
    "oil": { "value": number, "change": number, "changePercent": number, "unit": "USD per barrel", "lastUpdated": "ISO timestamp" }
  },
  "forex": {
    "eurusd": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" },
    "gbpusd": { "value": number, "change": number, "changePercent": number, "lastUpdated": "ISO timestamp" }
  },
  "interest_rates": {
    "fed_rate": { "value": number, "description": "Current Federal Funds Rate", "lastUpdated": "ISO timestamp" }
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