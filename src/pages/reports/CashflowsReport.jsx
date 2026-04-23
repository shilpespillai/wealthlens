import React, { useState, useMemo, useEffect } from "react";
import { 
  format, 
  eachMonthOfInterval, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  subMonths 
} from "date-fns";
import { 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Activity
} from "lucide-react";
import useFinancialParser from "../../hooks/useFinancialParser";
import { CORE_CATEGORY_REGISTRY } from "../../utils/constants";

export default function CashflowsReport() {
  const { getProductionLedger, getDatabaseTable, normalizeTransactionData, formatAmount } = useFinancialParser();
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(2026, 3, 1), 5), // Default to Last 6 Months ending April 2026
    to: new Date(2026, 3, 1)
  });

  const [allTransactions, setAllTransactions] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    async function load() {
      const [rawAccounts, productionLedger, budgets] = await Promise.all([
        getDatabaseTable("user_accounts"),
        getProductionLedger(),
        getDatabaseTable("budgets")
      ]);

      const seen = new Set();
      const uniqueAccs = (rawAccounts || []).filter(a => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });
      
      setAccounts(uniqueAccs);
      setAllTransactions(productionLedger || []);
      setAllBudgets(budgets || []);
    }
    load();
  }, [getProductionLedger, getDatabaseTable]);

  const intervalMonths = useMemo(() => {
    try {
      if (!dateRange.from || !dateRange.to) return [new Date(2026, 3, 1)];
      return eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    } catch (e) {
      return [new Date(2026, 3, 1)];
    }
  }, [dateRange]);

  const reportGrid = useMemo(() => {
    const allIncomes = new Set();
    const allExpenses = new Set();
    
    const monthlyData = intervalMonths.map(m => {
      const monthKey = format(m, "yyyy-MM");
      const savedBudget = (allBudgets || []).find(b => b.month === monthKey);
      const budgetRow = savedBudget || { month: monthKey, payload: { incomes: [], expenses: [] } };
      
      // Use the normalization engine for 1:1 parity with other reports
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

    const monthlyTotals = monthlyData.map(d => ({
      income: d.incomes.reduce((s, t) => s + (Number(t.amount) || 0), 0),
      expense: d.expenses.reduce((s, t) => s + (Number(t.amount) || 0), 0)
    }));

    return { 
      months: intervalMonths, 
      incomeRows, 
      expenseRows, 
      monthlyTotals 
    };
  }, [intervalMonths, allTransactions, allBudgets, accounts, normalizeTransactionData]);

  // Quick Preset Selection Helper
  const setRange = (months) => {
    const to = new Date(2026, 3, 1); // Anchor to April 2026 for this dataset
    const from = subMonths(to, months - 1);
    setDateRange({ from, to });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      {/* Premium Header */}
      <div className="max-w-[1600px] mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#1E293B] p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Cashflows
              </h1>
              <p className="text-slate-400 font-medium text-sm mt-1">Multi-month comparative performance analysis</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50">
            <button 
              onClick={() => setRange(3)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange.from.getMonth() === subMonths(new Date(2026,3,1), 2).getMonth() ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              LAST 3M
            </button>
            <button 
              onClick={() => setRange(6)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange.from.getMonth() === subMonths(new Date(2026,3,1), 5).getMonth() ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              LAST 6M
            </button>
            <button 
              onClick={() => setRange(12)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange.from.getFullYear() < 2026 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              FULL YEAR
            </button>
            <div className="w-[1px] h-6 bg-slate-700 mx-2" />
            <div className="flex items-center gap-3 px-4 text-slate-300 font-bold text-xs uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-indigo-400" />
              {format(dateRange.from, "MMM yyyy")} — {format(dateRange.to, "MMM yyyy")}
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Performance Grid */}
      <div className="max-w-[1600px] mx-auto bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-8 text-left min-w-[280px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance Grid</span>
                </th>
                {reportGrid.months.map((m, idx) => (
                  <th key={idx} className="p-8 text-center min-w-[160px]">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{format(m, "MMM 'yy")}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Liquidity Overview */}
              <tr className="bg-slate-50/20 group hover:bg-slate-50/50 transition-colors">
                <td className="p-8 font-bold text-slate-600 text-sm">Closing Balances</td>
                {reportGrid.monthlyTotals.map((t, idx) => {
                  const balance = reportGrid.monthlyTotals.slice(0, idx + 1).reduce((s, curr) => s + (curr.income - curr.expense), 0);
                  return (
                    <td key={idx} className="p-8 text-center font-black text-slate-800 text-sm tabular-nums">
                      {formatAmount(balance)}
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-indigo-50/10 group hover:bg-indigo-50/20 transition-colors">
                <td className="p-8 font-bold text-slate-600 text-sm">Monthly Surplus</td>
                {reportGrid.monthlyTotals.map((t, idx) => (
                  <td key={idx} className="p-8 text-center text-sm tabular-nums">
                    <div className={`inline-flex items-center gap-1.5 font-bold ${t.income - t.expense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${t.income - t.expense >= 0 ? '' : 'rotate-180'}`} />
                      {formatAmount(t.income - t.expense)}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Income Section */}
              <tr className="bg-slate-50/30">
                <td colSpan={reportGrid.months.length + 1} className="px-8 py-4">
                  <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Income Sources</span>
                </td>
              </tr>
              {reportGrid.incomeRows.map((row, rIdx) => (
                <tr key={rIdx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-8 text-sm font-medium text-slate-600 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                    {row.label}
                  </td>
                  {row.values.map((v, vIdx) => (
                    <td key={vIdx} className="p-8 text-center text-sm font-medium text-slate-500 tabular-nums">
                      {v > 0 ? formatAmount(v) : "—"}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Expense Section */}
              <tr className="bg-slate-50/30">
                <td colSpan={reportGrid.months.length + 1} className="px-8 py-4">
                  <span className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.2em]">Categorical Spending</span>
                </td>
              </tr>
              {reportGrid.expenseRows.map((row, rIdx) => (
                <tr key={rIdx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-8 text-sm font-medium text-slate-600 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 transition-colors" />
                    {row.label}
                  </td>
                  {row.values.map((v, vIdx) => (
                    <td key={vIdx} className="p-8 text-center text-sm font-medium text-slate-500 tabular-nums">
                      {v > 0 ? formatAmount(v) : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
