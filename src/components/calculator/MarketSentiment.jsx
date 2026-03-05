import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { TrendingUp, TrendingDown, Minus, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sentimentConfig = {
  bullish: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  neutral: { icon: Minus, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
  bearish: { icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
};

const instrumentNames = {
  stocks: "Stock Market",
  etf: "ETFs and Index Funds",
  property: "Real Estate and Property Market",
  bonds: "Bond Market",
  mutual_funds: "Mutual Funds",
  fixed_deposit: "Fixed Deposits and Savings",
  crypto: "Cryptocurrency Market",
  gold: "Gold and Precious Metals",
};

export default function MarketSentiment({ instrument, currency }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const fetchSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the current market conditions for ${instrumentNames[instrument]} in ${currency} currency. 
        Provide a concise analysis covering:
        1. Current market sentiment (bullish/neutral/bearish)
        2. Key market trends and factors
        3. Short-term outlook (next 6-12 months)
        4. Risk factors to consider
        5. Recommended return rate range for conservative, moderate, and aggressive scenarios
        
        Keep it concise and actionable for investors.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment: { type: "string", enum: ["bullish", "neutral", "bearish"] },
            summary: { type: "string" },
            key_trends: { type: "array", items: { type: "string" } },
            outlook: { type: "string" },
            risks: { type: "array", items: { type: "string" } },
            recommended_rates: {
              type: "object",
              properties: {
                conservative: { type: "number" },
                moderate: { type: "number" },
                aggressive: { type: "number" }
              }
            }
          }
        }
      });
      setAnalysis(result);
    } catch (err) {
      setError("Failed to fetch market analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, [instrument, currency]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Analyzing market conditions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchSentiment} variant="outline" size="sm">
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const config = sentimentConfig[analysis.sentiment] || sentimentConfig.neutral;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-6"
    >
      {/* Header with sentiment */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Market Analysis</h3>
          <p className="text-xs text-slate-600">{instrumentNames[instrument]}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${config.bg} ${config.color} ${config.border} border flex items-center gap-1.5 px-3 py-1`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="font-semibold capitalize">{analysis.sentiment}</span>
          </Badge>
          <Button onClick={fetchSentiment} variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200">
        <p className="text-sm text-slate-800 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Key Trends */}
      {analysis.key_trends && analysis.key_trends.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Key Trends</h4>
          <div className="space-y-3">
            {analysis.key_trends.map((trend, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 flex-1 leading-relaxed">{trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outlook */}
      {analysis.outlook && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Outlook</h4>
          <p className="text-sm text-slate-800 leading-relaxed">{analysis.outlook}</p>
        </div>
      )}

      {/* Risks */}
      {analysis.risks && analysis.risks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Risk Factors</h4>
          <div className="space-y-3">
            {analysis.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 flex-1 leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Rates */}
      {analysis.recommended_rates && (
        <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-[0.15em] mb-4">Suggested Return Rates</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Conservative</p>
              <p className="text-xl font-black text-slate-200">{analysis.recommended_rates.conservative}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mb-2">Moderate</p>
              <p className="text-xl font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{analysis.recommended_rates.moderate}%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Aggressive</p>
              <p className="text-xl font-black text-slate-200">{analysis.recommended_rates.aggressive}%</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-500 italic text-center pt-2">
        Analysis powered by real-time market data • Updated {new Date().toLocaleDateString()}
      </p>
    </motion.div>
  );
}