import React, { useState, useMemo, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calculator, BarChart3, Table2, Layers, TrendingUp, Shield, Sparkles, Palmtree, PieChart as PieChartIcon, Settings, PiggyBank, Map as MapIcon, Lock, Target, Crown, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import InstrumentSelector from "@/components/calculator/InstrumentSelector";
import CurrencySelector from "@/components/calculator/CurrencySelector";
import InvestmentProfiles from "@/components/calculator/InvestmentProfiles";
import InvestmentForm, { getDefaultRate } from "@/components/calculator/InvestmentForm";
import GrowthChart from "@/components/calculator/GrowthChart";
import ScenarioComparison from "@/components/calculator/ScenarioComparison";
import YearlyBreakdown from "@/components/calculator/YearlyBreakdown";
import MarketSentiment from "@/components/calculator/MarketSentiment";
import TaxOptimization from "@/components/calculator/TaxOptimization";
import InvestmentCoach from "@/components/calculator/InvestmentCoach";
import PropertyAnalyzer from "@/components/calculator/PropertyAnalyzer";
import PropertyVsETF from "@/components/calculator/PropertyVsETF";
import EquityUnlockPlanner from "@/components/calculator/EquityUnlockPlanner";
import PortfolioOverview from "@/components/calculator/PortfolioOverview";
import RetirementPlanner from "@/components/calculator/RetirementPlanner";

import FairValueCalculator from "@/components/calculator/FairValueCalculator";
import SaveExport from "@/components/calculator/SaveExport";
import { calculateInvestment, calculateScenarios } from "@/components/calculator/calculationEngine";
import AdvisorLogic from "@/components/calculator/AdvisorLogic";
import { useSubscription } from "@/components/calculator/useSubscription";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import AuthGuard from "@/components/AuthGuard";
import PremiumGate from "@/components/calculator/PremiumGate";
import { generatePdfReport } from "@/components/calculator/generatePdfReport";
import { toast } from "sonner";

const LS_KEY = "wealthlens-calc-state";

const DEFAULT_PARAMS = {
  currency: "USD",
  initialAmount: 10000,
  monthlyContribution: 500,
  years: 10,
  returnRate: 10,
  inflationRate: 3,
  frequency: "monthly",
  taxRate: 15,
  fees: 0.5
};

function loadLocalState() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

function CalculatorContent() {
  const { getDatabaseTable } = useFinancialParser();
  const local = loadLocalState();
  const [instrument, setInstrument] = useState(local?.instrument || "stocks");
  const [params, setParams] = useState(local?.params || DEFAULT_PARAMS);
  const [propertyCurrency, setPropertyCurrency] = useState(local?.propertyCurrency || "USD");
  const [userLoaded, setUserLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab");
  const setActiveTab = (tab) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
  };
  const [showAdvisorLogic, setShowAdvisorLogic] = useState(false);

  const chartRef = useRef(null);
  const { isPremium, loading: subLoading } = useSubscription();

  // Auto-trigger checkout if redirected here after login from pricing page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("checkout") === "1") {
      // Remove param from URL cleanly
      window.history.replaceState({}, "", window.location.pathname);
      (async () => {
        try {
          const user = await base44.auth.me();
          if (!user?.email) return;
          // Check if already subscribed — if so, stay on Calculator
          if (user.is_premium || user.subscription_tier === 'pro') return;
          // Not subscribed — proceed to Stripe checkout
          const price = await base44.app.getPrice();
          const response = await base44.functions.invoke("stripeCheckout", {
            priceId: "price_1T7w6sJkmG8taKBQqIH4PxqD",
            email: user.email,
            amount: price, // Pass dynamic price in dollars
            successUrl: window.location.origin + window.location.pathname + "?upgraded=true",
            cancelUrl: window.location.href,
          });
          if (response.data?.url) {
            window.location.href = response.data.url;
          }
        } catch (err) {
          console.error("Auto-checkout failed:", err);
        }
      })();
    }
  }, []);

  // On mount: load persisted state from production DB
  useEffect(() => {
    async function loadFromDB() {
      try {
        const settings = await base44.user.loadData("wl_calc_settings");
        if (settings) {
          if (settings.params) setParams(settings.params);
          if (settings.instrument) setInstrument(settings.instrument);
          if (settings.propertyCurrency) setPropertyCurrency(settings.propertyCurrency);
        } else {
          // Fallback to legacy metadata if new table doesn't exist yet
          const user = await base44.auth.me();
          if (user?.calc_params) setParams(JSON.parse(user.calc_params));
          if (user?.calc_instrument) setInstrument(user.calc_instrument);
          if (user?.calc_currency) setPropertyCurrency(user.calc_currency);
        }
      } catch (err) {
        console.error("Failed to load calculator state:", err);
        setLoadError(true);
      } finally {
        setUserLoaded(true);
      }
    }
    loadFromDB();
  }, []);

  // Track changes manually
  useEffect(() => {
    if (userLoaded) setHasChanges(true);
  }, [instrument, params, propertyCurrency]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.user.saveData("wl_calc_settings", { instrument, params, propertyCurrency });
      setHasChanges(false);
      toast.success("Calculation parameters saved");
    } catch (err) {
      console.error("[Calculator] Save failed:", err);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstrumentChange = (id) => {
    setInstrument(id);
    const rate = getDefaultRate(id, "moderate");
    setParams((prev) => ({ ...prev, returnRate: rate }));
  };

  const results = useMemo(() => calculateInvestment(params), [params]);
  const scenarios = useMemo(() => calculateScenarios(params), [params]);


  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Syncing data...</p>
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
          <Calculator className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Calculator Sync Error</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">We encountered a secure loading error. To protect your saved calculation parameters, the interface has been locked. Please try refreshing.</p>
        <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 h-12 rounded-xl">
          Refresh Calculator
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-2 pt-4 pb-2">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
          {/* Header Area */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <Calculator className="w-4 h-4 text-amber-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Financial Calculator</h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`h-9 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border-0 shadow-lg ${hasChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 animate-pulse' : 'bg-slate-700 text-slate-400 cursor-default'}`}
              >
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  if (!isPremium) {
                    toast.error("Premium subscription required for PDF export");
                    return;
                  }
                  const loadingToast = toast.loading("Generating PDF report...");
                  try {
                    generatePdfReport({ params, results, instrument, activeTab });
                    toast.dismiss(loadingToast);
                    toast.success("PDF report downloaded!");
                  } catch (error) {
                    console.error("PDF export error:", error);
                    toast.dismiss(loadingToast);
                    toast.error(`Failed to generate PDF: ${error.message}`);
                  }
                }}
                className="bg-[#C5A059] hover:bg-[#D4B06A] text-[#1A202C] font-bold h-9 px-4 rounded-xl shadow-lg shadow-[#C5A059]/20 transition-all flex items-center gap-2 border-0 group"
              >
                {isPremium ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4 text-[#1A202C]/60" />}
                <span className="text-[10px] uppercase tracking-wider">Export PDF</span>
                {!isPremium && <span className="text-[9px] bg-[#1A202C] text-[#C5A059] px-1.5 py-0.5 rounded ml-1 font-black">PRO</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel starts below Navbar */}
      <div className="bg-slate-50 min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-500/5 rounded-full blur-3xl" />
        </div>

         <div className="max-w-full mx-auto px-2 py-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 bg-white rounded-[32px] p-5 border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-24 -mt-24" />
            
            <div className="flex flex-col gap-10 relative z-10">
              <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-1 rounded-full bg-amber-600" />
                  <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.35em]">Quick Start Profiles</h2>
                </div>
                <InvestmentProfiles onSelect={(defaults) => setParams((prev) => ({ ...prev, ...defaults }))} />
              </div>

              <div className="w-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-1 rounded-full bg-amber-600" />
                  <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.35em]">Select Asset Class</h2>
                </div>
                <InstrumentSelector selected={instrument} onSelect={handleInstrumentChange} />
              </div>
            </div>
          </motion.div>

        <div className={instrument === "property" ? "" : "grid grid-cols-1 lg:grid-cols-12 gap-8"}>
          {instrument !== "property" &&
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                <h3 className="text-sm font-medium text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Calculator className="w-4 h-4 text-white" />
                  </div>
                  Investment Parameters
                </h3>
                <InvestmentForm params={params} setParams={setParams} instrument={instrument} />
              </div>
            </motion.div>
          }

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={instrument === "property" ? "space-y-8" : "lg:col-span-8 space-y-8"}>

            {instrument !== "property" &&
            <div id="calculator-portfolio-overview">
              <PortfolioOverview
                params={params}
                instrument={instrument}
                results={results}
                currency={params.currency} />
            </div>
            }

            {instrument === "property" &&
            <>
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-[0.15em] whitespace-nowrap">Property Currency</label>
                  <div className="flex-1 max-w-xs">
                    <CurrencySelector value={propertyCurrency} onChange={setPropertyCurrency} />
                  </div>
                </div>
                <PropertyAnalyzer currency={propertyCurrency} />
                <PropertyVsETF currency={propertyCurrency} />
                <PremiumGate featureName="Equity Unlock Planner" isPremium={isPremium}>
                  <EquityUnlockPlanner currency={propertyCurrency} />
                </PremiumGate>
              </>
            }

            {instrument !== "property" && activeTab &&
            <div id="calculator-active-module">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="coach" className="mt-0">
                <PremiumGate featureName="AI Investment Coach" isPremium={isPremium}>
                  {activeTab === "coach" && (
                    <InvestmentCoach params={params} instrument={instrument} results={results} />
                  )}
                </PremiumGate>
              </TabsContent>



              <TabsContent value="fairvalue" className="mt-6">
                <PremiumGate featureName="Fair Value Calculator" isPremium={isPremium}>
                  <FairValueCalculator />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="retirement" className="mt-6">
                <PremiumGate featureName="Retirement Planner" isPremium={isPremium}>
                  <RetirementPlanner currency={params.currency} />
                </PremiumGate>
              </TabsContent>

              <TabsContent value="chart" className="mt-6">
                <div id="calculator-growth-chart" ref={chartRef} className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-6">Portfolio Growth Over Time</h3>
                  <GrowthChart data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>

              <TabsContent value="market" className="mt-6">
                <PremiumGate featureName="Market Sentiment Analysis" isPremium={isPremium}>
                  <MarketSentiment instrument={instrument} currency={params.currency} params={params} />
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
                  <GrowthChart data={results.yearlyData} currency={params.currency} />
            
                  <div className="mt-8">
                    {!showAdvisorLogic ? (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                         <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-5 h-5 text-amber-400" />
                              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">New Beta Feature</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">AdvisorLogic™ Orchestration</h3>
                            <p className="text-slate-300 font-medium max-w-md">Collaborate with a panel of specialized AI agents for a rigorous, multi-point audit of your strategy.</p>
                         </div>
                         <Button 
                           onClick={() => setShowAdvisorLogic(true)}
                           className="bg-amber-600 text-white hover:bg-gray-100 font-black px-8 py-6 rounded-2xl shadow-2xl relative z-10 uppercase tracking-widest"
                         >
                           Start AdvisorLogic Review
                         </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">AdvisorLogic Committee</h3>
                          <Button variant="ghost" size="sm" onClick={() => setShowAdvisorLogic(false)} className="text-gray-400 hover:text-gray-900 font-bold uppercase tracking-widest text-[10px]">Reset Session</Button>
                        </div>
                        <AdvisorLogic 
                          symbol={instrument.toUpperCase()} 
                          onApply={() => {
                            setParams(prev => ({
                              ...prev,
                              returnRate: Math.max(0, prev.returnRate - 2),
                              fees: prev.fees + 0.2
                            }));
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <YearlyBreakdown data={results.yearlyData} currency={params.currency} />
                </div>
              </TabsContent>
            </Tabs>
            </div>
            }

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
  </div>
  );
}

export default function CalculatorPage() {
  return (
    <AuthGuard>
      <CalculatorContent />
    </AuthGuard>);

}