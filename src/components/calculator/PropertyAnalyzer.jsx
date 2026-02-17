import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, TrendingUp, DollarSign, Percent, Home, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getCurrencySymbol } from "./CurrencySelector";

export default function PropertyAnalyzer({ currency }) {
  const sym = getCurrencySymbol(currency);

  // Capital Growth State
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [growthRate, setGrowthRate] = useState(7);
  const [holdingPeriod, setHoldingPeriod] = useState(10);
  const [sellingCosts, setSellingCosts] = useState(3);
  const [whatIfGrowth, setWhatIfGrowth] = useState(3);

  // Rental Yield State
  const [weeklyRent, setWeeklyRent] = useState(600);
  const [vacancyRate, setVacancyRate] = useState(2);
  const [managementFees, setManagementFees] = useState(7);
  const [maintenance, setMaintenance] = useState(1000);
  const [insurance, setInsurance] = useState(1200);
  const [councilRates, setCouncilRates] = useState(2000);
  const [suburbYield, setSuburbYield] = useState(3.8);

  // Capital Growth Calculations
  const growthResults = useMemo(() => {
    const futureValue = purchasePrice * Math.pow(1 + growthRate / 100, holdingPeriod);
    const equityBuilt = futureValue - purchasePrice;
    const sellingCostsAmount = futureValue * (sellingCosts / 100);
    const netProceeds = futureValue - sellingCostsAmount - purchasePrice;
    const totalROI = (netProceeds / purchasePrice) * 100;
    const annualizedReturn = (Math.pow(futureValue / purchasePrice, 1 / holdingPeriod) - 1) * 100;

    // What-if scenario
    const whatIfValue = purchasePrice * Math.pow(1 + whatIfGrowth / 100, holdingPeriod);
    const whatIfEquity = whatIfValue - purchasePrice;
    const whatIfSellingCosts = whatIfValue * (sellingCosts / 100);
    const whatIfNet = whatIfValue - whatIfSellingCosts - purchasePrice;
    const whatIfROI = (whatIfNet / purchasePrice) * 100;

    return {
      futureValue,
      equityBuilt,
      sellingCostsAmount,
      netProceeds,
      totalROI,
      annualizedReturn,
      whatIfValue,
      whatIfEquity,
      whatIfROI,
      difference: futureValue - whatIfValue
    };
  }, [purchasePrice, growthRate, holdingPeriod, sellingCosts, whatIfGrowth]);

  // Rental Yield Calculations
  const yieldResults = useMemo(() => {
    const annualRent = weeklyRent * 52;
    const grossYield = (annualRent / purchasePrice) * 100;
    
    const vacancyLoss = annualRent * (vacancyRate / 100);
    const managementCost = annualRent * (managementFees / 100);
    const totalExpenses = vacancyLoss + managementCost + maintenance + insurance + councilRates;
    const netRent = annualRent - totalExpenses;
    const netYield = (netRent / purchasePrice) * 100;
    const monthlyCashflow = netRent / 12;

    return {
      annualRent,
      grossYield,
      netRent,
      netYield,
      monthlyCashflow,
      totalExpenses,
      yieldVsSuburb: netYield - suburbYield
    };
  }, [weeklyRent, vacancyRate, managementFees, maintenance, insurance, councilRates, purchasePrice, suburbYield]);

  const fmt = (num) => `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Property Investment Analysis</h3>
          <p className="text-xs text-slate-400">Advanced property investment tools</p>
        </div>
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="bg-slate-700/40 border border-white/10 p-1 rounded-xl mb-6">
          <TabsTrigger value="growth" className="rounded-lg px-4 py-2 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            Capital Growth
          </TabsTrigger>
          <TabsTrigger value="yield" className="rounded-lg px-4 py-2 text-xs font-bold">
            <DollarSign className="w-3.5 h-3.5 mr-2" />
            Rental Yield
          </TabsTrigger>
        </TabsList>

        {/* Capital Growth Simulator */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Inputs</h4>
              
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Annual Growth Rate</Label>
                  <span className="text-sm font-bold text-emerald-400">{growthRate}%</span>
                </div>
                <Slider value={[growthRate]} onValueChange={([v]) => setGrowthRate(v)} min={0} max={20} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Holding Period</Label>
                  <span className="text-sm font-bold text-white">{holdingPeriod} years</span>
                </div>
                <Slider value={[holdingPeriod]} onValueChange={([v]) => setHoldingPeriod(v)} min={1} max={30} step={1} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Selling Costs</Label>
                  <span className="text-sm font-bold text-white">{sellingCosts}%</span>
                </div>
                <Slider value={[sellingCosts]} onValueChange={([v]) => setSellingCosts(v)} min={0} max={10} step={0.5} />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Projected Results</h4>
              
              <div className="bg-slate-700/30 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Future Property Value</p>
                <p className="text-2xl font-black text-white">{fmt(growthResults.futureValue)}</p>
              </div>

              <div className="bg-slate-700/30 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Equity Built</p>
                <p className="text-xl font-black text-emerald-400">{fmt(growthResults.equityBuilt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-400 mb-1">Total ROI</p>
                  <p className="text-lg font-black text-white">{growthResults.totalROI.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-400 mb-1">Annualized Return</p>
                  <p className="text-lg font-black text-white">{growthResults.annualizedReturn.toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-400 mb-1">Selling Costs</p>
                <p className="text-sm font-bold text-slate-300">{fmt(growthResults.sellingCostsAmount)}</p>
              </div>
            </div>
          </div>

          {/* What-If Scenario */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-400/20">
            <h4 className="text-sm font-bold text-amber-300 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              What If Growth Rate Changes?
            </h4>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Alternative Growth Rate</Label>
                <span className="text-sm font-bold text-amber-300">{whatIfGrowth}%</span>
              </div>
              <Slider 
                value={[whatIfGrowth]} 
                onValueChange={([v]) => setWhatIfGrowth(v)} 
                min={0} 
                max={15} 
                step={0.5}
                className="py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">Property Value</p>
                <p className="text-sm font-bold text-white">{fmt(growthResults.whatIfValue)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">Equity</p>
                <p className="text-sm font-bold text-emerald-400">{fmt(growthResults.whatIfEquity)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 mb-1">ROI</p>
                <p className="text-sm font-bold text-white">{growthResults.whatIfROI.toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-slate-300">
                Difference: <span className={`font-bold ${growthResults.difference > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {growthResults.difference > 0 ? '+' : ''}{fmt(growthResults.difference)}
                </span> compared to {growthRate}% growth
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Rental Yield Analyzer */}
        <TabsContent value="yield" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Income & Expenses</h4>
              
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Weekly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={weeklyRent}
                    onChange={(e) => setWeeklyRent(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
                <p className="text-xs text-slate-500">Annual: {fmt(weeklyRent * 52)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Vacancy Rate</Label>
                  <span className="text-sm font-bold text-white">{vacancyRate}%</span>
                </div>
                <Slider value={[vacancyRate]} onValueChange={([v]) => setVacancyRate(v)} min={0} max={20} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Management Fees</Label>
                  <span className="text-sm font-bold text-white">{managementFees}%</span>
                </div>
                <Slider value={[managementFees]} onValueChange={([v]) => setManagementFees(v)} min={0} max={15} step={0.5} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Annual Maintenance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Annual Insurance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Council Rates (Annual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={councilRates}
                    onChange={(e) => setCouncilRates(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Suburb Average Yield</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={suburbYield}
                    onChange={(e) => setSuburbYield(parseFloat(e.target.value) || 0)}
                    className="bg-slate-700/30 border-white/10 text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Yield Analysis</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-4 border border-blue-400/20">
                  <p className="text-xs text-blue-300 mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Gross Yield
                  </p>
                  <p className="text-2xl font-black text-white">{yieldResults.grossYield.toFixed(2)}%</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 border border-emerald-400/20">
                  <p className="text-xs text-emerald-300 mb-1 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    Net Yield
                  </p>
                  <p className="text-2xl font-black text-white">{yieldResults.netYield.toFixed(2)}%</p>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border ${yieldResults.monthlyCashflow >= 0 ? 'bg-emerald-500/10 border-emerald-400/20' : 'bg-rose-500/10 border-rose-400/20'}`}>
                <p className="text-xs text-slate-300 mb-1">Monthly Cashflow</p>
                <p className={`text-2xl font-black ${yieldResults.monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {yieldResults.monthlyCashflow >= 0 ? '+' : ''}{fmt(yieldResults.monthlyCashflow)}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {yieldResults.monthlyCashflow >= 0 ? 'Positive' : 'Negative'} cashflow property
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-2">Annual Breakdown</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Gross Rent</span>
                    <span className="text-white font-semibold">{fmt(yieldResults.annualRent)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Total Expenses</span>
                    <span className="font-semibold">-{fmt(yieldResults.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-emerald-300 font-bold">Net Income</span>
                    <span className="text-emerald-400 font-bold">{fmt(yieldResults.netRent)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-2xl p-4 border border-indigo-400/20">
                <p className="text-xs text-indigo-300 mb-2">Yield vs Suburb Average</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{yieldResults.netYield.toFixed(2)}%</span>
                  <span className="text-sm text-slate-400">vs</span>
                  <span className="text-lg font-bold text-slate-300">{suburbYield}%</span>
                </div>
                <p className={`text-xs mt-2 font-semibold ${yieldResults.yieldVsSuburb > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {yieldResults.yieldVsSuburb > 0 ? '+' : ''}{yieldResults.yieldVsSuburb.toFixed(2)}% {yieldResults.yieldVsSuburb > 0 ? 'above' : 'below'} suburb average
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}