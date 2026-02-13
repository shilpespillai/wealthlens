import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, Receipt, ShieldCheck, ArrowDownRight, Percent } from "lucide-react";
import { getCurrencySymbol } from "./CurrencySelector";

function formatNumber(num, symbol) {
  if (num >= 1_000_000_000) return `${symbol}${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(2)}M`;
  return `${symbol}${num.toLocaleString()}`;
}

const cards = [
  { key: "finalValue", label: "Final Portfolio Value", icon: TrendingUp, color: "from-indigo-500 to-violet-500", textColor: "text-indigo-600" },
  { key: "totalContributed", label: "Total Contributed", icon: Wallet, color: "from-slate-400 to-slate-500", textColor: "text-slate-600" },
  { key: "totalReturns", label: "Total Returns", icon: TrendingUp, color: "from-emerald-500 to-green-500", textColor: "text-emerald-600" },
  { key: "afterTax", label: "After Tax Value", icon: ShieldCheck, color: "from-blue-500 to-cyan-500", textColor: "text-blue-600" },
  { key: "taxPaid", label: "Estimated Tax", icon: Receipt, color: "from-rose-400 to-red-500", textColor: "text-rose-500" },
  { key: "realValue", label: "Real Value (Inflation Adj.)", icon: ArrowDownRight, color: "from-amber-500 to-orange-500", textColor: "text-amber-600" },
];

export default function ResultsSummary({ summary, currency }) {
  const sym = getCurrencySymbol(currency);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className={`text-lg font-bold ${card.textColor}`}>
              {formatNumber(value, sym)}
            </p>
          </motion.div>
        );
      })}
      {/* Return percent card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-lg transition-shadow duration-300 col-span-2 lg:col-span-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Return</p>
              <p className="text-lg font-bold text-purple-600">{summary.totalReturnPercent}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Annualized Return (net of fees)</p>
            <p className="text-lg font-bold text-slate-700">{summary.annualizedReturn.toFixed(1)}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}