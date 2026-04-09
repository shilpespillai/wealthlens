import React, { useState, useMemo } from "react";
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
  addDays, 
  eachDayOfInterval,
  getYear,
  getMonth
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Premium Mock Transactions as seen in the screenshot
const MOCK_TRANSACTIONS = [
  { id: 1, date: "2026-04-10", label: "Rent", amount: 240.00, type: "expense", color: "bg-purple-600" },
  { id: 2, date: "2026-04-11", label: "Entertainment", amount: 75.00, type: "expense", color: "bg-emerald-500" },
  { id: 3, date: "2026-04-17", label: "Rent", amount: 240.00, type: "expense", color: "bg-purple-600" },
  { id: 4, date: "2026-04-18", label: "Entertainment", amount: 75.00, type: "expense", color: "bg-emerald-500" },
  { id: 5, date: "2026-04-14", label: "Eating Out", amount: 70.00, type: "expense", color: "bg-rose-500" },
  { id: 6, date: "2026-04-21", label: "Eating Out", amount: 70.00, type: "expense", color: "bg-rose-500" },
  { id: 7, date: "2026-04-21", label: "Repay Credit Card", amount: 150.00, type: "expense", color: "bg-red-600" },
  { id: 8, date: "2026-04-21", label: "Salary and Wages", amount: 1487.90, type: "income", color: "bg-teal-400" },
  { id: 9, date: "2026-04-22", label: "Groceries", amount: 250.00, type: "expense", color: "bg-blue-600" },
  { id: 10, date: "2026-04-24", label: "Rent", amount: 240.00, type: "expense", color: "bg-purple-600" },
  { id: 11, date: "2026-04-25", label: "Entertainment", amount: 75.00, type: "expense", color: "bg-emerald-500" },
  { id: 12, date: "2026-04-27", label: "Utilities", amount: 290.00, type: "expense", color: "bg-sky-500" },
  { id: 13, date: "2026-04-28", label: "Eating Out", amount: 70.00, type: "expense", color: "bg-rose-500" },
  { id: 14, date: "2026-04-30", label: "Depreciation...", amount: 112.38, type: "expense", color: "text-rose-500 font-medium" }, // Transparent style
  { id: 15, date: "2026-04-30", label: "Interest on...", amount: 47.92, type: "expense", color: "text-rose-500 font-medium" },
  { id: 16, date: "2026-05-01", label: "Rent", amount: 240.00, type: "expense", color: "bg-purple-600" },
  { id: 17, date: "2026-05-02", label: "Entertainment", amount: 75.00, type: "expense", color: "bg-emerald-500" },
];

const WEEKDAYS = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(val);

export default function BudgetCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // Default to April 2026 per mockup

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleMonthChange = (val) => {
    const newDate = new Date(currentDate.getFullYear(), parseInt(val), 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (val) => {
    const newDate = new Date(parseInt(val), currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  // Helper to get transactions for a specific day
  const getTransactionsForDay = (day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return MOCK_TRANSACTIONS.filter(t => t.date === dateStr);
  };

  // Simulate running balance (starting at a base value and adjusting)
  // In real use, this would be computed from starting balance + daily deltas
  const getRunningBalance = (day) => {
    // For visual consistency with mock:
    // If it's the start area of April, show 5191.91
    const dayOfMonth = day.getDate();
    const month = day.getMonth();
    if (month === 3) { // April
       if (dayOfMonth < 17) return 5191.91;
       if (dayOfMonth < 21) return 4876.91;
       if (dayOfMonth === 21) return 5909.81;
       if (dayOfMonth < 24) return 5659.81;
       if (dayOfMonth < 27) return 5344.81;
       if (dayOfMonth < 30) return 4984.81;
       return 4788.01;
    }
    if (month === 4) { // May
       if (dayOfMonth === 1) return 4548.01;
       return 4473.01;
    }
    return 5191.91; 
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F9FB]">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="text-slate-600 gap-2 hover:bg-slate-50 border border-slate-100 shadow-sm" onClick={() => {}}>
              <Plus className="w-4 h-4" />
              <span className="text-xs font-semibold">New budget</span>
           </Button>
        </div>

        <div className="flex items-center gap-4">
           {/* Navigation Controls */}
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
              <button 
                onClick={prevMonth}
                className="p-2 border-r border-slate-200 hover:bg-slate-50 transition-colors"
              >
                 <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-slate-50 transition-colors"
              >
                 <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
           </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Main Calendar Grid */}
      <div className="flex-1 overflow-auto bg-slate-200 p-[1px] grid grid-cols-7 gap-[1px]">
        {days.map((day, idx) => {
          const trans = getTransactionsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const balance = getRunningBalance(day);
          
          return (
            <div 
              key={idx} 
              className={`min-h-[140px] flex flex-col p-3 relative group transition-colors duration-200 ${
                isCurrentMonth ? 'bg-white' : 'bg-slate-50/70'
              } hover:bg-slate-50/40`}
            >
              {/* Date Header */}
              <div className="flex justify-end mb-2">
                <span className={`text-[11px] font-semibold ${
                  isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full -mr-1 -mt-1 shadow-md' : 
                  isCurrentMonth ? 'text-slate-400' : 'text-slate-300'
                }`}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Transactions List */}
              <div className="flex-1 space-y-1">
                {trans.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-1">
                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white truncate max-w-[80px] shadow-sm ${t.color.includes('text-') ? 'bg-transparent text-slate-600 italic' : t.color}`}>
                      {t.label}
                    </div>
                    <div className={`text-[9px] font-semibold whitespace-nowrap ${t.color.includes('text-') ? t.color : 'text-rose-500'}`}>
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Running Balance at Bottom */}
              <div className="mt-auto flex justify-center pt-2 border-t border-slate-50">
                 <span className="text-[10px] font-medium text-slate-400">
                    {formatCurrency(balance)}
                 </span>
              </div>

              {/* Hover Effect Add Button */}
              <button className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-indigo-500 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
