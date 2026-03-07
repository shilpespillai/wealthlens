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
  gold: { conservative: 2, moderate: 5, aggressive: 8 }
};

export function getDefaultRate(instrument, scenario) {
  return defaultRates[instrument]?.[scenario] || 7;
}

// Per-instrument config: which fields to show and their labels
const INSTRUMENT_CONFIG = {
  stocks: {
    returnLabel: "Expected Annual Return",
    returnMax: 50,
    showFees: true,
    feesLabel: "Brokerage / Management Fees",
    showTax: true,
    showContributionFreq: true,
    showContribution: true,
  },
  etf: {
    returnLabel: "Expected Annual Return",
    returnMax: 40,
    showFees: true,
    feesLabel: "Expense Ratio (MER)",
    showTax: true,
    showContributionFreq: true,
    showContribution: true,
  },
  crypto: {
    returnLabel: "Expected Annual Return",
    returnMax: 100,
    showFees: true,
    feesLabel: "Exchange / Trading Fees",
    showTax: true,
    showContributionFreq: true,
    showContribution: true,
  },
  bonds: {
    returnLabel: "Coupon / Annual Yield",
    returnMax: 20,
    showFees: false,
    showTax: true,
    showContributionFreq: false,
    showContribution: false,
  },
  mutual_funds: {
    returnLabel: "Expected Annual Return",
    returnMax: 40,
    showFees: true,
    feesLabel: "Fund Management Fees",
    showTax: true,
    showContributionFreq: true,
    showContribution: true,
  },
  fixed_deposit: {
    returnLabel: "Interest Rate (p.a.)",
    returnMax: 20,
    showFees: false,
    showTax: true,
    showContributionFreq: false,
    showContribution: false,
  },
  gold: {
    returnLabel: "Expected Annual Return",
    returnMax: 30,
    showFees: true,
    feesLabel: "Storage / Management Fees",
    showTax: true,
    showContributionFreq: false,
    showContribution: false,
  },
};

export default function InvestmentForm({ params, setParams, instrument = "stocks" }) {
  const config = INSTRUMENT_CONFIG[instrument] || INSTRUMENT_CONFIG.stocks;
  const update = (key, val) => setParams((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      {/* Currency */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Currency</Label>
        <CurrencySelector value={params.currency} onChange={(v) => update("currency", v)} />
      </div>

      {/* Initial Investment */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Initial Investment</Label>
        <div className="relative">
          <Input
            type="number"
            min={0}
            max={10000000}
            value={params.initialAmount}
            onChange={(e) => update("initialAmount", parseFloat(e.target.value) || 0)}
            className="bg-slate-50 text-slate-600 pl-10 px-3 py-1 text-base font-semibold rounded-xl flex w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20"
            placeholder="Any amount from $1 to $10M" />
        </div>
      </div>

      {/* Contribution — only for relevant instruments */}
      {config.showContribution && (
        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Contribution</Label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={1000000}
              value={params.monthlyContribution}
              onChange={(e) => update("monthlyContribution", parseFloat(e.target.value) || 0)}
              className="bg-slate-50 text-slate-600 pl-10 px-3 py-1 text-base font-semibold rounded-xl flex w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-14 border-white/10 focus:border-indigo-400/50 focus:ring-indigo-400/20"
              placeholder="Any amount from $0 to $1M" />
          </div>
        </div>
      )}

      {/* Time Horizon */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Time Horizon</Label>
          <span className="text-sm font-black bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{params.years} years</span>
        </div>
        <Slider value={[params.years]} onValueChange={([v]) => update("years", v)} min={1} max={40} step={1} className="py-2" />
        <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
          <span>1 yr</span><span>10 yrs</span><span>20 yrs</span><span>30 yrs</span><span>40 yrs</span>
        </div>
      </div>

      {/* Expected Return Rate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">{config.returnLabel}</Label>
          <span className="text-slate-500 text-sm font-black">{params.returnRate}%</span>
        </div>
        <Slider value={[params.returnRate]} onValueChange={([v]) => update("returnRate", v)} min={0} max={config.returnMax} step={0.5} className="py-2" />
      </div>

      {/* Inflation Rate */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Inflation Rate</Label>
          <span className="text-slate-500 text-sm font-black">{params.inflationRate}%</span>
        </div>
        <Slider value={[params.inflationRate]} onValueChange={([v]) => update("inflationRate", v)} min={0} max={15} step={0.5} className="py-2" />
      </div>

      {/* Contribution Frequency — only for relevant instruments */}
      {config.showContributionFreq && (
        <div className="space-y-3">
          <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Contribution Frequency</Label>
          <Select value={params.frequency} onValueChange={(v) => update("frequency", v)}>
            <SelectTrigger className="bg-slate-50 text-slate-600 px-3 py-2 text-sm font-semibold rounded-xl flex w-full items-center justify-between whitespace-nowrap border shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 h-14 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Capital Gains Tax */}
      {config.showTax && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">Capital Gains Tax</Label>
            <span className="text-slate-500 text-sm font-black">{params.taxRate}%</span>
          </div>
          <Slider value={[params.taxRate]} onValueChange={([v]) => update("taxRate", v)} min={0} max={50} step={1} className="py-2" />
        </div>
      )}

      {/* Annual Fees — only for relevant instruments */}
      {config.showFees && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em]">{config.feesLabel}</Label>
            <span className="text-slate-500 text-sm font-black">{params.fees}%</span>
          </div>
          <Slider value={[params.fees]} onValueChange={([v]) => update("fees", v)} min={0} max={5} step={0.05} className="py-2" />
        </div>
      )}
    </div>
  );
}