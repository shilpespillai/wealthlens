import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight,
  TrendingUp,
  ArrowRightLeft,
  PieChart as PieChartIcon, 
  Plus, 
  Trash2, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  AlertCircle,
  CheckCircle2,
  Calendar,
  Save,
  Download,
  Bot,
  Sparkles,
  Crown,
  Lock
} from "lucide-react";

import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  Sankey,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AuthGuard from "@/components/AuthGuard";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import CurrencySelector, { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { INITIAL_BUDGET_DATA } from "./SetBudget";


const EXPENSE_CATEGORIES = [
  { id: "fixed", label: "Fixed / Needs", color: "#B8D8BA", targetPct: 45 },
  { id: "variable", label: "Variable / Wants", color: "#E5C48B", targetPct: 30 },
  { id: "savings", label: "Savings & Debt", color: "#E5989B", targetPct: 20 },
  { id: "uncategorized", label: "Uncategorized", color: "#94A3B8", targetPct: 5 },
];

const DEFAULT_INCOMES = [
  { id: 1, name: "Primary Salary", monthlyAmount: 5000 },
];

const DEFAULT_EXPENSES = [
  { id: 1, name: "Rent / Mortgage", category: "fixed", monthlyAmount: 1800 },
  { id: 2, name: "Electricity / Gas / Water", category: "fixed", monthlyAmount: 250 },
  { id: 3, name: "Internet & Phone Plans", category: "fixed", monthlyAmount: 120 },
  { id: 4, name: "Groceries & Household", category: "variable", monthlyAmount: 800 },
  { id: 5, name: "Health & Insurance", category: "fixed", monthlyAmount: 200 },
];

const DEFAULT_GOALS = [
  { id: 1, name: "Emergency Fund", target: 10000, current: 2400 },
  { id: 2, name: "Family Travel", target: 5000, current: 750 },
  { id: 3, name: "Education Fund", target: 20000, current: 0 },
  { id: 4, name: "Medical Fund", target: 5000, current: 0 }
];

// Legacy mock data removed. Transaction visibility is now 100% relational through getProductionLedger.

function FamilyBudgetContent() {
  const { 
    parseCurrency, 
    formatAmount, 
    calculateMetrics, 
    syncData, 
    normalizeTransactionData,
    getDatabaseTable,
    getProductionLedger 
  } = useFinancialParser();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState("sankey"); // sankey or burndown

  const [currency, setCurrency] = useState("USD");
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [selectedVaultGoal, setSelectedVaultGoal] = useState("");
  const [vaultWithdrawAmount, setVaultWithdrawAmount] = useState("");
  const [isVaultAllocating, setIsVaultAllocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  // Load from server
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        // 1. Fetch budget for this month from the centralized table
        const allBudgets = await getDatabaseTable("budgets");
        const saved = (allBudgets || []).find(b => b.month === monthKey);
        
        // 2. Fetch real transactions from production ledger
        const productionLedger = await getProductionLedger({ month: monthKey });
        
        const { incomes: normIncs, expenses: normExps } = normalizeTransactionData(saved, selectedDate, productionLedger);
        
        setIncomes(normIncs);
        setExpenses(normExps);
        setAllTransactions(productionLedger);
        if (saved?.currency) setCurrency(saved.currency);
      } catch (err) {
        console.error("FamilyBudget initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [monthKey, normalizeTransactionData, selectedDate, getDatabaseTable, getProductionLedger]);

  const changeMonth = (offset) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + offset);
    setSelectedDate(next);
  };

  const selectMonthYear = (month, year) => {
    const next = new Date(selectedDate);
    if (year !== undefined) next.setFullYear(year);
    if (month !== undefined) next.setMonth(month);
    setSelectedDate(next);
  };

  const sym = getCurrencySymbol(currency);

    const aggregatedIncomes = useMemo(() => {
    const groups = incomes.reduce((acc, curr) => {
      const catName = curr.category || "Salary";
      const key = catName.toLowerCase();
      const st = (curr.spendType || 'income').toLowerCase();
      if (!acc[key]) acc[key] = { name: catName, amount: 0, count: 0, spendType: st };
      acc[key].amount += (curr.monthlyAmount || 0);
      acc[key].count += 1;
      return acc;
    }, {});
    return Object.values(groups);
  }, [incomes]);

  const aggregatedExpenses = useMemo(() => {
    const groups = expenses.reduce((acc, curr) => {
      const catName = curr.category || "Uncategorized";
      const key = catName.toLowerCase();
      const st = (curr.spendType || 'variable').toLowerCase();
      if (!acc[key]) acc[key] = { name: catName, amount: 0, count: 0, category: catName, spendType: st };
      acc[key].amount += (curr.monthlyAmount || 0);
      acc[key].count += 1;
      return acc;
    }, {});
    return Object.values(groups);
  }, [expenses]);



  const unifiedFlow = useMemo(() => {
    const incomesList = aggregatedIncomes.map(i => ({ ...i, flow: 'income', color: 'emerald' }));
    const expensesList = aggregatedExpenses.map(e => ({ ...e, flow: 'expense', color: 'rose' }));
    return [...incomesList, ...expensesList].sort((a, b) => b.amount - a.amount);
  }, [aggregatedIncomes, aggregatedExpenses]);

  const monthParam = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  const parseNum = (val) => {
    return parseFloat(val) || 0;
  };


  const metrics = useMemo(() => {
    const { totalIncome, totalExpenses, balance, savings } = calculateMetrics(incomes, expenses);

    const breakdown = EXPENSE_CATEGORIES.map(cat => {
      const catExpenses = expenses.filter(e => {
        const est = (e.spendType || "").toLowerCase();
        const ecat = (e.category || "").toLowerCase();
        return (est || (ecat === 'fixed' ? 'fixed' : 'variable')) === cat.id;
      });
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

    const fixedExpenses = expenses.filter(e => {
      const est = (e.spendType || "").toLowerCase();
      const ecat = (e.category || "").toLowerCase();
      return (est || (ecat === 'fixed' ? 'fixed' : 'variable')) === "fixed";
    }).reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    
    const variableWants = expenses.filter(e => {
      const est = (e.spendType || "").toLowerCase();
      const ecat = (e.category || "").toLowerCase();
      return (est || (ecat === 'fixed' ? 'fixed' : 'variable')) === "variable";
    }).reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);

    return { totalIncome, totalExpenses, balance, breakdown, pieData, fixedExpenses, variableWants, savings };
  }, [incomes, expenses, calculateMetrics]);

  const sankeyData = useMemo(() => {
    if ((incomes.length === 0 && expenses.length === 0) || metrics.totalIncome === 0) return null;

    const nodes = [];
    const links = [];

    const colors = {
      income: "#06b6d4",    // Cyan
      fixed: "#f59e0b",     // Amber
      variable: "#f43f5e",  // Rose
      savings: "#10b981",   // Emerald
      tax: "#f97316",       // Orange
      surplus: "#6366f1",   // Indigo
      gross: "#8b5cf6"      // Violet
    };

    const getSectionColor = (name, category = "", spendType = "") => {
      const n = (name || "").toLowerCase();
      const st = (spendType || "").toLowerCase();
      const c = (category || "").toLowerCase();
      
      if (n.includes("tax") || c.includes("tax")) return colors.tax;
      if (st === "fixed" || n.includes("rent") || n.includes("mortgage")) return colors.fixed;
      if (st === "variable" || n.includes("food") || n.includes("grocery")) return colors.variable;
      if (st === "savings" || n.includes("savings") || n.includes("invest")) return colors.savings;
      return "#94a3b8"; // Slate for unknown
    };

    const safeVal = (v) => {
      const num = Number(v) || 0;
      return Math.max(0.1, num); // Ensure minimal flow for Sankey to render links
    };

    const nodeNames = new Set();
    const safeNodePush = (node) => {
      let name = node.name || "Default";
      while (nodeNames.has(name)) {
        name += "\u00A0"; // Append non-breaking space until unique
      }
      nodeNames.add(name);
      nodes.push({ ...node, name });
    };

    // 1. Group Incomes by Name
    const groupedIncomes = incomes.reduce((acc, inc) => {
      const name = inc.name || "Source";
      if (!acc[name]) acc[name] = { name, amount: 0 };
      acc[name].amount += Number(inc.monthlyAmount) || 0;
      return acc;
    }, {});

    Object.values(groupedIncomes).forEach(inc => {
      safeNodePush({ name: inc.name, color: colors.income, value: inc.amount });
    });

    const grossIncomeIndex = nodes.length;
    const totalInc = Number(metrics.totalIncome) || 0;
    safeNodePush({ name: "Gross Income", color: colors.gross, value: totalInc });

    // Link Incomes to Gross
    Object.values(groupedIncomes).forEach((inc, i) => {
      links.push({ source: i, target: grossIncomeIndex, value: safeVal(inc.amount) });
    });

    // 2. Gross Income to Categories
    const fixedIndex = nodes.length;
    safeNodePush({ name: "Fixed Needs", color: colors.fixed, value: metrics.fixedExpenses });
    if (metrics.fixedExpenses > 0) {
      links.push({ source: grossIncomeIndex, target: fixedIndex, value: safeVal(metrics.fixedExpenses) });
    }

    const variableIndex = nodes.length;
    safeNodePush({ name: "Variable Wants", color: colors.variable, value: metrics.variableWants });
    if (metrics.variableWants > 0) {
      links.push({ source: grossIncomeIndex, target: variableIndex, value: safeVal(metrics.variableWants) });
    }

    const savingsIndex = nodes.length;
    safeNodePush({ name: "Savings", color: colors.savings, value: metrics.savings });
    if (metrics.savings > 0) {
      links.push({ source: grossIncomeIndex, target: savingsIndex, value: safeVal(metrics.savings) });
    }

    const surplusIndex = nodes.length;
    const bal = metrics.balance > 0 ? metrics.balance : 0;
    safeNodePush({ name: "Monthly Surplus", color: colors.surplus, value: bal });
    if (bal > 0) {
      links.push({ source: grossIncomeIndex, target: surplusIndex, value: safeVal(bal) });
    }

    // 3. Group Expenses by Name and Category
    const groupedExpensesMap = expenses.reduce((acc, exp) => {
      const name = exp.name || "Item";
      const st = exp.spendType || "variable";
      const key = `${name}-${st}`;
      if (!acc[key]) acc[key] = { name, st, amount: 0, category: exp.category };
      acc[key].amount += Number(exp.monthlyAmount) || 0;
      return acc;
    }, {});

    const sortedGroupedExpenses = Object.values(groupedExpensesMap).sort((a, b) => b.amount - a.amount);
    
    // Aggregation Logic: Keep top 15, group others
    const topCount = 15;
    const displayedExpenses = sortedGroupedExpenses.slice(0, topCount);
    const otherExpenses = sortedGroupedExpenses.slice(topCount);

    // Add Top Expenses
    displayedExpenses.forEach((exp) => {
      const color = getSectionColor(exp.name, exp.category, exp.st);
      const itemIndex = nodes.length;
      safeNodePush({ name: exp.name, color, value: exp.amount });
      
      let targetCatIndex = variableIndex;
      if (exp.st === "fixed") targetCatIndex = fixedIndex;
      if (exp.st === "savings") targetCatIndex = savingsIndex;
      
      links.push({ source: targetCatIndex, target: itemIndex, value: safeVal(exp.amount) });
    });

    // Add "Other" node if needed
    if (otherExpenses.length > 0) {
      // Group by spendType for "Other Fixed", "Other Variable", "Other Savings"
      const otherBySt = otherExpenses.reduce((acc, exp) => {
        if (!acc[exp.st]) acc[exp.st] = 0;
        acc[exp.st] += exp.amount;
        return acc;
      }, {});

      Object.entries(otherBySt).forEach(([st, amount]) => {
        if (amount <= 0) return;
        const name = `Diversified ${st === 'fixed' ? 'Needs' : (st === 'savings' ? 'Savings' : 'Outflows')}`;
        const itemIndex = nodes.length;
        safeNodePush({ name, color: "#94a3b8", value: amount });
        
        let targetCatIndex = variableIndex;
        if (st === "fixed") targetCatIndex = fixedIndex;
        if (st === "savings") targetCatIndex = savingsIndex;
        
        links.push({ source: targetCatIndex, target: itemIndex, value: safeVal(amount) });
      });
    }

    return { nodes, links };
  }, [incomes, expenses, metrics]);

  const radarData = useMemo(() => {
    return metrics.breakdown.map(b => ({
      subject: b.label,
      A: b.actualPct,
      B: b.targetPct,
      fullMark: 100
    }));
  }, [metrics.breakdown]);

  const burndownData = useMemo(() => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const today = selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear() 
      ? new Date().getDate() 
      : daysInMonth;

    const data = [];
    let cumulativeSpent = 0;
    const totalPlanned = metrics.totalExpenses || 1;

    // Daily actuals from ledger
    const dailyTotals = allTransactions.reduce((acc, t) => {
      const d = new Date(t.date || t.timestamp).getDate();
      if (!acc[d]) acc[d] = 0;
      if (t.type === 'expense' || t.spendType !== 'income') {
        acc[d] += Math.abs(t.monthlyAmount || t.amount || 0);
      }
      return acc;
    }, {});

    for (let i = 1; i <= daysInMonth; i++) {
      if (i <= today) {
        cumulativeSpent += (dailyTotals[i] || 0);
      }
      
      const remainingActual = i <= today ? Math.max(0, totalPlanned - cumulativeSpent) : null;
      const targetDecay = Math.max(0, totalPlanned - (totalPlanned / daysInMonth) * i);

      data.push({
        day: i,
        actual: remainingActual,
        target: targetDecay,
        label: `Day ${i}`
      });
    }
    return data;
  }, [allTransactions, metrics.totalExpenses, selectedDate]);

  const CustomSankeyNode = (props) => {
    const { x, y, width, height, payload, containerWidth } = props;
    if (isNaN(x) || isNaN(y) || isNaN(height) || !payload) return null;

    const isOut = x > (containerWidth || 1000) / 2;
    const nodeHeight = Math.max(2, height);

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={6}
          height={nodeHeight}
          fill={payload.color || "#10b981"}
          rx={2}
          className="transition-all duration-300 shadow-sm"
        />
        <text
          x={x + (isOut ? -12 : 18)}
          y={y + nodeHeight / 2 - 2}
          textAnchor={isOut ? "end" : "start"}
          fill="#1e293b"
          fontSize="9"
          fontWeight="800"
          className="uppercase tracking-tight"
        >
          {payload.name}
        </text>
        <text
          x={x + (isOut ? -12 : 18)}
          y={y + nodeHeight / 2 + 8}
          textAnchor={isOut ? "end" : "start"}
          fill="#94a3b8"
          fontSize="8"
          fontWeight="700"
        >
          {sym}{(payload.value || 0).toLocaleString()}
        </text>
      </g>
    );
  };

  const CustomSankeyLink = (props) => {
    const { sourceX, sourceY, targetX, targetY, linkWidth, payload } = props;
    
    // Explicitly pull color from the source node metadata provided by Recharts
    const color = payload?.source?.color || "#cbd5e1";
    
    const finalWidth = linkWidth || (payload && payload.value ? Math.max(2, payload.value / 400) : 4);
    if (isNaN(sourceX) || isNaN(targetX) || isNaN(sourceY) || isNaN(targetY)) return null;

    const cpX = (sourceX + targetX) / 2;
    const d = `M${sourceX},${sourceY} 
               C${cpX},${sourceY} 
               ${cpX},${targetY} 
               ${targetX},${targetY}`;

    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(2, finalWidth)}
        strokeOpacity={0.45}
        className="transition-all duration-300 hover:stroke-opacity-80"
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const vaultData = useMemo(() => {
     // Aggregate surplus from the production ledger
     const surplusNow = allTransactions.reduce((sum, t) => {
       const amount = Math.abs(t.monthlyAmount || t.amount || 0);
       return (t.type === 'income' || t.spendType === 'income') ? sum + amount : sum - amount;
     }, 0);
     
     const allocated = Number(localStorage.getItem('wealthlens-vault-allocated')) || 0;
     // Base surplus starts with the historical seed (12450) + current ledger delta
     return { remaining: Math.max(0, 12450 + surplusNow - allocated), allocated };
  }, [allTransactions]);

  const handleVaultWithdraw = (goalId, amount) => {
    const withdrawal = Number(amount);
    if (!goalId) return toast.error("Please select a goal first");
    if (isNaN(withdrawal) || withdrawal <= 0) return toast.error("Enter a valid amount");
    if (withdrawal > vaultData.remaining) return toast.error("Insufficient funds in the vault");
    
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + withdrawal } : g));
    const newAllocated = vaultData.allocated + withdrawal;
    localStorage.setItem('wealthlens-vault-allocated', newAllocated.toString());
    
    toast.success(`Allocated ${getCurrencySymbol(currency)}${(withdrawal || 0).toLocaleString()} from vault to ${goals.find(g => g.id === goalId)?.name}`);
    setVaultWithdrawAmount("");
  };




  return (
    <div className="min-h-screen bg-white font-sans pb-10 flex flex-col">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2">
        <div className="bg-[#3b4754] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          {/* Header Area */}
          <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#2D3748] flex items-center justify-center border border-[#C5A059]/30">
                  <PiggyBank className="w-4 h-4 text-[#C5A059]" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-medium text-[#C5A059] tracking-tight leading-none mb-1">Budget Planner</h1>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-[#2D3748] rounded text-[#C5A059]/60 hover:text-[#C5A059]">
                      <TrendingUp className="w-3 h-3 rotate-[270deg]" />
                    </button>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-sm font-medium text-[#C5A059] bg-[#2D3748] px-3 py-1 rounded-md uppercase tracking-wider hover:bg-[#1A202C] border border-[#C5A059]/20 transition-colors flex items-center gap-2">
                          {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                          <Calendar className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-4 rounded-2xl shadow-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                          <button onClick={() => selectMonthYear(undefined, selectedDate.getFullYear() - 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                            <TrendingUp className="w-3 h-3 rotate-[270deg]" />
                          </button>
                          <span className="font-bold text-slate-700">{selectedDate.getFullYear()}</span>
                          <button onClick={() => selectMonthYear(undefined, selectedDate.getFullYear() + 1)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
                            <TrendingUp className="w-3 h-3 rotate-90" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
                            const isSelected = selectedDate.getMonth() === i;
                            return (
                              <button
                                key={i}
                                onClick={() => selectMonthYear(i)}
                                className={`py-2 text-xs font-bold rounded-lg transition-all ${isSelected ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                              >
                                {monthName}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-[#2D3748] rounded text-[#C5A059]/60 hover:text-[#C5A059]">
                      <TrendingUp className="w-3 h-3 rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24">
                <CurrencySelector value={currency} onChange={setCurrency} />
              </div>
            </div>
          </div>

          {/* Metric Banner Area */}
          <div className="bg-[#3b4754] text-[#C5A059] py-4 px-6 relative z-0">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="text-center w-full px-2">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{incomes.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">TOTAL INCOME</p>
              </div>
              <div className="text-center w-full px-2 border-l border-white/5">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{expenses.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">TOTAL SPENT</p>
              </div>
              <div className="text-center border-l border-white/5 w-full px-2">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{Math.max(0, incomes.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0) - expenses.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0)).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">TOTAL SAVED</p>
              </div>
              <div className="text-center border-l border-white/5 w-full px-2">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{expenses.filter(e => e.name?.toLowerCase().includes('debt') || e.name?.toLowerCase().includes('loan') || e.category?.toLowerCase() === 'debt').reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">TOTAL DEBT PAID</p>
              </div>
              <div className="text-center border-l border-white/5 w-full px-2">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{Math.max(0, incomes.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0) - expenses.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0)).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">LEFT TO SPEND</p>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Main Panel starts below Navbar */}
      <div className="bg-slate-50 min-h-screen pt-4">




      {/* Sankey Chart Re-Positioned to the top under metrics */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Financial Flow Intelligence</h3>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Live Granular Flow Analysis</p>
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setActiveView("sankey")}
                    className={`px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all ${activeView === 'sankey' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Flow
                  </button>
                  <button 
                    onClick={() => setActiveView("burndown")}
                    className={`px-3 py-1 text-[8px] font-black uppercase rounded-md transition-all ${activeView === 'burndown' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Velocity
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Managed</p>
                <p className="text-md font-black text-[#C5A059] leading-none">{formatAmount(metrics.totalIncome)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#2D3748] flex items-center justify-center border border-[#C5A059]/20">
                <TrendingUp className="w-5 h-5 text-[#C5A059]" />
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full mt-2">
            {activeView === 'sankey' ? (
              sankeyData && sankeyData.nodes.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Sankey
                    data={sankeyData}
                    node={<CustomSankeyNode />}
                    link={<CustomSankeyLink />}
                    nodePadding={45}
                    margin={{ left: 100, right: 200, top: 40, bottom: 40 }}
                    sort={false}
                  >
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isLink = data.source && data.target;
                          const name = isLink 
                            ? `${data.source.name} → ${data.target.name}` 
                            : (data.name || 'Financial Flow');
                          const value = data.value || 0;
                          const color = isLink ? data.source.color : (data.color || "#6366f1");

                          return (
                            <div className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 transition-all min-w-[200px] z-[999]">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{name}</p>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: color}} />
                                <p className="text-xl font-black text-slate-800">{sym}{(Number(value) || 0).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </Sankey>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <PieChartIcon className="w-6 h-6 opacity-30 text-slate-400" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Add inputs below to generate flow</p>
                </div>
              )
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burndownData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                    dy={10}
                    label={{ value: 'DAY OF MONTH', position: 'insideBottom', offset: -10, fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                    tickFormatter={(val) => `${sym}${Math.round(val/1000)}k`}
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[180px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Day {payload[0].payload.day} Consumption</p>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Remaining</span>
                                <span className="text-md font-black text-slate-900">{sym}{Math.round(payload[0].value).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Target Pace</span>
                                <span className="text-xs font-bold text-[#C5A059]">{sym}{Math.round(payload[1].value).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#1e293b" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#1e293b', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    name="Actual Remaining"
                    connectNulls
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="target" 
                    stroke="#C5A059" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target Decay"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (


        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Syncing budget data...</p>
        </div>
      ) : (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total Monthly Income</p>

              <h2 className="text-2xl font-medium text-slate-700 tracking-tight">{formatAmount(metrics.totalIncome)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total Monthly Expenses</p>

              <h2 className="text-2xl font-medium text-slate-700 tracking-tight">{formatAmount(metrics.totalExpenses)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={`rounded-xl p-4 border shadow-sm flex items-center justify-between ${metrics.balance >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-widest mb-1 ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Remaining Balance</p>
              <h2 className={`text-2xl font-medium tracking-tight ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {metrics.balance >= 0 ? '+' : '-'}{formatAmount(Math.abs(metrics.balance))}
              </h2>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <TrendingUp className={`w-5 h-5 ${metrics.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
          </motion.div>
        </div>





        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-7 space-y-4">

            {/* Household Vault & Global Savings Engine - Relocated to reduce width */}
            <motion.div 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}}
              className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
            >
              <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-700 tracking-tight leading-none text-md">Vault</h3>
                      <span className="text-[8px] font-medium bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Locked</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xl font-medium text-slate-700">{getCurrencySymbol(currency)}{vaultData.remaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full xl:w-auto">
                  {!isVaultAllocating ? (
                    <Button 
                      onClick={() => setIsVaultAllocating(true)}
                      disabled={vaultData.remaining <= 0}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-[10px] h-9 px-4 shadow-lg shadow-indigo-100 transition-all active:scale-95 w-full xl:w-auto"
                    >
                      Fund Goals
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100 animate-in slide-in-from-right-2 duration-300">
                      <select 
                        value={selectedVaultGoal}
                        onChange={(e) => setSelectedVaultGoal(Number(e.target.value))}
                        className="bg-transparent border-none text-[10px] font-black text-slate-700 outline-none w-24 px-1 cursor-pointer"
                      >
                        <option value="">Select Goal</option>
                        {goals.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <div className="w-px h-4 bg-slate-200" />
                      <div className="relative min-w-[60px]">
                        <input 
                          type="number"
                          placeholder="0"
                          value={vaultWithdrawAmount}
                          onChange={(e) => setVaultWithdrawAmount(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg h-7 pl-2 pr-1 text-[10px] font-black outline-none focus:border-indigo-400"
                        />
                      </div>
                      <button 
                        onClick={() => handleVaultWithdraw(selectedVaultGoal, vaultWithdrawAmount)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest"
                      >
                        Ok
                      </button>
                      <button onClick={() => setIsVaultAllocating(false)} className="p-1 text-slate-400 hover:text-slate-600"><Plus className="w-3.5 h-3.5 rotate-45" /></button>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full blur-2xl -mr-12 -mt-12" />
            </motion.div>


                    {/* Aggregated Overview Pane — Now with Donut Chart */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Cash Flow</h3>
                    <p className="text-sm text-slate-500 font-medium">Categorical contribution to your monthly budget.</p>
                 </div>
                 <Link to={`/Transactions?month=${monthParam}`}>
                    <Button variant="outline" className="gap-2 h-10 px-5 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest transition-all">
                       Audit Ledger <ChevronRight className="w-4 h-4" />
                    </Button>
                 </Link>
               </div>

               <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                  {unifiedFlow.length === 0 ? (
                     <div className="w-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                        <p className="text-sm text-slate-400 font-medium tracking-tight uppercase tracking-widest">No transaction data in ledger for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
                     </div>
                  ) : (
                     <>
                        <div className="w-full md:w-1/2 h-[320px] relative">
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Monthly Flow</span>
                             <span className="text-2xl font-medium text-slate-800 tracking-tighter">{formatAmount(metrics.totalExpenses)}</span>
                           </div>
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={unifiedFlow.map(item => ({ ...item, value: Math.abs(item.amount) }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={85}
                                    outerRadius={115}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    onClick={(data) => {
                                       if (data && data.name) {
                                         navigate(`/Transactions?search=${encodeURIComponent(data.name)}&month=${monthParam}`);
                                       }
                                    }}
                                    className="cursor-pointer outline-none"
                                 >
                                    {unifiedFlow.map((entry, index) => (
                                       <Cell 
                                         key={`cell-${index}`} 
                                         fill={entry.flow === 'income' ? '#06b6d4' : (entry.spendType === 'fixed' ? '#f59e0b' : (entry.spendType === 'savings' ? '#10b981' : '#f43f5e'))} 
                                         className="hover:scale-105 transition-transform duration-300"
                                       />
                                    ))}
                                 </Pie>
                                 <RechartsTooltip 
                                    formatter={(value) => formatAmount(value)}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}
                                 />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Breakdown by Category</h4>
                          {unifiedFlow.map((item, index) => (
                            <div 
                              key={index}
                              onClick={() => navigate(`/Transactions?search=${encodeURIComponent(item.name)}&month=${monthParam}`)}
                              className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 rounded-full shadow-lg shadow-current ring-4 ring-offset-0 ring-current/10" style={{ color: item.flow === 'income' ? '#06b6d4' : (item.spendType === 'fixed' ? '#f59e0b' : (item.spendType === 'savings' ? '#10b981' : '#f43f5e')), backgroundColor: 'currentColor' }} />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-purple-600 transition-colors uppercase">{item.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.count} Transactions</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-serif font-bold tracking-tight ${item.flow === 'income' ? 'text-cyan-600' : 'text-slate-700'}`}>
                                  {item.flow === 'income' ? '+' : '-'}{formatAmount(item.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                     </>
                  )}
               </div>

          </div>

          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* The 50/30/20 Rule Analysis */}
            <div className="bg-[#2D3748] border border-slate-700 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="text-xl font-medium text-white/95 mb-6 flex items-center gap-3">
                <PieChartIcon className="w-5 h-5 text-[#E5C48B]" />
                The 50/30/20 Analysis
              </h3>
              
              <div className="space-y-6">
                {metrics.breakdown.map((b) => (
                  <div key={b.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white/90 text-sm tracking-tight">{b.label}</span>
                          <span className="text-[9px] font-medium text-[#2D3748] px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{backgroundColor: b.color}}>
                            Target {b.targetPct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl font-medium tracking-tighter" style={{color: b.color}}>{b.actualPct.toFixed(1)}%</span>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Live Flow</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest block mb-0.5">{formatAmount(b.targetAmount)} Goal</span>
                        {b.isOver ? (
                          <span className="text-[10px] font-medium text-rose-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> {formatAmount(Math.abs(b.diff))} Variance
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" /> {formatAmount(Math.abs(b.diff))} Savings
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Bullet Chart for 50/30/20 */}
                    <div className="relative h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="absolute h-full rounded-full transition-all duration-700 opacity-90 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                        style={{ backgroundColor: b.color, width: `${b.actualPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Budget Integrity Radar */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget Integrity Radar</h4>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Target</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Actual</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={false}
                        axisLine={false}
                      />
                      <Radar
                        name="Target"
                        dataKey="B"
                        stroke="#C5A059"
                        fill="#C5A059"
                        fillOpacity={0.1}
                      />
                      <Radar
                        name="Actual"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.5}
                      />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                             return (
                               <div className="bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-700">
                                 <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{payload[0].payload.subject}</p>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-400">Actual: {payload[0].value.toFixed(1)}%</p>
                                    <p className="text-[10px] font-bold text-[#C5A059]">Target: {payload[1].value}%</p>
                                 </div>
                               </div>
                             );
                          }
                          return null;
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Pie Chart */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-6 text-center">Relative Distribution</h4>
                {metrics.pieData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {metrics.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => sym + value.toLocaleString()}
                          itemStyle={{ fontSize: 13, fontWeight: 'medium', color: '#111827' }}
                          contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#F3F4F6', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-xs py-8 font-medium">Add inputs to generate flow analysis</p>
                )}
              </div>
              {/* Family Savings Pillars */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Savings Velocity Pillars</h4>
                  <TrendingUp className="w-4 h-4 text-[#E5C48B]" />
                </div>
                <div className="space-y-6">
                  {goals.map((g) => {
                    const pct = Math.min((g.current / (g.target || 1)) * 100, 100);
                    return (
                      <div key={g.id} className="space-y-2.5">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[11px] font-medium text-white/90 uppercase tracking-tight">{g.name}</p>
                            <p className="text-[10px] font-medium text-slate-400">
                              {sym}{g.current.toLocaleString()} / {sym}{g.target.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-[#B8D8BA]">{pct.toFixed(0)}%</span>
                        </div>
                        {/* High-Precision Bullet Chart */}
                        <div className="relative h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className="h-full bg-emerald-500/80 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-700"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guides & Tips */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-[32px] p-8 shadow-xl">
              <h4 className="font-medium text-white/95 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#E5C48B]" />
                Portfolio Guidance
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                The <strong className="font-medium text-white">50/30/20 rule</strong> is an institutional-grade framework for capital allocation. We recommend deploying <span className="text-white">50% to essentials</span>, <span className="text-white">30% to living luxuries</span>, and scaling <span className="text-white">20% into wealth-building assets</span>.
              </p>
            </div>


          </div>
        </div>
      </div>
      )}
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
