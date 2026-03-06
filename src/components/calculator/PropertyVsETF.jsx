import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, TrendingUp, DollarSign, Zap, Shield, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getCurrencySymbol } from "./CurrencySelector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PropertyVsETF({ currency }) {
  const sym = getCurrencySymbol(currency);

  // Shared inputs
  const [initialCapital, setInitialCapital] = useState(100000);
  const [yearsToCompare, setYearsToCompare] = useState(20);

  // Property inputs
  const [propertyPrice, setPropertyPrice] = useState(500000);
  const [propertyGrowth, setPropertyGrowth] = useState(6);
  const [weeklyRent, setWeeklyRent] = useState(600);
  const [propertyExpenses, setPropertyExpenses] = useState(8000);
  const [mortgageRate, setMortgageRate] = useState(6);
  const [taxBenefit, setTaxBenefit] = useState(15);

  // ETF inputs
  const [etfReturn, setEtfReturn] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [etfFees, setEtfFees] = useState(0.2);

  // Calculations
  const comparison = useMemo(() => {
    const deposit = initialCapital;
    const loanAmount = propertyPrice - deposit;
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = 30 * 12;

    // Property monthly repayment
    const monthlyRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualRent = weeklyRent * 52;
    const netRentalIncome = annualRent - propertyExpenses;
    const monthlyCashflow = netRentalIncome / 12 - monthlyRepayment;

    const yearlyData = [];

    // Property simulation
    let propertyValue = propertyPrice;
    let loanBalance = loanAmount;
    let propertyEquity = deposit;

    // ETF simulation
    let etfValue = initialCapital;

    for (let year = 0; year <= yearsToCompare; year++) {
      // Property calculations
      if (year > 0) {
        propertyValue *= 1 + propertyGrowth / 100;

        // Pay down loan
        for (let m = 0; m < 12; m++) {
          const interest = loanBalance * monthlyRate;
          const principal = monthlyRepayment - interest;
          loanBalance = Math.max(0, loanBalance - principal);
        }

        propertyEquity = propertyValue - loanBalance;
      }

      // Tax benefit on property (simplified)
      const propertyAfterTax = propertyEquity * (1 + taxBenefit / 100 / 10);

      // ETF calculations
      if (year > 0) {
        // Annual contributions
        const yearlyContribution = monthlyContribution * 12;
        etfValue += yearlyContribution;

        // Apply returns after fees
        const netReturn = etfReturn - etfFees;
        etfValue *= 1 + netReturn / 100;
      }

      yearlyData.push({
        year,
        propertyEquity: Math.round(propertyEquity),
        etfValue: Math.round(etfValue),
        propertyValue: Math.round(propertyValue),
        loanBalance: Math.round(loanBalance)
      });
    }

    const finalProperty = yearlyData[yearsToCompare].propertyEquity;
    const finalETF = yearlyData[yearsToCompare].etfValue;
    const totalPropertyInvested = deposit + Math.max(0, -monthlyCashflow) * 12 * yearsToCompare;
    const totalETFInvested = initialCapital + monthlyContribution * 12 * yearsToCompare;

    const propertyROI = (finalProperty - totalPropertyInvested) / totalPropertyInvested * 100;
    const etfROI = (finalETF - totalETFInvested) / totalETFInvested * 100;

    return {
      yearlyData,
      finalProperty,
      finalETF,
      winner: finalProperty > finalETF ? "property" : "etf",
      difference: Math.abs(finalProperty - finalETF),
      monthlyRepayment,
      monthlyCashflow,
      totalPropertyInvested,
      totalETFInvested,
      propertyROI,
      etfROI
    };
  }, [initialCapital, propertyPrice, propertyGrowth, weeklyRent, propertyExpenses, mortgageRate, taxBenefit, etfReturn, monthlyContribution, etfFees, yearsToCompare]);

  const fmt = (num) => `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const propertyPros = [
  "Leveraged growth (5x capital)",
  "Rental income stream",
  "Tax deductions (interest, depreciation)",
  "Tangible asset"];


  const propertyCons = [
  "Illiquid - hard to sell quickly",
  "Maintenance costs",
  "Vacancy risk",
  "Location dependent"];


  const etfPros = [
  "Highly liquid",
  "Globally diversified",
  "No maintenance",
  "Low fees"];


  const etfCons = [
  "No leverage",
  "Market volatility",
  "No income (unless dividend ETF)",
  "Capital gains tax on sale"];


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Property vs ETF Wealth Builder</h3>
          <p className="text-xs text-slate-600">Compare 20-year wealth outcomes side-by-side</p>
        </div>
      </div>

      {/* Shared Inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <Label className="text-xs text-slate-700">Starting Capital</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
              className="pl-8 bg-slate-700/30 border-white/10 text-white" />

          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-xs text-slate-700">Time Horizon</Label>
            <span className="text-sm font-bold text-slate-900">{yearsToCompare} years</span>
          </div>
          <Slider value={[yearsToCompare]} onValueChange={([v]) => setYearsToCompare(v)} min={5} max={40} step={1} />
        </div>
      </div>

      {/* Side by Side Inputs */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Property Inputs */}
        <div className="bg-orange-100 text-slate-600 p-5 rounded-2xl border border-emerald-400/20">
          <h4 className="text-sm font-bold text-emerald-700 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Property Investment
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium opacity-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Property Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-600 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />


              </div>
              <p className="text-xs text-slate-500">Deposit: {fmt(initialCapital)} ({(initialCapital / propertyPrice * 100).toFixed(0)}%)</p>
            </div>

            <div className="space-y-2">
              <div className="text-slate-600 flex justify-between">
                <Label className="text-xs text-slate-300">Annual Growth</Label>
                <span className="text-xs font-bold text-emerald-400">{propertyGrowth}%</span>
              </div>
              <Slider value={[propertyGrowth]} onValueChange={([v]) => setPropertyGrowth(v)} min={0} max={15} step={0.5} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Weekly Rent</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={weeklyRent}
                  onChange={(e) => setWeeklyRent(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-600 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />


              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Annual Expenses</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={propertyExpenses}
                  onChange={(e) => setPropertyExpenses(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-600 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />


              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Mortgage Rate</Label>
                <span className="text-xs font-bold text-white">{mortgageRate}%</span>
              </div>
              <Slider value={[mortgageRate]} onValueChange={([v]) => setMortgageRate(v)} min={2} max={12} step={0.1} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Tax Benefit</Label>
                <span className="text-xs font-bold text-white">{taxBenefit}%</span>
              </div>
              <Slider value={[taxBenefit]} onValueChange={([v]) => setTaxBenefit(v)} min={0} max={30} step={1} />
            </div>
          </div>
        </div>

        {/* ETF Inputs */}
        <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-400/20">
          <h4 className="text-sm font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            ETF Investment
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Expected Return</Label>
                <span className="text-xs font-bold text-indigo-400">{etfReturn}%</span>
              </div>
              <Slider value={[etfReturn]} onValueChange={([v]) => setEtfReturn(v)} min={0} max={20} step={0.5} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Monthly Contribution</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-slate-700/30 border-white/10 text-white" />

              </div>
              <p className="text-xs text-slate-500">Annual: {fmt(monthlyContribution * 12)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Annual Fees</Label>
                <span className="text-xs font-bold text-white">{etfFees}%</span>
              </div>
              <Slider value={[etfFees]} onValueChange={([v]) => setEtfFees(v)} min={0} max={2} step={0.05} />
            </div>
          </div>
        </div>
      </div>

      {/* Winner Banner */}
      <div className={`rounded-2xl p-6 border mb-8 bg-white ${
      comparison.winner === "property" ?
      "border-emerald-200" :
      "border-indigo-200"}`
      }>
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-2">After {yearsToCompare} years</p>
          <p className={`text-3xl font-black mb-2 ${
          comparison.winner === "property" ? "text-emerald-400" : "text-indigo-400"}`
          }>
            {comparison.winner === "property" ? "🏠 Property Wins!" : "📈 ETF Wins!"}
          </p>
          <p className="text-lg font-bold text-white">
            {fmt(comparison.winner === "property" ? comparison.finalProperty : comparison.finalETF)}
          </p>
          <p className="text-sm text-slate-400 mt-2">
            {fmt(comparison.difference)} more than {comparison.winner === "property" ? "ETF" : "Property"}
          </p>
        </div>
      </div>

      {/* Wealth Comparison Chart */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
        <h4 className="text-sm font-bold text-slate-900 mb-4">20-Year Wealth Outcome</h4>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={comparison.yearlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} />

            <YAxis
              stroke="#94a3b8"
              tickFormatter={(val) => `${sym}${(val / 1000).toFixed(0)}k`} />

            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => fmt(value)} />

            <Legend />
            <Line type="monotone" dataKey="propertyEquity" stroke="#10b981" strokeWidth={3} name="Property Equity" />
            <Line type="monotone" dataKey="etfValue" stroke="#6366f1" strokeWidth={3} name="ETF Portfolio" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-emerald-500/10 rounded-2xl p-5 border border-emerald-400/20">
          <h5 className="text-sm font-bold text-emerald-700 mb-4">Property Results</h5>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Final Equity</span>
              <span className="text-white font-bold">{fmt(comparison.finalProperty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Invested</span>
              <span className="text-white font-bold">{fmt(comparison.totalPropertyInvested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">ROI</span>
              <span className="text-emerald-400 font-bold">{comparison.propertyROI.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Monthly Cashflow</span>
              <span className={`font-bold ${comparison.monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {comparison.monthlyCashflow >= 0 ? '+' : ''}{fmt(comparison.monthlyCashflow)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-400/20">
          <h5 className="text-sm font-bold text-indigo-700 mb-4">ETF Results</h5>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Final Value</span>
              <span className="text-white font-bold">{fmt(comparison.finalETF)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Invested</span>
              <span className="text-white font-bold">{fmt(comparison.totalETFInvested)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">ROI</span>
              <span className="text-indigo-400 font-bold">{comparison.etfROI.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Liquidity</span>
              <span className="text-emerald-400 font-bold">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Property Pros & Cons</h5>
          <div className="space-y-2 mb-3">
            {propertyPros.map((pro, i) =>
            <div key={i} className="text-slate-600 text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {propertyCons.map((con, i) =>
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{con}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h5 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">ETF Pros & Cons</h5>
          <div className="space-y-2 mb-3">
            {etfPros.map((pro, i) =>
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {etfCons.map((con, i) =>
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <span>{con}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>);

}