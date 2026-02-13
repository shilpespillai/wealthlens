import React from "react";
import { motion } from "framer-motion";
import { Building2, TrendingUp, BarChart3, Landmark, Coins, PiggyBank, Wallet, Bitcoin } from "lucide-react";
import { cn } from "@/lib/utils";

const instruments = [
  { id: "stocks", label: "Stocks", icon: TrendingUp, color: "from-blue-500 to-cyan-400" },
  { id: "etf", label: "ETFs", icon: BarChart3, color: "from-violet-500 to-purple-400" },
  { id: "property", label: "Property", icon: Building2, color: "from-emerald-500 to-green-400" },
  { id: "bonds", label: "Bonds", icon: Landmark, color: "from-amber-500 to-yellow-400" },
  { id: "mutual_funds", label: "Mutual Funds", icon: PiggyBank, color: "from-pink-500 to-rose-400" },
  { id: "fixed_deposit", label: "Fixed Deposit", icon: Wallet, color: "from-orange-500 to-amber-400" },
  { id: "crypto", label: "Crypto", icon: Bitcoin, color: "from-indigo-500 to-blue-400" },
  { id: "gold", label: "Gold", icon: Coins, color: "from-yellow-500 to-amber-300" },
];

export default function InstrumentSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {instruments.map((inst) => {
        const Icon = inst.icon;
        const isActive = selected === inst.id;
        return (
          <motion.button
            key={inst.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(inst.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
              isActive
                ? "border-transparent bg-gradient-to-br shadow-lg shadow-slate-200/50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              isActive
                ? `bg-gradient-to-br ${inst.color} text-white`
                : "bg-slate-100 text-slate-500"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-xs font-semibold tracking-wide",
              isActive ? "text-slate-800" : "text-slate-500"
            )}>
              {inst.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="instrument-active"
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${inst.color} opacity-[0.07]`}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}