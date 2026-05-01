import React, { useState, useMemo, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parse,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { base44 } from "@/api/base44Client";
import { robustParseDate } from "@/utils/dateParser";

// Accessing the shared mock generator logic
const CATEGORY_MAP = [
  { name: "Salary", color: "bg-teal-400" },
  { name: "Bonus", color: "bg-teal-500" },
  { name: "Housing", color: "bg-purple-600" },
  { name: "Groceries", color: "bg-blue-600" },
  { name: "Dining Out", color: "bg-rose-500" },
  { name: "Transport", color: "bg-sky-500" },
  { name: "Utilities", color: "bg-amber-500" },
  { name: "Healthcare", color: "bg-red-600" },
  { name: "Entertainment", color: "bg-emerald-500" },
  { name: "Shopping", color: "bg-indigo-500" },
  { name: "Savings", color: "bg-rose-600" },
  { name: "Investments", color: "bg-slate-600" }
];

const WEEKDAYS = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Mock Data removed in favor of production ledger fetching.

export default function BudgetCalendar() {
  const { formatAmount, normalizeTransactionData, getProductionLedger, getDatabaseTable } = useFinancialParser();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // Default to April 2026 per current demo context
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [historicalSurplus, setHistoricalSurplus] = useState(0);

  const monthKey = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [currentDate]);

  // Load and Normalize Categorical Data
  const [rawTransactions, setRawTransactions] = useState([]);

  useEffect(() => {
    async function initData() {
      // Optimized: Only fetch ledger data if the tab is visible
      if (document.visibilityState !== 'visible') {
        console.log("[Calendar] Data sync paused (Tab hidden).");
        return;
      }

      const allBudgets = await getDatabaseTable("budgets");
      const saved = (allBudgets || []).find((b) => b.month === monthKey);

      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      
      const productionLedger = await getProductionLedger({ 
        startDate: start.getTime(), 
        endDate: end.getTime() 
      });
      
      // Store raw transactions for individual calendar rendering
      setRawTransactions(productionLedger || []);

      // Still compute aggregated data if needed for summary purposes
      const accounts = await getDatabaseTable("user_accounts");
      setDbAccounts(accounts || []);

      const { incomes: normIncs, expenses: normExps } = normalizeTransactionData(saved, currentDate, productionLedger, accounts || [], { ignoreMonthFilter: true });
      setIncomes(normIncs);
      setExpenses(normExps);

      // Fetch starting balance (Total surplus of all past months)
      const fullLedger = await getProductionLedger();
      const startOfThisMonth = startOfMonth(currentDate);
      const totalPastSurplus = fullLedger
        .filter((t) => robustParseDate(t.date || t.actualDate) < startOfThisMonth)
        .reduce((sum, t) => {
          const val = Math.abs(t.amount || 0);
          return t.type === "income" ? sum + val : sum - val;
        }, 0);

      setHistoricalSurplus(12450 + totalPastSurplus); // Base seed + cumulative
    }
    initData();

    // Resume when tab returns to focus
    const handleVisibility = () => {
        if (document.visibilityState === 'visible') initData();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [monthKey, normalizeTransactionData, currentDate, getProductionLedger, getDatabaseTable]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleMonthChange = (val) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(val), 1));
  const handleYearChange = (val) => setCurrentDate(new Date(parseInt(val), currentDate.getMonth(), 1));

  // Dynamic Transaction Parser - Now uses RAW transactions to prevent aggregation loss
  const getTransactionsForDay = (day) => {
    const isMatchingDay = (itemDate) => {
      if (!itemDate) return false;
      const d = robustParseDate(itemDate);
      return d && isSameDay(d, day);
    };

    return rawTransactions
      .filter(t => isMatchingDay(t.date || t.actualDate))
      .map(tx => {
        const catInfo = CATEGORY_MAP.find(c => c.name === tx.category);
        const amount = Number(tx.amount) || 0;
        const type = (tx.type || "").toLowerCase() === 'income' ? 'income' : (amount > 0 ? 'income' : 'expense');
        
        return { 
          ...tx, 
          type,
          label: tx.merchant || tx.name || tx.category || 'Transaction',
          color: catInfo ? catInfo.color : (type === 'income' ? 'bg-teal-400' : 'bg-slate-500') 
        };
      });
  };

  const getRunningBalance = (day) => {
    const currentDay = startOfDay(day);
    let monthDelta = 0;
    
    const isBeforeOrSame = (itemDate) => {
      if (!itemDate) return false;
      const d = robustParseDate(itemDate);
      return d && startOfDay(d) <= currentDay;
    };

    incomes.forEach(i => {
      if (isBeforeOrSame(i.date)) monthDelta += Number(i.amount || 0);
    });

    expenses.forEach(e => {
      if (isBeforeOrSame(e.date)) monthDelta -= Math.abs(Number(e.amount || 0));
    });

    return historicalSurplus + monthDelta;
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FB]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-slate-600 gap-2 hover:bg-slate-50 border border-slate-100 shadow-sm">
            <Plus className="w-4 h-4" />
            <span className="text-xs font-semibold">New Entry</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 shadow-sm">
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs font-medium text-slate-600 px-3">
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px] h-9 text-slate-700 font-medium border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, idx) => (
                  <SelectItem key={m} value={idx.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[90px] h-9 text-slate-700 font-medium border-none shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg shadow-sm overflow-hidden bg-white">
            <button onClick={prevMonth} className="p-2 border-r border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-auto bg-slate-200 p-[1px] grid grid-cols-7 gap-[1px]">
        {days.map((day, idx) => {
          const trans = getTransactionsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const balance = getRunningBalance(day);
          
          return (
            <div key={idx} className={`min-h-[140px] flex flex-col p-3 relative group transition-all duration-300 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}`}>
              <div className="flex justify-end mb-2">
                <span className={`text-[11px] font-bold ${isToday ? 'bg-purple-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-lg' : isCurrentMonth ? 'text-slate-500' : 'text-slate-300'}`}>
                  {format(day, "d")}
                </span>
              </div>

              <div className="flex-1 space-y-1.5 overflow-hidden">
                {trans.map((t, tIdx) => (
                  <div key={tIdx} className="flex flex-col gap-0.5 group/item cursor-pointer">
                    <div className={`px-1.5 py-1 rounded text-[9px] font-bold text-white truncate shadow-sm transition-transform group-hover/item:scale-[1.02] ${t.color}`}>
                      {t.label}
                    </div>
                    <div className="px-1 text-[8px] font-bold text-slate-400">
                      {t.type === 'income' ? '+' : '-'}{formatAmount(t.amount || 0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Balance removed per user request */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
