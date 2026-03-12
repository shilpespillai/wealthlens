import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const news = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Find 6 real, current financial and investment news articles from today or the past 24-48 hours. 
For each article, provide the actual title, a brief summary, the real URL to the article, the news source name, the category, and whether the sentiment is bullish, bearish, or neutral.
Only include articles that have real, working URLs from reputable sources like Reuters, Bloomberg, CNBC, Financial Times, Wall Street Journal, MarketWatch, BBC Business, Guardian Business, Yahoo Finance, etc.
Return today's date: ${new Date().toISOString().split('T')[0]}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          articles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                url: { type: "string" },
                source: { type: "string" },
                category: { type: "string" },
                sentiment: { type: "string", enum: ["bullish", "bearish", "neutral"] },
                publishedAt: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json(news);
  } catch (error) {
    console.error('News fetch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});