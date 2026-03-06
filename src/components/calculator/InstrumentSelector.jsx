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
{ id: "gold", label: "Gold", icon: Coins, color: "from-yellow-500 to-amber-300" }];


export default function InstrumentSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {instruments.map((inst) => {
        const Icon = inst.icon;
        const isActive = selected === inst.id;
        return (
          <motion.button
            key={inst.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(inst.id)} className="bg-zinc-300 p-5 rounded-2xl relative flex flex-col items-center gap-3 border-2 transition-all duration-300 border-transparent shadow-2xl shadow-indigo-500/20">







            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg",
              isActive ?
              `bg-gradient-to-br ${inst.color} text-white shadow-indigo-500/30` :
              "bg-slate-700/50 text-slate-400"
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-slate-700 text-xs font-bold tracking-wide">



              {inst.label}
            </span>
          </motion.button>);

      })}
    </div>);

}