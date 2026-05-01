import React, { useState, useMemo, useEffect } from "react";
import { 
  ArrowRightLeft, 
  Settings, 
  Download,
  Calendar as CalendarIcon,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { base44 } from "@/api/base44Client";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import PremiumOverlay from "@/components/layout/PremiumOverlay";
import { generateManualPdf } from "@/utils/generateManualPdf";
import { toast } from "react-hot-toast";

export default function CashflowsReport() {
  const { isPaidUser } = useAuth();
  const { formatAmount, normalizeTransactionData, getProductionLedger, getDatabaseTable } = useFinancialParser();
  const [accounts, setAccounts] = useState([]);
  
  // Date Range State (Unified Calendar Selection)
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 6),
    to: new Date()
  });

  const [allTransactions, setAllTransactions] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);

  useEffect(() => {
    async function load() {
      // 1. Load accounts first
      const rawAccounts = await getDatabaseTable("user_accounts", { month: monthKey });
      const seen = new Set();
      const unique = (rawAccounts || []).filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      setAccounts(unique);

      // 2. Fetch the full production ledger and budgets
      const [productionLedger, budgets] = await Promise.all([
        getDatabaseTable("transactions"),
        getDatabaseTable("budgets")
      ]);
      setAllTransactions(productionLedger);
      setAllBudgets(budgets || []);
    }
    load();
  }, [getProductionLedger, getDatabaseTable]);

  const intervalMonths = useMemo(() => {
    try {
      if (!dateRange.from || !dateRange.to) return [new Date()];
      return eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    } catch (e) {
      return [dateRange.from || new Date()];
    }
  }, [dateRange]);

  const reportGrid = useMemo(() => {
    // Discovery: Get all unique categories across the entire interval for a complete grid
    const allIncomes = new Set();
    const allExpenses = new Set();
    
    const monthlyData = intervalMonths.map(m => {
      const monthKey = format(m, "yyyy-MM");
      // Use REAL budget data if available for this month to discover categories
      const savedBudget = (allBudgets || []).find(b => b.month === monthKey);
      const budgetRow = savedBudget || { month: monthKey, payload: { incomes: [], expenses: [] } };
      
      const { incomes, expenses } = normalizeTransactionData(budgetRow, m, allTransactions, accounts);
      
      incomes.forEach(i => allIncomes.add(i.category));
      expenses.forEach(e => allExpenses.add(e.category));
      
      return { month: m, incomes, expenses };
    });

    const incomeRows = Array.from(allIncomes).sort().map(cat => ({
      label: cat,
      values: monthlyData.map(d => {
        return d.incomes
          .filter(i => i.category === cat)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      })
    }));

    const expenseRows = Array.from(allExpenses).sort().map(cat => ({
      label: cat,
      values: monthlyData.map(d => {
        return d.expenses
          .filter(e => e.category === cat)
          .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      })
    }));

    const monthlySurplus = intervalMonths.map((m, i) => {
      const inc = incomeRows.reduce((s, r) => s + r.values[i], 0);
      const exp = expenseRows.reduce((s, r) => s + r.values[i], 0);
      return inc - exp;
    });

    const initialBalance = 0; // Standardized to ledger start
    const closingBalances = monthlySurplus.reduce((acc, surplus, i) => {
      const prev = i === 0 ? initialBalance : acc[i - 1];
      acc.push(prev + surplus);
      return acc;
    }, []);

    return { incomeRows, expenseRows, monthlySurplus, closingBalances };
  }, [allTransactions, intervalMonths, normalizeTransactionData]);

  const handleExportPDF = async () => {
    const element = document.getElementById('cashflow-export-area');
    if (!element) return;
    
    const loadingToast = toast.loading("Generating PDF snapshot...");
    try {
      await generateManualPdf(element, { 
        filename: `WealthLens-Cashflows-${format(new Date(), 'MMM-yyyy')}.pdf` 
      });
      toast.success("PDF exported successfully!", { id: loadingToast });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF", { id: loadingToast });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans relative">
      {!isPaidUser && <PremiumOverlay featureName="Institutional Cashflow Analysis" />}
      {/* Premium Header - Moves up with scroll */}
      <div className="w-full px-6 pt-4 pb-2 bg-white z-20">
        <div className="bg-[#1E293B] rounded-3xl shadow-xl overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ArrowRightLeft className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-medium text-white tracking-tight">Cashflows</h1>
            </div>
            <div className="flex items-center gap-6">
               
               {/* High-Fidelity Range Selector with Presets */}
               <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white px-5 py-6 rounded-2xl gap-3 min-w-[320px] justify-start text-xs font-medium uppercase tracking-widest",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                      {dateRange?.from && dateRange?.to ? (
                        <>{format(dateRange.from, "MMMM yyyy")} — {format(dateRange.to, "MMMM yyyy")}</>
                      ) : (
                        <span>Pick a date range</span>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 bg-[#1E293B] border-slate-700 shadow-2xl rounded-2xl" align="end">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-1">Quick Selection</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Last 3 Months", months: 3 },
                            { label: "Last 6 Months", months: 6 },
                            { label: "Last 12 Months", months: 12 },
                            { label: "Year to Date", months: new Date().getMonth() + 1 }
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => setDateRange({
                                from: subMonths(startOfMonth(new Date()), preset.months - 1),
                                to: endOfMonth(new Date())
                              })}
                              className="py-2.5 rounded-xl text-[11px] font-semibold bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-[#C5A059] hover:text-white hover:border-[#C5A059] transition-all"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-700/50">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest px-1">Fiscal Years</label>
                        <div className="flex gap-2">
                          {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()].map(year => (
                            <button
                              key={year}
                              onClick={() => setDateRange({
                                from: new Date(year, 0, 1),
                                to: new Date(year, 11, 31)
                              })}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all",
                                dateRange.from?.getFullYear() === year && dateRange.to?.getFullYear() === year
                                  ? "bg-[#C5A059] border-[#C5A059] text-white"
                                  : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700"
                              )}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 text-center">
                        <p className="text-[9px] text-slate-500 italic">Select a preset to automatically refresh the grid.</p>
                      </div>
                    </div>
                  </PopoverContent>
               </Popover>

               <Button onClick={handleExportPDF} variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-[10px] font-medium uppercase tracking-widest gap-2">
                  <Download className="w-4 h-4" /> Export PDF
               </Button>
            </div>
          </div>
        </div>
      </div>

      <main id="cashflow-export-area" className="flex-1 p-12 pt-6 bg-[#F8F9FB]">
        <div className="w-full mx-auto bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-8 text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 w-64 border-r border-slate-100">Performance Grid</th>
                {intervalMonths.map((m, idx) => (
                  <th key={idx} className="px-6 py-8 text-[10px] uppercase font-medium tracking-[0.2em] text-center text-slate-400">
                    {format(m, "MMM ''yy")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* SUMMARY ROW: CLOSING BALANCES */}
              <tr className="bg-slate-50/30">
                <td className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-widest border-r border-slate-100">Closing Balances</td>
                {reportGrid.closingBalances.map((v, i) => (
                  <td key={i} className="px-6 py-5 text-xs font-medium text-slate-900 text-center">
                    {formatAmount(v)}
                  </td>
                ))}
              </tr>
              {/* SUMMARY ROW: SURPLUS */}
              <tr className="border-b-2 border-slate-100">
                <td className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-widest border-r border-slate-100">Monthly Surplus</td>
                {reportGrid.monthlySurplus.map((v, i) => (
                  <td key={i} className={`px-6 py-5 text-xs font-medium text-center ${v >= 0 ? 'text-teal-500' : 'text-rose-500'}`}>
                    <div className="flex items-center justify-center gap-1">
                      {v >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {formatAmount(v)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* INCOME SECTION */}
              <tr>
                <td colSpan={intervalMonths.length + 1} className="px-8 pt-10 pb-4 text-[10px] font-medium text-teal-400 uppercase tracking-[0.2em]">Income Sources</td>
              </tr>
              {reportGrid.incomeRows.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 text-xs font-medium text-slate-600 border-r border-slate-100">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-6 py-4 text-xs text-center text-slate-500 font-medium group-hover:text-slate-900">
                      {v > 0 ? formatAmount(v) : "—"}
                    </td>
                  ))}
                </tr>
              ))}

              {/* EXPENSE SECTION */}
              <tr>
                <td colSpan={intervalMonths.length + 1} className="px-8 pt-12 pb-4 text-[10px] font-medium text-rose-400 uppercase tracking-[0.2em]">Categorical Spending</td>
              </tr>
              {reportGrid.expenseRows.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 text-xs font-medium text-slate-600 border-r border-slate-100">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-6 py-4 text-xs text-center text-slate-500 font-medium group-hover:text-slate-900">
                      {v > 0 ? formatAmount(v) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Final Margin Table Spacer */}
              <tr><td colSpan={intervalMonths.length + 1} className="py-8" /></tr>
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}
