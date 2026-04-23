import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  TrendingDown,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  List
} from "lucide-react";
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, isSameMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const COLORS = ['#10B981', '#F43F5E'];

// Mock generation removed for production data integrity.

export default function DigestReport() {
  const { formatAmount, getProductionLedger, getDatabaseTable } = useFinancialParser();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 1)); // Default to January 2026
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [allTransactions, setAllTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    async function load() {
      // 1. Load dynamic accounts from production DB (correct table: user_accounts, deduped)
      const rawAccounts = await getDatabaseTable('user_accounts');
      const seen = new Set();
      const unique = (rawAccounts || []).filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true; });
      setAccounts(unique);

      // 2. Load the full indexed production ledger
      const ledger = await getProductionLedger();
      setAllTransactions(ledger);
    }
    load();
  }, [getDatabaseTable, getProductionLedger]);

  const { normIncs, normExps } = useMemo(() => {
    // Reconstruct a budget-like row for the parser (empty payload as we want purely ledger-driven actuals)
    const budgetRow = { month: format(selectedDate, "yyyy-MM"), payload: { incomes: [], expenses: [] } };
    const { incomes, expenses } = normalizeTransactionData(budgetRow, selectedDate, allTransactions, accounts);
    
    // Account filtering
    const filterByAccount = (list) => {
      if (selectedAccountId === "all") return list;
      return list.filter(t => String(t.account_id || t.accountId) === String(selectedAccountId));
    };

    return { 
      normIncs: filterByAccount(incomes), 
      normExps: filterByAccount(expenses) 
    };
  }, [allTransactions, selectedDate, selectedAccountId, accounts, normalizeTransactionData]);

  const metrics = useMemo(() => {
    const earned = normIncs.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const spent = normExps.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    return { earned, spent, loss: spent > earned ? spent - earned : 0 };
  }, [normIncs, normExps]);

  const pieData = useMemo(() => [
    { name: 'Earned', value: metrics.earned },
    { name: 'Spent', value: metrics.spent },
  ], [metrics]);

  const trendData = useMemo(() => {
    // Generate 4 months of history up to selected month
    const historyMonths = [subMonths(selectedDate, 3), subMonths(selectedDate, 2), subMonths(selectedDate, 1), selectedDate];
    return historyMonths.map(m => {
      const budgetRow = { month: format(m, "yyyy-MM"), payload: { incomes: [], expenses: [] } };
      const { incomes, expenses } = normalizeTransactionData(budgetRow, m, allTransactions, accounts);
      
      const filterByAccount = (list) => {
        if (selectedAccountId === "all") return list;
        return list.filter(t => String(t.account_id || t.accountId) === String(selectedAccountId));
      };

      const i = filterByAccount(incomes).reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const o = filterByAccount(expenses).reduce((s, t) => s + (Number(t.amount) || 0), 0);

      return {
        month: format(m, "MMM"),
        inflow: i,
        outflow: o,
      };
    });
  }, [allTransactions, selectedDate, selectedAccountId, accounts, normalizeTransactionData]);

  const reportInsights = useMemo(() => {
    const prevDate = subMonths(selectedDate, 1);
    const budgetRowPrev = { month: format(prevDate, "yyyy-MM"), payload: { incomes: [], expenses: [] } };
    const { incomes: prevIncs, expenses: prevExpsRaw } = normalizeTransactionData(budgetRowPrev, prevDate, allTransactions, accounts);
    
    const filterByAccount = (list) => {
      if (selectedAccountId === "all") return list;
      return list.filter(t => String(t.account_id || t.accountId) === String(selectedAccountId));
    };

    const prevExp = filterByAccount(prevExpsRaw).reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const prevInc = filterByAccount(prevIncs).reduce((s, t) => s + (Number(t.amount) || 0), 0);

    const catTotals = {};
    normExps.forEach(t => {
      const cat = t.category || 'Uncategorized';
      catTotals[cat] = (catTotals[cat] || 0) + (Number(t.amount) || 0);
    });
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    const highlights = [];
    const lows = [];

    if (metrics.earned > prevInc && prevInc > 0) {
      highlights.push(`Income increased by ${((metrics.earned - prevInc) / prevInc * 100).toFixed(0)}% compared to last month, totaling ${formatCurrency(metrics.earned)}.`);
    } else if (metrics.earned > 0 && prevInc === 0) {
      highlights.push(`You generated ${formatCurrency(metrics.earned)} in total income.`);
    }

    const savings = metrics.earned - metrics.spent;
    if (savings > 0) {
      const sr = ((savings / metrics.earned) * 100).toFixed(0);
      if (sr > 20) {
        highlights.push(`Excellent wealth retention! You saved ${formatCurrency(savings)}, achieving a strong savings rate of ${sr}%.`);
      } else {
        highlights.push(`You successfully lived within your means, generating a modest surplus of ${formatCurrency(savings)} (${sr}% savings rate).`);
      }
    } else if (metrics.spent > 0) {
      lows.push(`You operated at a deficit of ${formatCurrency(Math.abs(savings))} this month. Outflows exceeded inflows.`);
    }

    if (metrics.spent < prevExp && prevExp > 0) {
      highlights.push(`Fantastic cost control. Total spending was down ${((prevExp - metrics.spent) / prevExp * 100).toFixed(0)}% from last month, landing at ${formatCurrency(metrics.spent)}.`);
    } else if (metrics.spent > prevExp && prevExp > 0) {
      lows.push(`Total spending rose ${((metrics.spent - prevExp) / prevExp * 100).toFixed(0)}% above last month. Overall outflows reached ${formatCurrency(metrics.spent)}.`);
    }

    if (sortedCats.length > 0) {
      const topCat = sortedCats[0];
      if (metrics.spent > 0) {
        if (topCat.value > metrics.spent * 0.35) {
           lows.push(`${topCat.name} was a massive liquidity drain, constituting ${((topCat.value / metrics.spent) * 100).toFixed(0)}% of your total expenditures (${formatCurrency(topCat.value)}).`);
        } else {
           if (lows.length === 0) lows.push(`Your single largest expense category was ${topCat.name} at ${formatCurrency(topCat.value)}.`);
        }
      }
    }

    if (highlights.length === 0 && metrics.earned === 0 && metrics.spent === 0) {
       highlights.push("No financial activity recorded for this period.");
    }
    if (lows.length === 0 && metrics.spent > 0) {
       highlights.push("No significant red flags detected in your spending behavior.");
    }

    return { sortedCats, highlights, lows, prevExp, prevInc };
  }, [normIncs, normExps, allTransactions, selectedDate, selectedAccountId, metrics, normalizeTransactionData, accounts]);

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-900">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between shadow-lg relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#C5A059]/10 rounded-lg">
                  <FileText className="w-6 h-6 text-[#C5A059]" />
               </div>
               <h1 className="text-xl font-medium text-white tracking-tight">Financial Digest</h1>
            </div>
            <div className="flex items-center gap-3">
               <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center bg-slate-800/50 rounded-xl border border-slate-700 px-5 py-2.5 text-xs text-slate-300 font-medium gap-3 hover:bg-slate-700 transition-all">
                       <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                       Report for {format(selectedDate, "MMMM yyyy")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-4 bg-[#1E293B] border-slate-700 shadow-2xl rounded-2xl" align="end">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-1">Select month</label>
                        <div className="grid grid-cols-3 gap-1">
                          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                            <button
                              key={m}
                              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), idx, 1))}
                              className={cn(
                                "py-2 rounded-lg text-xs font-medium transition-all",
                                selectedDate.getMonth() === idx 
                                  ? "bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/20" 
                                  : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                              )}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-2 border-t border-slate-700/50">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-1">Select year</label>
                        <div className="flex items-center justify-between gap-2">
                          {[2024, 2025, 2026].map((y) => (
                            <button
                              key={y}
                              onClick={() => setSelectedDate(new Date(y, selectedDate.getMonth(), 1))}
                              className={cn(
                                "flex-1 py-1.5 rounded-lg text-xs font-medium transition-all",
                                selectedDate.getFullYear() === y 
                                  ? "bg-slate-700 text-white" 
                                  : "text-slate-500 hover:text-slate-300"
                              )}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
               </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main content starts below Navbar */}
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Reports Navigation Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 shadow-sm">
           <div className="space-y-4">
              <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400">Timeframe Coverage</p>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <div className="w-4 h-4 border-2 border-current rounded-sm flex items-center justify-center text-[10px] font-bold">M</div>
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-medium text-slate-700">{format(selectedDate, "MMMM yyyy")}</p>
                    <p className="text-[10px] text-slate-400 truncate tracking-tight">Monthly overview</p>
                 </div>
              </div>
           </div>

             <div className="space-y-4">
                <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400">Linked Accounts (Consolidated)</p>
                <div className="space-y-3 opacity-60 grayscale cursor-default pointer-events-none">
                   <div 
                     className="w-full text-left bg-slate-50 border border-[#C5A059] p-4 rounded-2xl bg-[#C5A059]/5"
                   >
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                         <p className="text-[10px] font-medium text-slate-700 truncate">Total Consolidated Balance</p>
                      </div>
                      <p className="text-sm font-medium tracking-tight text-slate-900">
                         {formatCurrency(accounts.reduce((s, a) => s + (a.type === 'asset' ? Number(a.base_balance || 0) : -Number(a.base_balance || 0)), 0))}
                      </p>
                   </div>

                   {accounts.map((acc) => (
                      <div 
                        key={acc.id} 
                        className="w-full text-left bg-slate-50 border border-slate-100 p-4 rounded-2xl"
                      >
                         <div className="flex items-center gap-3 mb-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", acc.type === 'asset' ? "bg-teal-500" : "bg-rose-500")} />
                            <p className="text-[10px] font-medium text-slate-700 truncate">{acc.name}</p>
                         </div>
                         <p className={cn("text-sm font-medium tracking-tight", acc.type === 'asset' ? "text-slate-900" : "text-rose-500")}>
                            {formatCurrency(Number(acc.base_balance || 0))}
                         </p>
                      </div>
                   ))}
                </div>
             </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-12 bg-white">
           <div className="max-w-4xl mx-auto space-y-24">
              
              {/* Header Title Section */}
              <div className="text-center space-y-4">
                 <p className="text-[10px] font-medium text-[#C5A059] uppercase tracking-[0.4em]">Monthly Digest</p>
                 <h2 className="text-4xl font-medium text-slate-900 tracking-tight">Executive Summary <span className="text-slate-200 font-light mx-2">|</span> {format(selectedDate, "MMMM yyyy")}</h2>
                 <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-normal">Your automated, narrative-driven report detailing what went right, what went wrong, and where your money flowed.</p>
              </div>

              {/* The Written Report (Narrative Highlights & Lows) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-50 pt-16">
                 {/* Highlights */}
                 <div className="bg-teal-50/50 rounded-[32px] p-8 border border-teal-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-teal-600">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-200 shadow-sm">
                         <CheckCircle2 className="w-3.5 h-3.5" /> What went well
                       </div>
                       <ul className="space-y-4">
                          {reportInsights?.highlights.map((text, i) => (
                            <li key={i} className="flex gap-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2 shadow-sm" />
                              <p className="text-slate-700 text-sm leading-relaxed font-medium">{text}</p>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>

                 {/* Lows / Overspent */}
                 <div className="bg-rose-50/50 rounded-[32px] p-8 border border-rose-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-rose-600">
                      <AlertCircle className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-200 shadow-sm">
                         <TrendingDown className="w-3.5 h-3.5" /> Areas of concern
                       </div>
                       <ul className="space-y-4">
                          {reportInsights?.lows.map((text, i) => (
                            <li key={i} className="flex gap-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2 shadow-sm" />
                              <p className="text-slate-700 text-sm leading-relaxed font-medium">{text}</p>
                            </li>
                          ))}
                          {reportInsights?.lows.length === 0 && (
                            <li className="flex gap-4"><p className="text-slate-500 text-sm leading-relaxed font-medium italic">No major concerns flagged this month.</p></li>
                          )}
                       </ul>
                    </div>
                 </div>
              </div>

              {/* System Liquidity Metrics */}
              <div className="border-t border-slate-50 pt-16 space-y-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-medium text-slate-900 tracking-tight">System Liquidity Flow</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Monthly Gross</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                       <div className="relative z-10">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Gross Inflows</p>
                          <p className="text-3xl font-medium text-teal-600 tracking-tight">{formatCurrency(metrics.earned)}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                       <div className="relative z-10">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Gross Outflows</p>
                          <p className="text-3xl font-medium text-rose-500 tracking-tight">{formatCurrency(metrics.spent)}</p>
                       </div>
                    </div>
                    <div className={cn("border rounded-3xl p-6 relative overflow-hidden", metrics.loss > 0 ? "bg-rose-50 border-rose-100" : "bg-teal-50 border-teal-100")}>
                       <div className="relative z-10">
                          <p className={cn("text-[10px] uppercase font-bold tracking-widest mb-1", metrics.loss > 0 ? "text-rose-600/70" : "text-teal-600/70")}>Net Capital Flow</p>
                          <p className={cn("text-3xl font-medium tracking-tight", metrics.loss > 0 ? "text-rose-600" : "text-teal-700")}>
                             {formatCurrency(Math.abs(metrics.earned - metrics.spent))} <span className="text-sm font-semibold uppercase tracking-widest ml-1">{metrics.loss > 0 ? "Deficit" : "Surplus"}</span>
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Ratio Bar */}
                 {metrics.earned + metrics.spent > 0 && (
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                      <div className="h-full bg-teal-500" style={{ width: `${(metrics.earned / (metrics.earned + metrics.spent)) * 100}%` }} />
                      <div className="h-full bg-rose-500" style={{ width: `${(metrics.spent / (metrics.earned + metrics.spent)) * 100}%` }} />
                   </div>
                 )}
              </div>

              {/* Advanced Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-slate-50 pt-16 pb-24">
                 
                 {/* Top Categories */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-medium text-slate-900 tracking-tight">Primary Capital Drains</h3>
                       <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Top 5 Segments</p>
                    </div>
                    <div className="space-y-6">
                       {reportInsights?.sortedCats.slice(0, 5).map((cat, i) => {
                         const pct = metrics.spent > 0 ? (cat.value / metrics.spent) * 100 : 0;
                         return (
                           <div key={i} className="space-y-2 group">
                              <div className="flex justify-between items-end">
                                 <span className="text-sm font-medium text-slate-700 group-hover:text-[#C5A059] transition-colors">{cat.name}</span>
                                 <div className="text-right">
                                    <span className="text-sm font-bold text-slate-900 block">{formatCurrency(cat.value)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pct.toFixed(1)}% of total</span>
                                 </div>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#1E293B] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                           </div>
                         );
                       })}
                       {reportInsights?.sortedCats.length === 0 && (
                         <div className="p-8 border border-slate-100 border-dashed rounded-3xl text-center">
                            <p className="text-sm text-slate-400 italic">No capital drains recorded.</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Historical Trend */}
                 <div className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-medium text-slate-900 tracking-tight">120-Day Trajectory</h3>
                       <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Inflows vs Outflows</p>
                    </div>
                    <div className="h-[280px] w-full border border-slate-100 rounded-[32px] p-6 bg-slate-50/50 shadow-inner group">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                             <defs>
                                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15}/>
                                   <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '12px 16px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                formatter={(v) => formatCurrency(v)}
                             />
                             <Area type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" name="Gross Inflows" />
                             <Area type="monotone" dataKey="outflow" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" name="Gross Outflows" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
}
