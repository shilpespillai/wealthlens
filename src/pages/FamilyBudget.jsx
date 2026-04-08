import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Download,
  Send,
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Sankey,
  Treemap,
  ResponsiveContainer as ChartContainer
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import AuthGuard from "@/components/AuthGuard";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CurrencySelector, { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import PremiumGate from "@/components/calculator/PremiumGate";
import { useSubscription } from "@/components/calculator/useSubscription";
import BankConnect from "@/components/calculator/BankConnect";

const EXPENSE_CATEGORIES = [
  { id: "fixed", label: "Fixed / Needs", color: "#3b82f6", targetPct: 50 },
  { id: "variable", label: "Variable / Wants", color: "#f59e0b", targetPct: 30 },
  { id: "savings", label: "Savings & Debt", color: "#10b981", targetPct: 20 },
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

function FamilyBudgetContent() {
  const [viewMode, setViewMode] = useState("monthly"); // 'monthly' | 'annual'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currency, setCurrency] = useState("USD");
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [selectedVaultGoal, setSelectedVaultGoal] = useState("");
  const [vaultWithdrawAmount, setVaultWithdrawAmount] = useState("");
  const [isVaultAllocating, setIsVaultAllocating] = useState(false);
  const [nextIncomeId, setNextIncomeId] = useState(2);
  const [nextExpenseId, setNextExpenseId] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { isPremium } = useSubscription();
  const [importText, setImportText] = useState("");
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      if (typeof result === "string") {
        setImportText(result);
        toast.success(`${file.name} loaded. Click Analyze to process.`);
      }
    };
    
    if (file.type === "application/pdf") {
      toast.info("PDF support is currently via AI-pasted text. Try copying the PDF text directly.");
    } else {
      reader.readAsText(file);
    }
  };

  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `wealthlens-budget-${y}-${m}`;
  }, [selectedDate]);

  const handleImport = async () => {
    if (!importText.trim()) return;
    
    setIsLoading(true);
    const toastId = toast.loading("Analyzing statement with AI...");

    try {
      // Use AI for better extraction
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract financial transactions from the following bank statement text. 
        Return ONLY a JSON array of objects with the following keys: "name", "category" (one of: "fixed", "variable", "savings"), and "monthlyAmount" (number). 
        Statement text: ${importText.substring(0, 4000)}`
      });

      let parsedData = [];
      if (typeof response === "string") {
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
      } else if (Array.isArray(response)) {
        parsedData = response;
      } else if (response.transactions) {
        parsedData = response.transactions;
      }

      if (parsedData.length > 0) {
        const formatted = parsedData.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || "Imported Item",
          category: item.category || "variable",
          monthlyAmount: Number(item.monthlyAmount) || 0
        }));
        
        setExpenses(prev => [...prev, ...formatted]);
        toast.success(`Imported ${formatted.length} transactions!`, { id: toastId });
        setImportText("");
        setIsImportModalOpen(false);
      } else {
        throw new Error("No transactions found");
      }
    } catch (e) {
      console.error("AI Import failed", e);
      toast.error("AI Analysis failed. Falling back to basic parsing...", { id: toastId });
      
      // Basic fallback logic
      const lines = importText.split('\n');
      const newExpenses = [];
      lines.forEach(line => {
        const amountMatch = line.match(/\d+\.\d{2}/) || line.match(/\d+(\,\d{3})*(\.\d{2})?/);
        if (amountMatch) {
          let amountStr = amountMatch[0].replace(/,/g, '');
          const amount = parseFloat(amountStr);
          if (isNaN(amount)) return;
          const description = line.replace(amountMatch[0], '').trim().substring(0, 40);
          let category = "variable";
          const lowerDesc = description.toLowerCase();
          if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage') || lowerDesc.includes('util')) category = "fixed";
          if (lowerDesc.includes('save') || lowerDesc.includes('invest')) category = "savings";
          
          newExpenses.push({
            id: Date.now() + Math.random(),
            name: description || "Imported Payment",
            category,
            monthlyAmount: amount
          });
        }
      });
      if (newExpenses.length > 0) {
        setExpenses(prev => [...prev, ...newExpenses]);
        toast.success(`Imported ${newExpenses.length} transactions via fallback.`);
        setImportText("");
        setIsImportModalOpen(false);
      } else {
        toast.error("Format not recognized.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankSync = (transactions) => {
    const formatted = transactions.map(item => ({
      id: Date.now() + Math.random(),
      name: item.name,
      category: item.category,
      monthlyAmount: item.amount
    }));

    // Check for duplicates
    const existing = new Set(expenses.map(e => `${e.name}-${e.monthlyAmount}`));
    const uniqueNew = formatted.filter(f => !existing.has(`${f.name}-${f.monthlyAmount}`));

    if (uniqueNew.length > 0) {
      setExpenses(prev => [...prev, ...uniqueNew]);
      toast.success(`Synced ${uniqueNew.length} new transactions from your bank!`);
    } else {
      toast.info("No new transactions found since last sync.");
    }
  };

  // Load from server (preferred) or localStorage
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        // Try server first
        const saved = await base44.user.loadData(monthKey);
        if (saved) {
          const { incomes: savedIncomes, expenses: savedExpenses, currency: savedCurrency } = saved;
          setIncomes(savedIncomes || []);
          setExpenses(savedExpenses || []);
          if (savedCurrency) setCurrency(savedCurrency);
          
          const maxIncId = savedIncomes?.length > 0 ? Math.max(...savedIncomes.map(i => i.id)) : 0;
          const maxExpId = savedExpenses?.length > 0 ? Math.max(...savedExpenses.map(e => e.id)) : 0;
          setNextIncomeId(maxIncId + 1);
          setNextExpenseId(maxExpId + 1);
        } else {
          // Fallback to localStorage
          const localSaved = localStorage.getItem(monthKey);
          if (localSaved) {
            const { incomes: localIncomes, expenses: localExpenses, currency: localCurrency } = JSON.parse(localSaved);
            setIncomes(localIncomes || []);
            setExpenses(localExpenses || []);
            if (localCurrency) setCurrency(localCurrency);
            
            const maxIncId = localIncomes?.length > 0 ? Math.max(...localIncomes.map(i => i.id)) : 0;
            const maxExpId = localExpenses?.length > 0 ? Math.max(...localExpenses.map(e => e.id)) : 0;
            setNextIncomeId(maxIncId + 1);
            setNextExpenseId(maxExpId + 1);
          } else {
            // New month, start at 0 as requested by user
            setIncomes([]);
            setExpenses([]);
            setNextIncomeId(1);
            setNextExpenseId(1);
          }
        }
      } catch (e) { 
        console.error("Could not load budget", e); 
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [monthKey]);

  const handleSave = async () => {
    try {
      const data = { incomes, expenses, currency };
      // Save locally
      localStorage.setItem(monthKey, JSON.stringify(data));
      
      // Save to server
      const success = await base44.user.saveData(monthKey, data);
      
      if (success) {
        toast.success(`Budget for ${selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })} saved!`);
      } else {
        toast.warning("Saved locally, but server sync failed.");
      }
    } catch {
      toast.error("Failed to save budget");
    }
  };

  const changeMonth = (offset) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + offset);
    setSelectedDate(next);
  };

  const handleCopyFromPrevious = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const y = prevDate.getFullYear();
    const m = (prevDate.getMonth() + 1).toString().padStart(2, '0');
    const prevKey = `wealthlens-budget-${y}-${m}`;
    
    setIsLoading(true);
    const toastId = toast.loading(`Copying from ${prevDate.toLocaleString('default', { month: 'short' })}...`);
    
    try {
      let saved = await base44.user.loadData(prevKey);
      if (!saved) {
        const local = localStorage.getItem(prevKey);
        if (local) saved = JSON.parse(local);
      }
      
      if (saved && (saved.incomes?.length > 0 || saved.expenses?.length > 0)) {
        setIncomes(saved.incomes || []);
        setExpenses(saved.expenses || []);
        toast.success("Imported previous month's plan!", { id: toastId });
      } else {
        toast.error("No data found in previous month.", { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to copy data.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const selectMonthYear = (month, year) => {
    const next = new Date(selectedDate);
    if (year !== undefined) next.setFullYear(year);
    if (month !== undefined) next.setMonth(month);
    setSelectedDate(next);
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
    const totalExpenses = expensesOnly + savingsOnly;
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

    const fixedExpenses = expenses.filter(e => e.category === "fixed").reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    const variableWants = expenses.filter(e => e.category === "variable").reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
    const savings = expenses.filter(e => e.category === "savings").reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);

    return { totalIncome, totalExpenses, balance, breakdown, pieData, fixedExpenses, variableWants, savings };
  }, [incomes, expenses]);

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

    const getSectionColor = (name, category = "") => {
      const n = (name || "").toLowerCase();
      const c = (category || "").toLowerCase();
      if (n.includes("tax") || c.includes("tax")) return colors.tax;
      if (n.includes("rent") || n.includes("mortgage") || c === "fixed") return colors.fixed;
      if (c === "variable" || n.includes("food") || n.includes("grocery") || n.includes("living")) return colors.variable;
      if (c === "savings" || n.includes("savings") || n.includes("surplus") || n.includes("invest")) return colors.savings;
      return "#94a3b8"; // Slate for unknown
    };

    const safeVal = (v) => Math.max(0.01, Number(v) || 0);

    // 1. Individual Incomes
    incomes.forEach((inc, i) => {
      nodes.push({ name: inc.name || "Source", color: colors.income, value: Number(inc.monthlyAmount) || 0 });
    });

    const grossIncomeIndex = nodes.length;
    const totalInc = Number(metrics.totalIncome) || 0;
    nodes.push({ name: "Gross Income", color: colors.gross, value: totalInc });

    // Link Incomes to Gross
    incomes.forEach((inc, i) => {
      links.push({ source: i, target: grossIncomeIndex, value: safeVal(inc.monthlyAmount) });
    });

    // 2. Gross Income to Categories
    const fixedIndex = nodes.length;
    nodes.push({ name: "Fixed Needs", color: colors.fixed, value: metrics.fixedExpenses });
    if (metrics.fixedExpenses > 0) {
      links.push({ source: grossIncomeIndex, target: fixedIndex, value: safeVal(metrics.fixedExpenses) });
    }

    const variableIndex = nodes.length;
    nodes.push({ name: "Variable Wants", color: colors.variable, value: metrics.variableWants });
    if (metrics.variableWants > 0) {
      links.push({ source: grossIncomeIndex, target: variableIndex, value: safeVal(metrics.variableWants) });
    }

    const savingsIndex = nodes.length;
    nodes.push({ name: "Savings", color: colors.savings, value: metrics.savings });
    if (metrics.savings > 0) {
      links.push({ source: grossIncomeIndex, target: savingsIndex, value: safeVal(metrics.savings) });
    }

    const surplusIndex = nodes.length;
    const bal = metrics.balance > 0 ? metrics.balance : 0;
    nodes.push({ name: "Monthly Surplus", color: colors.surplus, value: bal });
    if (bal > 0) {
      links.push({ source: grossIncomeIndex, target: surplusIndex, value: safeVal(bal) });
    }

    // 3. Category to Items
    expenses.forEach((exp) => {
      const cat = exp.category || "variable";
      const color = getSectionColor(exp.name || "", cat);
      const itemIndex = nodes.length;
      nodes.push({ name: exp.name || "Item", color, value: Number(exp.monthlyAmount) || 0 });
      
      let targetCatIndex = variableIndex;
      if (cat === "fixed" || color === colors.fixed) targetCatIndex = fixedIndex;
      if (cat === "savings" || color === colors.savings) targetCatIndex = savingsIndex;
      
      links.push({ source: targetCatIndex, target: itemIndex, value: safeVal(exp.monthlyAmount) });
    });

    return { nodes, links };
  }, [incomes, expenses, metrics]);

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
          rx={1}
          className="transition-all duration-300"
        />
        <text
          x={x + (isOut ? -10 : 15)}
          y={y + nodeHeight / 2 - 4}
          textAnchor={isOut ? "end" : "start"}
          fill="#334155"
          fontSize="10"
          fontWeight="700"
          className="tracking-tight"
        >
          {payload.name}
        </text>
        <text
          x={x + (isOut ? -10 : 15)}
          y={y + nodeHeight / 2 + 8}
          textAnchor={isOut ? "end" : "start"}
          fill="#94a3b8"
          fontSize="9"
          fontWeight="600"
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
    let totalSurplus = 0;
    Object.keys(localStorage).filter(k => k.startsWith('wealthlens-budget-')).forEach(k => {
      try {
        const data = JSON.parse(localStorage.getItem(k));
        const inc = (data.incomes || []).reduce((s, i) => s + (Number(i.monthlyAmount) || 0), 0);
        const exp = (data.expenses || []).reduce((s, e) => s + (Number(e.monthlyAmount) || 0), 0);
        totalSurplus += (inc - exp);
      } catch {}
    });
    const allocated = Number(localStorage.getItem('wealthlens-vault-allocated')) || 0;
    return { remaining: Math.max(0, totalSurplus - allocated), allocated };
  }, [incomes, expenses]);

  const handleVaultWithdraw = (goalId, amount) => {
    const withdrawal = Number(amount);
    if (!goalId) return toast.error("Please select a goal first");
    if (isNaN(withdrawal) || withdrawal <= 0) return toast.error("Enter a valid amount");
    if (withdrawal > vaultData.remaining) return toast.error("Insufficient funds in the vault");
    
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + withdrawal } : g));
    const newAllocated = vaultData.allocated + withdrawal;
    localStorage.setItem('wealthlens-vault-allocated', newAllocated.toString());
    
    toast.success(`Allocated ${getCurrencySymbol(currency)}${withdrawal.toLocaleString()} from vault to ${goals.find(g => g.id === goalId)?.name}`);
    setVaultWithdrawAmount("");
  };

  const historyData = useMemo(() => {
    const data = [];
    const now = new Date();
    // Scan last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const key = `wealthlens-budget-${y}-${m}`;
      
      // For current month being edited, use live state
      let incTotal = 0;
      let expTotal = 0;
      let categoriesMap = {};

      if (key === monthKey) {
        incTotal = incomes.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0);
        expTotal = expenses.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0);
        expenses.forEach(e => {
          const cat = e.category || "other";
          categoriesMap[cat] = (categoriesMap[cat] || 0) + (Number(e.monthlyAmount) || 0);
        });
      } else {
        try {
          const saved = JSON.parse(localStorage.getItem(key) || "{}");
          incTotal = (saved.incomes || []).reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0);
          expTotal = (saved.expenses || []).reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0);
          (saved.expenses || []).forEach(e => {
            const cat = e.category || "other";
            categoriesMap[cat] = (categoriesMap[cat] || 0) + (Number(e.monthlyAmount) || 0);
          });
        } catch {}
      }
      
      data.push({
        name: d.toLocaleString('default', { month: 'short' }),
        income: incTotal,
        expenses: expTotal,
        savings: Math.max(0, incTotal - expTotal),
        categories: categoriesMap
      });
    }
    return data;
  }, [incomes, expenses, monthKey]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none mb-1">Budget Planner</h1>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                    <TrendingUp className="w-3 h-3 rotate-[270deg]" />
                  </button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center gap-1.5">
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

                  <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                    <TrendingUp className="w-3 h-3 rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setViewMode("monthly")} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Editor
              </button>
              <PremiumGate isPremium={isPremium} featureName="Budget Trends & AI Reports" noOverlay>
                <button 
                  onClick={() => {
                    if (isPremium) setViewMode("reports");
                  }} 
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {isPremium ? (
                    <Crown className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-400" />
                  )}
                  Reports
                  {!isPremium && <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded ml-1 tracking-tighter">PRO</span>}
                </button>
              </PremiumGate>
            </div>
            <div className="w-24">
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>
            <Button onClick={handleSave} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10 px-6 rounded-xl shadow-lg shadow-emerald-200/50">
              <Save className="w-4 h-4" /> Save
            </Button>
          </div>
        </div>
      </div>      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Syncing budget data...</p>
        </div>
      ) : viewMode === "reports" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <PremiumGate isPremium={isPremium} featureName="Budget Trends & AI Reports">
            <BudgetReports 
              currency={currency} 
              selectedDate={selectedDate} 
              onOpenImport={() => {
                setViewMode("monthly");
                setIsImportModalOpen(true);
              }} 
            />
          </PremiumGate>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 space-y-4">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {viewMode === 'annual' ? 'Annual' : 'Monthly'} Income</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{fmt(metrics.totalIncome)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total {viewMode === 'annual' ? 'Annual' : 'Monthly'} Expenses</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{fmt(metrics.totalExpenses)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={`rounded-xl p-4 border shadow-sm flex items-center justify-between ${metrics.balance >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Remaining Balance</p>
              <h2 className={`text-2xl font-black tracking-tight ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {metrics.balance >= 0 ? '+' : '-'}{fmt(Math.abs(metrics.balance))}
              </h2>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metrics.balance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'}`}>
              <TrendingUp className={`w-5 h-5 ${metrics.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
          </motion.div>
        </div>

        {/* Household Vault & Global Savings Engine - Sleek Edition */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 tracking-tight leading-none text-lg">Household Vault</h3>
                  <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Locked</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-slate-900">{getCurrencySymbol(currency)}{vaultData.remaining.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Total Surplus</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[320px]">
              {!isVaultAllocating ? (
                <div className="flex items-center justify-end gap-3">
                  <p className="text-[11px] text-slate-400 font-bold uppercase hidden lg:block tracking-widest">Ready to deploy capital?</p>
                  <Button 
                    onClick={() => setIsVaultAllocating(true)}
                    disabled={vaultData.remaining <= 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs h-11 px-8 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    Fund Goals
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 animate-in slide-in-from-right-2 duration-300">
                  <select 
                    value={selectedVaultGoal}
                    onChange={(e) => setSelectedVaultGoal(Number(e.target.value))}
                    className="bg-transparent border-none text-xs font-black text-slate-700 outline-none w-32 px-2 cursor-pointer"
                  >
                    <option value="">Select Goal</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <div className="relative flex-1 min-w-[80px]">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{getCurrencySymbol(currency)}</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={vaultWithdrawAmount}
                      onChange={(e) => setVaultWithdrawAmount(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg h-8 pl-5 pr-2 text-xs font-black outline-none focus:border-indigo-400"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIsVaultAllocating(false)} className="p-2 text-slate-400 hover:text-slate-600"><Plus className="w-4 h-4 rotate-45" /></button>
                    <button 
                      onClick={() => handleVaultWithdraw(selectedVaultGoal, vaultWithdrawAmount)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                    >
                      Allocate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-16 -mt-16" />
        </motion.div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Editor */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Income Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Income Sources</h3>
                  <p className="text-xs text-slate-400">Add your monthly income streams</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyFromPrevious} 
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 h-8 rounded-lg"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Copy Prev. Month
                  </Button>
                  <Button variant="outline" size="sm" onClick={addIncome} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-8 rounded-lg">
                    <Plus className="w-4 h-4 mr-1" /> Add Income
                  </Button>
                </div>
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
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Expenses & Savings</h3>
                  <p className="text-sm text-slate-500">Categorize for 50/30/20 breakdown</p>
                </div>
                <div className="flex items-center gap-2">
                  <BankConnect onSyncSuccess={handleBankSync} />
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100/50 h-8 rounded-lg px-4 font-bold"
                      >
                        <Download className="w-3.5 h-3.5 mr-2" /> Smart Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>AI Bank Statement Import</DialogTitle>
                        <DialogDescription>
                          Paste statement text or CSV content below. Our AI will automatically extract amounts and categorize them.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 gap-2 border-dashed border-2 hover:border-indigo-400 hover:bg-indigo-50 transition-all border-slate-200"
                          >
                            <Download className="w-4 h-4" /> Upload CSV / TXT
                          </Button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".csv,.txt"
                            onChange={handleFileUpload}
                          />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">or paste text</span></div>
                        </div>
                        <Textarea 
                          placeholder="Paste your bank statement text here (e.g. 12/01 Amazon $45.99)..."
                          className="min-h-[200px] bg-slate-50 border-slate-200"
                          value={importText}
                          onChange={(e) => setImportText(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsImportModalOpen(false); setImportText(""); }}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImport}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          disabled={!importText.trim()}
                        >
                          Analyze & Import
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyFromPrevious} 
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 h-8 rounded-lg"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Copy Prev. Month
                  </Button>
                  <Button variant="outline" size="sm" onClick={addExpense} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-8 rounded-lg">
                    <Plus className="w-4 h-4 mr-1" /> Add Expense
                  </Button>
                </div>
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
          <div className="lg:col-span-5 space-y-4">
            
            {/* The 50/30/20 Rule Analysis */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                The 50/30/20 Breakdown
              </h3>
              
              <div className="space-y-4">
                {metrics.breakdown.map((b) => (
                  <div key={b.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{b.label}</span>
                          <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter" style={{backgroundColor: b.color}}>
                            Target {b.targetPct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-black" style={{color: b.color}}>{b.actualPct.toFixed(1)}%</span>
                          <span className="text-[10px] font-bold text-slate-400 capitalize">Actual Outgoings</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 font-bold block mb-0.5">{fmt(b.targetAmount)} Target</span>
                        {b.isOver ? (
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> {fmt(Math.abs(b.diff))} Over
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" /> {fmt(Math.abs(b.diff))} Saved
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Bullet Chart for 50/30/20 */}
                    <div className="relative h-4 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 shadow-inner">
                      {/* 50% Milestone Marker */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400/30 z-10" />
                      {/* Target Indicator */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-black/20 z-20"
                        style={{ left: `${b.targetPct}%` }}
                      />
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${b.actualPct}%` }}
                        className="h-full rounded-r-md shadow-lg transition-all duration-500 opacity-90"
                        style={{ backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Pie Chart */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Actual Distribution</h4>
                {metrics.pieData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
              {/* Family Savings Pillars */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Pillars</h4>
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="space-y-4">
                  {goals.map((g) => {
                    const pct = Math.min((g.current / (g.target || 1)) * 100, 100);
                    return (
                      <div key={g.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[11px] font-black text-slate-700 uppercase">{g.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {sym}{g.current.toLocaleString()} of {sym}{g.target.toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xs font-black text-indigo-600">{pct.toFixed(0)}%</span>
                        </div>
                        {/* High-Precision Bullet Chart */}
                        <div className="relative h-4 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50 shadow-inner group-hover:bg-slate-200 transition-colors">
                          {/* Qualitative Range: 50% Stability Marker */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 z-10" />
                          {/* Qualitative Range: 80% Velocity Marker */}
                          <div className="absolute left-[80%] top-0 bottom-0 w-px bg-slate-300 z-10" />
                          
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className="h-full bg-indigo-500 rounded-r-md shadow-lg shadow-indigo-200/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
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
      )}

      {viewMode === "monthly" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 pb-10">
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Financial Flow Intelligence</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Live Granular Flow Analysis • Interactive Visualization</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Managed</p>
                  <p className="text-md font-black text-emerald-600 leading-none">{fmt(metrics.totalIncome)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="h-[600px] w-full mt-2">
              {sankeyData && sankeyData.nodes.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Sankey
                    data={sankeyData}
                    node={<CustomSankeyNode />}
                    link={<CustomSankeyLink />}
                    nodePadding={20}
                    margin={{ left: 100, right: 180, top: 40, bottom: 40 }}
                    sort={false}
                  >
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          // In Sankey, payload[0].payload can be a link or a node
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
                                <p className="text-xl font-black text-slate-800">{sym}{Number(value).toLocaleString()}</p>
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
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/10">
                  <PieChartIcon className="w-6 h-6 opacity-30 text-slate-400" />
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Add inputs to view flow</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AIChatInsights({ history, currency }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI budget assistant. Ask me anything about your spending over the last 6 months!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const sym = getCurrencySymbol(currency);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `
        User Question: ${userMsg}
        Financial Data (Last 6 Months): ${JSON.stringify(history)}
        Currency Symbol: ${sym}
        
        CRITICAL TASK: 
        1. Analyze the data across months (the 'Financial Data' array has 6 entries).
        2. If providing a breakdown, trend, or comparison, you MUST include a JSON component in your response for a chart.
        3. Format your response as: [Your Text Analysis] followed by a JSON block:
           {"chart": "bar" | "pie" | "line" | "area", "data": [{"name": "Label", "value": 100}, ...]}
        4. Be professional and concise. Avoid technical JSON jargon in the text.
      `});
      
      const content = typeof response === "string" ? response : (response.content || JSON.stringify(response));
      
      // Parse potential chart data
      let textContent = content;
      let chartData = null;
      let chartType = 'bar';

      try {
        const jsonMatch = content.match(/\{.*"data".*\}/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          chartData = parsed.data;
          chartType = parsed.chart || 'bar';
          textContent = content.replace(jsonMatch[0], "").trim();
        }
      } catch (e) {
        console.warn("Failed to parse AI chart data", e);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: textContent, chartData, chartType }]);
    } catch (e) {
      console.error("AI Insights Error:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble analyzing your data. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[750px]">
      <div className="bg-indigo-600 p-5 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-100" />
        </div>
        <div>
          <h3 className="font-bold text-sm">AI Financial Insights</h3>
          <p className="text-[10px] text-indigo-100 uppercase tracking-wider font-semibold opacity-80">Dynamics 6-Month Engine</p>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {m.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-indigo-500 uppercase">
                  <Bot className="w-3 h-3" /> WealthLens AI
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              
              {m.chartData && (
                <div className="mt-4 pt-4 border-t border-slate-100 h-48 w-full min-w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {m.chartType === 'area' ? (
                      <AreaChart data={m.chartData}>
                        <defs>
                          <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis hide />
                        <RechartsTooltip formatter={(v) => sym + v.toLocaleString()} />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorAI)" />
                      </AreaChart>
                    ) : m.chartType === 'line' ? (
                      <LineChart data={m.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis hide />
                        <RechartsTooltip formatter={(v) => sym + v.toLocaleString()} />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{fill: '#6366f1', r: 4}} />
                      </LineChart>
                    ) : m.chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={m.chartData}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {m.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f43f5e', '#f59e0b'][index % 4]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(v) => sym + v.toLocaleString()} />
                      </PieChart>
                    ) : (
                      <BarChart data={m.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis hide />
                        <RechartsTooltip formatter={(v) => sym + v.toLocaleString()} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your spending..."
            className="flex-1 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 h-11 text-sm"
          />
          <Button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-11 h-11 rounded-xl p-0 flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
           {[ 
             "Eating Out Chart", 
             "Savings trajectory", 
             "Biggest spend categories",
             "Income vs Expense ratio",
             "Spending Trends"
           ].map(q => (
             <button 
               key={q} 
               onClick={() => setInput(q.includes('trajectory') ? q : `Generate a chart for: ${q}`)}
               className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
             >
               {q}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}

function BudgetReports({ currency, selectedDate, onOpenImport }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sym = getCurrencySymbol(currency);

  const fetchHistory = async () => {
    setIsLoading(true);
    const data = [];
    const now = new Date(selectedDate);
    // Fetch 6 months history
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const key = `wealthlens-budget-${y}-${m}`;
      
      let saved = await base44.user.loadData(key);
      if (!saved) {
        const local = localStorage.getItem(key);
        if (local) saved = JSON.parse(local);
      }

      const totalIncome = (saved?.incomes || []).reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
      const totalExpenses = (saved?.expenses || []).reduce((sum, item) => sum + (Number(item.monthlyAmount) || 0), 0);
      
      const categoryData = (saved?.expenses || []).reduce((acc, e) => {
        const cat = e.category || "other";
        acc[cat] = (acc[cat] || 0) + (Number(e.monthlyAmount) || 0);
        return acc;
      }, {});

      data.push({
        name: d.toLocaleString('default', { month: 'short' }),
        income: totalIncome,
        expenses: totalExpenses,
        balance: Math.max(0, totalIncome - totalExpenses),
        deficit: totalExpenses > totalIncome ? totalExpenses - totalIncome : 0,
        categories: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
        rawCategories: categoryData
      });
    }
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [currency, selectedDate]);

  if (isLoading) return <div className="py-20 text-center text-slate-500">Generating trends...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-12">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Visual Trends</TabsTrigger>
            <TabsTrigger value="ai" className="rounded-xl px-8 font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">AI Analysis</TabsTrigger>
          </TabsList>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Last Updated Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                   <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                Cash Flow Balance (6M)
              </h3>
              <div className="h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => sym + v} />
                    <RechartsTooltip 
                      formatter={(v) => sym + v.toLocaleString()}
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                    <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} name="Income" />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                   <Wallet className="w-5 h-5 text-indigo-600" />
                </div>
                Savings Strategy Engine
              </h3>
              <div className="h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => sym + v} />
                    <RechartsTooltip 
                      formatter={(v) => sym + v.toLocaleString()}
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <div className="space-y-8">
            {/* Row 1: The Sankey & Treemap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cash Flow Sankey Removal - Moved to Editor */}
              <div className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden bg-slate-50/30">
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Sankey moved to Editor</h3>
                  <p className="text-sm text-slate-500 max-w-sm">We've integrated the live cash flow chart directly into the budget editor for real-time analysis while you work.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode("monthly")}
                    className="mt-6 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
                  >
                    Go to Editor
                  </Button>
                </div>
              </div>

              {/* Expense Treemap */}
              <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase mb-6">Spending Hierarchy</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={history[history.length - 1]?.categories || []}
                      dataKey="value"
                      ratio={4/3}
                      stroke="#fff"
                      fill="#6366f1"
                    >
                      <RechartsTooltip />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 2: Monthly Intensity Heatmap */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Spending Intensity Matrix</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest tracking-tighter">Color-coded temporal heatmap</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                 {history.map((h, i) => {
                   const intensity = Math.min((h.expenses / (h.income || 1)) * 100, 100);
                   let color = "bg-emerald-500";
                   if (intensity > 90) color = "bg-rose-500";
                   else if (intensity > 70) color = "bg-amber-500";
                   else if (intensity > 50) color = "bg-indigo-500";
                   
                   return (
                     <div key={i} className="flex flex-col gap-2">
                        <div 
                          className={`h-24 rounded-2xl ${color} flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer shadow-lg shadow-black/5`}
                          style={{ opacity: 0.1 + (intensity / 100) }}
                        >
                           <span className="text-lg font-black">{intensity.toFixed(0)}%</span>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-slate-400">{h.name}</p>
                          <p className="text-[10px] font-bold text-slate-700">{sym}{h.expenses.toLocaleString()}</p>
                        </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="max-w-4xl mx-auto">
             <AIChatInsights history={history} currency={currency} />
          </div>
        </TabsContent>
      </Tabs>
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
