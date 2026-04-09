import React from "react";
import { motion } from "framer-motion";
import { Wallet, Home, TrendingUp, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const profiles = [
{
  id: "starter",
  label: "Starting Out",
  description: "For new investors and savers",
  icon: Wallet,
  color: "from-blue-500 to-cyan-500",
  defaults: {
    initialAmount: 100,
    monthlyContribution: 50,
    years: 10,
    returnRate: 8,
    inflationRate: 3,
    taxRate: 10,
    fees: 0.2
  }
},
{
  id: "middle",
  label: "Building Wealth",
  description: "For middle-class families",
  icon: Home,
  color: "from-emerald-500 to-green-500",
  defaults: {
    initialAmount: 5000,
    monthlyContribution: 500,
    years: 15,
    returnRate: 10,
    inflationRate: 3,
    taxRate: 15,
    fees: 0.5
  }
},
{
  id: "established",
  label: "Growing Portfolio",
  description: "For established investors",
  icon: TrendingUp,
  color: "from-violet-500 to-purple-500",
  defaults: {
    initialAmount: 50000,
    monthlyContribution: 2000,
    years: 20,
    returnRate: 10,
    inflationRate: 3,
    taxRate: 20,
    fees: 0.75
  }
},
{
  id: "wealth",
  label: "High Net Worth",
  description: "For affluent investors",
  icon: Crown,
  color: "from-amber-500 to-yellow-500",
  defaults: {
    initialAmount: 250000,
    monthlyContribution: 10000,
    years: 25,
    returnRate: 12,
    inflationRate: 3,
    taxRate: 25,
    fees: 1
  }
}];


export default function InvestmentProfiles({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {profiles.map((profile, i) => {
        const Icon = profile.icon;
        return (
          <motion.button
            key={profile.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(profile.defaults)}
            className="group flex flex-col w-full bg-[#111827] border border-white/5 rounded-xl p-3 text-left hover:border-[#C5A059]/30 hover:bg-[#1a2333] transition-all duration-300 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-[#C5A059]/10 flex items-center justify-center border border-[#C5A059]/10 group-hover:bg-[#C5A059]/20 transition-all">
                <Icon className="w-3 h-3 text-[#C5A059]" />
              </div>
              <h3 className="text-[#C5A059] text-[9px] font-black uppercase tracking-widest truncate">{profile.label}</h3>
            </div>
            
            <div className="flex flex-col gap-0.5">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500 font-medium">Initial</span>
                  <span className="text-[9px] text-gray-300 font-black">${profile.defaults.initialAmount.toLocaleString()}</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-500 font-medium">Monthly</span>
                  <span className="text-[9px] text-gray-300 font-black">${profile.defaults.monthlyContribution.toLocaleString()}</span>
               </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}