import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, TrendingUp, Info, ChevronRight, X, Heart, ShieldCheck, 
  Trash2, Plus, ArrowRight, Download, Save, Map as MapIcon, Layers, 
  BarChart3, Layout, Clock, ExternalLink, AlertCircle, Maximize2, Minimize2, 
  ArrowLeftRight, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useSubscription } from "@/components/calculator/useSubscription";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function SuburbAnalyzer() {
  const [currency] = useState('AUD'); // Defaulting to AUD for Australian suburbs but keeping dynamic ability
  const sym = getCurrencySymbol(currency);
  const { isPremium } = useSubscription();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCountry, setSearchCountry] = useState('AU');
  const [searchState, setSearchState] = useState('NSW');
  const [propertyType, setPropertyType] = useState('house'); // 'house' | 'unit'
  const [suburbs, setSuburbs] = useState([]); // Selected suburbs for comparison
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [comparing, setComparing] = useState(false);

  const countries = [
    { code: 'AU', name: 'Australia', stateLabel: 'State', zipLabel: 'Postcode', states: ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'], currency: 'AUD' },
    { code: 'US', name: 'USA', stateLabel: 'State', zipLabel: 'Zip Code', states: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'], currency: 'USD' },
    { code: 'UK', name: 'United Kingdom', stateLabel: 'Region', zipLabel: 'Postcode', states: ['London', 'South East', 'South West', 'Midlands', 'North', 'Wales', 'Scotland', 'NI'], currency: 'GBP' },
    { code: 'CA', name: 'Canada', stateLabel: 'Province', zipLabel: 'Postal Code', states: ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE'], currency: 'CAD' },
    { code: 'NZ', name: 'New Zealand', stateLabel: 'Region', zipLabel: 'Postcode', states: ['Auckland', 'Wellington', 'Canterbury', 'Waikato', 'Otago'], currency: 'NZD' },
    { code: 'IN', name: 'India', stateLabel: 'State', zipLabel: 'PIN Code', states: ['MH', 'DL', 'KA', 'TN', 'GJ', 'WB', 'UP', 'HR', 'TG'], currency: 'INR' }
  ];

  const activeCountry = countries.find(c => c.code === searchCountry) || countries[0];

  const processAIResults = (aiData, name, state, suburbCountry) => {
    // Calculate a base score if AI fails (unlikely with fallbacks)
    const totalScore = aiData?.investmentScore || 50;

    return {
      id: Date.now(), 
      name: name.toUpperCase(),
      state: state,
      postcode: '',
      country: suburbCountry,
      currency: aiData?.currency || (suburbCountry === 'US' ? 'USD' : suburbCountry === 'UK' ? 'GBP' : 'AUD'),
      medianPrice: aiData?.medianPrice || 0,
      rentalYield: aiData?.rentalYield || 0,
      score: totalScore,
      strategy: (aiData?.rentalYield || 0) > 4.5 ? 'High Cashflow' : 'Capital Growth',
      infrastructure: (aiData?.projects || []).map(p => 
        typeof p === 'string' ? { title: p, desc: "Identified via AI market scan." } : p
      ),
      indicators: aiData?.indicators || { 
        vacancyRate: 1.5, 
        listingsTrend: 0, 
        monthsSupply: 3.5, 
        dom: 35, 
        growth3mo: 1.2, 
        growth12mo: 5.5, 
        volumeTrend: 0, 
        landConstraint: 5 
      },
      categoryScores: aiData?.categoryScores || {
        affordability: 50,
        lifestyle: 70,
        transport: 65,
        schools: 75,
        safety: 80
      },
      recommendation: aiData ? (totalScore >= 70 ? 'Strong Buy' : totalScore >= 50 ? 'Monitor' : 'Avoid') : 'Analyze',
      recClass: totalScore >= 70 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : totalScore >= 50 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-rose-100 text-rose-700 border-rose-200',
      aiText: aiData?.insights || 'Market analysis search in progress...',
      propertyType: aiData?.propertyType || propertyType,
      strategistAnalysis: aiData?.strategistAnalysis || {
        domVsCityAvg: "N/A",
        somPercentage: 0,
        ripplePotential: "Analysis pending",
        supplyTrapRisk: "Low",
        redFlags: ["No specific flags identified"],
        tenantFit: "Stock matches standard demographic profile."
      },
      verdict: aiData?.strategistVerdict || "Analysis Pending",
      chartData: aiData?.historicalSeries || []
    };
  };

  const saveToProfile = async (data) => {
    const { base44 } = await import("@/api/base44Client");
    await base44.user.saveData('wealthlens-suburbs', data);
  };

  // Persistence: Load from Supabase on mount
  useEffect(() => {
    (async () => {
      const { base44 } = await import("@/api/base44Client");
      const saved = await base44.user.loadData('wealthlens-suburbs');
      if (saved && Array.isArray(saved)) {
        setSuburbs(saved);
        if (saved.length > 0) {
          setExpandedId(saved[0].id); // Expand the first one by default
        }
      }
    })();
  }, []);

  const analyzeSuburb = async () => {
    if (!searchQuery || !searchState) return;
    setAnalyzing(true);
    
    const suburbCountry = searchCountry; // Capture current state
    const currentActiveCountry = activeCountry; // Capture current state
    
    try {
      const { base44 } = await import("@/api/base44Client");
      
      let aiData = null;
      // Load calculator context for better AI personalization
      let budgetContext = "";
      try {
        const calcParams = await base44.user.loadData('calc_params');
        if (calcParams) {
          const p = typeof calcParams === 'string' ? JSON.parse(calcParams) : calcParams;
          budgetContext = `USER FINANCIAL CONTEXT:
- Budget/Initial: ${p.currency} ${p.initialAmount?.toLocaleString()}
- Monthly Contribution: ${p.currency} ${p.monthlyContribution?.toLocaleString()}
- Time Horizon: ${p.years} years
- Target Return: ${p.returnRate}%
`;
        }
      } catch (e) {
        console.warn("Failed to load calculator context for AI:", e);
      }

      // Use Gemini AI for all countries (AU + Global)
      const aiResp = await base44.functions.invoke('getGlobalAIInsights', { 
        suburb: searchQuery, 
        state: searchState, 
        country: suburbCountry,
        propertyType: propertyType, // Pass property type
        userContext: budgetContext // Pass the new context
      });
      aiData = aiResp.data;

      const newSuburb = processAIResults(aiData, searchQuery, searchState, suburbCountry);
      // Inject country/currency info for global display if not already set by AI
      if (!newSuburb.currency) newSuburb.currency = currentActiveCountry.currency;

      setSuburbs(prev => {
        const newSuburbs = [newSuburb, ...prev];
        setExpandedId(newSuburb.id); // Auto-expand the new one
        saveToProfile(newSuburbs);
        return newSuburbs;
      });
      
      setSearchQuery('');
    } catch (error) {
      console.error(" suburb analysis error:", error);
      toast.error("Failed to analyze market. Please check your inputs and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const removeSuburb = (id) => {
    setSuburbs(suburbs.filter(s => s.id !== id));
  };
  
  const fmt = (num, subCurrency) => {
    const cur = subCurrency || currency;
    const symbol = getCurrencySymbol(cur);
    return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <MapIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suburb Investment Analyzer</h1>
              <p className="text-slate-500 font-medium">AI-powered property market insights & demand forecasting</p>
            </div>
          </div>
          <Link to={createPageUrl("Calculator")} className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to Tools
          </Link>
        </div>

        <div className="space-y-8">
          {/* Search Input */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
            <div className="max-w-4xl">
               <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Search className="w-4 h-4 text-indigo-500" />
                 Analyze a Suburb
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-1">
                   <select 
                     value={searchCountry}
                     onChange={(e) => {
                       const c = countries.find(x => x.code === e.target.value);
                       setSearchCountry(e.target.value);
                       setSearchState(c.states[0]);
                     }}
                     className="w-full bg-slate-50 border border-slate-200 h-14 rounded-xl px-4 text-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                   >
                     {countries.map(c => (
                       <option key={c.code} value={c.code}>{c.name}</option>
                     ))}
                   </select>
                 </div>
                 <div className="md:col-span-1">
                   <Input 
                     placeholder={`${searchCountry === 'US' ? 'City' : 'Suburb'} Name`} 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="bg-slate-50 border-slate-200 h-14 text-lg focus:ring-indigo-500"
                     onKeyDown={(e) => e.key === 'Enter' && analyzeSuburb()}
                   />
                 </div>
                 <div>
                   <select 
                     value={searchState}
                     onChange={(e) => setSearchState(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 h-14 rounded-xl px-4 text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   >
                     {activeCountry.states.map(s => (
                       <option key={s} value={s}>{s}</option>
                     ))}
                   </select>
                 </div>
               </div>
               
               {/* Property Type Toggle */}
               <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full sm:w-fit mt-4">
                 <button 
                   onClick={() => setPropertyType('house')}
                   className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${propertyType === 'house' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Houses
                 </button>
                 <button 
                   onClick={() => setPropertyType('unit')}
                   className={`flex-1 sm:flex-none px-6 py-2 rounded-lg font-bold text-sm transition-all ${propertyType === 'unit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Units / Apartments
                 </button>
               </div>

               <div className="mt-4">
                 <Button 
                   onClick={analyzeSuburb}
                   disabled={!searchQuery || !searchState || analyzing}
                   className="h-14 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 w-full sm:w-auto"
                 >
                   {analyzing ? 'Analyzing Market...' : 'Analyze Market'}
                 </Button>
               </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">Live AI Google Search active. Grounded 2025/2026 market analysis.</p>
            </div>
          </div>

          {/* Dashboards Area */}
           <div className="max-w-7xl mx-auto px-4 pb-24">
             {suburbs.length > 0 && (
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <Layout className="w-5 h-5 text-indigo-600" />
                   Market Insights <span className="text-slate-400 font-medium text-sm">({suburbs.length})</span>
                 </h3>
                 <div className="flex gap-3">
                   {suburbs.length >= 2 && (
                     <Button 
                       onClick={() => setComparing(!comparing)}
                       variant="outline"
                       className={`flex items-center gap-2 font-black border-2 rounded-xl h-12 px-6 transition-all ${comparing ? 'bg-indigo-600 text-white border-indigo-600' : 'text-indigo-600 border-indigo-100'}`}
                     >
                       <ArrowLeftRight className="w-4 h-4" />
                       {comparing ? 'Exit Comparison' : 'Compare Suburbs'}
                     </Button>
                   )}
                   <Button 
                     variant="outline"
                     onClick={() => {
                        setSuburbs([]);
                        saveToProfile([]);
                     }}
                     className="flex items-center gap-2 text-rose-500 border-rose-100 hover:bg-rose-50 font-black rounded-xl h-12 px-6"
                   >
                     <Trash2 className="w-4 h-4" />
                     Clear All
                   </Button>
                 </div>
               </div>
             )}

             {comparing ? (
               <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-2xl font-black text-slate-900">Side-by-Side Comparison</h4>
                    <p className="text-sm text-slate-500 font-medium">Head-to-head property strategist metrics</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50">
                             <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Metric</th>
                             {suburbs.map(s => (
                               <th key={s.id} className="p-6 font-black text-slate-900 border-l border-slate-100">
                                 {s.name} <span className="block text-[8px] opacity-50 uppercase">{s.propertyType}</span>
                               </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          <tr>
                             <td className="p-6 text-xs font-black text-slate-500 uppercase">Median Price</td>
                             {suburbs.map(s => <td key={s.id} className="p-6 font-bold text-slate-900 border-l border-slate-100">{fmt(s.medianPrice, s.currency)}</td>)}
                          </tr>
                          <tr>
                             <td className="p-6 text-xs font-black text-slate-500 uppercase">Yield</td>
                             {suburbs.map(s => <td key={s.id} className="p-6 font-bold text-emerald-600 border-l border-slate-100">{s.rentalYield.toFixed(2)}%</td>)}
                          </tr>
                          <tr>
                             <td className="p-6 text-xs font-black text-slate-500 uppercase">SOM %</td>
                             {suburbs.map(s => <td key={s.id} className="p-6 font-bold text-indigo-600 border-l border-slate-100">{s.strategistAnalysis.somPercentage}%</td>)}
                          </tr>
                          <tr>
                             <td className="p-6 text-xs font-black text-slate-500 uppercase">Supply Risk</td>
                             {suburbs.map(s => (
                               <td key={s.id} className="p-6 border-l border-slate-100">
                                 <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                   s.strategistAnalysis.supplyTrapRisk === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                 }`}>{s.strategistAnalysis.supplyTrapRisk}</span>
                               </td>
                             ))}
                          </tr>
                          <tr>
                             <td className="p-6 text-xs font-black text-slate-500 uppercase">Verdict</td>
                             {suburbs.map(s => (
                               <td key={s.id} className="p-6 border-l border-slate-100">
                                 <span className="text-xs font-black text-indigo-600">{s.verdict}</span>
                               </td>
                             ))}
                          </tr>
                       </tbody>
                    </table>
                  </div>
               </div>
             ) : (
               <div className="space-y-4">
                 {suburbs.map((suburb) => (
                   <div key={suburb.id} className="transition-all duration-500 ease-in-out">
                     {expandedId === suburb.id ? (
                       <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                         {/* Card Header with Collapse */}
                         <div className="absolute top-6 right-6 flex gap-2 z-10">
                            <button 
                              onClick={() => setExpandedId(null)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                              title="Collapse"
                            >
                              <ChevronUp className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                const newSuburbs = suburbs.filter(s => s.id !== suburb.id);
                                setSuburbs(newSuburbs);
                                saveToProfile(newSuburbs);
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                         
                         {/* Card Content */}
                         <div className={`p-6 sm:p-8 border-b ${suburb.recClass}`}>
                           <div className="flex justify-between items-start mb-6">
                             <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-3xl font-black tracking-tight">{suburb.name}</h3>
                                  <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black uppercase tracking-widest border border-white/20">
                                    {suburb.propertyType}
                                  </span>
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-black/10 flex items-center gap-1.5 ${suburb.strategy === 'Capital Growth' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                    <TrendingUp className="w-3 h-3" />
                                    {suburb.strategy}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <MapPin className="w-5 h-5 opacity-70" />
                                  <span className="text-lg font-bold opacity-80">{suburb.state}</span>
                                </div>
                             </div>
                             
                             {/* Investment Score Gauge */}
                             <div className="relative w-24 h-24 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-black/5 shadow-inner">
                               <svg className="w-20 h-20 -rotate-90">
                                 <circle
                                   cx="40" cy="40" r="34"
                                   fill="transparent"
                                   stroke="currentColor"
                                   strokeWidth="8"
                                   className="opacity-10"
                                 />
                                 <motion.circle
                                   cx="40" cy="40" r="34"
                                   fill="transparent"
                                   stroke="currentColor"
                                   strokeWidth="8"
                                   strokeDasharray={2 * Math.PI * 34}
                                   initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                   animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - suburb.score / 100) }}
                                   transition={{ duration: 1.5, ease: "easeOut" }}
                                   strokeLinecap="round"
                                 />
                               </svg>
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-2xl font-black">{suburb.score}</span>
                                 <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Points</span>
                               </div>
                             </div>
                           </div>
                           
                           {/* Key Stats */}
                           <div className="grid grid-cols-2 gap-4">
                             <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm">
                               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                                 <Layers className="w-3 h-3" />
                                 Median Price
                               </div>
                               <div className="text-xl font-black">{fmt(suburb.medianPrice, suburb.currency)}</div>
                             </div>
                             <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 border border-black/5 shadow-sm">
                               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                                 <TrendingUp className="w-3 h-3" />
                                 Rental Yield
                               </div>
                               <div className="text-xl font-black">{suburb.rentalYield.toFixed(2)}%</div>
                             </div>
                           </div>
                         </div>
 
                         {/* AI Analysis */}
                         <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
                           <div className="flex items-center gap-2 mb-3">
                             <ShieldCheck className="w-5 h-5 text-indigo-500" />
                             <h4 className="font-bold text-slate-900">AI Recommendation</h4>
                             <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${suburb.recClass}`}>
                               {suburb.recommendation}
                             </span>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed font-medium">
                             {suburb.aiText}
                           </p>
                         </div>
 
                         {/* Strategist Verdict & Analysis */}
                         <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3 mb-6">
                               <ShieldCheck className="w-5 h-5 text-indigo-600" />
                               <h4 className="text-lg font-black text-slate-900">Strategist Report</h4>
                               <span className={`ml-auto px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border shadow-sm ${
                                 suburb.verdict.includes('Pass') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                 suburb.verdict.includes('Yield') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                 'bg-indigo-50 text-indigo-700 border-indigo-200'
                               }`}>
                                 Verdict: {suburb.verdict}
                               </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {/* Demand/Supply Metrics */}
                               <div className="space-y-4">
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                     <div className="flex justify-between items-center mb-1">
                                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SOM % (Scarcity)</span>
                                       <span className={`text-xs font-black ${suburb.strategistAnalysis.somPercentage < 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                         {suburb.strategistAnalysis.somPercentage}%
                                       </span>
                                     </div>
                                     <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                       <div className={`h-full rounded-full ${suburb.strategistAnalysis.somPercentage < 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (suburb.strategistAnalysis.somPercentage / 5) * 100)}%` }} />
                                     </div>
                                  </div>
                                  
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Ripple Effect potential</span>
                                     <p className="text-xs font-bold text-slate-900">{suburb.strategistAnalysis.ripplePotential || suburb.strategistAnalysis.ripplepotential}</p>
                                  </div>
                               </div>
                               
                               {/* Risks & Tenant fit */}
                               <div className="space-y-4">
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Risk: Supply Trap</span>
                                     <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                          suburb.strategistAnalysis.supplyTrapRisk === 'High' ? 'bg-rose-100 text-rose-700' : 
                                          suburb.strategistAnalysis.supplyTrapRisk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                          {suburb.strategistAnalysis.supplyTrapRisk} Risk
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-500 italic">DOM vs City: {suburb.strategistAnalysis.domVsCityAvg}</span>
                                     </div>
                                  </div>
 
                                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tenant Profile & Fit</span>
                                     <p className="text-xs font-bold text-slate-900">{suburb.strategistAnalysis.tenantFit}</p>
                                  </div>
                               </div>
                            </div>
                            
                            {/* Red Flags */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                               <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle className="w-4 h-4 text-rose-500" />
                                  <span className="text-xs font-black text-slate-900 uppercase">Strategic Red Flags</span>
                               </div>
                               <div className="flex flex-wrap gap-3">
                                  {(suburb.strategistAnalysis.redFlags || []).map((flag, idx) => (
                                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-bold">
                                      • {flag}
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
 
                         {/* Infrastructure Section */}
                         <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-2 mb-4">
                               <Layers className="w-4 h-4 text-indigo-500" />
                               <h4 className="font-bold text-slate-900">Infrastructure & Development</h4>
                            </div>
                            <div className="space-y-3">
                               {suburb.infrastructure && suburb.infrastructure.length > 0 ? (
                                 suburb.infrastructure.map((project, idx) => (
                                   <div key={idx} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                                     <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                     <div>
                                       <p className="text-sm font-bold text-slate-900">{project.title}</p>
                                       <p className="text-xs text-slate-500 mt-1">{project.desc}</p>
                                     </div>
                                   </div>
                                 ))
                               ) : (
                                 <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                                   <p className="text-sm text-slate-500 font-medium italic">No major local projects identified by AI market scan for this specific segment.</p>
                                 </div>
                               )}
                            </div>
                         </div>
 
                         {/* Indicators & Trend Chart */}
                         <div className="p-6 sm:p-8 border-b border-slate-100 grid md:grid-cols-2 gap-8">
                           <div>
                             <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                               <BarChart3 className="w-4 h-4 text-slate-400" />
                               Historical Price Trend
                             </h4>
                             <div className="h-40 w-full bg-white rounded-xl border border-slate-100 p-2">
                               <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={suburb.chartData || []}>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                   <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                   <YAxis hide domain={['auto', 'auto']} />
                                   <RechartsTooltip 
                                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                     formatter={(v) => fmt(v, suburb.currency)}
                                   />
                                   <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                 </LineChart>
                               </ResponsiveContainer>
                             </div>
                           </div>
                           
                           <div>
                             <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                               <AlertCircle className="w-4 h-4 text-slate-400" />
                               Demand & Supply
                             </h4>
                             <div className="space-y-4">
                               <div className="space-y-2">
                                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                   <span>Demand Strength</span>
                                   <span className="text-indigo-600">{(100 - (suburb.indicators.vacancyRate * 25)).toFixed(0)}%</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${Math.min(100, 100 - (suburb.indicators.vacancyRate * 25))}%` }}
                                     className="h-full bg-indigo-500 rounded-full"
                                   />
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                   <span>Growth Momentum</span>
                                   <span className="text-blue-600">{((suburb.indicators.volumeTrend + 10) * 2.5 + suburb.indicators.growth3mo * 5).toFixed(0)}%</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${Math.min(100, (suburb.indicators.volumeTrend + 10) * 2.5 + suburb.indicators.growth3mo * 5)}%` }}
                                     className="h-full bg-blue-500 rounded-full"
                                   />
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                                   <span>Infrastructure & Dev</span>
                                   <span className="text-amber-600">{(suburb.indicators.landConstraint * 10).toFixed(0)}%</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${suburb.indicators.landConstraint * 10}%` }}
                                     className="h-full bg-amber-500 rounded-full"
                                   />
                                 </div>
                               </div>
                             </div>
                           </div>
                         </div>
 
                         {/* Radar Chart for Categories */}
                         <div className="p-6 sm:p-8">
                           <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                             <Info className="w-4 h-4 text-slate-400" />
                             Livability Check
                           </h4>
                           <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                               <RadarChart cx="50%" cy="50%" outerRadius="70%" 
                                 data={[
                                   { subject: 'Affordability', A: suburb.categoryScores.affordability, fullMark: 100 },
                                   { subject: 'Lifestyle', A: suburb.categoryScores.lifestyle, fullMark: 100 },
                                   { subject: 'Transport', A: suburb.categoryScores.transport, fullMark: 100 },
                                   { subject: 'Schools', A: suburb.categoryScores.schools, fullMark: 100 },
                                   { subject: 'Safety', A: suburb.categoryScores.safety, fullMark: 100 },
                                 ]}
                               >
                                 <PolarGrid stroke="#e2e8f0" />
                                 <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                                 <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                 <Radar name={suburb.name} dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                                 <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                               </RadarChart>
                             </ResponsiveContainer>
                           </div>
                         </div>
                       </div>
                     ) : (
                        /* Minimized SLEEK Panel */
                        <button 
                          onClick={() => setExpandedId(suburb.id)}
                          className="group w-full flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-indigo-600" />
                               </div>
                               <div>
                                  <h4 className="text-lg font-black text-slate-900 leading-none">{suburb.name}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">{suburb.state} • {suburb.propertyType}</p>
                               </div>
                            </div>
                            
                            <div className="hidden sm:flex items-center gap-6 border-l border-slate-100 pl-6">
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Median</p>
                                  <p className="text-sm font-bold text-slate-900">{fmt(suburb.medianPrice, suburb.currency)}</p>
                               </div>
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SOM %</p>
                                  <p className="text-sm font-bold text-indigo-600">{suburb.strategistAnalysis.somPercentage}%</p>
                               </div>
                            </div>
                          </div>
 
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                              suburb.verdict.includes('Pass') ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              suburb.verdict.includes('Yield') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              'bg-indigo-50 text-indigo-700 border-indigo-100'
                            }`}>
                              {suburb.verdict}
                            </span>
                            <ChevronDown className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
