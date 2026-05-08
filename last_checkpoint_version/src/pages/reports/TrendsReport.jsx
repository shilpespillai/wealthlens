import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  LineChart as TrendsIcon, 
  ChevronRight, 
  Calendar as CalendarIcon,
  TrendingUp, 
  Activity,
  ArrowRight,
  Info,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Cell, AreaChart, Area, ReferenceLine, Legend
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { useCategories } from "@/hooks/useCategories";
import { base44 } from "@/api/base44Client";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth, subMonths, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import PremiumOverlay from "@/components/layout/PremiumOverlay";
import { toast } from "react-hot-toast";
import { generateManualPdf } from "@/utils/generateManualPdf";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

// Mock generation removed per user request for production data integrity.

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl space-y-3 min-w-[200px]">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-xs uppercase tracking-widest">{label}</p>
        
        <div className="space-y-2">
          {payload.map((entry, index) => {
            if (!entry.value || entry.value === 0 || entry.dataKey === 'budgeted') return null;
            return (
              <div key={index} className="flex justify-between items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                   <span className="text-slate-500 font-medium capitalize">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-700">
                   {formatCurrency(entry.value)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-2 space-y-1">
           <div className="flex justify-between items-center gap-6 text-xs">
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Budgeted</span>
              <span className="font-black text-[#4C1D95]">{formatCurrency(data.budgeted)}</span>
           </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendsReport() {
  const { isPaidUser } = useAuth();
  const { formatAmount, getProductionLedger } = useFinancialParser();
  const { categories } = useCategories({ global: true });
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [showType, setShowType] = useState('expense'); // expense or income
  const [isBurndownOpen, setIsBurndownOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date()
  });

  const categoryNames = useMemo(() => {
    return ["All categories", ...categories.map(c => c.name).sort()];
  }, [categories]);

  const [allTransactions, setAllTransactions] = useState([]);
  const [dbBudgets, setDbBudgets] = useState({}); // { '2026-01': payload, ... }

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const activeInterval = useMemo(() => {
    try {
      if (!dateRange || !dateRange.from || !dateRange.to) return [new Date()];
      return eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    } catch (e) {
      return [new Date()];
    }
  }, [dateRange]);


  useEffect(() => {
    async function load() {
      // 1. Fetch Transactions
      const ledger = await getProductionLedger();
      setAllTransactions(ledger);

      // 2. Fetch Budgets for the active interval
      const budgetPromises = activeInterval.map(async (m) => {
        const monthKey = format(m, "yyyy-MM");
        const results = await base44.db.query("budgets", {
          filters: [{ column: 'month', op: 'eq', value: monthKey }]
        });
        return { monthKey, data: results?.[0]?.payload || null };
      });

      const resolved = await Promise.all(budgetPromises);
      const budgetMap = {};
      resolved.forEach(r => { if (r.data) budgetMap[r.monthKey] = r.data; });
      setDbBudgets(budgetMap);
    }
    load();
  }, [getProductionLedger, activeInterval]);

  const handleExportPDF = async () => {
    const element = document.getElementById("trends-export-area");
    if (!element) return;
    const loadingToast = toast.loading("Generating PDF snapshot...");
    try {
      await generateManualPdf(element, { filename: `WealthLens-Trends-${selectedCategory.replace(/\s+/g, '-')}.pdf` });
      toast.success("PDF downloaded successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to generate PDF.", { id: loadingToast });
    }
  };

  const chartData = useMemo(() => {
    return activeInterval.map((month, idx) => {
      const monthTxs = allTransactions.filter(t => isSameMonth(new Date(t.date || t.actualDate), month));
      const monthKey = format(month, "yyyy-MM");
      const monthBudgetPayload = dbBudgets[monthKey];
      
      let actual = 0;
      let budgeted = selectedCategory === "All categories" ? 2500 : 0;

      // Try to find the real budget from DB first
      if (monthBudgetPayload) {
        if (selectedCategory === "All categories") {
          const budgetsArray = showType === 'income' ? monthBudgetPayload.incomes : monthBudgetPayload.expenses;
          if (budgetsArray) {
            budgeted = budgetsArray.reduce((sum, b) => sum + (Number(b.monthly_target) || 0), 0);
          }
        } else {
          const flatBudgets = [...(monthBudgetPayload.incomes || []), ...(monthBudgetPayload.expenses || [])];
          const found = flatBudgets.find(b => 
            (String(b.category || "")).toLowerCase() === String(selectedCategory || "").toLowerCase() || 
            (String(b.id || "")).toLowerCase() === String(selectedCategory || "").toLowerCase()
          );
          if (found) {
            budgeted = parseFloat(String(found.amount || "").replace(/[^\d.]/g, '')) || 0;
          }
        }
      }

      if (selectedCategory === "All categories") {
        actual = monthTxs
          .filter(t => (showType === 'income' ? (t.type === 'income' || t.spendType === 'income') : (t.type === 'expense' || t.spendType === 'expense')))
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
      } else {
        actual = monthTxs
          .filter(t => (t.category || "").toLowerCase() === selectedCategory.toLowerCase())
          .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
      }

      // Dynamic Pending Logic: Month is pending if it's the current month or in the future
      const today = new Date();
      const isPending = isSameMonth(month, today) || month > today;
      
      const within = isPending ? 0 : Math.min(actual, budgeted);
      const overspent = isPending ? 0 : Math.max(0, actual - budgeted);
      const saved = isPending ? 0 : Math.max(0, budgeted - actual);
      const pending = isPending ? budgeted : 0;

      return {
        month: format(month, "MMM yyyy"),
        within: Math.round(within * 100) / 100,
        overspent: Math.round(overspent * 100) / 100,
        saved: Math.round(saved * 100) / 100,
        pending: Math.round(pending * 100) / 100,
        budgeted: Math.round(budgeted * 100) / 100,
        totalActual: Math.round(actual * 100) / 100
      };
    });
  }, [allTransactions, activeInterval, selectedCategory, showType, dbBudgets]);

  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return { budgeted: 0, totalActual: 0, overspent: 0, within: 0, avg: 0 };
    
    // Aggregate totals for the selected period
    const totals = chartData.reduce((acc, d) => ({
      budgeted: acc.budgeted + d.budgeted,
      totalActual: acc.totalActual + d.totalActual,
      within: acc.within + d.within,
      overspent: acc.overspent + d.overspent
    }), { budgeted: 0, totalActual: 0, within: 0, overspent: 0 });

    const avg = totals.totalActual / chartData.length;
    
    return { ...totals, avg };
  }, [chartData]);

  const burndownData = useMemo(() => {
    // 1. Calculate total budget across the entire activeInterval
    let totalBudget = 0;
    const monthlyBudgets = activeInterval.map(month => {
      const monthKey = format(month, "yyyy-MM");
      const monthBudgetPayload = dbBudgets[monthKey];
      let b = selectedCategory === "All categories" ? (showType === 'income' ? 5500 : 2800) : 0;
      
      if (monthBudgetPayload) {
        if (selectedCategory === "All categories") {
          const budgetsArray = showType === 'income' ? monthBudgetPayload.incomes : monthBudgetPayload.expenses;
          if (budgetsArray) {
            b = budgetsArray.reduce((sum, item) => sum + (Number(item.monthly_target) || 0), 0);
          }
        } else {
          const flatBudgets = [...(monthBudgetPayload.incomes || []), ...(monthBudgetPayload.expenses || [])];
          const found = flatBudgets.find(item => 
            String(item.category || "") === String(selectedCategory || "") || 
            String(item.id || "") === String(selectedCategory || "")
          );
          if (found) {
            b = Number(found.monthly_target) || 0;
          }
        }
      }
      totalBudget += b;
      return { month, budget: b };
    });

    // 2. Map over each month to calculate cumulative spend and ideal burndown
    let cumulativeSpend = 0;
    let idealRemaining = totalBudget;
    
    // We want to show a data point for the "Start" (before any spend) to make the chart look like a true burndown.
    const result = [];
    result.push({
      day: "Start",
      remaining: totalBudget,
      ideal: totalBudget
    });

    activeInterval.forEach((month, idx) => {
      const monthTxs = allTransactions.filter(t => {
        const d = new Date(t.date || t.actualDate);
        const categoryMatch = selectedCategory === "All categories" 
          ? (showType === 'income' ? (t.type === 'income' || t.spendType === 'income') : (t.type === 'expense' || t.spendType === 'expense'))
          : (String(t.category || "")).toLowerCase() === String(selectedCategory || "").toLowerCase();
        return isSameMonth(d, month) && categoryMatch;
      });

      const monthSpend = monthTxs.reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
      cumulativeSpend += monthSpend;
      
      const currentMonthBudget = monthlyBudgets[idx].budget;
      idealRemaining -= currentMonthBudget;

      result.push({
        day: format(month, "MMM ''yy"),
        remaining: Math.round(Math.max(0, totalBudget - cumulativeSpend) * 100) / 100,
        ideal: Math.round(idealRemaining * 100) / 100
      });
    });
    
    return result;
  }, [allTransactions, activeInterval, selectedCategory, showType, dbBudgets]);

  return (
    <div id="trends-export-area" className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden text-slate-900 relative">
      {!isPaidUser && <PremiumOverlay featureName="Historical Trend Intelligence" />}
      {/* Premium Header */}
      <div className="w-full px-2 pt-4 pb-2 bg-white z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
               <TrendsIcon className="w-5 h-5 text-[#C5A059]" />
               <h1 className="text-xl font-bold text-slate-900 tracking-tight">Trends <span className="text-slate-300 font-normal px-2">›</span> <span className="text-[#C5A059]">{selectedCategory}</span></h1>
            </div>
            <div className="flex items-center gap-6">
                
               <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100 h-10 px-5 rounded-xl gap-3 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                      {dateRange?.from ? (
                        format(dateRange.from, "MMM yyyy") + (dateRange?.to ? ` - ${format(dateRange.to, "MMM yyyy")}` : "")
                      ) : "Pick date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-slate-100 shadow-2xl overflow-hidden rounded-3xl" align="end">
                    <div className="flex h-[360px]">
                      {/* Presets Sidebar */}
                      <div className="w-40 border-r border-slate-100 p-4 space-y-2 flex flex-col justify-center bg-slate-50">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Cycle Presets</p>
                         {[
                           { label: "Last 3 Months", get: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
                           { label: "Last 6 Months", get: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
                           { label: "Last 12 Months", get: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
                           { label: "Year to Date", get: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) },
                           { label: "Current Quarter", get: () => {
                             const q = Math.floor(new Date().getMonth() / 3);
                             return { from: new Date(new Date().getFullYear(), q * 3, 1), to: new Date() };
                           }},
                         ].map((p) => (
                           <button 
                             key={p.label}
                             onClick={() => setDateRange(p.get())}
                             className="w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all"
                           >
                             {p.label}
                           </button>
                         ))}
                      </div>
                      <div className="p-6 flex flex-col gap-6 justify-center w-64">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Custom Range</p>
                         <div className="space-y-4">
                           <div>
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Start Month</label>
                             <input 
                               type="month" 
                               className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                               value={dateRange?.from ? format(dateRange.from, "yyyy-MM") : ""}
                               onChange={(e) => {
                                 const val = e.target.value;
                                 if (val) {
                                   const [y, m] = val.split('-');
                                   setDateRange(prev => ({ ...prev, from: new Date(y, m - 1, 1) }));
                                 }
                               }}
                             />
                           </div>
                           <div>
                             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">End Month</label>
                             <input 
                               type="month" 
                               className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                               value={dateRange?.to ? format(dateRange.to, "yyyy-MM") : ""}
                               onChange={(e) => {
                                 const val = e.target.value;
                                 if (val) {
                                   const [y, m] = val.split('-');
                                   setDateRange(prev => ({ ...prev, to: new Date(y, m - 1, 1) }));
                                 }
                               }}
                             />
                           </div>
                         </div>
                      </div>
                    </div>
                  </PopoverContent>
               </Popover>

               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                 <SelectTrigger className="w-[200px] h-10 bg-slate-50 border-slate-100 rounded-xl shadow-sm text-xs font-bold text-slate-700">
                   <SelectValue placeholder="Select category" />
                 </SelectTrigger>
                 <SelectContent>
                   {categoryNames.map(cat => (
                     <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>

               {selectedCategory === "All categories" && (
                 <Button 
                   onClick={() => setShowType(prev => prev === 'expense' ? 'income' : 'expense')}
                   className={cn(
                     "h-10 px-6 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md",
                     showType === 'expense' ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                   )}
                 >
                   Showing {showType.charAt(0).toUpperCase() + showType.slice(1)}
                 </Button>
               )}

               <Button 
                  onClick={handleExportPDF}
                  variant="outline" 
                  className="bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 h-10 px-4 rounded-xl gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
               >
                 <Download className="w-4 h-4 text-[#C5A059]" />
                 Export
               </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Main Chart Area */}
        <main className="flex-1 overflow-y-auto p-2 bg-[#F8F9FB]">
           <div className="max-w-full mx-auto space-y-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  {/* Large Chart Card */}
                  <motion.div 
                    key={`chart-${selectedCategory}-${showType}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="xl:col-span-3 bg-white border border-slate-200 rounded-[40px] p-12 shadow-sm relative group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500"
                  >
                    <div className="absolute top-10 left-12 flex items-center gap-2">
                       <Info className="w-4 h-4 text-slate-300" />
                       <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Monthly {showType} analysis</p>
                    </div>

                    <div className="w-full h-[400px] mt-12">
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} />
                             <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} 
                                tickFormatter={(val) => `$${val/1000}k`}
                             />
                             <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8F9FB' }} />
                             <Bar dataKey="within" stackId="a" fill="#3B82F6" barSize={40} />
                             <Bar dataKey="saved" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                             <Bar dataKey="overspent" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={40} />
                             <Bar dataKey="pending" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={40} />
                             
                             <Line type="monotone" dataKey="budgeted" stroke="#4C1D95" strokeWidth={3} dot={{ fill: '#4C1D95', r: 5, strokeWidth: 2, stroke: '#fff' }} />
                             
                             {showType === 'expense' && (
                               <ReferenceLine y={1712} stroke="#334155" strokeDasharray="4 4" label={{ value: 'Avg: $1,712', position: 'right', fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                             )}
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>

                    {/* Premium Legend Layout from Screenshot */}
                    <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-12">
                       {/* Column 1: BUDGETED */}
                       <div className="space-y-4">
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Budgeted</p>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4C1D95]" />
                                <div className="w-4 h-0.5 bg-[#4C1D95]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#4C1D95]" />
                             </div>
                             <span className="text-xs font-medium text-slate-700 tracking-tight">Monthly Target</span>
                          </div>
                       </div>

                       {/* Column 2: SPENT */}
                       <div className="space-y-5">
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Spent</p>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-4 h-0.5 border-t border-dashed border-slate-400" />
                                <span className="text-xs font-medium text-slate-600">Avg: <span className="text-slate-900">{formatCurrency(stats.avg)}</span></span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 bg-[#3B82F6] rounded-sm" />
                                <span className="text-xs font-medium text-slate-600 tracking-tight">Within budget</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 bg-[#F43F5E] rounded-sm" />
                                <span className="text-xs font-medium text-slate-600 tracking-tight">Overspent limit</span>
                             </div>
                          </div>
                       </div>

                       {/* Column 3: REMAINDER */}
                       <div className="space-y-5">
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Remainder</p>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 bg-[#CBD5E1] rounded-sm" />
                                <span className="text-xs font-medium text-slate-600 tracking-tight">Pending / In Progress</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 bg-[#10B981] rounded-sm" />
                                <span className="text-xs font-medium text-slate-600 tracking-tight">Surplus savings</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>

                  {/* Sidebar Stats Card */}
                  <div className="xl:col-span-1 space-y-8 h-full">
                    <motion.div 
                      key={`stats-${selectedCategory}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm h-full flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                    >
                       <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Current Period Audit</p>
                          <h3 className="text-2xl font-black text-slate-900 mb-2 truncate">{selectedCategory}</h3>
                          <p className="text-[10px] font-bold text-amber-600 tracking-tight mb-10 flex items-center gap-2 uppercase tracking-[0.2em]">
                             {dateRange?.from ? format(dateRange.from, "MMM") : ""} - {dateRange?.to ? format(dateRange.to, "MMM") : ""} Cycle
                          </p>
                          
                 <div className="space-y-10">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Period Target</p>
                       <p className="text-xl font-black text-slate-900">{formatCurrency(stats.budgeted)}</p>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-slate-100">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Period Actual</p>
                          <p className="text-xl font-black text-amber-600">{formatCurrency(stats.totalActual)}</p>
                       </div>

                       <div className="space-y-4 pt-2">
                         <div className="flex items-center justify-between bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
                              <span className="text-[10px] font-medium text-teal-700 uppercase tracking-widest leading-none">Period Within Budget</span>
                            </div>
                            <span className="text-xs font-medium text-slate-700">{formatCurrency(stats.within)}</span>
                         </div>
                         <div className="flex items-center justify-between bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                              <span className="text-[10px] font-medium text-rose-700 uppercase tracking-widest leading-none">Period Overspent</span>
                            </div>
                            <span className="text-xs font-medium text-rose-600">{formatCurrency(stats.overspent)}</span>
                         </div>
                       </div>
                    </div>
                 </div>
                       </div>

                       <Dialog open={isBurndownOpen} onOpenChange={setIsBurndownOpen}>
                          <DialogTrigger asChild>
                             <Button className="mt-12 w-full h-14 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-medium uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-sm transition-all active:scale-95 group">
                                <Activity className="w-5 h-5 group-hover:rotate-12 transition-all" /> Burndown Chart
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-white rounded-[40px] p-12 border-none shadow-2xl overflow-hidden">
                             <DialogHeader className="mb-10">
                                <DialogTitle className="text-2xl font-medium text-slate-900 tracking-tight flex items-center gap-3 underline decoration-teal-500/20 underline-offset-8">
                                   <Activity className="w-6 h-6 text-teal-500" />
                                   Cumulative Trajectory: {selectedCategory}
                                </DialogTitle>
                             </DialogHeader>
                             <div className="w-full h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                   <AreaChart data={burndownData}>
                                      <defs>
                                        <linearGradient id="colorRemain" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15}/>
                                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                                        </linearGradient>
                                      </defs>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} />
                                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 500 }} tickFormatter={(v) => `$${v}`} />
                                      <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', fontWeight: 500 }} />
                                      <Area type="monotone" dataKey="remaining" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorRemain)" />
                                      <Line type="monotone" dataKey="ideal" stroke="#94A3B8" strokeDasharray="6 6" strokeWidth={2} dot={false} />
                                   </AreaChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="mt-8 flex items-center justify-between text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t border-slate-50 pt-8">
                                <span>Start of Period</span>
                                <div className="flex items-center gap-8">
                                   <div className="flex items-center gap-2"><div className="w-8 h-0.5 bg-teal-500" /> Actual Cumulative Path</div>
                                   <div className="flex items-center gap-2"><div className="w-8 h-0.5 border-t-2 border-dashed border-slate-300" /> Ideal Trajectory</div>
                                </div>
                                <span>End of Period</span>
                             </div>
                          </DialogContent>
                       </Dialog>
                    </motion.div>
                  </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
