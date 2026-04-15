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
import { format, addMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";

// Shared Mock Generator (Seeded 5-month history)
const MOCK_TRANS_GEN = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];
  const transactions = [];
  const CATEGORY_CONFIG = [
    { name: "Salary", type: "income", amount: 5500 },
    { name: "Bonus", type: "income", amount: 2000 },
    { name: "Housing", type: "expense", amount: -1850 },
    { name: "Groceries", type: "expense", amount: -150 },
    { name: "Dining Out", type: "expense", amount: -45 },
    { name: "Transport", type: "expense", amount: -25 },
    { name: "Utilities", type: "expense", amount: -85 },
    { name: "Healthcare", type: "expense", amount: -210 },
    { name: "Entertainment", type: "expense", amount: -45.99 },
    { name: "Shopping", type: "expense", amount: -60 },
    { name: "Savings", type: "expense", amount: -500 },
    { name: "Investments", type: "expense", amount: -500 }
  ];
  months.forEach((m) => {
    CATEGORY_CONFIG.forEach((cat, cIdx) => {
      if (cat.name === "Bonus" && m !== "Jan") return;
      const day = (5 + (cIdx * 2)) % 28;
      transactions.push({
        id: `mock-${m}-${cat.name}`,
        date: `${m} ${day.toString().padStart(2, '0')} 2026`,
        merchant: cat.name,
        amount: cat.amount,
        category: cat.name,
        type: cat.type
      });
    });
  });
  return transactions;
})();

export default function CashflowsReport() {
  const { formatAmount, normalizeTransactionData } = useFinancialParser();
  
  // Date Range State (Unified Calendar Selection)
  const [dateRange, setDateRange] = useState({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 4, 31)
  });

  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    async function load() {
      const saved = await base44.user.loadData("wealthlens-full-ledger");
      
      const demoInterval = [
        new Date(2026, 0, 1), new Date(2026, 1, 1), 
        new Date(2026, 2, 1), new Date(2026, 3, 1), 
        new Date(2026, 4, 1)
      ];

      let combinedIncs = [];
      let combinedExps = [];

      demoInterval.forEach(month => {
        const { incomes: monthIncs, expenses: monthExps } = normalizeTransactionData(saved || [], month, MOCK_TRANS_GEN);
        combinedIncs = [...combinedIncs, ...monthIncs];
        combinedExps = [...combinedExps, ...monthExps];
      });

      setAllTransactions([...combinedIncs, ...combinedExps]);
    }
    load();
  }, [normalizeTransactionData]);

  const intervalMonths = useMemo(() => {
    try {
      if (!dateRange.from || !dateRange.to) return [new Date(2026, 4, 1)];
      return eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    } catch (e) {
      return [dateRange.from || new Date(2026, 4, 1)];
    }
  }, [dateRange]);

  const reportGrid = useMemo(() => {
    const INCOME_BASE = ["Salary", "Bonus"];
    const EXPENSE_BASE = ["Housing", "Groceries", "Dining Out", "Transport", "Utilities", "Healthcare", "Entertainment", "Shopping", "Savings", "Investments"];
    
    const getMonthValue = (month, category) => {
      return allTransactions
        .filter(t => {
          const tDate = t.date || t.actualDate;
          return t.category === category && isSameMonth(new Date(tDate), month);
        })
        .reduce((sum, t) => sum + Math.abs(t.monthlyAmount || t.amount || 0), 0);
    };

    const incomeRows = INCOME_BASE.map(cat => ({
      label: cat,
      values: intervalMonths.map(m => getMonthValue(m, cat))
    }));

    const expenseRows = EXPENSE_BASE.map(cat => ({
      label: cat,
      values: intervalMonths.map(m => getMonthValue(m, cat))
    }));

    const monthlySurplus = intervalMonths.map((m, i) => {
      const inc = incomeRows.reduce((s, r) => s + r.values[i], 0);
      const exp = expenseRows.reduce((s, r) => s + r.values[i], 0);
      return inc - exp;
    });

    const initialBalance = 5240.50; 
    const closingBalances = monthlySurplus.reduce((acc, surplus, i) => {
      const prev = i === 0 ? initialBalance : acc[i - 1];
      acc.push(prev + surplus);
      return acc;
    }, []);

    return { incomeRows, expenseRows, monthlySurplus, closingBalances };
  }, [allTransactions, intervalMonths]);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Premium Header - Moves up with scroll */}
      <div className="w-full px-6 pt-4 pb-2 bg-white z-20">
        <div className="bg-[#1E293B] rounded-3xl shadow-xl overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ArrowRightLeft className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-medium text-white tracking-tight">Cashflows</h1>
            </div>
            <div className="flex items-center gap-6">
               
               {/* Unified Calendar Range Selector */}
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
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto text-slate-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#1E293B] border-slate-700 shadow-2xl" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="text-white"
                    />
                  </PopoverContent>
               </Popover>

               <Button variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-[10px] font-medium uppercase tracking-widest gap-2">
                  <Download className="w-4 h-4" /> Export CSV
               </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-12 pt-6 bg-[#F8F9FB]">
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
