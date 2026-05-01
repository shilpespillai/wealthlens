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
{ key: "finalValue", label: "Final Portfolio Value", icon: TrendingUp, color: "from-indigo-500 to-violet-500", textColor: "text-indigo-900", labelColor: "text-indigo-600", bgColor: "bg-indigo-50 border-indigo-100" },
{ key: "totalContributed", label: "Total Contributed", icon: Wallet, color: "from-slate-400 to-slate-500", textColor: "text-slate-800", labelColor: "text-slate-500", bgColor: "bg-slate-50 border-slate-200" },
{ key: "totalReturns", label: "Total Returns", icon: TrendingUp, color: "from-emerald-500 to-green-500", textColor: "text-emerald-900", labelColor: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-100" },
{ key: "afterTax", label: "After Tax Value", icon: ShieldCheck, color: "from-blue-500 to-cyan-500", textColor: "text-blue-900", labelColor: "text-blue-600", bgColor: "bg-blue-50 border-blue-100" },
{ key: "taxPaid", label: "Estimated Tax", icon: Receipt, color: "from-rose-400 to-red-500", textColor: "text-rose-900", labelColor: "text-rose-600", bgColor: "bg-rose-50 border-rose-100" },
{ key: "realValue", label: "Real Value (Inflation Adj.)", icon: ArrowDownRight, color: "from-amber-500 to-orange-500", textColor: "text-amber-900", labelColor: "text-amber-600", bgColor: "bg-amber-50 border-amber-100" }];


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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }} 
            className={`p-4 rounded-[20px] border border-slate-100 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${card.bgColor}`}>

            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${card.labelColor}`}>{card.label}</p>
            </div>
            
            <p className={`text-xl font-black tracking-tight ${card.textColor}`}>
              {formatNumber(value, sym)}
            </p>
          </motion.div>
        );
      })}
      
      {/* Return percent card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-purple-50 rounded-[20px] border border-purple-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 col-span-2 lg:col-span-3">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Percent className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[9px] font-black text-purple-600 uppercase tracking-[0.2em]">Total Return</p>
              <p className="text-xl font-black text-purple-900 tracking-tight">{summary.totalReturnPercent}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:text-right">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Annualized Return (net)</p>
            <p className="text-xl font-black text-emerald-700 tracking-tight">{summary.annualizedReturn.toFixed(1)}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}