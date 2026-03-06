import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, DollarSign, PieChart, Zap } from "lucide-react";
import { getCurrencySymbol } from "./CurrencySelector";
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const INSTRUMENT_META = {
  stocks:        { name: 'Stocks',        color: '#6366f1' },
  etf:           { name: 'ETF',           color: '#8b5cf6' },
  property:      { name: 'Property',      color: '#10b981' },
  crypto:        { name: 'Crypto',        color: '#f59e0b' },
  bonds:         { name: 'Bonds',         color: '#3b82f6' },
  fixed_deposit: { name: 'Fixed Deposit', color: '#06b6d4' },
  mutual_funds:  { name: 'Mutual Funds',  color: '#ec4899' },
  gold:          { name: 'Gold',          color: '#d97706' },
  commodities:   { name: 'Commodities',  color: '#84cc16' },
  forex:         { name: 'Forex',        color: '#f43f5e' },
};

export default function PortfolioOverview({ params, instrument, results, currency }) {
  const sym = getCurrencySymbol(currency);

  const portfolioMetrics = useMemo(() => {
    // Base investment metrics
    const totalInvested = params.initialAmount + params.monthlyContribution * 12 * params.years;
    const finalValue = results.summary.finalValue;
    const totalReturn = results.summary.totalReturns;
    const annualizedReturn = (Math.pow(finalValue / totalInvested, 1 / params.years) - 1) * 100;

    // Diversification breakdown — dynamically based on selected instrument
    const INSTRUMENT_META = {
      stocks:        { name: 'Stocks',        color: '#6366f1' },
      etf:           { name: 'ETF',           color: '#8b5cf6' },
      property:      { name: 'Property',      color: '#10b981' },
      crypto:        { name: 'Crypto',        color: '#f59e0b' },
      bonds:         { name: 'Bonds',         color: '#3b82f6' },
      fixed_deposit: { name: 'Fixed Deposit', color: '#06b6d4' },
      mutual_funds:  { name: 'Mutual Funds',  color: '#ec4899' },
      gold:          { name: 'Gold',          color: '#d97706' },
      commodities:   { name: 'Commodities',  color: '#84cc16' },
      forex:         { name: 'Forex',        color: '#f43f5e' },
    };
    const meta = INSTRUMENT_META[instrument] || { name: instrument, color: '#6366f1' };
    // Show selected instrument as 60%, then suggest a complementary split
    const complementary = Object.entries(INSTRUMENT_META)
      .filter(([id]) => id !== instrument)
      .slice(0, 3);
    const complementaryTotal = 40;
    const eachShare = Math.floor(complementaryTotal / complementary.length);
    const diversificationData = [
      { name: meta.name, value: 60, color: meta.color },
      ...complementary.map(([, m], i) => ({
        name: m.name,
        value: i === complementary.length - 1 ? complementaryTotal - eachShare * (complementary.length - 1) : eachShare,
        color: m.color,
      })),
    ];


    // Cash flow analysis
    const monthlyContribution = params.monthlyContribution;
    const projectedMonthlyIncome = finalValue * 0.04 / 12; // 4% withdrawal rate
    const netCashflow = projectedMonthlyIncome - monthlyContribution;

    // Risk assessment
    const riskLevel =
      instrument === 'crypto' ? 'High' :
      instrument === 'forex' ? 'High' :
      instrument === 'stocks' ? 'Medium-High' :
      instrument === 'etf' ? 'Medium-High' :
      instrument === 'mutual_funds' ? 'Medium' :
      instrument === 'commodities' ? 'Medium' :
      instrument === 'property' ? 'Medium' :
      instrument === 'gold' ? 'Low-Medium' :
      instrument === 'bonds' ? 'Low' :
      instrument === 'fixed_deposit' ? 'Low' : 'Medium';

    return {
      totalInvested,
      finalValue,
      totalReturn,
      annualizedReturn,
      diversificationData,
      monthlyContribution,
      projectedMonthlyIncome,
      netCashflow,
      riskLevel
    };
  }, [params, instrument, results, currency]);

  const safe = (num) => isFinite(num) && !isNaN(num) ? num : 0;
  const fmt = (num) => `${sym}${safe(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }} className="bg-slate-700 p-8 rounded-3xl from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">


      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Portfolio Overview</h3>
          <p className="text-xs text-slate-400">Asset wealth projection & performance metrics</p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-5 border border-emerald-400/30">

          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-300 font-bold">Projected Net Worth</p>
          </div>
          <p className="text-2xl font-black text-white">{fmt(portfolioMetrics.finalValue)}</p>
          <p className="text-xs text-slate-400 mt-1">in {params.years} years</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl p-5 border border-indigo-400/30">

          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-indigo-400" />
            <p className="text-xs text-indigo-300 font-bold">Total Return</p>
          </div>
          <p className="text-2xl font-black text-white">{fmt(portfolioMetrics.totalReturn)}</p>
          <p className="text-xs text-slate-400 mt-1">+{portfolioMetrics.annualizedReturn.toFixed(1)}% p.a.</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl p-5 border border-violet-400/30">

          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <p className="text-xs text-violet-300 font-bold">Total Invested</p>
          </div>
          <p className="text-2xl font-black text-white">{fmt(portfolioMetrics.totalInvested)}</p>
          <p className="text-xs text-slate-400 mt-1">over {params.years} years</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl p-5 border border-amber-400/30">

          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <p className="text-xs text-amber-300 font-bold">Risk Level</p>
          </div>
          <p className="text-2xl font-black text-white">{portfolioMetrics.riskLevel}</p>
          <p className="text-xs text-slate-400 mt-1">{meta?.name || instrument}</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Recommended Asset Allocation
          </h4>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <RechartPie>
                <Pie
                  data={portfolioMetrics.diversificationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">
                  {portfolioMetrics.diversificationData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartPie>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {portfolioMetrics.diversificationData.map((entry, i) =>
              <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-300">{entry.name}</span>
                  <span className="text-xs font-bold text-white ml-1">{entry.value}%</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Diversification reduces risk and stabilizes returns
          </p>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Cash Flow Analysis
          </h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Monthly Contribution</span>
              <span className="text-lg font-bold text-white">{fmt(portfolioMetrics.monthlyContribution)}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Projected Monthly Income</span>
              <span className="text-lg font-bold text-emerald-400">{fmt(portfolioMetrics.projectedMonthlyIncome)}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Net Cashflow (Year {params.years})</span>
              <span className={`text-lg font-bold ${portfolioMetrics.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {portfolioMetrics.netCashflow >= 0 ? '+' : ''}{fmt(portfolioMetrics.netCashflow)}
              </span>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-xl p-4 border border-indigo-400/20 mt-4">
              <p className="text-xs text-indigo-300 font-bold mb-1">Passive Income Goal</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                At 4% withdrawal rate, your portfolio could generate <strong className="text-white">{fmt(portfolioMetrics.projectedMonthlyIncome)}/month</strong> in passive income
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Milestones */}
      <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-400/20 mt-6">
        <h4 className="text-sm font-bold text-violet-300 mb-4">Wealth Milestones</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
          { year: Math.ceil(params.years * 0.25), value: results.summary.finalValue * 0.25 },
          { year: Math.ceil(params.years * 0.5), value: results.summary.finalValue * 0.5 },
          { year: Math.ceil(params.years * 0.75), value: results.summary.finalValue * 0.75 },
          { year: params.years, value: results.summary.finalValue }].
          map((milestone, i) =>
          <div key={i} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Year {milestone.year}</p>
              <p className="text-lg font-bold text-white">{fmt(milestone.value)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Insights */}
      <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5 mt-6">
        <p className="text-xs text-slate-400 font-bold mb-2">📊 Portfolio Insights</p>
        <ul className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Your {portfolioMetrics.riskLevel === 'High' ? '⚠️ high-risk ' : ''}{INSTRUMENT_META[instrument]?.name || instrument} investment shows a projected {safe(portfolioMetrics.annualizedReturn).toFixed(1)}% annualized return</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-400 mt-0.5">•</span>
            <span>Consider diversifying across multiple asset classes to reduce portfolio volatility</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-violet-400 mt-0.5">•</span>
            <span>Your monthly contribution of {fmt(portfolioMetrics.monthlyContribution)} compounds to significant wealth over time</span>
          </li>
        </ul>
      </div>
    </motion.div>);

}