import React, { useState, useMemo, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Plus, 
  Calendar, 
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
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { isSameMonthYear } from "@/utils/dateParser";
import { base44 } from "@/api/base44Client";
import { addMonths, subMonths, format } from "date-fns";
import { generateIncomeExpensePdf } from "@/components/reports/generateIncomeExpensePdf";
import { toast } from "react-hot-toast";

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
  const { formatAmount, normalizeTransactionData, getProductionLedger, getDatabaseTable } = useFinancialParser();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current month
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [nestCategories, setNestCategories] = useState(false);
  const [showPercentages, setShowPercentages] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  const monthKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}`;
  const [dbAccounts, setDbAccounts] = useState([]);

  useEffect(() => {
    async function load() {
      setIncomes([]);
      setExpenses([]);
      // 1. Load accounts first as they are needed for normalization
      const rawAccounts = await getDatabaseTable("user_accounts");
      const seen = new Set();
      const unique = (rawAccounts || []).filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      // Add Virtual "Manual Vault" for unassigned items
      const virtualManual = { id: "manual", name: "Manual Vault", is_system: true };
      setDbAccounts([virtualManual, ...unique]);

      // 2. Load budgets and ledger
      const allBudgets = await getDatabaseTable("budgets");
      const saved = (allBudgets || []).find((b) => b.month === monthKey);

      const productionLedger = await getProductionLedger({ month: monthKey });
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

    const filteredIncs = incomes.filter(i => {
      if (!selectedAccountId) return true;
      if (selectedAccountId === 'manual') return !i.account_id || String(i.account_id) === 'manual' || String(i.account_id) === 'null' || i.account_id === '';
      return String(i.account_id) === String(selectedAccountId);
    });
    
    const filteredExps = expenses.filter(e => {
      if (!selectedAccountId) return true;
      if (selectedAccountId === 'manual') return !e.account_id || String(e.account_id) === 'manual' || String(e.account_id) === 'null' || e.account_id === '';
      return String(e.account_id) === String(selectedAccountId);
    });

    const rawIncs = processGroup(filteredIncs);
    const rawExps = processGroup(filteredExps);

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
  }, [incomes, expenses, nestCategories, selectedAccountId]);

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
    <div className="flex flex-col h-full bg-white font-sans">
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Unified Analysis Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-100 p-8 space-y-10 overflow-y-auto">
           <div className="space-y-6">
              <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-300">Analysis Options</p>
              <div className="space-y-5">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Nest categories</span>
                    <Switch checked={nestCategories} onCheckedChange={setNestCategories} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Show % of total</span>
                    <Switch checked={showPercentages} onCheckedChange={setShowPercentages} />
                 </div>
              </div>
           </div>

            <div className="space-y-4">
               <p className="text-[10px] uppercase font-medium tracking-[0.2em] text-slate-300">Accounts</p>
               <div className="space-y-2">
                {dbAccounts.map((acc, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? null : acc.id)}
                    className={`p-4 rounded-2xl flex items-center justify-between group transition-all cursor-pointer border ${selectedAccountId === acc.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-[#C5A059]/30'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedAccountId === acc.id || !selectedAccountId} />
                      <span className={`text-[10px] font-medium uppercase transition-colors ${selectedAccountId === acc.id ? 'text-indigo-600' : 'text-slate-500'}`}>{acc.name}</span>
                    </div>
                    {(selectedAccountId === acc.id || !selectedAccountId) && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </div>
                ))}
                {dbAccounts.length === 0 && (
                  <p className="text-[9px] text-slate-400 text-center italic">No accounts linked</p>
                )}
               </div>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-12 pt-6 bg-[#F8F9FB]">
            {/* Premium Header - Now part of the scroll flow */}
            <div className="max-w-6xl mx-auto mb-8">
              <div className="bg-[#1E293B] rounded-3xl shadow-xl overflow-hidden border border-slate-700/30">
                <div className="px-8 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#C5A059]" />
                    <h1 className="text-xl font-medium text-white tracking-tight">Income & Expense</h1>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700">
                        <Select value={selectedDate.getMonth().toString()} onValueChange={(v) => setSelectedDate(new Date(selectedDate.getFullYear(), parseInt(v), 1))}>
                          <SelectTrigger className="w-[110px] h-7 text-[11px] text-white font-medium bg-transparent border-none focus:ring-0">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((m, i) => <SelectItem key={i} value={i.toString()}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={selectedDate.getFullYear().toString()} onValueChange={(v) => setSelectedDate(new Date(parseInt(v), selectedDate.getMonth(), 1))}>
                          <SelectTrigger className="w-[80px] h-7 text-[11px] text-white font-medium bg-transparent border-none focus:ring-0">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center border border-slate-700 rounded-lg shadow-sm overflow-hidden bg-slate-800">
                        <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-2 border-r border-slate-700 hover:bg-slate-700 transition-colors">
                          <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </button>
                        <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-2 hover:bg-slate-700 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                    <Button onClick={handleExport} variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-[10px] font-medium uppercase tracking-widest gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
           <div className="max-w-6xl mx-auto bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50">
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
                    <tr className="bg-[#1E293B] border-t-2 border-slate-700">
                       <td className="px-8 py-6 text-xs font-medium text-white uppercase tracking-wider">MONTHLY SURPLUS</td>
                       <td className="px-8 py-6 text-right text-xs font-medium text-slate-400">---</td>
                       <td className="px-8 py-6 text-right text-sm font-medium text-white group-hover:text-[#C5A059] transition-colors">{formatAmount(totalActualIncome - totalActualExpense)}</td>
                       <td colSpan={showPercentages ? 2 : 1} className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] text-slate-500 uppercase">Savings Velocity</span>
                            <span className="text-xs font-medium text-teal-400">{totalActualIncome > 0 ? (((totalActualIncome - totalActualExpense) / totalActualIncome) * 100).toFixed(1) : "0.0"}%</span>
                          </div>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </main>
      </div>
    </div>
  );
}
