import React, { useState, useMemo } from "react";
import { 
  Target, 
  Info, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fmt = (n) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(n);

export default function FairValueCalculator({ initialTicker = "" }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [eps, setEps] = useState(5.00);
  const [growthRate, setGrowthRate] = useState(15); // % per year for 10 years
  const [exitPe, setExitPe] = useState(20);
  const [discountRate, setDiscountRate] = useState(12.5); // Desired return
  const [marginOfSafety, setMarginOfSafety] = useState(25); // %

  const results = useMemo(() => {
    // Current method: 10-year DCF / Multiplier approach
    // 1. Future EPS after 10 years
    const futureEps = eps * Math.pow(1 + growthRate / 100, 10);
    
    // 2. Future Price after 10 years
    const futurePrice = futureEps * exitPe;
    
    // 3. Intrinsic Value (Present Value of that future price)
    // PV = FV / (1 + r)^n
    const intrinsicValue = futurePrice / Math.pow(1 + discountRate / 100, 10);
    
    // 4. Buy Price (with Margin of Safety)
    const buyPrice = intrinsicValue * (1 - marginOfSafety / 100);

    return {
      futureEps,
      futurePrice,
      intrinsicValue,
      buyPrice,
      totalMultiplier: (futurePrice / eps).toFixed(1)
    };
  }, [eps, growthRate, exitPe, discountRate, marginOfSafety]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Fair Value Calculator</h2>
            <p className="text-sm text-slate-500 font-medium">Find the intrinsic value and your "Margin of Safety" buy price.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Inputs */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Assumptions</h3>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    Current EPS (Earnings Per Share)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><Info className="w-3.5 h-3.5 text-slate-300" /></TooltipTrigger>
                        <TooltipContent>The net profit a company makes for each share of its stock.</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm font-black text-indigo-600">${eps.toFixed(2)}</span>
                </div>
                <Input 
                  type="number" 
                  value={eps} 
                  onChange={(e) => setEps(parseFloat(e.target.value) || 0)}
                  className="bg-slate-50 border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">Expected 10yr Growth Rate</label>
                  <span className="text-sm font-black text-indigo-600">{growthRate}%</span>
                </div>
                <Slider 
                  value={[growthRate]} 
                  onValueChange={([v]) => setGrowthRate(v)} 
                  min={0} max={40} step={0.5} 
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700">Exit P/E Ratio (at Year 10)</label>
                  <span className="text-sm font-black text-indigo-600">{exitPe}x</span>
                </div>
                <Slider 
                  value={[exitPe]} 
                  onValueChange={([v]) => setExitPe(v)} 
                  min={5} max={50} step={1} 
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Your Requirements</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">Desired Annual Return</label>
                    <span className="text-sm font-black text-emerald-600">{discountRate}%</span>
                  </div>
                  <Slider 
                    value={[discountRate]} 
                    onValueChange={([v]) => setDiscountRate(v)} 
                    min={5} max={25} step={0.5} 
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">Typically investors aim for 10-15% to beat the S&P 500.</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">Margin of Safety</label>
                    <span className="text-sm font-black text-rose-600">{marginOfSafety}%</span>
                  </div>
                  <Slider 
                    value={[marginOfSafety]} 
                    onValueChange={([v]) => setMarginOfSafety(v)} 
                    min={0} max={50} step={5} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
              
              <div className="space-y-6 relative z-10">
                <div className="text-center pb-6 border-b border-white/10">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Target Buy Price</div>
                  <div className="text-6xl font-black text-emerald-400 tracking-tighter">
                    {fmt(results.buyPrice)}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-medium">
                    (With {marginOfSafety}% Margin of Safety)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-black mb-1">Intrinsic Value</div>
                    <div className="text-lg font-bold">{fmt(results.intrinsicValue)}</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-black mb-1">Year 10 Price</div>
                    <div className="text-lg font-bold">{fmt(results.futurePrice)}</div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold mb-1">The Math Story</p>
                      <p className="text-xs text-indigo-100 leading-relaxed">
                        If this company grows at <b>{growthRate}%</b> for 10 years and sells at a <b>{exitPe}</b> P/E, 
                        the share price will be <b>{fmt(results.futurePrice)}</b>. 
                        To earn a <b>{discountRate}%</b> return, you should pay no more than <b>{fmt(results.intrinsicValue)}</b> today.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "High Growth", growth: 25, pe: 35, disc: 15 },
                { label: "Stable Value", growth: 8, pe: 15, disc: 10 },
                { label: "Aggressive Safety", growth: 12, pe: 18, disc: 12.5, safety: 40 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setGrowthRate(preset.growth);
                    setExitPe(preset.pe);
                    setDiscountRate(preset.disc);
                    if (preset.safety) setMarginOfSafety(preset.safety);
                  }}
                  className="p-3 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all text-center uppercase tracking-wider shadow-sm"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed italic">
                <b>Caution:</b> Small changes in growth rates or P/E multiples have massive impacts on fair value. 
                Always use conservative estimates (Low projections) to protect your capital.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
