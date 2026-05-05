import React, { useState, useMemo, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Plus, 
  Calendar as CalendarIcon, 
  Info,
  CheckCircle2,
  FileText,
  ChevronLeft,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { isSameMonthYear } from "@/utils/dateParser";
import { base44 } from "@/api/base44Client";
import { addMonths, subMonths, format } from "date-fns";
import { generateIncomeExpensePdf } from "@/components/reports/generateIncomeExpensePdf";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";
import { useAccounts } from "@/hooks/useAccounts";
import PremiumOverlay from "@/components/layout/PremiumOverlay";

// Mock generation removed for production data integrity.

// Budget Targets based on INITIAL_BUDGET_DATA in SetBudget.jsx
// Budget targets are now dynamically resolved from the 'budgets' table via the normalizeTransactionData helper.
// Hardcoded BUDGET_TARGETS removed to ensure production data integrity.


const NESTING_GROUPS = {
  "Household": ["Housing", "Utilities"],
  "Living": ["Groceries", "Dining & Food", "Shopping", "Fuel & Transport"],
  "Lifestyle": ["Entertainment", "Healthcare", "Travel", "Lifestyle"]
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function IncomeExpenseReport() {
  const { isPaidUser } = useAuth();
  const { formatAmount, normalizeTransactionData, getProductionLedger, getDatabaseTable } = useFinancialParser();
  const { syncMonthlyWithMaster } = useAccounts();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current month
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [nestCategories, setNestCategories] = useState(false);
  const [showPercentages, setShowPercentages] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const monthKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}`;

  useEffect(() => {
    async function load() {
      setIncomes([]);
      setExpenses([]);
      
      // 0. Ensure master accounts are synced to this month's shard
      await syncMonthlyWithMaster(monthKey);

      // 1. Load accounts first as they are needed for normalization
      const rawAccounts = await getDatabaseTable("user_accounts", { month: monthKey });
      const seen = new Set();
      const unique = (rawAccounts || []).filter(a => {
        if (seen.has(a.id)) return false;
        // Filter out any system-added or redundant manual vaults to prevent duplicates
        if (a.name === 'Manual Vault' || a.id === 'sys-vault' || a.id === 'manual') return false;
        seen.add(a.id);
        return true;
      });

      // 2. Load budgets and ledger
      const allBudgets = await getDatabaseTable("budgets");
      const saved = (allBudgets || []).find(b => b.month === monthKey);
      const productionLedger = await getProductionLedger({ month: monthKey });

      // 3. Normalize and set data
      const { incomes: normIncs, expenses: normExps } = normalizeTransactionData(saved, selectedDate, productionLedger, unique);
      
      setIncomes(normIncs);
      setExpenses(normExps);
    }
    load();
  }, [monthKey, normalizeTransactionData, selectedDate, getProductionLedger, getDatabaseTable]);

  const reportData = useMemo(() => {
    const processGroup = (txs) => {
      const cats = {};
      txs.forEach(t => {
        const catName = t.category || 'Uncategorized';
        if (!cats[catName]) {
          cats[catName] = { 
            category: catName, 
            actual: 0, 
            budgeted: Number(t.monthly_target || 0) 
          };
        }
        cats[catName].actual += (Number(t.amount) || 0);
      });
      return Object.values(cats);
    };

    const rawIncs = processGroup(incomes);
    const rawExps = processGroup(expenses);

    if (!nestCategories) return { incomes: rawIncs, expenses: rawExps };

    // Apply Nesting
    const nest = (data) => {
      const nested = [];
      const handled = new Set();
      
      Object.entries(NESTING_GROUPS).forEach(([groupName, children]) => {
        const groupItems = data.filter(d => children.includes(d.category));
        if (groupItems.length > 0) {
          const groupSum = groupItems.reduce((s, curr) => ({ 
            actual: s.actual + curr.actual, 
            budgeted: s.budgeted + Math.abs(curr.budgeted) 
          }), { actual: 0, budgeted: 0 });
          
          nested.push({ 
            category: groupName, 
            isGroup: true, 
            ...groupSum, 
            children: groupItems 
          });
          children.forEach(c => handled.add(c));
        }
      });

      // Add loose items
      data.forEach(d => { if (!handled.has(d.category)) nested.push(d); });
      return nested;
    };

    return { incomes: rawIncs, expenses: nest(rawExps) };
  }, [incomes, expenses, nestCategories]);

  const totalActualIncome = reportData.incomes.reduce((s, i) => s + Number(i.actual || 0), 0);
  const totalActualExpense = reportData.expenses.reduce((s, e) => s + Math.abs(Number(e.actual || 0)), 0);

  const handleExport = () => {
    const loadingToast = toast.loading("Generating professional PDF report...");
    try {
      generateIncomeExpensePdf({
        date: selectedDate,
        incomes,
        expenses,
        incomeTotal: totalActualIncome,
        expenseTotal: totalActualExpense,
        reportData
      });
      toast.success("PDF report downloaded!", { id: loadingToast });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF", { id: loadingToast });
    }
  };

  const renderRow = (item, isSub = false, total = 1) => {
    const isExpanded = expandedGroups.includes(item.category);
    const diff = Math.abs(item.budgeted) - Math.abs(item.actual);
    const pct = total > 0 ? ((Math.abs(item.actual) / total) * 100).toFixed(1) + "%" : "0%";

    return (
      <React.Fragment key={item.category}>
        <tr className={`group hover:bg-slate-50 transition-colors ${isSub ? "bg-slate-50/30" : ""}`}>
          <td className={`px-8 py-4 flex items-center gap-3 ${isSub ? "pl-12" : ""}`}>
            {item.isGroup ? (
              <button 
                onClick={() => setExpandedGroups(prev => prev.includes(item.category) ? prev.filter(g => g !== item.category) : [...prev, item.category])}
                className="w-5 h-5 flex items-center justify-center hover:bg-slate-100 rounded"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            ) : <div className={`w-2 h-2 rounded-full border ${isSub ? "border-slate-300 scale-75" : "border-slate-200"}`} />}
            <span className={`text-xs ${item.isGroup ? "font-medium text-slate-700 uppercase tracking-wider" : "font-normal text-slate-600"}`}>
              {item.category}
            </span>
          </td>
          <td className="px-8 py-4 text-right text-xs font-medium text-slate-400">{formatAmount(Math.abs(item.budgeted))}</td>
          <td className="px-8 py-4 text-right text-xs font-medium text-slate-700">{formatAmount(item.actual)}</td>
          <td className={`px-8 py-4 text-right text-xs font-medium ${diff >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {formatAmount(diff)}
          </td>
          {showPercentages && (
            <td className="px-8 py-4 text-right text-[10px] font-medium text-slate-400">{pct}</td>
          )}
        </tr>
        {item.isGroup && isExpanded && item.children.map(child => renderRow(child, true, total))}
      </React.Fragment>
    );
  };

  return (
      <div className="flex-1 overflow-y-auto bg-[#F8F9FB] p-6">
        <div className="max-w-7xl mx-auto mb-6">



            {/* Premium Header - Now part of the scroll flow */}
            <div className="max-w-full mx-auto mb-4">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#C5A059]" />
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Income & Expense</h1>
                  </div>

                  <div className="h-8 w-px bg-slate-100 hidden md:block" />

                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nest Categories</span>
                      <Switch checked={nestCategories} onCheckedChange={setNestCategories} className="data-[state=checked]:bg-[#C5A059]" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Show %</span>
                      <Switch checked={showPercentages} onCheckedChange={setShowPercentages} className="data-[state=checked]:bg-[#C5A059]" />
                    </div>
                  </div>
                </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50 overflow-hidden shadow-sm h-10">
                        <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border-r border-slate-100 transition-all h-full">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-100 transition-all h-full border-r border-slate-100 flex items-center gap-2">
                              <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                              {format(selectedDate, "MMM yyyy")}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border-slate-100 shadow-2xl" align="end">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(d) => d && setSelectedDate(d)}
                              initialFocus
                              className="bg-white"
                            />
                          </PopoverContent>
                        </Popover>

                        <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all h-full">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <Button onClick={handleExport} variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-[10px] font-bold uppercase tracking-widest gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
           <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-8 py-6 text-[10px] uppercase font-medium tracking-[0.15em] text-slate-400">Category</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-medium tracking-[0.15em] text-slate-400 text-right">Budgeted</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-medium tracking-[0.15em] text-slate-400 text-right">Actual</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-medium tracking-[0.15em] text-slate-400 text-right">Variance</th>
                       {showPercentages && <th className="px-8 py-6 text-[10px] uppercase font-medium tracking-[0.15em] text-slate-400 text-right">% of Total</th>}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {/* INCOME SECTION */}
                    <tr><td colSpan={showPercentages ? 5 : 4} className="px-8 pt-10 pb-4 text-[10px] font-medium text-teal-400 uppercase tracking-[0.2em]">Income</td></tr>
                    {reportData.incomes.map(item => renderRow(item, false, totalActualIncome))}
                    
                    <tr className="bg-teal-50/20">
                       <td className="px-8 py-4 italic text-xs font-medium text-teal-500">Total Income</td>
                       <td className="px-8 py-4 text-xs font-medium text-slate-400 text-right">---</td>
                       <td className="px-8 py-4 text-xs font-medium text-slate-800 text-right">{formatAmount(totalActualIncome)}</td>
                       <td colSpan={showPercentages ? 2 : 1} />
                    </tr>

                    {/* EXPENSE SECTION */}
                    <tr><td colSpan={showPercentages ? 5 : 4} className="px-8 pt-12 pb-4 text-[10px] font-medium text-rose-400 uppercase tracking-[0.2em]">Expenses</td></tr>
                    {reportData.expenses.map(item => renderRow(item, false, totalActualExpense))}
                    
                    <tr className="bg-rose-50/20">
                       <td className="px-8 py-4 italic text-xs font-medium text-rose-500">Total Expense</td>
                       <td className="px-8 py-4 text-xs font-medium text-slate-400 text-right">---</td>
                       <td className="px-8 py-4 text-xs font-medium text-slate-800 text-right">{formatAmount(totalActualExpense)}</td>
                       <td colSpan={showPercentages ? 2 : 1} />
                    </tr>
                    
                    {/* Summary Footer */}
                    <tr className="bg-slate-900">
                       <td className="px-8 py-6 text-[10px] font-bold text-white uppercase tracking-widest">MONTHLY SURPLUS</td>
                       <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">---</td>
                       <td className="px-8 py-6 text-right text-sm font-bold text-white group-hover:text-[#C5A059] transition-colors">{formatAmount(totalActualIncome - totalActualExpense)}</td>
                       <td colSpan={showPercentages ? 2 : 1} className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Savings Velocity</span>
                            <span className="text-xs font-bold text-emerald-400">{totalActualIncome > 0 ? (((totalActualIncome - totalActualExpense) / totalActualIncome) * 100).toFixed(1) : "0.0"}%</span>
                          </div>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
      </div>
    </div>
  );
}
