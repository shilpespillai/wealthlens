import React from "react";
import { motion } from "framer-motion";
import { Wallet, Home, TrendingUp, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {profiles.map((profile, i) => {
        const Icon = profile.icon;
        return (
          <motion.button
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(profile.defaults)}
            className="group relative bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-left hover:border-white/20 hover:bg-slate-800/50 transition-all duration-300">

            <div className={cn(
              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform",
              profile.color
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-slate-700 mb-1 text-sm font-bold">{profile.label}</h3>
            <p className="text-xs text-slate-400 mb-3">{profile.description}</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Initial: ${profile.defaults.initialAmount.toLocaleString()}</p>
              <p>Monthly: ${profile.defaults.monthlyContribution.toLocaleString()}</p>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
            style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
          </motion.button>);

      })}
    </div>);

}