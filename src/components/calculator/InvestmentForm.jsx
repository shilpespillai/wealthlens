import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CurrencySelector, { getCurrencySymbol } from "./CurrencySelector";

const defaultRates = {
  stocks: { conservative: 6, moderate: 10, aggressive: 15 },
  etf: { conservative: 5, moderate: 8, aggressive: 12 },
  property: { conservative: 3, moderate: 6, aggressive: 10 },
  bonds: { conservative: 2, moderate: 4, aggressive: 6 },
  mutual_funds: { conservative: 5, moderate: 8, aggressive: 12 },
  fixed_deposit: { conservative: 3, moderate: 5, aggressive: 7 },
  crypto: { conservative: 5, moderate: 20, aggressive: 40 },
  gold: { conservative: 2, moderate: 5, aggressive: 8 },
};

export function getDefaultRate(instrument, scenario) {
  return defaultRates[instrument]?.[scenario] || 7;
}

export default function InvestmentForm({ params, setParams }) {
  const sym = getCurrencySymbol(params.currency);

  const update = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Currency</Label>
        <CurrencySelector value={params.currency} onChange={(v) => update("currency", v)} />
      </div>

      {/* Initial Investment */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Initial Investment</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{sym}</span>
          <Input
            type="number"
            min={0}
            max={10000000}
            value={params.initialAmount}
            onChange={(e) => update("initialAmount", parseFloat(e.target.value) || 0)}
            className="pl-10 h-14 rounded-xl border-white/10 bg-slate-700/30 text-white text-base font-semibold focus:border-indigo-400/50 focus:ring-indigo-400/20"
            placeholder="Any amount from $1 to $10M"
          />
        </div>
      </div>

      {/* Monthly Contribution */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Monthly Contribution</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{sym}</span>
          <Input
            type="number"
            min={0}
            max={1000000}
            value={params.monthlyContribution}
            onChange={(e) => update("monthlyContribution", parseFloat(e.target.value) || 0)}
            className="pl-10 h-14 rounded-xl border-white/10 bg-slate-700/30 text-white text-base font-semibold focus:border-indigo-400/50 focus:ring-indigo-400/20"
            placeholder="Any amount from $0 to $1M"
          />
        </div>
      </div>

      {/* Time Horizon */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Time Horizon</Label>
          <span className="text-sm font-black text-white bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{params.years} years</span>
        </div>
        <Slider
          value={[params.years]}
          onValueChange={([v]) => update("years", v)}
          min={1}
          max={40}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
          <span>1 yr</span>
          <span>10 yrs</span>
          <span>20 yrs</span>
          <span>30 yrs</span>
          <span>40 yrs</span>
        </div>
      </div>

      {/* Expected Return Rate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Expected Annual Return</Label>
          <span className="text-sm font-black text-emerald-400">{params.returnRate}%</span>
        </div>
        <Slider
          value={[params.returnRate]}
          onValueChange={([v]) => update("returnRate", v)}
          min={0}
          max={50}
          step={0.5}
          className="py-2"
        />
      </div>

      {/* Inflation Rate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Inflation Rate</Label>
          <span className="text-sm font-black text-slate-300">{params.inflationRate}%</span>
        </div>
        <Slider
          value={[params.inflationRate]}
          onValueChange={([v]) => update("inflationRate", v)}
          min={0}
          max={15}
          step={0.5}
          className="py-2"
        />
      </div>

      {/* Contribution Frequency */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Contribution Frequency</Label>
        <Select value={params.frequency} onValueChange={(v) => update("frequency", v)}>
          <SelectTrigger className="h-14 rounded-xl border-white/10 bg-slate-700/30 text-white font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tax Rate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Capital Gains Tax</Label>
          <span className="text-sm font-black text-slate-300">{params.taxRate}%</span>
        </div>
        <Slider
          value={[params.taxRate]}
          onValueChange={([v]) => update("taxRate", v)}
          min={0}
          max={50}
          step={1}
          className="py-2"
        />
      </div>

      {/* Annual Fees */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Annual Fees / Expense Ratio</Label>
          <span className="text-sm font-black text-slate-300">{params.fees}%</span>
        </div>
        <Slider
          value={[params.fees]}
          onValueChange={([v]) => update("fees", v)}
          min={0}
          max={5}
          step={0.05}
          className="py-2"
        />
      </div>
    </div>
  );
}