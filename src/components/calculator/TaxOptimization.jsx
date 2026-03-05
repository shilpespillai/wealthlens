import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingDown, DollarSign, CalendarClock, Loader2, RefreshCw } from "lucide-react";
import { getCurrencySymbol } from "./CurrencySelector";

export default function TaxOptimization({ params, instrument, results }) {
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState(null);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const sym = getCurrencySymbol(params.currency);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As a tax optimization expert, provide specific strategies for minimizing taxes on a ${instrument} investment with the following details:
        - Initial Investment: ${sym}${params.initialAmount.toLocaleString()}
        - Monthly Contribution: ${sym}${params.monthlyContribution.toLocaleString()}
        - Time Horizon: ${params.years} years
        - Expected Return: ${params.returnRate}%
        - Current Tax Rate: ${params.taxRate}%
        - Currency: ${params.currency}
        - Projected Total Gains: ${sym}${results.summary.totalReturns.toLocaleString()}
        
        Provide practical, actionable tax optimization strategies including:
        1. Tax-advantaged account recommendations (401k, IRA, Roth, etc.)
        2. Tax-loss harvesting opportunities
        3. Optimal withdrawal strategies
        4. Capital gains management
        5. Estimated tax savings with each strategy
        
        Be specific with dollar amounts and percentages where possible.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_savings: { type: "string" },
                  timeframe: { type: "string" },
                  difficulty: { type: "string", enum: ["Easy", "Moderate", "Complex"] }
                }
              }
            },
            account_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  account_type: { type: "string" },
                  benefits: { type: "string" },
                  contribution_limits: { type: "string" }
                }
              }
            },
            withdrawal_strategy: { type: "string" },
            key_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      setStrategies(result);
    } catch (error) {
      console.error('Failed to fetch tax strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStrategies();
  }, [params.taxRate, results.summary.totalReturns]);

  if (loading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-300">Analyzing tax optimization strategies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!strategies) return null;

  const difficultyColors = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
    Moderate: "bg-amber-500/10 text-amber-400 border-amber-400/20",
    Complex: "bg-rose-500/10 text-rose-400 border-rose-400/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Tax Optimization Strategies</h3>
          <p className="text-xs text-slate-600">Maximize your after-tax returns</p>
        </div>
        <Button onClick={fetchStrategies} variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200">
        <p className="text-sm text-slate-800 leading-relaxed">{strategies.summary}</p>
      </div>

      {/* Tax Strategies */}
      {strategies.strategies && strategies.strategies.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Recommended Strategies
          </h4>
          <div className="space-y-3">
            {strategies.strategies.map((strategy, i) => (
              <div key={i} className="bg-slate-50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="text-sm font-bold text-slate-900">{strategy.title}</h5>
                  <Badge className={`${difficultyColors[strategy.difficulty]} border`}>
                    {strategy.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-3 leading-relaxed">{strategy.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{strategy.estimated_savings}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>{strategy.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account Recommendations */}
      {strategies.account_recommendations && strategies.account_recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-4">Tax-Advantaged Accounts</h4>
          <div className="grid gap-3">
            {strategies.account_recommendations.map((account, i) => (
              <div key={i} className="bg-slate-50 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                <h5 className="text-sm font-bold text-indigo-300 mb-2">{account.account_type}</h5>
                <p className="text-xs text-slate-300 mb-2">{account.benefits}</p>
                <p className="text-xs text-slate-400 italic">{account.contribution_limits}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Strategy */}
      {strategies.withdrawal_strategy && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Optimal Withdrawal Strategy</h4>
          <div className="bg-slate-50 backdrop-blur-sm rounded-2xl p-5 border border-slate-200">
            <p className="text-sm text-slate-800 leading-relaxed">{strategies.withdrawal_strategy}</p>
          </div>
        </div>
      )}

      {/* Key Tips */}
      {strategies.key_tips && strategies.key_tips.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em] mb-3">Key Tips</h4>
          <div className="space-y-2">
            {strategies.key_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 flex-1 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-slate-500 italic text-center pt-2 border-t border-white/5">
        Tax strategies are personalized based on your inputs • Consult a tax professional for specific advice
      </p>
    </motion.div>
  );
}