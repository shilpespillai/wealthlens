import React, { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Calculator, BarChart3, Table2, Layers, TrendingUp, Shield, Sparkles, Palmtree, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InstrumentSelector from "@/components/calculator/InstrumentSelector";
import InvestmentProfiles from "@/components/calculator/InvestmentProfiles";
import InvestmentForm, { getDefaultRate } from "@/components/calculator/InvestmentForm";
import GrowthChart from "@/components/calculator/GrowthChart";
import ResultsSummary from "@/components/calculator/ResultsSummary";
import ScenarioComparison from "@/components/calculator/ScenarioComparison";
import YearlyBreakdown from "@/components/calculator/YearlyBreakdown";
import MarketSentiment from "@/components/calculator/MarketSentiment";
import TaxOptimization from "@/components/calculator/TaxOptimization";
import InvestmentCoach from "@/components/calculator/InvestmentCoach";
import PropertyAnalyzer from "@/components/calculator/PropertyAnalyzer";
import PropertyVsETF from "@/components/calculator/PropertyVsETF";
import EquityUnlockPlanner from "@/components/calculator/EquityUnlockPlanner";
import PortfolioOverview from "@/components/calculator/PortfolioOverview";
import AIPortfolioBuilder from "@/components/calculator/AIPortfolioBuilder";
import RetirementPlanner from "@/components/calculator/RetirementPlanner";
import SaveExport from "@/components/calculator/SaveExport";
import PremiumGate from "@/components/calculator/PremiumGate";
import AuthGuard from "@/components/AuthGuard";
import { useSubscription } from "@/components/calculator/useSubscription";
import { calculateInvestment, calculateScenarios } from "@/components/calculator/calculationEngine";

function CalculatorContent() {
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
  
  const chartRef = useRef(null);
  const { isPremium, loading: subLoading } = useSubscription();

  const handleInstrumentChange = (id) => {
    setInstrument(id);
    const rate = getDefaultRate(id, "moderate");
    setParams(prev => ({ ...prev, returnRate: rate }));
  };

  const results = useMemo(() => calculateInvestment(params), [params]);
  const scenarios = useMemo(() => calculateScenarios(params), [params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/3 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698eb477e1773680473fe637/f6715e80c_generated_image.png" alt="WealthLens logo" className="w-12 h-12 rounded-2xl shadow-lg shadow-indigo-500/30" />
              <span className="text-2xl font-black text-white tracking-tight">WealthLens</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              See Your Financial
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">Future Clearly</span>
            </h1>
            <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Whether you're starting with $50 or managing millions, make informed investment decisions.
              <br className="hidden sm:block" />
              Professional-grade tools for every investor.
            </p>
            <div className="flex items-center justify-center gap-8 mt-8 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Accessible to All</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Real-Time Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span>20+ Currencies</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">
        {/* Investment Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Quick Start Profiles</h2>
          <InvestmentProfiles onSelect={(defaults) => setParams(prev => ({ ...prev, ...defaults }))} />
        </motion.div>

        {/* Instrument Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-6">Select Asset Class</h2>
          <InstrumentSelector selected={instrument} onSelect={handleInstrumentChange} />
        </motion.div>

        {/* Main Grid */}
        <div className={instrument === "property" ? "" : "grid grid-cols-1 lg:grid-cols-12 gap-8"}>
          {/* Form Sidebar - Hidden for Property */}
          {instrument !== "property" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4"
            >
              <div className="sticky top-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                <h3 className="text-sm font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  Investment Parameters
                </h3>
                <InvestmentForm params={params} setParams={setParams} />
              </div>
            </motion.div>
          )}

          {/* Results Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={instrument === "property" ? "space-y-8" : "lg:col-span-8 space-y-8"}
          >
            {/* Portfolio Overview Dashboard */}
            {instrument !== "property" && (
              <PortfolioOverview 
                params={params} 
                instrument={instrument} 
                results={results} 
                currency={params.currency} 
              />
            )}

            {/* Summary Cards - Hidden for Property */}
            {instrument !== "property" && (
              <>
                <ResultsSummary summary={results.summary} currency={params.currency} />
                
                {/* Save & Export */}
                <div className="flex justify-end">
                  {isPremium ? (
                    <SaveExport params={params} instrument={instrument} results={results} chartRef={chartRef} />
                  ) : (
                    <button
                      onClick={() => document.getElementById('premium-trigger')?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-semibold hover:from-amber-400/30 hover:to-orange-500/30 transition-all"
                    >
                      <span>👑</span> Save & Export PDF — Premium
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Property-Specific Analysis */}
            {instrument === "property" && (
              <>
                <PropertyAnalyzer currency={params.currency} />
                
                {/* Property vs ETF Comparison */}
                <PropertyVsETF currency={params.currency} />

                {/* Equity Unlock Planner — Premium */}
                <PremiumGate featureName="Equity Unlock Planner" isPremium={isPremium}>
                  <EquityUnlockPlanner currency={params.currency} />
                </PremiumGate>
              </>
            )}

            {/* Tabs for Chart / Scenarios / Table / Market Analysis - Hidden for Property */}
            {instrument !== "property" && (
              <Tabs defaultValue="coach" className="w-full">
              <TabsList className="bg-slate-100 border border-slate-300 p-1.5 rounded-2xl h-auto flex-wrap">
                <TabsTrigger value="coach" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  AI Coach
                </TabsTrigger>
                <TabsTrigger value="portfolio_builder" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <BrainCircuit className="w-3.5 h-3.5 mr-2" />
                  AI Portfolio
                </TabsTrigger>
                <TabsTrigger value="retirement" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <Palmtree className="w-3.5 h-3.5 mr-2" />
                  Retirement
                </TabsTrigger>
                <TabsTrigger value="chart" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <BarChart3 className="w-3.5 h-3.5 mr-2" />
                  Growth Chart
                </TabsTrigger>
                <TabsTrigger value="market" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <TrendingUp className="w-3.5 h-3.5 mr-2" />
                  Market Analysis
                </TabsTrigger>
                <TabsTrigger value="tax" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <Shield className="w-3.5 h-3.5 mr-2" />
                  Tax Strategies
                </TabsTrigger>
                <TabsTrigger value="scenarios" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <Layers className="w-3.5 h-3.5 mr-2" />
                  Scenarios
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-xl px-5 py-3 text-xs font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 text-slate-700 transition-all">
                  <Table2 className="w-3.5 h-3.5 mr-2" />
                  Yearly Breakdown
                </TabsTrigger>
              </TabsList>

              <TabsContent value="coach" className="mt-6">
                <PremiumGate featureName="AI Investment Coach" isPremium={isPremium}>
                  <InvestmentCoach params={params} instrument={instrument} results={results} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="portfolio_builder" className="mt-6">
                <PremiumGate featureName="AI Portfolio Builder" isPremium={isPremium}>
                  <AIPortfolioBuilder currency={params.currency} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="retirement" className="mt-6">
                <PremiumGate featureName="Retirement Planner" isPremium={isPremium}>
                  <RetirementPlanner currency={params.currency} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="chart" className="mt-6">
                <div ref={chartRef} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Portfolio Growth Over Time</h3>
                  <GrowthChart data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>

              <TabsContent value="market" className="mt-6">
                <PremiumGate featureName="Market Sentiment Analysis" isPremium={isPremium}>
                  <MarketSentiment instrument={instrument} currency={params.currency} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="tax" className="mt-6">
                <PremiumGate featureName="Tax Optimization Strategies" isPremium={isPremium}>
                  <TaxOptimization params={params} instrument={instrument} results={results} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="scenarios" className="mt-6">
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Market Scenario Analysis</h3>
                  <p className="text-xs text-slate-700 mb-6">Compare conservative, moderate, and aggressive market outcomes</p>
                  <ScenarioComparison scenarios={scenarios} currency={params.currency} />
                </div>
              </TabsContent>

              <TabsContent value="table" className="mt-6">
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Year-by-Year Breakdown</h3>
                  <YearlyBreakdown data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>
            </Tabs>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-200 rounded-2xl p-5">
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong className="text-amber-900">Disclaimer:</strong> This calculator provides estimates for educational purposes only. 
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

export default function CalculatorPage() {
  return (
    <AuthGuard>
      <CalculatorContent />
    </AuthGuard>
  );
}