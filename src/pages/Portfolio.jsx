import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon, TrendingUp, DollarSign, Plus, Trash2, BarChart3, Download, Lock, Crown } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { generatePortfolioPdf } from "@/components/portfolio/generatePortfolioPdf";
import { toast } from "sonner";
import PremiumGate from "@/components/calculator/PremiumGate";
import { useSubscription } from "@/components/calculator/useSubscription";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { useAuth } from "@/lib/AuthContext";
import { calculatePortfolioHoldings } from "@/api/portfolioEngine";

const ASSET_CLASSES = [
  { id: "stocks", label: "Stocks", color: "#E5C48B" },    // Muted Peach
  { id: "property", label: "Property", color: "#E5989B" },  // Rose Dust
  { id: "etf", label: "ETF", color: "#B8D8BA" },       // Sage
  { id: "crypto", label: "Crypto", color: "#FFB5A7" },    // Apricot
  { id: "bonds", label: "Bonds", color: "#95D5B2" },      // Mint
  { id: "fixed_deposit", label: "Fixed Deposit", color: "#A8DADC" }, // Powder Blue
  { id: "mutual_funds", label: "Mutual Funds", color: "#DDBDF1" },  // Lavender
  { id: "gold", label: "Gold", color: "#FEEAFA" },       // Champagne
  { id: "liability", label: "Liability / Debt", color: "#EF4444" }, // Red
];

const CURRENCIES = ["USD", "AUD", "EUR", "GBP", "JPY", "CAD", "SGD", "INR", "NZD"];

// Production state is driven exclusively by Supabase snapshots.
// Mock data removed per user request.

function PortfolioContent() {
  const { getDatabaseTable } = useFinancialParser();
  const auth = useAuth();
  const authUser = auth?.user;
  const [currency, setCurrency] = useState("AUD");
  const [holdings, setHoldings] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [userLoaded, setUserLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { isPremium } = useSubscription();
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removedHoldings, setRemovedHoldings] = useState([]); // Track labels for hard deletion
  const [lastSaved, setLastSaved] = useState(null);
  const [savedSignature, setSavedSignature] = useState("");

  // Load from Production DB
  useEffect(() => {
    async function loadFromDB() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('DEBUG_PORTFOLIO_USER_ID:', session?.user?.id);
        
        // Fetch all holdings and filter for the latest snapshot date
        const allData = await base44.db.getTable("portfolio_holdings");
        console.log('DEBUG_PORTFOLIO_ROWS_FOUND:', allData?.length);
        
        let mapped = [];
        if (allData && allData.length > 0) {
          // Use intelligent Engine to get latest snapshot per unique item
          const latestHoldings = calculatePortfolioHoldings(allData);

          // Filter for valid labeled holdings to prevent 'ghost rows'
          mapped = latestHoldings
            .filter(d => (d.label && d.label.trim() !== "") || Number(d.current_value) > 0 || Number(d.mortgage_amount) > 0)
            .map((d, index) => ({
              id: d.id || `rec_${index}`,
              label: d.label || "",
              asset: d.asset_class,
              currentValue: Number(d.current_value),
              invested: Number(d.invested_amount),
              mortgage: Number(d.mortgage_amount || 0)
            }));

          setHoldings(mapped);
          
          // Next ID for new local items
          const nextVal = mapped.reduce((m, h) => typeof h.id === 'number' ? Math.max(m, h.id) : m, 0);
          setNextId(nextVal + 1);
        } else {
          // Explicitly clear state if DB is empty to prevent 'ghost rows'
          setHoldings([]);
        }

        // Use authUser metadata for currency if available
        let initCurrency = "AUD";
        const vaultCurrency = await base44.user.loadData('wl_portfolio_currency');
        if (vaultCurrency?.currency) {
          initCurrency = vaultCurrency.currency;
        } else if (authUser?.user_metadata?.portfolio_currency) {
          initCurrency = authUser.user_metadata.portfolio_currency;
        } else if (authUser?.portfolio_currency) {
          initCurrency = authUser.portfolio_currency;
        }
        setCurrency(initCurrency);
        
        // Save initial signature to prevent ghost edits
        setSavedSignature(JSON.stringify({ holdings: mapped, currency: initCurrency }));

      } catch (err) {
        console.error("Failed to load portfolio:", err);
        setLoadError(true);
      } finally {
        setUserLoaded(true);
      }
    }
    loadFromDB();
  }, [getDatabaseTable, authUser]);

  // Track changes robustly via deep comparison
  useEffect(() => {
    if (userLoaded) {
      const currentSignature = JSON.stringify({ holdings, currency });
      setHasChanges(currentSignature !== savedSignature);
    }
  }, [holdings, currency, savedSignature, userLoaded]);

   const handleSave = async () => {
    setIsSaving(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      // 0. Garbage Collection: Filter out uninitialized rows (no label and zero value)
      const validHoldings = holdings.filter(h => (h.label && h.label.trim() !== "") || Number(h.currentValue) > 0 || Number(h.mortgage) > 0);
      
      // 1. Permanent Purge: Delete records for items removed during this session
      if (removedHoldings.length > 0) {
        console.log('[Portfolio] Purging deleted labels:', removedHoldings);
        const allHoldings = await base44.db.getTable("portfolio_holdings");
        // Cross-reference labels to find all historical IDs to purge
        const idsToPurge = allHoldings
          .filter(h => removedHoldings.some(label => (h.label || '').toLowerCase() === (label || '').toLowerCase()))
          .map(h => h.id);
        
        console.log(`[Portfolio] Found ${idsToPurge.length} historical records to purge`);
        for (const id of idsToPurge) {
          await base44.db.deleteRow("portfolio_holdings", id);
        }
        setRemovedHoldings([]);
      }

      // 2. Snapshot Update: Save all valid holdings as a single daily snapshot
      if (validHoldings.length > 0) {
        console.log(`[Portfolio] Saving ${validHoldings.length} valid holdings:`, validHoldings);
        const payload = {
          snapshot_date: today,
          currency: currency,
          holdings: validHoldings.map(h => ({
            id: h.id,
            label: h.label,
            asset_class: h.asset,
            current_value: h.currentValue,
            invested_amount: h.invested,
            mortgage_amount: h.mortgage
          }))
        };

        // Use upsertRow to ensure we only have ONE row per user per day
        const result = await base44.db.upsertRow("portfolio_holdings", payload, "user_id,snapshot_date");
        
        if (result && result.error) {
          throw new Error(result.error.message || "Database rejected the snapshot update");
        }
      }

      // Clean up local state to remove purged ghost rows
      setHoldings(validHoldings);

      await base44.user.saveData("wl_portfolio_currency", { currency });
      
      // Update signature so button goes back to idle
      setSavedSignature(JSON.stringify({ holdings: validHoldings, currency }));
      setHasChanges(false);
      setLastSaved(new Date());
      toast.success(`Portfolio synchronized and purged for ${today}`);
    } catch (err) {
      console.error("[Portfolio] Save failed:", err);
      toast.error("Failed to persist portfolio changes");
    } finally {
      setIsSaving(false);
    }
  };

  const sym = getCurrencySymbol(currency);

  const fmt = (n) => {
    const val = Number(n);
    return `${sym}${(isNaN(val) ? 0 : val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };
  const pct = (n) => {
    const val = Number(n);
    return (isNaN(val) ? 0 : val).toFixed(1) + "%";
  };

  const addHolding = () => {
    setHoldings([...holdings, { id: nextId, asset: "stocks", currentValue: 0, invested: 0, mortgage: 0, label: "" }]);
    setNextId(nextId + 1);
  };

   const removeHolding = (id) => {
    const itemToRemove = holdings.find(h => h.id === id);
    if (itemToRemove && itemToRemove.label) {
      setRemovedHoldings(prev => [...prev, itemToRemove.label]);
    }
    setHoldings(holdings.filter((h) => h.id !== id));
  };

  const updateHolding = (id, field, value) => {
    setHoldings(holdings.map((h) => h.id === id ? { ...h, [field]: value } : h));
  };

  const metrics = useMemo(() => {
    const totalGrossValue = holdings.reduce((s, h) => {
      const val = Number(h.currentValue || 0);
      return h.asset === 'liability' ? s - val : s + val;
    }, 0);

    const totalMortgage = holdings.reduce((s, h) => {
      return s + (Number(h.mortgage || 0));
    }, 0);

    const totalValue = totalGrossValue - totalMortgage;

    const totalInvested = holdings.reduce((s, h) => {
      const val = Number(h.invested || 0);
      return h.asset === 'liability' ? s - val : s + val;
    }, 0);

    const totalGain = totalGrossValue - totalInvested;
    const totalReturnPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Pie chart data — group by asset class (Net Equity Only)
    const grouped = {};
    holdings.forEach((h) => {
      if (h.asset === 'liability') return; 
      if (!grouped[h.asset]) grouped[h.asset] = 0;
      const netHValue = Number(h.currentValue || 0) - Number(h.mortgage || 0);
      grouped[h.asset] += netHValue;
    });
    const pieData = Object.entries(grouped).map(([asset, value]) => {
      const cls = ASSET_CLASSES.find((a) => a.id === asset);
      return { name: cls?.label || asset, value, color: cls?.color || "#888" };
    }).filter((d) => d.value > 0);
 
    // Bar chart data — per holding
    const barData = holdings
      .filter((h) => h.currentValue > 0 || h.invested > 0 || h.asset === 'liability' || h.mortgage > 0)
      .map((h) => {
        const cls = ASSET_CLASSES.find((a) => a.id === h.asset);
        const isLiability = h.asset === 'liability';
        return {
          name: h.label || cls?.label,
          invested: isLiability ? -Number(h.invested || 0) : Number(h.invested || 0),
          value: isLiability ? -Number(h.currentValue || 0) : Number(h.currentValue || 0),
          mortgage: Number(h.mortgage || 0),
          equity: Number(h.currentValue || 0) - Number(h.mortgage || 0),
          gain: (Number(h.currentValue || 0) - Number(h.invested || 0)) * (isLiability ? -1 : 1),
        };
      });

    // Per-class summary
    const classSummary = ASSET_CLASSES.map((cls) => {
      const clsHoldings = holdings.filter((h) => h.asset === cls.id);
      const grossValue = clsHoldings.reduce((s, h) => s + Number(h.currentValue || 0), 0);
      const mortgage = clsHoldings.reduce((s, h) => s + Number(h.mortgage || 0), 0);
      const value = grossValue - mortgage;
      const invested = clsHoldings.reduce((s, h) => s + Number(h.invested || 0), 0);
      const gain = grossValue - invested;
      const returnPct = invested > 0 ? (gain / invested) * 100 : 0;
      const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return { ...cls, value, grossValue, mortgage, invested, gain, returnPct, allocation, count: clsHoldings.length };
    }).filter((c) => c.grossValue > 0 || c.invested > 0);

    return { totalValue, totalGrossValue, totalMortgage, totalInvested, totalGain, totalReturnPct, pieData, barData, classSummary };
  }, [holdings]);

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-100 border-t-amber-600 rounded-full mb-4"
        />
        <p className="text-slate-500 font-medium animate-pulse">Loading secure portfolio data...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
          <Trash2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Sync Error</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">We couldn't securely load your portfolio data. To prevent overwriting your existing holdings, access has been temporarily disabled.</p>
        <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 h-12 rounded-xl">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Rounded Navbar Panel - Full Length */}
      <div className="flex flex-col">
        <div className="w-full px-2 pt-4 pb-2">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
          {/* Header Area */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <PieChartIcon className="w-4 h-4 text-[#C5A059]" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Portfolio Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-28 h-9 text-sm bg-white border-slate-200 text-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`h-9 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border-0 shadow-lg ${hasChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-400 cursor-default'}`}
              >
                {isSaving ? "Saving..." : "Save Portfolio"}
              </Button>

              <Button
                size="sm"
                className="bg-[#C5A059] hover:bg-[#D4B06A] text-white font-bold h-9 px-4 rounded-xl shadow-lg shadow-[#C5A059]/20 transition-all flex items-center gap-2 border-0 group"
                onClick={() => {
                  if (!isPremium) {
                    toast.error("Premium subscription required for PDF export");
                    return;
                  }; 
                  try {
                    generatePortfolioPdf({ holdings, currency });
                    toast.success("Portfolio PDF downloaded!");
                  } catch (e) {
                    toast.error("Failed to generate PDF");
                  }
                }}
              >
                {isPremium ? <Download className="w-4 h-4" /> : <Crown className="w-4 h-4 text-white/60" />}
                <span className="text-[10px] uppercase tracking-wider">Export PDF</span>
                {!isPremium && <span className="text-[9px] bg-slate-900 text-[#C5A059] px-1.5 py-0.5 rounded ml-1 font-black">PRO</span>}
              </Button>
            </div>
          </div>

          {/* Metric Banner Header - Institutional Light Mode */}
          <div className="bg-slate-50/50 text-slate-900 py-4 px-6 relative z-0">
            <div className="max-w-full mx-auto flex items-center justify-between">
              <div className="text-center w-full px-2">
                <p className="text-[17px] font-black tracking-tight text-slate-900">{fmt(metrics.totalGrossValue)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">TOTAL ASSETS</p>
              </div>
              <div className="text-center border-l border-slate-200 w-full px-2">
                <p className="text-[17px] font-black tracking-tight text-rose-600">{fmt(metrics.totalMortgage)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">TOTAL SECURED DEBT</p>
              </div>
              <div className="text-center border-l border-slate-200 w-full px-2">
                <p className="text-[17px] font-black tracking-tight text-emerald-600">{fmt(metrics.totalValue)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">NET EQUITY VALUE</p>
              </div>
              <div className="text-center border-l border-slate-200 w-full px-2">
                <p className="text-[17px] font-black tracking-tight text-slate-900">{pct(metrics.totalReturnPct)}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">PORTFOLIO YIELD</p>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Main Panel starts below Navbar */}
      <div className="bg-slate-50/50 min-h-screen">
        <div className="max-w-full mx-auto px-2 py-12 space-y-10">


        <div className="grid lg:grid-cols-2 gap-6">
          {/* Allocation Pie */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#C5A059]" /> Asset Allocation
            </h3>
            {metrics.pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-[55%] h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metrics.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" stroke="none" paddingAngle={4}>
                        {metrics.pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip 
                        formatter={(v) => fmt(v)}
                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3">
                  {metrics.pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{entry.name}</span>
                      <span className="text-[11px] font-bold text-slate-900 ml-1">
                        {metrics.totalValue > 0 ? pct((entry.value / metrics.totalValue) * 100) : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12 font-medium">Add holdings to generate allocation analysis</p>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C5A059]" /> Performance Blueprint
            </h3>
            {metrics.barData.length > 0 ? (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 500 }} tickFormatter={(v) => `${sym}${(v/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(v) => fmt(v)}
                      contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: '20px', color: '#94a3b8' }} />
                    <Bar dataKey="equity" name="Net Equity" fill="#C5A059" radius={[0, 0, 0, 0]} stackId="a" barSize={16} />
                    <Bar dataKey="mortgage" name="Mortgage Debt" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-12 font-medium">Add holdings to generate growth mapping</p>
            )}
          </div>
        </div>

        {/* Asset Class Summary */}
        {metrics.classSummary.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" /> Performance by Asset Class
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left pb-4 font-medium">Asset Class</th>
                    <th className="text-right pb-4 font-medium">Market Value</th>
                    <th className="text-right pb-4 font-medium">Mortgage</th>
                    <th className="text-right pb-4 font-medium">Net Equity</th>
                    <th className="text-right pb-4 font-medium">Return</th>
                    <th className="text-right pb-4 font-medium">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {metrics.classSummary.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cls.color }} />
                          <span className="font-medium text-slate-800">{cls.label}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({cls.count})</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-500 font-medium">{fmt(cls.grossValue)}</td>
                      <td className="py-3 text-right text-rose-500 font-medium">-{fmt(cls.mortgage)}</td>
                      <td className="py-3 text-right font-medium text-slate-900">{fmt(cls.value)}</td>
                      <td className={`py-3 text-right font-medium ${cls.returnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {cls.returnPct >= 0 ? "+" : ""}{pct(cls.returnPct)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${cls.allocation}%`, backgroundColor: cls.color }} />
                          </div>
                          <span className="text-slate-600 text-xs w-10 text-right">{pct(cls.allocation)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holdings Editor */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-bold text-slate-800 flex items-center gap-2 uppercase tracking-[0.2em]">
              <DollarSign className="w-4 h-4 text-[#C5A059]" /> My Holdings
            </h3>
            <Button onClick={addHolding} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2 rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg shadow-amber-500/10 transition-all">
              <Plus className="w-4 h-4" /> Add Holding
            </Button>
          </div>

          <div className="space-y-3">
            {holdings.map((h) => {
              const gain = Number(h.currentValue || 0) - Number(h.invested || 0);
              const returnPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;
              return (
                <div key={h.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="col-span-12 sm:col-span-2">
                    <Input
                      placeholder="Label"
                      value={h.label}
                      onChange={(e) => updateHolding(h.id, "label", e.target.value)}
                      className="h-9 text-[11px] bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Select value={h.asset} onValueChange={(v) => updateHolding(h.id, "asset", v)}>
                      <SelectTrigger className="h-9 text-[11px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CLASSES.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input
                      type="number"
                      placeholder={`Invested`}
                      value={h.invested || ""}
                      onChange={(e) => updateHolding(h.id, "invested", parseFloat(e.target.value) || 0)}
                      className="h-9 text-[11px] bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input
                      type="number"
                      placeholder={`Market Value`}
                      value={h.currentValue || ""}
                      onChange={(e) => updateHolding(h.id, "currentValue", parseFloat(e.target.value) || 0)}
                      className="h-9 text-[11px] bg-white border-emerald-100"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input
                      type="number"
                      placeholder={`Mortgage / Debt`}
                      value={h.mortgage || ""}
                      onChange={(e) => updateHolding(h.id, "mortgage", parseFloat(e.target.value) || 0)}
                      className="h-9 text-[11px] bg-white border-rose-100"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-1 text-right">
                    <p className={`text-[11px] font-bold ${gain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {gain >= 0 ? "+" : ""}{fmt(gain)}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeHolding(h.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {holdings.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No holdings yet. Click "Add Holding" to get started.</p>
            )}
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <PortfolioContent />
    </AuthGuard>
  );
}