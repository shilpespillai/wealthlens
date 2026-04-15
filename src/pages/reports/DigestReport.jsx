import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingDown,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Sparkles,
  ArrowRight,
  Calendar
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
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

// Shared Mock Generator (Fallback)
const MOCK_TRANS_GEN = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];
  const transactions = [];
  months.forEach((m) => {
    ["Salary", "Rent", "Groceries", "Entertainment", "Utilities"].forEach(cat => {
      const amount = (cat === "Salary") ? 5500 : (cat === "Rent" ? 720 : 300 + Math.random() * 200);
      // Assign accounts: Bank for stable income/bills, Credit for variable spending
      const accountId = ["Salary", "Rent", "Utilities"].includes(cat) ? 'bank' : 'credit';
      transactions.push({
        id: `mock-${m}-${cat}`,
        date: `${m} 15 2026`,
        merchant: cat,
        amount: (cat === "Salary") ? amount : -amount,
        category: cat,
        type: (cat === "Salary") ? 'income' : 'expense',
        accountId
      });
    });
  });
  return transactions;
})();

export default function DigestReport() {
  const { formatAmount, normalizeTransactionData } = useFinancialParser();
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 1));
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      const saved = await base44.user.loadData("wealthlens-full-ledger");
      let combined = [];
      const monthsToLoad = [
        new Date(2026, 0, 1), new Date(2026, 1, 1), 
        new Date(2026, 2, 1), new Date(2026, 3, 1), 
        new Date(2026, 4, 1)
      ];
      
      monthsToLoad.forEach(month => {
        const { incomes, expenses } = normalizeTransactionData(saved || [], month, MOCK_TRANS_GEN);
        combined = [...combined, ...incomes, ...expenses];
      });
      setAllTransactions(combined);
    }
    load();
  }, [normalizeTransactionData]);

  const filteredMonthTxs = useMemo(() => {
    return allTransactions.filter(t => {
      const dateMatch = isSameMonth(new Date(t.date || t.actualDate), selectedDate);
      const accountMatch = selectedAccountId === "all" || t.accountId === selectedAccountId;
      return dateMatch && accountMatch;
    });
  }, [allTransactions, selectedDate, selectedAccountId]);

  const metrics = useMemo(() => {
    const earned = filteredMonthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0);
    const spent = filteredMonthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0);
    return { earned, spent, loss: spent > earned ? spent - earned : 0 };
  }, [filteredMonthTxs]);

  const pieData = useMemo(() => [
    { name: 'Earned', value: metrics.earned },
    { name: 'Spent', value: metrics.spent },
  ], [metrics]);

  const barData = useMemo(() => {
    // Generate 4 months of history up to selected month
    const historyMonths = [subMonths(selectedDate, 3), subMonths(selectedDate, 2), subMonths(selectedDate, 1), selectedDate];
    return historyMonths.map(m => {
      const monthTxs = allTransactions.filter(t => {
        const dateMatch = isSameMonth(new Date(t.date || t.actualDate), m);
        const accountMatch = selectedAccountId === "all" || t.accountId === selectedAccountId;
        return dateMatch && accountMatch;
      });
      return {
        month: format(m, "MMMM"),
        spent: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0),
        groceries: monthTxs.filter(t => t.category === 'Groceries').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0),
        entertainment: monthTxs.filter(t => t.category === 'Entertainment').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0),
        utilities: monthTxs.filter(t => t.category === 'Utilities').reduce((s, t) => s + Math.abs(t.amount || t.monthlyAmount || 0), 0),
      };
    });
  }, [allTransactions, selectedDate, selectedAccountId]);

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
            <div className="flex items-center gap-4">
               <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center bg-slate-800/50 rounded-xl border border-slate-700 px-5 py-2.5 text-xs text-slate-300 font-medium gap-3 hover:bg-slate-700 transition-all">
                       <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                       {format(startOfMonth(selectedDate), "MMM d, yyyy")} - {format(endOfMonth(selectedDate), "MMM d, yyyy")}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1E293B] border-slate-700" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      initialFocus
                      className="text-white"
                    />
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
              <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400">Linked Accounts</p>
              <div className="space-y-3">
                 {[
                   { id: "all", name: "All Consolidated Accounts", balance: 1205.91, color: "bg-indigo-500" },
                   { id: "bank", name: "Vault Savings Account", balance: 3547.45, color: "bg-teal-500" },
                   { id: "credit", name: "Premium Travel Card", balance: -2345.54, color: "bg-rose-500" }
                 ].map((acc) => (
                    <button 
                      key={acc.id} 
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={cn(
                        "w-full text-left bg-slate-50 border p-4 rounded-2xl transition-all group",
                        selectedAccountId === acc.id ? "border-[#C5A059] bg-[#C5A059]/5" : "border-slate-100 hover:border-slate-300"
                      )}
                    >
                       <div className="flex items-center gap-3 mb-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", acc.color)} />
                          <p className="text-[10px] font-medium text-slate-700 truncate">{acc.name}</p>
                       </div>
                       <p className={cn("text-sm font-medium tracking-tight", acc.balance >= 0 ? "text-slate-900" : "text-rose-500")}>
                          {formatCurrency(acc.balance)}
                       </p>
                    </button>
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
                 <h2 className="text-4xl font-medium text-slate-900 tracking-tight">Financial Overview <span className="text-slate-200 font-light mx-2">|</span> {format(selectedDate, "MMMM yyyy")}</h2>
                 <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed font-normal">A strategic breakdown of your cash velocity and spending footprint across all accounts.</p>
              </div>

              {/* Big Insight Section 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-slate-50 pt-16">
                 <div className="space-y-8">
                    {metrics.loss > 0 ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-medium uppercase tracking-widest border border-rose-100">
                        <TrendingDown className="w-3 h-3" /> Warning Insight
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-medium uppercase tracking-widest border border-teal-100">
                        <Sparkles className="w-3 h-3" /> Positive Velocity
                      </div>
                    )}
                    <h3 className="text-3xl font-medium text-slate-900 tracking-tight leading-tight">
                      {selectedAccountId === 'all' 
                        ? (metrics.loss > 0 ? "You spent more than you earned." : "Strong monthly savings cycle.")
                        : (selectedAccountId === 'bank' ? "Vault Savings performance is stable." : "Credit usage is being monitored.")}
                    </h3>
                    <div className="space-y-4 text-slate-500 text-sm leading-relaxed font-normal">
                       <p>In {format(selectedDate, "MMMM")}, your total inflow reached <span className="text-teal-600 font-medium">{formatCurrency(metrics.earned)}</span>, while outgoings reached <span className="text-rose-500 font-medium">{formatCurrency(metrics.spent)}</span>.</p>
                       <p className="text-slate-800 font-medium">
                          {metrics.loss > 0 
                            ? `This resulted in a net loss of ${formatCurrency(metrics.loss)} for the monthly cycle.`
                            : `This resulted in a healthy surplus of ${formatCurrency(metrics.earned - metrics.spent)}.`}
                       </p>
                    </div>
                    <Button variant="link" className="text-[#C5A059] p-0 h-auto font-medium text-xs uppercase tracking-widest gap-2 group hover:no-underline">
                       View reconciliation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </div>
                 <div className="relative h-[300px]">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="text-center">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total cycle</p>
                          <p className="text-2xl font-medium text-slate-900">{formatCurrency(metrics.earned + metrics.spent)}</p>
                       </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={pieData}
                             cx="50%"
                             cy="50%"
                             innerRadius={90}
                             outerRadius={120}
                             paddingAngle={8}
                             dataKey="value"
                             stroke="none"
                          >
                             {pieData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                             ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 500 }}
                            formatter={(v) => formatCurrency(v)}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Big Insight Section 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-slate-50 pt-16 pb-24">
                 <div className="h-[300px] border border-slate-100 rounded-[32px] p-8 bg-slate-50/50 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 500 }} />
                          <YAxis hide />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '16px', color: '#fff' }}
                             itemStyle={{ fontSize: '11px', fontWeight: 500 }}
                             cursor={{ fill: 'transparent' }}
                             formatter={(v) => formatCurrency(v)}
                          />
                          <Bar dataKey="spent" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={24} />
                          <Bar dataKey="groceries" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={24} />
                          <Bar dataKey="entertainment" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                          <Bar dataKey="utilities" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-medium uppercase tracking-widest border border-indigo-100">
                       <BarIcon className="w-3 h-3" /> Historical Snapshot
                    </div>
                    <h3 className="text-3xl font-medium text-slate-900 tracking-tight leading-tight">
                      {barData[3]?.spent > barData[2]?.spent ? "Spending has increased." : "Costs are stabilizing."}
                    </h3>
                    <div className="space-y-6 text-slate-500 text-sm leading-relaxed font-normal">
                       <p>Historical trends indicate concentration in essentials. Current trajectory shows:</p>
                       <ul className="space-y-4">
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
                             <span>Monthly expense floor at <span className="text-slate-800 font-medium">{formatCurrency(barData[3]?.spent)}</span>.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                             <span>Groceries accounting for <span className="text-slate-800 font-medium">{formatCurrency(barData[3]?.groceries)}</span> volume.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50" />
                             <span>Lifestyle spending is <span className={cn("font-medium", barData[3]?.entertainment > barData[2]?.entertainment ? "text-amber-600" : "text-teal-600")}>
                               {barData[3]?.entertainment > barData[2]?.entertainment ? "trending up" : "holding steady"}
                             </span>.</span>
                          </li>
                       </ul>
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
}
