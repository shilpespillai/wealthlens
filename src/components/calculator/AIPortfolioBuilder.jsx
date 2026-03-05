import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Clock, TrendingUp, Shield, Loader2, ChevronRight, PieChart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

const goals = [
  { id: "retirement", label: "Retirement", icon: "🏖️" },
  { id: "wealth", label: "Wealth Building", icon: "📈" },
  { id: "house", label: "Buy a Home", icon: "🏠" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "passive_income", label: "Passive Income", icon: "💰" },
  { id: "emergency", label: "Emergency Fund", icon: "🛡️" },
];

const riskLevels = [
  { id: "conservative", label: "Conservative", desc: "Capital preservation, low risk", color: "text-blue-400" },
  { id: "moderate", label: "Moderate", desc: "Balanced growth and stability", color: "text-indigo-400" },
  { id: "aggressive", label: "Aggressive", desc: "Maximum growth, high risk", color: "text-violet-400" },
];

export default function AIPortfolioBuilder({ currency = "USD" }) {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [risk, setRisk] = useState("moderate");
  const [age, setAge] = useState(30);
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [horizon, setHorizon] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleGoal = (id) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const buildPortfolio = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert financial advisor. Build a personalized investment portfolio for a user with these details:
- Goals: ${selectedGoals.join(", ")}
- Risk tolerance: ${risk}
- Age: ${age}
- Monthly investment: ${currency} ${monthlyAmount}
- Time horizon: ${horizon} years

Return a detailed portfolio recommendation. Make the allocations sum to 100%.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            expectedReturn: { type: "number" },
            riskScore: { type: "number" },
            allocations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  asset: { type: "string" },
                  percentage: { type: "number" },
                  rationale: { type: "string" },
                  examples: { type: "string" }
                }
              }
            },
            strategies: { type: "array", items: { type: "string" } },
            projectedValue: { type: "number" },
            monthlyIncome: { type: "number" },
            warnings: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResult(res);
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Portfolio Builder</h3>
          <p className="text-xs text-slate-600">Get a personalized investment plan built by AI</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Goals & Risk */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-1">What are your investment goals?</h4>
              <p className="text-xs text-slate-600 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedGoals.includes(g.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <span className="text-xs font-semibold text-slate-900">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Risk Tolerance</h4>
              <div className="grid grid-cols-3 gap-3">
                {riskLevels.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRisk(r.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      risk === r.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className={`text-xs font-bold mb-1 ${r.color}`}>{r.label}</div>
                    <div className="text-xs text-slate-700">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={selectedGoals.length === 0}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold rounded-xl py-3"
            >
              Next <ChevronRight className="w-4 h-4 ml-1 inline" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="space-y-8 mb-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Your Age</label>
                  <span className="text-sm font-bold text-indigo-600">{age} years</span>
                </div>
                <Slider value={[age]} onValueChange={([v]) => setAge(v)} min={18} max={75} step={1} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Monthly Investment</label>
                  <span className="text-sm font-bold text-indigo-600">{sym}{monthlyAmount.toLocaleString()}</span>
                </div>
                <Slider value={[monthlyAmount]} onValueChange={([v]) => setMonthlyAmount(v)} min={50} max={10000} step={50} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">Time Horizon</label>
                  <span className="text-sm font-bold text-indigo-600">{horizon} years</span>
                </div>
                <Slider value={[horizon]} onValueChange={([v]) => setHorizon(v)} min={1} max={40} step={1} className="w-full" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="border-slate-200 text-slate-900 hover:bg-slate-100 flex-1">Back</Button>
              <Button
                onClick={buildPortfolio}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-xl flex-1"
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building...</> : <><Sparkles className="w-4 h-4 mr-2" /> Build My Portfolio</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Summary Banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-6">
              <p className="text-sm text-slate-800 leading-relaxed">{result.summary}</p>
              <div className="flex gap-6 mt-4">
                <div>
                  <div className="text-xs text-slate-600">Expected Return</div>
                  <div className="text-xl font-bold text-indigo-600">{result.expectedReturn}% p.a.</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Risk Score</div>
                  <div className="text-xl font-bold text-violet-600">{result.riskScore}/10</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600">Projected Value</div>
                  <div className="text-xl font-bold text-emerald-600">{sym}{(result.projectedValue || 0).toLocaleString()}</div>
                </div>
                {result.monthlyIncome > 0 && (
                  <div>
                    <div className="text-xs text-slate-600">Monthly Income</div>
                    <div className="text-xl font-bold text-amber-600">{sym}{(result.monthlyIncome || 0).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pie + Allocations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4">Asset Allocation</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={result.allocations}
                      dataKey="percentage"
                      nameKey="asset"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {result.allocations.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
                      formatter={(v) => [`${v}%`]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {result.allocations.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-slate-900">{a.asset}</span>
                        <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>{a.percentage}%</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{a.rationale}</p>
                      {a.examples && <p className="text-xs text-indigo-600 mt-0.5">{a.examples}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategies */}
            {result.strategies?.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-5 mb-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Recommended Strategies</h4>
                <ul className="space-y-2">
                  {result.strategies.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-400 mt-0.5">✦</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4">
                <h4 className="text-xs font-bold text-amber-400 mb-2">⚠ Things to Watch</h4>
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-200/80">{w}</p>
                ))}
              </div>
            )}

            <Button
              onClick={() => { setStep(1); setResult(null); setSelectedGoals([]); }}
              variant="outline"
              className="border-slate-200 text-slate-900 hover:bg-slate-100 w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Rebuild Portfolio
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}