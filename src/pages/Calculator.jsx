import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, BarChart3, Table2, Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstrumentSelector from "@/components/calculator/InstrumentSelector";
import InvestmentForm, { getDefaultRate } from "@/components/calculator/InvestmentForm";
import GrowthChart from "@/components/calculator/GrowthChart";
import ResultsSummary from "@/components/calculator/ResultsSummary";
import ScenarioComparison from "@/components/calculator/ScenarioComparison";
import YearlyBreakdown from "@/components/calculator/YearlyBreakdown";
import { calculateInvestment, calculateScenarios } from "@/components/calculator/calculationEngine";

export default function CalculatorPage() {
  const [instrument, setInstrument] = useState("stocks");
  const [params, setParams] = useState({
    currency: "USD",
    initialAmount: 10000,
    monthlyContribution: 500,
    years: 10,
    returnRate: 10,
    inflationRate: 3,
    frequency: "monthly",
    taxRate: 15,
    fees: 0.5,
  });

  const handleInstrumentChange = (id) => {
    setInstrument(id);
    const rate = getDefaultRate(id, "moderate");
    setParams(prev => ({ ...prev, returnRate: rate }));
  };

  const results = useMemo(() => calculateInvestment(params), [params]);
  const scenarios = useMemo(() => calculateScenarios(params), [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <Calculator className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 tracking-wide">INVESTMENT CALCULATOR</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Calculate Your
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> Investment Returns</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Model potential returns across stocks, ETFs, property, bonds, and more.
              Compare scenarios and plan your financial future with precision.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Instrument Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Investment Type</h2>
          <InstrumentSelector selected={instrument} onSelect={handleInstrumentChange} />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-6 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                Parameters
              </h3>
              <InvestmentForm params={params} setParams={setParams} />
            </div>
          </motion.div>

          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 space-y-8"
          >
            {/* Summary Cards */}
            <ResultsSummary summary={results.summary} currency={params.currency} />

            {/* Tabs for Chart / Scenarios / Table */}
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="bg-slate-100/80 p-1 rounded-2xl h-auto">
                <TabsTrigger value="chart" className="rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                  Growth Chart
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-xl px-4 py-2.5 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Table2 className="w-3.5 h-3.5 mr-1.5" />
                  Yearly Breakdown
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Portfolio Growth Over Time</h3>
                  <GrowthChart data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>

              <TabsContent value="scenarios" className="mt-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Market Scenario Analysis</h3>
                  <p className="text-xs text-slate-400 mb-5">Compare conservative, moderate, and aggressive market outcomes</p>
                  <ScenarioComparison scenarios={scenarios} currency={params.currency} />
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Year-by-Year Breakdown</h3>
                  <YearlyBreakdown data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
              <p className="text-[11px] text-amber-700/80 leading-relaxed">
                <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. 
                Actual investment returns will vary based on market conditions, timing, specific instruments chosen, 
                and other factors. Past performance does not guarantee future results. 
                Always consult a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}