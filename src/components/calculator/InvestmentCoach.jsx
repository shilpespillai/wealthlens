import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, TrendingUp, Target, AlertCircle, Loader2, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "./CurrencySelector";

export default function InvestmentCoach({ params, instrument, results }) {
  const [loading, setLoading] = useState(false);
  const [coaching, setCoaching] = useState(null);
  const [error, setError] = useState(null);

  const fetchCoaching = async () => {
    if (!results?.summary) return;
    
    setLoading(true);
    setError(null);
    try {
      const sym = getCurrencySymbol(params.currency);
      const summary = results.summary;
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Act as an elite financial advisor analyzing a client's portfolio. Provide hyper-personalized, mathematically sound advice in a direct, encouraging tone.

CLIENT SCENARIO:
- Asset Class: ${instrument}
- Initial Capital: ${sym}${params.initialAmount?.toLocaleString() || 0}
- Monthly Addition: ${sym}${params.monthlyContribution?.toLocaleString() || 0}
- Horizon: ${params.years || 0} years
- Assumed Return: ${params.returnRate || 0}% p.a.
- Assumed Inflation: ${params.inflationRate || 0}% p.a.
- Tax Rate: ${params.taxRate || 0}%
- Annual Fees: ${params.fees || 0}%

PROJECTIONS:
- Nominal Final Value: ${sym}${summary.finalValue?.toLocaleString() || 0}
- Real Purchasing Power: ${sym}${summary.realValue?.toLocaleString() || 0}
- Net After-Tax: ${sym}${summary.afterTax?.toLocaleString() || 0}
- Total Profit: ${sym}${summary.totalReturns?.toLocaleString() || 0}
- Net Annualized Yield: ${summary.annualizedReturn?.toFixed(1) || 0}%

YOUR TASK:
1. Provide a sharp 1-2 sentence assessment of the sustainability and aggressiveness of this strategy.
2. Give 3-4 highly specific recommendations that use EXACT numbers (e.g., "Increasing your monthly contribution by $250 will yield an extra $140,000" or "Your ${params.fees}% fee is dragging returns down by $X").
3. List 2-3 key insights identifying the biggest hidden risk and largest opportunity in this specific setup.
4. Provide a strong closing motivational thought.

CRITICAL: Do not use generic advice. Every recommendation MUST reference the specific numbers provided above. Calculate simple math if needed for impact statements.`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            assessment: { type: "string" },
            tone: { type: "string", enum: ["encouraging", "cautious", "urgent", "excellent"] },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  impact: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] }
                }
              }
            },
            key_insights: { type: "array", items: { type: "string" } },
            closing_motivation: { type: "string" }
          }
        }
      });
      
      console.log("AI Coach response:", result);
      setCoaching(result);
    } catch (err) {
      console.error("AI Coach error:", err);
      setError(`Failed to generate coaching advice: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaching();
  }, [params.initialAmount, params.monthlyContribution, params.years, params.returnRate, results?.summary?.finalValue]);

  const toneConfig = {
    encouraging: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: TrendingUp },
    cautious: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle },
    urgent: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: AlertCircle },
    excellent: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: Target },
  };

  const priorityConfig = {
    high: { color: "bg-rose-100 text-rose-700 border-rose-300" },
    medium: { color: "bg-amber-100 text-amber-700 border-amber-300" },
    low: { color: "bg-slate-100 text-slate-700 border-slate-300" },
  };

  if (loading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-300">Your AI coach is analyzing your investment strategy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 mb-4">{error}</p>
          <Button onClick={fetchCoaching} variant="outline" size="sm" className="bg-slate-700/50 border-white/10 text-white">
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!coaching) return null;

  const config = toneConfig[coaching.tone] || toneConfig.encouraging;
  const ToneIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              AI Investment Coach
              <MessageCircle className="w-4 h-4 text-indigo-700" />
            </h3>
            <p className="text-xs text-slate-600">Personalized guidance for your strategy</p>
          </div>
        </div>
        <Button onClick={fetchCoaching} variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      {/* Assessment */}
      <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
        <div className="flex items-start gap-3">
          <ToneIcon className={`w-5 h-5 ${config.color} mt-0.5 flex-shrink-0`} />
          <p className="text-base text-slate-800 leading-relaxed font-medium">{coaching.assessment}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          Action Items
        </h4>
        <div className="space-y-3">
          {coaching.recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {i + 1}
                  </div>
                  <Badge className={`${(priorityConfig[rec.priority] || priorityConfig.medium).color} border text-[10px] font-bold uppercase tracking-wider`}>
                    {rec.priority} priority
                  </Badge>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1.5 pl-9">{rec.action}</p>
              <p className="text-xs text-slate-700 leading-relaxed pl-9">{rec.impact}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      {coaching.key_insights && coaching.key_insights.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Key Insights</h4>
          <div className="space-y-2.5">
            {coaching.key_insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-800 leading-relaxed flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing Motivation */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
        <p className="text-sm text-slate-800 leading-relaxed italic text-center">{coaching.closing_motivation}</p>
      </div>

      <p className="text-[10px] text-slate-500 italic text-center pt-2">
        AI-powered coaching • Based on your current strategy
      </p>
    </motion.div>
  );
}