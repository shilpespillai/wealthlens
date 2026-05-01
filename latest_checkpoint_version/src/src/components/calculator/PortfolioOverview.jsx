import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, DollarSign, PieChart, Zap, Shield, Receipt, ArrowDownRight, Calculator, ArrowRightLeft } from "lucide-react";
import { getCurrencySymbol } from "./CurrencySelector";
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

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
  const meta = INSTRUMENT_META[instrument] || { name: instrument, color: '#6366f1' };

  const portfolioMetrics = useMemo(() => {
    const { 
      finalValue, 
      totalReturns, 
      totalContributed, 
      afterTax, 
      taxPaid, 
      realValue, 
      totalReturnPercent: rawTRPercent, 
      annualizedReturn 
    } = results.summary;
    
    const totalReturnPercent = parseFloat(rawTRPercent) || 0;
    
    // Monthly stats
    const projectedMonthlyIncome = finalValue * 0.04 / 12; // 4% rule
    const netCashflow = projectedMonthlyIncome - params.monthlyContribution;

    // Risk assessment
    const riskLevel =
      instrument === 'crypto' ? 'High' :
      instrument === 'forex' ? 'High' :
      ['stocks', 'etf'].includes(instrument) ? 'Medium-High' :
      ['mutual_funds', 'commodities', 'property'].includes(instrument) ? 'Medium' :
      instrument === 'gold' ? 'Low-Medium' : 'Low';

    // Diversification breakdown — dynamically based on selected instrument
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

    return {
      totalInvested: totalContributed,
      finalValue,
      totalReturn: totalReturns,
      totalReturnPercent,
      annualizedReturn,
      afterTaxValue: afterTax,
      estimatedTax: taxPaid,
      realValue,
      projectedMonthlyIncome,
      netCashflow,
      riskLevel,
      diversificationData
    };
  }, [params, instrument, results, meta]);

  const safe = (num) => isFinite(num) && !isNaN(num) ? num : 0;
  const fmt = (num) => {
    const v = safe(num);
    if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(2)}B`;
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
    return `${sym}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const MetricCard = ({ label, value, subtext, icon: Icon, colorClass, borderClass, textClass }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl p-4 border transition-all ${colorClass} ${borderClass} overflow-hidden relative group flex flex-col`}
    >
      <div className="flex items-start gap-2 mb-2 relative z-10 min-h-[28px]">
        <Icon className={`w-3.5 h-3.5 ${textClass} mt-0.5 flex-shrink-0`} />
        <p className={`text-[9px] font-black uppercase tracking-[0.15em] ${textClass} leading-tight`}>{label}</p>
      </div>
      <p className="text-xl font-medium text-slate-300 relative z-10">{value}</p>
      <p className="text-[9px] text-slate-400 mt-1 relative z-10">{subtext}</p>
      <div className={`absolute top-0 right-0 w-12 h-12 rounded-full blur-2xl opacity-20 -mr-6 -mt-6 ${colorClass}`} />
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }} 
      className="bg-[#111827] p-6 rounded-[32px] border border-white/5 shadow-2zl overflow-hidden relative"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Portfolio Overview</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Asset wealth projection & performance metrics</p>
          </div>
        </div>
      </div>

      {/* 4x3 Grid of Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 relative z-10">
        {/* Row 1 */}
        <MetricCard 
          label="Projected Net Worth" 
          value={fmt(portfolioMetrics.finalValue)} 
          subtext={`In ${params.years} years`}
          icon={TrendingUp}
          colorClass="bg-emerald-500/5"
          borderClass="border-emerald-500/10"
          textClass="text-emerald-400"
        />
        <MetricCard 
          label="Total Invested" 
          value={fmt(portfolioMetrics.totalInvested)} 
          subtext="Principle contributions"
          icon={Zap}
          colorClass="bg-indigo-500/5"
          borderClass="border-indigo-500/10"
          textClass="text-indigo-400"
        />
        <MetricCard 
          label="Total Return ($)" 
          value={fmt(portfolioMetrics.totalReturn)} 
          subtext="Net profit earned"
          icon={DollarSign}
          colorClass="bg-[#C5A059]/5"
          borderClass="border-[#C5A059]/10"
          textClass="text-[#C5A059]"
        />
        <MetricCard 
          label="Total Return (%)" 
          value={`${portfolioMetrics.totalReturnPercent.toFixed(1)}%`} 
          subtext="Aggregate gain"
          icon={PieChart}
          colorClass="bg-purple-500/5"
          borderClass="border-purple-500/10"
          textClass="text-purple-400"
        />

        {/* Row 2 */}
        <MetricCard 
          label="After Tax Value" 
          value={fmt(portfolioMetrics.afterTaxValue)} 
          subtext="Post-liquidation estimation"
          icon={Shield}
          colorClass="bg-blue-500/5"
          borderClass="border-blue-500/10"
          textClass="text-blue-400"
        />
        <MetricCard 
          label="Estimated Tax" 
          value={fmt(portfolioMetrics.estimatedTax)} 
          subtext={`${params.taxRate}% estimated bracket`}
          icon={Receipt}
          colorClass="bg-rose-500/5"
          borderClass="border-rose-500/10"
          textClass="text-rose-400"
        />
        <MetricCard 
          label="Inflation Adj. Value" 
          value={fmt(portfolioMetrics.realValue)} 
          subtext={`At ${params.inflationRate}% annual rate`}
          icon={ArrowDownRight}
          colorClass="bg-amber-500/5"
          borderClass="border-amber-500/10"
          textClass="text-amber-400"
        />
        <MetricCard 
          label="Annual Return (Net)" 
          value={`${portfolioMetrics.annualizedReturn.toFixed(1)}%`} 
          subtext="CAGR Performance"
          icon={TrendingUp}
          colorClass="bg-emerald-500/5"
          borderClass="border-emerald-500/10"
          textClass="text-emerald-400"
        />

        {/* Row 3 */}
        <MetricCard 
          label="Risk Level" 
          value={portfolioMetrics.riskLevel} 
          subtext={`${meta.name} asset class profile`}
          icon={Shield}
          colorClass="bg-slate-500/5"
          borderClass="border-slate-500/10"
          textClass="text-slate-400"
        />
        <MetricCard 
          label="Passive Income" 
          value={fmt(portfolioMetrics.projectedMonthlyIncome)} 
          subtext="Estimated monthly SWR"
          icon={Calculator}
          colorClass="bg-[#C5A059]/5"
          borderClass="border-[#C5A059]/10"
          textClass="text-[#C5A059]"
        />
        <MetricCard 
          label="Net Cashflow" 
          value={fmt(portfolioMetrics.netCashflow)} 
          subtext="Monthly surplus/deficit"
          icon={ArrowRightLeft}
          colorClass="bg-indigo-500/5"
          borderClass="border-indigo-500/10"
          textClass="text-indigo-400"
        />
        <MetricCard 
          label="Avg Contribution" 
          value={fmt(params.monthlyContribution)} 
          subtext="Current savings velocity"
          icon={DollarSign}
          colorClass="bg-emerald-500/5"
          borderClass="border-emerald-500/10"
          textClass="text-emerald-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
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
                  dataKey="value"
                >
                  {portfolioMetrics.diversificationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartPie>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {portfolioMetrics.diversificationData.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-300">{entry.name}</span>
                  <span className="text-xs font-semibold text-white ml-1">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Diversification reduces risk and stabilizes returns
          </p>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-white/5">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Cash Flow Analysis
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Monthly Contribution</span>
              <span className="text-lg font-semibold text-white">{fmt(portfolioMetrics.monthlyContribution)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Projected Monthly Income</span>
              <span className="text-lg font-semibold text-emerald-400">{fmt(portfolioMetrics.projectedMonthlyIncome)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Net Cashflow (Year {params.years})</span>
              <span className={`text-lg font-semibold ${portfolioMetrics.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {portfolioMetrics.netCashflow >= 0 ? '+' : ''}{fmt(portfolioMetrics.netCashflow)}
              </span>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-xl p-4 border border-indigo-400/20 mt-4">
              <p className="text-xs text-indigo-300 font-semibold mb-1">Passive Income Goal</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                At 4% withdrawal rate, your portfolio could generate <strong className="text-white">{fmt(portfolioMetrics.projectedMonthlyIncome)}/month</strong> in passive income
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Milestones */}
      <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-400/20 mt-6">
        <h4 className="text-sm font-semibold text-violet-300 mb-4">Wealth Milestones</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { year: Math.ceil(params.years * 0.25), value: results.summary.finalValue * 0.25 },
            { year: Math.ceil(params.years * 0.5), value: results.summary.finalValue * 0.5 },
            { year: Math.ceil(params.years * 0.75), value: results.summary.finalValue * 0.75 },
            { year: params.years, value: results.summary.finalValue }
          ].map((milestone, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Year {milestone.year}</p>
              <p className="text-lg font-medium text-slate-300">{fmt(milestone.value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Insights */}
      <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5 mt-6">
        <p className="text-xs text-slate-400 font-semibold mb-2">📊 Portfolio Insights</p>
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
    </motion.div>
  );
}