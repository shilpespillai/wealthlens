import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, TrendingUp, DollarSign, Percent, Home, Calculator, PiggyBank } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getCurrencySymbol } from "./CurrencySelector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  // Mortgage State
  const [depositPercent, setDepositPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6);
  const [loanTerm, setLoanTerm] = useState(30);
  const [loanType, setLoanType] = useState("principal"); // principal or interestOnly
  const [extraRepayments, setExtraRepayments] = useState(0);
  const [enableExtraRepayments, setEnableExtraRepayments] = useState(false);
  const [stressTestRate, setStressTestRate] = useState(9);

  // Capital Growth Calculations
  const growthResults = useMemo(() => {
    const futureValue = purchasePrice * Math.pow(1 + growthRate / 100, holdingPeriod);
    const equityBuilt = futureValue - purchasePrice;
    const sellingCostsAmount = futureValue * (sellingCosts / 100);
    const netProceeds = futureValue - sellingCostsAmount - purchasePrice;
    const totalROI = netProceeds / purchasePrice * 100;
    const annualizedReturn = (Math.pow(futureValue / purchasePrice, 1 / holdingPeriod) - 1) * 100;

    // What-if scenario
    const whatIfValue = purchasePrice * Math.pow(1 + whatIfGrowth / 100, holdingPeriod);
    const whatIfEquity = whatIfValue - purchasePrice;
    const whatIfSellingCosts = whatIfValue * (sellingCosts / 100);
    const whatIfNet = whatIfValue - whatIfSellingCosts - purchasePrice;
    const whatIfROI = whatIfNet / purchasePrice * 100;

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
    const grossYield = annualRent / purchasePrice * 100;

    const vacancyLoss = annualRent * (vacancyRate / 100);
    const managementCost = annualRent * (managementFees / 100);
    const totalExpenses = vacancyLoss + managementCost + maintenance + insurance + councilRates;
    const netRent = annualRent - totalExpenses;
    const netYield = netRent / purchasePrice * 100;
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

  // Mortgage Calculations
  const mortgageResults = useMemo(() => {
    const deposit = purchasePrice * (depositPercent / 100);
    const loanAmount = purchasePrice - deposit;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let monthlyRepayment;
    let totalInterest;
    let payoffMonths = numPayments;
    let equityTimeline = [];

    if (loanType === "interestOnly") {
      monthlyRepayment = loanAmount * monthlyRate;
      totalInterest = monthlyRepayment * numPayments;

      // Build equity timeline for interest-only
      for (let year = 0; year <= loanTerm; year++) {
        const propertyValue = purchasePrice * Math.pow(1 + growthRate / 100, year);
        equityTimeline.push({
          year,
          equity: propertyValue - loanAmount,
          propertyValue,
          loanBalance: loanAmount,
          lvr: loanAmount / propertyValue * 100
        });
      }
    } else {
      // Principal & Interest
      monthlyRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

      let balance = loanAmount;
      let totalInterestPaid = 0;
      let month = 0;
      const extraMonthly = enableExtraRepayments ? extraRepayments : 0;

      // Calculate with extra repayments
      while (balance > 0 && month < numPayments) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyRepayment - interestPayment + extraMonthly;
        totalInterestPaid += interestPayment;
        balance = Math.max(0, balance - principalPayment);
        month++;
      }

      totalInterest = totalInterestPaid;
      payoffMonths = month;

      // Build equity timeline
      balance = loanAmount;
      for (let year = 0; year <= Math.ceil(payoffMonths / 12); year++) {
        const monthsElapsed = Math.min(year * 12, payoffMonths);

        // Calculate balance at this year
        let tempBalance = loanAmount;
        for (let m = 0; m < monthsElapsed; m++) {
          const interest = tempBalance * monthlyRate;
          const principal = monthlyRepayment - interest + extraMonthly;
          tempBalance = Math.max(0, tempBalance - principal);
        }

        const propertyValue = purchasePrice * Math.pow(1 + growthRate / 100, year);
        const equity = propertyValue - tempBalance;
        const lvr = tempBalance > 0 ? tempBalance / propertyValue * 100 : 0;

        equityTimeline.push({
          year,
          equity,
          propertyValue,
          loanBalance: tempBalance,
          lvr
        });
      }
    }

    const monthlyWithExtra = enableExtraRepayments ? monthlyRepayment + extraRepayments : monthlyRepayment;
    const payoffYears = payoffMonths / 12;
    const interestSaved = enableExtraRepayments ? monthlyRepayment * numPayments - totalInterest : 0;

    return {
      deposit,
      loanAmount,
      monthlyRepayment,
      monthlyWithExtra,
      totalInterest,
      totalRepaid: loanAmount + totalInterest,
      payoffMonths,
      payoffYears,
      equityTimeline,
      interestSaved
    };
  }, [purchasePrice, depositPercent, interestRate, loanTerm, loanType, growthRate, extraRepayments, enableExtraRepayments]);

  // Stress Test Calculations
  const stressTestResults = useMemo(() => {
    const loanAmount = purchasePrice * (1 - depositPercent / 100);
    const monthlyRate = stressTestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let stressRepayment;
    if (loanType === "interestOnly") {
      stressRepayment = loanAmount * monthlyRate;
    } else {
      stressRepayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const repaymentIncrease = stressRepayment - mortgageResults.monthlyRepayment;
    const increasePercent = repaymentIncrease / mortgageResults.monthlyRepayment * 100;

    // Calculate cashflow impact (using rental income if available)
    const monthlyRentalIncome = yieldResults.monthlyCashflow;
    const netCashflowAtStress = monthlyRentalIncome - stressRepayment;
    const cashflowImpact = netCashflowAtStress - (monthlyRentalIncome - mortgageResults.monthlyRepayment);

    // Risk level based on increase
    let riskLevel = "Low";
    let riskColor = "emerald";
    if (increasePercent > 30) {
      riskLevel = "High";
      riskColor = "rose";
    } else if (increasePercent > 15) {
      riskLevel = "Medium";
      riskColor = "amber";
    }

    return {
      stressRepayment,
      repaymentIncrease,
      increasePercent,
      cashflowImpact,
      netCashflowAtStress,
      riskLevel,
      riskColor
    };
  }, [stressTestRate, purchasePrice, depositPercent, loanTerm, loanType, mortgageResults.monthlyRepayment, yieldResults.monthlyCashflow]);

  const fmt = (num) => `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Property Investment Analysis</h3>
          <p className="text-xs text-slate-600">Advanced property investment tools</p>
        </div>
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="growth" className="rounded-lg px-4 py-2 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5 mr-2" />
            Capital Growth
          </TabsTrigger>
          <TabsTrigger value="yield" className="rounded-lg px-4 py-2 text-xs font-bold">
            <DollarSign className="w-3.5 h-3.5 mr-2" />
            Rental Yield
          </TabsTrigger>
          <TabsTrigger value="mortgage" className="rounded-lg px-4 py-2 text-xs font-bold">
            <PiggyBank className="w-3.5 h-3.5 mr-2" />
            Mortgage & Leverage
          </TabsTrigger>
        </TabsList>

        {/* Capital Growth Simulator */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em]">Inputs</h4>
              
              <div className="space-y-2">
                <Label className="text-xs text-slate-900">Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-50 border-slate-200 text-slate-900" />

                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-900">Annual Growth Rate</Label>
                  <span className="text-sm font-bold text-emerald-600">{growthRate}%</span>
                </div>
                <Slider value={[growthRate]} onValueChange={([v]) => setGrowthRate(v)} min={0} max={20} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-900">Holding Period</Label>
                  <span className="text-sm font-bold text-slate-900">{holdingPeriod} years</span>
                </div>
                <Slider value={[holdingPeriod]} onValueChange={([v]) => setHoldingPeriod(v)} min={1} max={30} step={1} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-900">Selling Costs</Label>
                  <span className="text-sm font-bold text-slate-900">{sellingCosts}%</span>
                </div>
                <Slider value={[sellingCosts]} onValueChange={([v]) => setSellingCosts(v)} min={0} max={10} step={0.5} />
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-[0.15em]">Projected Results</h4>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Future Property Value</p>
                <p className="text-2xl font-black text-slate-900">{fmt(growthResults.futureValue)}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Equity Built</p>
                <p className="text-xl font-black text-emerald-600">{fmt(growthResults.equityBuilt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-600 mb-1">Total ROI</p>
                  <p className="text-lg font-black text-slate-900">{growthResults.totalROI.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-[10px] text-slate-600 mb-1">Annualized Return</p>
                  <p className="text-lg font-black text-slate-900">{growthResults.annualizedReturn.toFixed(1)}%</p>
                </div>
              </div>

              <div className="bg-slate-50 text-slate-600 p-3 rounded-xl border border-white/5">
                <p className="text-slate-600 mb-1">Selling Costs</p>
                <p className="text-[#e40c0c] text-sm font-bold">{fmt(growthResults.sellingCostsAmount)}</p>
              </div>
            </div>
          </div>

          {/* What-If Scenario */}
          <div className="bg-slate-50 p-5 rounded-2xl from-amber-500/10 to-orange-500/10 border border-amber-400/20">
            <h4 className="text-slate-600 mb-4 text-sm font-bold flex items-center gap-2">What If Growth Rate Changes?


            </h4>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Alternative Growth Rate</Label>
                <span className="text-slate-600 text-sm font-bold">{whatIfGrowth}%</span>
              </div>
              <Slider
                value={[whatIfGrowth]}
                onValueChange={([v]) => setWhatIfGrowth(v)}
                min={0}
                max={15}
                step={0.5}
                className="py-2" />

            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 text-slate-600 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 mb-1">Property Value</p>
                <p className="bg-slate-50 text-slate-600 text-sm font-bold">{fmt(growthResults.whatIfValue)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[10px] text-slate-400 mb-1">Equity</p>
                <p className="text-sm font-bold text-emerald-400">{fmt(growthResults.whatIfEquity)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-slate-600 mb-1">ROI</p>
                <p className="bg-slate-50 text-slate-600 text-sm font-bold">{growthResults.whatIfROI.toFixed(1)}%</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-slate-500 text-xs">
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
              <h4 className="text-slate-700 text-xs font-bold uppercase tracking-[0.15em]">INCOME & EXPENSES</h4>
              
              <div className="space-y-2">
                <Label className="text-xs text-slate-700">Weekly Rent</Label>
                <div className="relative">
                  
                  <Input
                    type="number"
                    value={weeklyRent}
                    onChange={(e) => setWeeklyRent(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-700 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />



                </div>
                <p className="text-xs text-slate-500">Annual: {fmt(weeklyRent * 52)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-700">Vacancy Rate</Label>
                  <span className="text-sm font-bold text-white">{vacancyRate}%</span>
                </div>
                <Slider value={[vacancyRate]} onValueChange={([v]) => setVacancyRate(v)} min={0} max={20} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-700">Management Fees</Label>
                  <span className="text-sm font-bold text-white">{managementFees}%</span>
                </div>
                <Slider value={[managementFees]} onValueChange={([v]) => setManagementFees(v)} min={0} max={15} step={0.5} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-700">Annual Maintenance</Label>
                <div className="relative">
                  
                  <Input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-700 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />



                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-700">Annual Insurance</Label>
                <div className="relative">
                  
                  <Input
                    type="number"
                    value={insurance}
                    onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-700 pl-8 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />



                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-700">Council Rates (Annual)</Label>
                <div className="relative">
                  
                  <Input
                    type="number"
                    value={councilRates}
                    onChange={(e) => setCouncilRates(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-700 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />


                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-700">Suburb Average Yield</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={suburbYield}
                    onChange={(e) => setSuburbYield(parseFloat(e.target.value) || 0)} className="bg-slate-50 text-slate-700 px-3 py-1 text-base rounded-md flex h-9 w-full border shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-white/10" />


                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Yield Analysis</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-100 p-4 rounded-2xl from-blue-500/20 to-cyan-500/20 border border-blue-400/20">
                  <p className="text-green-700 mb-1 text-xs flex items-center gap-1">Gross Yield


                  </p>
                  <p className="text-slate-600 text-2xl font-black">{yieldResults.grossYield.toFixed(2)}%</p>
                </div>

                <div className="bg-orange-100 text-slate-600 p-4 rounded-2xl from-emerald-500/20 to-green-500/20 border border-emerald-400/20">
                  <p className="text-green-700 mb-1 text-xs flex items-center gap-1">Net Yield


                  </p>
                  <p className="text-slate-600 text-2xl font-black">{yieldResults.netYield.toFixed(2)}%</p>
                </div>
              </div>

              <div className="bg-emerald-500/10 text-orange-200 p-4 rounded-2xl border border-emerald-400/20">
                <p className="text-green-700 mb-1 text-xs">Monthly Cashflow</p>
                <p className={`text-2xl font-black ${yieldResults.monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {yieldResults.monthlyCashflow >= 0 ? '+' : ''}{fmt(yieldResults.monthlyCashflow)}
                </p>
                <p className="text-slate-600 mt-1 text-xs">
                  {yieldResults.monthlyCashflow >= 0 ? 'Positive' : 'Negative'} cashflow property
                </p>
              </div>

              <div className="bg-slate-300 p-4 rounded-2xl border border-white/5">
                <p className="text-slate-600 mb-2 text-xs">Annual Breakdown</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-800">Gross Rent</span>
                    <span className="text-slate-700 font-semibold">{fmt(yieldResults.annualRent)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span className="text-[#db0f0f]">Total Expenses</span>
                    <span className="text-[#d50b0b] font-semibold">-{fmt(yieldResults.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-green-800 font-bold">Net Income</span>
                    <span className="text-emerald-700 font-bold">{fmt(yieldResults.netRent)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-2xl p-4 border border-indigo-400/20">
                <p className="text-slate-700 mb-2 text-xs">Yield vs Suburb Average</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-600 text-2xl font-black">{yieldResults.netYield.toFixed(2)}%</span>
                  <span className="text-sm text-slate-400">vs</span>
                  <span className="text-slate-700 text-lg font-bold">{suburbYield}%</span>
                </div>
                <p className="text-lime-800 mt-2 text-xs font-semibold">
                  {yieldResults.yieldVsSuburb > 0 ? '+' : ''}{yieldResults.yieldVsSuburb.toFixed(2)}% {yieldResults.yieldVsSuburb > 0 ? 'above' : 'below'} suburb average
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Mortgage & Leverage Engine */}
        <TabsContent value="mortgage" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Loan Parameters</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Deposit</Label>
                  <span className="text-sm font-bold text-emerald-400">{depositPercent}%</span>
                </div>
                <Slider value={[depositPercent]} onValueChange={([v]) => setDepositPercent(v)} min={5} max={50} step={1} />
                <p className="text-xs text-slate-500">Amount: {fmt(mortgageResults.deposit)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Interest Rate</Label>
                  <span className="text-sm font-bold text-white">{interestRate}%</span>
                </div>
                <Slider value={[interestRate]} onValueChange={([v]) => setInterestRate(v)} min={1} max={15} step={0.1} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Loan Term</Label>
                  <span className="text-sm font-bold text-white">{loanTerm} years</span>
                </div>
                <Slider value={[loanTerm]} onValueChange={([v]) => setLoanTerm(v)} min={5} max={40} step={1} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Loan Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLoanType("principal")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                    loanType === "principal" ?
                    "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg" :
                    "bg-slate-700/30 text-slate-600 border border-white/10"}`
                    }>

                    Principal & Interest
                  </button>
                  <button
                    onClick={() => setLoanType("interestOnly")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                    loanType === "interestOnly" ?
                    "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg" :
                    "bg-slate-700/30 text-slate-600 border border-white/10"}`
                    }>

                    Interest Only
                  </button>
                </div>
              </div>

              {/* Extra Repayments Toggle */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-4 border border-emerald-400/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-bold text-emerald-300">Extra Repayments</Label>
                  <Switch
                    checked={enableExtraRepayments}
                    onCheckedChange={setEnableExtraRepayments} />

                </div>
                
                {enableExtraRepayments &&
                <div className="space-y-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                      <Input
                      type="number"
                      value={extraRepayments}
                      onChange={(e) => setExtraRepayments(parseFloat(e.target.value) || 0)}
                      className="pl-8 bg-slate-700/30 border-white/10 text-white"
                      placeholder="Monthly extra" />

                    </div>
                  </div>
                }
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Repayment Analysis</h4>
              
              <div className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl p-4 border border-indigo-400/20">
                <p className="text-xs text-indigo-300 mb-1">Monthly Repayment</p>
                <p className="text-3xl font-black text-white">{fmt(mortgageResults.monthlyWithExtra)}</p>
                {enableExtraRepayments && extraRepayments > 0 &&
                <p className="text-xs text-slate-400 mt-1">
                    Base: {fmt(mortgageResults.monthlyRepayment)} + {fmt(extraRepayments)} extra
                  </p>
                }
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-400 mb-1">Loan Amount</p>
                  <p className="text-lg font-black text-white">{fmt(mortgageResults.loanAmount)}</p>
                </div>
                <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-400 mb-1">Total Interest</p>
                  <p className="text-lg font-black text-rose-400">{fmt(mortgageResults.totalInterest)}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Loan Payoff Time</p>
                <p className="text-2xl font-black text-white">{mortgageResults.payoffYears.toFixed(1)} years</p>
                {enableExtraRepayments && extraRepayments > 0 && loanType === "principal" &&
                <p className="text-xs text-emerald-400 mt-2 font-semibold">
                    ⚡ {(loanTerm - mortgageResults.payoffYears).toFixed(1)} years faster!
                  </p>
                }
              </div>

              {enableExtraRepayments && extraRepayments > 0 && loanType === "principal" &&
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 border border-emerald-400/20">
                  <p className="text-xs text-emerald-300 mb-1">Interest Saved</p>
                  <p className="text-2xl font-black text-emerald-400">{fmt(mortgageResults.interestSaved)}</p>
                </div>
              }

              <div className="bg-slate-700/30 rounded-xl p-3 border border-white/5">
                <p className="text-xs text-slate-400 mb-2">Total Amount Repaid</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Principal</span>
                    <span className="text-white font-semibold">{fmt(mortgageResults.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Interest</span>
                    <span className="text-rose-400 font-semibold">{fmt(mortgageResults.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-white font-bold">{fmt(mortgageResults.totalRepaid)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interest Rate Stress Test */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-400/20">
            <h4 className="text-sm font-bold text-amber-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Interest Rate Stress Test
            </h4>
            <p className="text-xs text-slate-400 mb-4">What if interest rates rise?</p>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-slate-300">Stress Test Rate</Label>
                  <span className="text-lg font-black text-amber-300">{stressTestRate}%</span>
                </div>
                <Slider
                  value={[stressTestRate]}
                  onValueChange={([v]) => setStressTestRate(v)}
                  min={interestRate}
                  max={15}
                  step={0.1}
                  className="py-2" />

                <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>Current: {interestRate}%</span>
                  <span>15%</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">New Monthly Repayment</p>
                  <p className="text-xl font-black text-white">{fmt(stressTestResults.stressRepayment)}</p>
                  <p className="text-xs text-rose-400 mt-1 font-semibold">
                    +{fmt(stressTestResults.repaymentIncrease)} ({stressTestResults.increasePercent.toFixed(1)}%)
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">Cashflow Impact</p>
                  <p className={`text-xl font-black ${stressTestResults.cashflowImpact < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {stressTestResults.cashflowImpact < 0 ? '' : '+'}{fmt(stressTestResults.cashflowImpact)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Net: {fmt(stressTestResults.netCashflowAtStress)}/mo
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-slate-400 mb-2">Risk Level</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${stressTestResults.riskColor}-500/20 border border-${stressTestResults.riskColor}-400/30`}>
                    <div className={`w-2 h-2 rounded-full bg-${stressTestResults.riskColor}-400`} />
                    <span className={`text-sm font-bold text-${stressTestResults.riskColor}-300`}>
                      {stressTestResults.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {stressTestResults.increasePercent.toFixed(0)}% increase
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Scenario:</strong> If rates increase from {interestRate}% to {stressTestRate}%, 
                  your monthly repayments would rise by {fmt(stressTestResults.repaymentIncrease)}. 
                  {stressTestResults.netCashflowAtStress < 0 ?
                  ` This would result in negative cashflow of ${fmt(Math.abs(stressTestResults.netCashflowAtStress))} per month.` :
                  ` You would still maintain positive cashflow of ${fmt(stressTestResults.netCashflowAtStress)} per month.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Equity Growth & LVR Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-[0.15em]">Equity Growth & LVR Timeline</h4>
            
            <div className="bg-slate-700/30 rounded-2xl p-6 border border-white/5">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mortgageResults.equityTimeline}>
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
                    formatter={(value, name) => {
                      if (name === "LVR") return [`${value.toFixed(1)}%`, name];
                      return [fmt(value), name];
                    }} />

                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="propertyValue" stroke="#10b981" strokeWidth={2} name="Property Value" />
                  <Line type="monotone" dataKey="equity" stroke="#6366f1" strokeWidth={2} name="Your Equity" />
                  <Line type="monotone" dataKey="loanBalance" stroke="#ef4444" strokeWidth={2} name="Loan Balance" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-700/30 rounded-2xl p-6 border border-white/5">
              <h5 className="text-xs font-bold text-slate-300 mb-4">LVR (Loan-to-Value Ratio) Over Time</h5>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mortgageResults.equityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(value) => [`${value.toFixed(1)}%`, "LVR"]} />

                  <Line type="monotone" dataKey="lvr" stroke="#f59e0b" strokeWidth={3} name="LVR %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>);

}