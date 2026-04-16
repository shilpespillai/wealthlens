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
    <div className="grid grid-cols-4 gap-2">
      {instruments.map((inst) => {
        const Icon = inst.icon;
        const isActive = selected === inst.id;
        return (
          <motion.button
            key={inst.id}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(inst.id)} 
            className={cn(
              "group px-3 py-2 rounded-xl flex items-center gap-2 border transition-all duration-200 shadow-sm overflow-hidden",
              isActive 
                ? "bg-[#C5A059]/10 border-[#C5A059] shadow-lg shadow-[#C5A059]/10" 
                : "bg-[#111827] border-white/5 hover:border-[#C5A059]/20 hover:bg-[#1a2333]"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded flex items-center justify-center transition-all shrink-0",
              isActive ? "bg-[#C5A059] text-[#111827]" : "bg-[#C5A059]/10 text-[#C5A059]"
            )}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-widest truncate",
              isActive ? "text-[#E5C48B]" : "text-gray-400 group-hover:text-gray-300"
            )}>
              {inst.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}