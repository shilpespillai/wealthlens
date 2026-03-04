import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Palmtree, TrendingUp, DollarSign, Clock, Target, AlertCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { getCurrencySymbol } from "./CurrencySelector";

const fmt = (n, sym) => {
  const v = n || 0;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}K`;
  return `${sym}${v.toLocaleString()}`;
};

export default function RetirementPlanner({ currency = "USD" }) {
  const sym = getCurrencySymbol(currency);

  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [desiredIncome, setDesiredIncome] = useState(5000); // monthly in retirement
  const [returnRate, setReturnRate] = useState(7);
  const [inflationRate, setInflationRate] = useState(3);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);

  const results = useMemo(() => {
    const yearsToRetire = Math.max(0, retirementAge - currentAge);
    const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);
    const monthlyRate = returnRate / 100 / 12;
    const totalMonths = yearsToRetire * 12;

    // Accumulation phase
    let balance = currentSavings;
    const chartData = [];

    // Current point
    chartData.push({ age: currentAge, balance: Math.round(balance), phase: "accumulation" });

    for (let month = 1; month <= totalMonths; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      if (month % 12 === 0) {
        chartData.push({
          age: currentAge + month / 12,
          balance: Math.round(balance),
          phase: "accumulation"
        });
      }
    }

    const retirementNestEgg = balance;

    // How much you need using 4% withdrawal rule
    const annualIncome = desiredIncome * 12;
    const inflationAdjAnnual = annualIncome * Math.pow(1 + inflationRate / 100, yearsToRetire);
    const neededNestEgg = inflationAdjAnnual / 0.04;

    // Drawdown phase
    const drawdownRate = returnRate / 100 / 12;
    const monthlyWithdrawal = inflationAdjAnnual / 12;
    let drawBalance = retirementNestEgg;

    for (let month = 1; month <= yearsInRetirement * 12; month++) {
      drawBalance = drawBalance * (1 + drawdownRate) - monthlyWithdrawal;
      if (month % 12 === 0) {
        chartData.push({
          age: retirementAge + month / 12,
          balance: Math.round(Math.max(0, drawBalance)),
          phase: "retirement"
        });
      }
    }

    const gap = neededNestEgg - retirementNestEgg;
    const isOnTrack = retirementNestEgg >= neededNestEgg;

    // How much extra monthly needed to close gap
    let extraMonthly = 0;
    if (!isOnTrack && totalMonths > 0) {
      // FV of annuity: FV = PMT * ((1+r)^n - 1) / r
      const r = monthlyRate;
      const n = totalMonths;
      const fvFactor = (Math.pow(1 + r, n) - 1) / r;
      // gap = extraMonthly * fvFactor
      extraMonthly = Math.max(0, gap / fvFactor);
    }

    // When balance runs out
    let runsOutAge = null;
    if (drawBalance <= 0) {
      let b = retirementNestEgg;
      for (let m = 1; m <= yearsInRetirement * 12; m++) {
        b = b * (1 + drawdownRate) - monthlyWithdrawal;
        if (b <= 0) {
          runsOutAge = retirementAge + m / 12;
          break;
        }
      }
    }

    return {
      retirementNestEgg: Math.round(retirementNestEgg),
      neededNestEgg: Math.round(neededNestEgg),
      gap: Math.round(gap),
      isOnTrack,
      extraMonthly: Math.round(extraMonthly),
      inflationAdjIncome: Math.round(inflationAdjAnnual / 12),
      yearsToRetire,
      yearsInRetirement,
      chartData,
      runsOutAge,
      replacementRate: retirementNestEgg > 0 ? Math.min(200, Math.round((retirementNestEgg / neededNestEgg) * 100)) : 0,
    };
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, desiredIncome, returnRate, inflationRate, lifeExpectancy]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3">
        <div className="text-xs text-slate-400 mb-1">Age {label}</div>
        <div className="text-sm font-bold text-white">{fmt(payload[0]?.value, sym)}</div>
        <div className="text-xs text-slate-400">{payload[0]?.payload?.phase === "accumulation" ? "Accumulation" : "Retirement"}</div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
          <Palmtree className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Retirement Planner</h3>
          <p className="text-xs text-slate-400">Find out when you can retire and if you're on track</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Ages */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Current Age</label>
              <span className="text-sm font-bold text-emerald-400">{currentAge}</span>
            </div>
            <Slider value={[currentAge]} onValueChange={([v]) => setCurrentAge(Math.min(v, retirementAge - 1))} min={18} max={70} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Target Retirement Age</label>
              <span className="text-sm font-bold text-emerald-400">{retirementAge}</span>
            </div>
            <Slider value={[retirementAge]} onValueChange={([v]) => setRetirementAge(Math.max(v, currentAge + 1))} min={40} max={80} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Life Expectancy</label>
              <span className="text-sm font-bold text-emerald-400">{lifeExpectancy}</span>
            </div>
            <Slider value={[lifeExpectancy]} onValueChange={([v]) => setLifeExpectancy(v)} min={70} max={100} step={1} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Current Savings</label>
              <span className="text-sm font-bold text-emerald-400">{fmt(currentSavings, sym)}</span>
            </div>
            <Slider value={[currentSavings]} onValueChange={([v]) => setCurrentSavings(v)} min={0} max={1000000} step={1000} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Monthly Contribution</label>
              <span className="text-sm font-bold text-emerald-400">{sym}{monthlyContribution.toLocaleString()}</span>
            </div>
            <Slider value={[monthlyContribution]} onValueChange={([v]) => setMonthlyContribution(v)} min={0} max={10000} step={50} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-white">Desired Monthly Income in Retirement</label>
              <span className="text-sm font-bold text-emerald-400">{sym}{desiredIncome.toLocaleString()}</span>
            </div>
            <Slider value={[desiredIncome]} onValueChange={([v]) => setDesiredIncome(v)} min={500} max={20000} step={100} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-white">Return Rate</label>
                <span className="text-xs font-bold text-emerald-400">{returnRate}%</span>
              </div>
              <Slider value={[returnRate]} onValueChange={([v]) => setReturnRate(v)} min={1} max={15} step={0.5} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-white">Inflation</label>
                <span className="text-xs font-bold text-emerald-400">{inflationRate}%</span>
              </div>
              <Slider value={[inflationRate]} onValueChange={([v]) => setInflationRate(v)} min={0} max={8} step={0.5} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          {/* On Track Banner */}
          <motion.div
            key={results.isOnTrack ? "on" : "off"}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-2xl p-5 border ${results.isOnTrack
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{results.isOnTrack ? "✅" : "⚠️"}</span>
              <div>
                <div className={`text-base font-bold ${results.isOnTrack ? "text-emerald-400" : "text-red-400"}`}>
                  {results.isOnTrack ? "You're on track!" : "You have a gap"}
                </div>
                <div className="text-xs text-slate-300">
                  {results.isOnTrack
                    ? `You'll have ${fmt(results.retirementNestEgg, sym)} — ${results.replacementRate}% of your goal`
                    : `Need ${fmt(results.extraMonthly, sym)}/mo more to close the ${fmt(results.gap, sym)} gap`}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Years to Retire", value: results.yearsToRetire, unit: "yrs", color: "text-indigo-400" },
              { label: "Projected Nest Egg", value: fmt(results.retirementNestEgg, sym), unit: "", color: "text-emerald-400" },
              { label: "Needed Nest Egg", value: fmt(results.neededNestEgg, sym), unit: "", color: "text-violet-400" },
              { label: "Inflation-adj. Income", value: `${sym}${results.inflationAdjIncome.toLocaleString()}`, unit: "/mo", color: "text-amber-400" },
            ].map(item => (
              <div key={item.label} className="bg-slate-700/30 rounded-2xl p-4">
                <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                <div className={`text-lg font-bold ${item.color}`}>{item.value}<span className="text-xs ml-1 text-slate-400">{item.unit}</span></div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400">Retirement Readiness</span>
              <span className="text-xs font-bold text-white">{results.replacementRate}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, results.replacementRate)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${results.replacementRate >= 100 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-red-500 to-amber-500"}`}
              />
            </div>
          </div>

          {results.runsOutAge && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-200">
                At current withdrawal rate, savings may run out at age <strong>{Math.round(results.runsOutAge)}</strong>. Consider increasing contributions or adjusting spending.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8">
        <h4 className="text-sm font-bold text-white mb-1">Wealth Journey</h4>
        <p className="text-xs text-slate-400 mb-4">Accumulation phase → Retirement drawdown</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={results.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="age" tick={{ fill: "#94a3b8", fontSize: 10 }} label={{ value: "Age", position: "insideBottomRight", fill: "#64748b", fontSize: 10 }} />
            <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fill: "#94a3b8", fontSize: 10 }} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={retirementAge} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "Retirement", position: "top", fill: "#818cf8", fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              fill="url(#accGrad)"
              strokeWidth={2.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-slate-700/20 rounded-2xl border border-white/5">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Note:</strong> Uses the 4% safe withdrawal rule. Projections are estimates and actual results will vary. Consult a financial advisor for personalized advice.
        </p>
      </div>
    </div>
  );
}