import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  PieChart as PieChartIcon, 
  Plus, 
  Trash2, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Save,
  Download
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AuthGuard from "@/components/AuthGuard";
import { createPageUrl } from "@/utils";
import CurrencySelector, { getCurrencySymbol } from "@/components/calculator/CurrencySelector";

const EXPENSE_CATEGORIES = [
  { id: "fixed", label: "Fixed / Needs", color: "#3b82f6", targetPct: 50 },
  { id: "variable", label: "Variable / Wants", color: "#f59e0b", targetPct: 30 },
  { id: "savings", label: "Savings & Debt", color: "#10b981", targetPct: 20 },
];

const DEFAULT_INCOMES = [
  { id: 1, name: "Primary Salary", monthlyAmount: 5000 },
];

const DEFAULT_EXPENSES = [
  { id: 1, name: "Rent / Mortgage", category: "fixed", monthlyAmount: 1500 },
  { id: 2, name: "Utilities", category: "fixed", monthlyAmount: 200 },
  { id: 3, name: "Groceries", category: "variable", monthlyAmount: 600 },
  { id: 4, name: "Entertainment", category: "variable", monthlyAmount: 300 },
  { id: 5, name: "Emergency Fund", category: "savings", monthlyAmount: 500 },
];

function FamilyBudgetContent() {
  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' | 'annual'
  const [currency, setCurrency] = useState("USD");
  const [incomes, setIncomes] = useState(DEFAULT_INCOMES);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [nextIncomeId, setNextIncomeId] = useState(2);
  const [nextExpenseId, setNextExpenseId] = useState(6);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wealthlens-family-budget");
      if (saved) {
        const { incomes: savedIncomes, expenses: savedExpenses, currency: savedCurrency } = JSON.parse(saved);
        if (savedIncomes) { setIncomes(savedIncomes); setNextIncomeId(Math.max(...savedIncomes.map(i => i.id), 0) + 1); }
        if (savedExpenses) { setExpenses(savedExpenses); setNextExpenseId(Math.max(...savedExpenses.map(e => e.id), 0) + 1); }
        if (savedCurrency) setCurrency(savedCurrency);
      }
    } catch (e) { console.error("Could not load budget", e); }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("wealthlens-family-budget", JSON.stringify({ incomes, expenses, currency }));
      toast.success("Budget saved locally!");
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const sym = getCurrencySymbol(currency);
  const multiplier = viewMode === "annual" ? 12 : 1;
  const fmt = (val) => `${sym}${(val * multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const rawFmt = (val) => (val * multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 });

  const addIncome = () => {
    setIncomes([...incomes, { id: nextIncomeId, name: "", monthlyAmount: 0 }]);
    setNextIncomeId(nextIncomeId + 1);
  };
  const removeIncome = (id) => setIncomes(incomes.filter(i => i.id !== id));
  const updateIncome = (id, field, val) => setIncomes(incomes.map(i => i.id === id ? { ...i, [field]: val } : i));

  const addExpense = () => {
    setExpenses([...expenses, { id: nextExpenseId, name: "", category: "variable", monthlyAmount: 0 }]);
    setNextExpenseId(nextExpenseId + 1);
  };
  const removeExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));
  const updateExpense = (id, field, val) => setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: val } : e));

  const parseNum = (val, currentView) => {
    const num = parseFloat(val) || 0;
    return currentView === "annual" ? num / 12 : num;
  };

  const metrics = useMemo(() => {
    const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    const expensesOnly = expenses.filter(e => e.category !== "savings").reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    const savingsOnly = expenses.filter(e => e.category === "savings").reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    const totalExpenses = expensesOnly + savingsOnly; // Sum of expense and saving columns as requested
    const balance = totalIncome - totalExpenses;

    const breakdown = EXPENSE_CATEGORIES.map(cat => {
      const catExpenses = expenses.filter(e => e.category === cat.id);
      const amount = catExpenses.reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
      const actualPct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      const targetAmount = (totalIncome * cat.targetPct) / 100;
      const diff = amount - targetAmount;
      const progress = Math.min((amount / (targetAmount || 1)) * 100, 100);
      const isOver = actualPct > cat.targetPct;

      return {
        ...cat,
        amount,
        actualPct,
        targetAmount,
        diff,
        progress,
        isOver
      };
    });

    const pieData = breakdown.filter(b => b.amount > 0).map(b => ({
      name: b.label,
      value: b.amount,
      color: b.color
    }));

    return { totalIncome, totalExpenses, balance, breakdown, pieData };
  }, [incomes, expenses]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Calculator")} className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">← Back to Tools</Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Family Budget Planner</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24">
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-32 h-9 bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="annual">Annual View</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 px-4 rounded-lg shadow-sm">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total {viewMode === 'annual' ? 'Annual' : 'Monthly'} Income</p>
              <h2 className="text-3xl font-black text-slate-800">{fmt(metrics.totalIncome)}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total {viewMode === 'annual' ? 'Annual' : 'Monthly'} Expenses</p>
              <h2 className="text-3xl font-black text-slate-800">{fmt(metrics.totalExpenses)}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-rose-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={`rounded-2xl p-6 border shadow-sm flex items-center justify-between ${metrics.balance >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div>
              <p className={`text-sm font-medium mb-1 ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Remaining Balance</p>
              <h2 className={`text-3xl font-black ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {metrics.balance >= 0 ? '+' : '-'}{fmt(Math.abs(metrics.balance))}
              </h2>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metrics.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <TrendingUp className={`w-6 h-6 ${metrics.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Income Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Income Sources</h3>
                <Button variant="outline" size="sm" onClick={addIncome} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-8 rounded-lg">
                  <Plus className="w-4 h-4 mr-1" /> Add Income
                </Button>
              </div>
              <div className="space-y-3">
                {incomes.map((inc) => (
                  <div key={inc.id} className="flex flex-col sm:flex-row gap-3 items-center group">
                    <Input 
                      placeholder="Income Label (e.g. Salary)" 
                      value={inc.name} 
                      onChange={(e) => updateIncome(inc.id, "name", e.target.value)}
                      className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                    />
                    <div className="relative w-full sm:w-48">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                      <Input 
                        type="number"
                        placeholder="0" 
                        value={inc.monthlyAmount ? (inc.monthlyAmount * multiplier).toString() : ""} 
                        onChange={(e) => updateIncome(inc.id, "monthlyAmount", parseNum(e.target.value, viewMode))}
                        className="pl-8 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                      />
                    </div>
                    <button onClick={() => removeIncome(inc.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Expenses & Savings</h3>
                  <p className="text-sm text-slate-500">Categorize to see your 50/30/20 breakdown</p>
                </div>
                <Button variant="outline" size="sm" onClick={addExpense} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-8 rounded-lg">
                  <Plus className="w-4 h-4 mr-1" /> Add Expense
                </Button>
              </div>
              <div className="space-y-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex flex-col sm:flex-row gap-3 items-center group">
                    <Input 
                      placeholder="Expense Label" 
                      value={exp.name} 
                      onChange={(e) => updateExpense(exp.id, "name", e.target.value)}
                      className="flex-1 bg-slate-50 border-slate-200"
                    />
                    <Input 
                      placeholder="Category" 
                      value={exp.category} 
                      onChange={(e) => updateExpense(exp.id, "category", e.target.value.toLowerCase())}
                      className="w-full sm:w-40 bg-slate-50 border-slate-200 text-sm"
                    />
                    <div className="relative w-full sm:w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={exp.monthlyAmount ? (exp.monthlyAmount * multiplier).toString() : ""} 
                        onChange={(e) => updateExpense(exp.id, "monthlyAmount", parseNum(e.target.value, viewMode))}
                        className="pl-8 bg-slate-50 border-slate-200 focus-visible:ring-rose-500"
                      />
                    </div>
                    <button onClick={() => removeExpense(exp.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* The 50/30/20 Rule Analysis */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                The 50/30/20 Breakdown
              </h3>
              
              <div className="space-y-6">
                {metrics.breakdown.map((b) => (
                  <div key={b.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{b.label}</span>
                          <span className="text-xs font-bold text-white px-1.5 py-0.5 rounded-md" style={{backgroundColor: b.color}}>
                            {b.targetPct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold" style={{color: b.color}}>{b.actualPct.toFixed(1)}% Actual</span>
                          <span className="text-xs text-slate-400">({fmt(b.amount)})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block mb-0.5">Target: {fmt(b.targetAmount)}</span>
                        {b.isOver ? (
                          <span className="text-xs font-medium text-rose-500 flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> {fmt(Math.abs(b.diff))} over
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-500 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" /> {fmt(Math.abs(b.diff))} under
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${b.progress}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Pie Chart */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-600 mb-4 text-center">Your Actual Expense Distribution</h4>
                {metrics.pieData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {metrics.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => sym + value.toLocaleString()}
                          itemStyle={{ fontSize: 13, fontWeight: 'bold' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-400 text-sm py-8">Add expenses to see chart</p>
                )}
              </div>
            </div>

            {/* Guides & Tips */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6">
              <h4 className="font-bold text-indigo-900 mb-2">Rule of Thumb</h4>
              <p className="text-sm text-indigo-800/80 leading-relaxed">
                The <strong className="text-indigo-900">50/30/20 rule</strong> is a simple budgeting method that can help you manage your money effectively. The basic rule of thumb is to divide up after-tax income and allocate it to spend: 50% on needs, 30% on wants, and socking away 20% to savings.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyBudgetPage() {
  return (
    <AuthGuard>
      <FamilyBudgetContent />
    </AuthGuard>
  );
}
