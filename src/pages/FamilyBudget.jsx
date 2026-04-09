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
import CurrencySelector, { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import BankConnect from "@/components/calculator/BankConnect";


const EXPENSE_CATEGORIES = [
  { id: "fixed", label: "Fixed / Needs", color: "#B8D8BA", targetPct: 50 },
  { id: "variable", label: "Variable / Wants", color: "#E5C48B", targetPct: 30 },
  { id: "savings", label: "Savings & Debt", color: "#E5989B", targetPct: 20 },
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
  const multiplier = 1;
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

  const parseNum = (val) => {
    return parseFloat(val) || 0;
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
              <Button onClick={handleSave} size="sm" className="bg-[#C5A059] hover:bg-[#D4B06A] text-[#1A202C] font-semibold gap-2 h-10 px-6 rounded-xl shadow-lg shadow-[#C5A059]/20 border-0">
                <Save className="w-4 h-4" /> Save
              </Button>
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
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{expenses.filter(e => e.name?.toLowerCase().includes('debt') || e.name?.toLowerCase().includes('loan') || e.category === 'debt').reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">TOTAL DEBT PAID</p>
              </div>
              <div className="text-center border-l border-white/5 w-full px-2">
                <p className="text-[17px] font-normal tracking-tight text-white">{sym}{Math.max(0, incomes.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0) - expenses.reduce((s, x) => s + (Number(x.monthlyAmount) || 0), 0)).toLocaleString()}</p>
                <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest mt-1">LEFT TO SPEND</p>
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
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Live Granular Flow Analysis • Interactive Visualization</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Total Managed</p>
                <p className="text-md font-black text-[#C5A059] leading-none">{fmt(metrics.totalIncome)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#2D3748] flex items-center justify-center border border-[#C5A059]/20">
                <TrendingUp className="w-5 h-5 text-[#C5A059]" />
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full mt-2">
            {sankeyData && sankeyData.nodes.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={sankeyData}
                  node={<CustomSankeyNode />}
                  link={<CustomSankeyLink />}
                  nodePadding={20}
                  margin={{ left: 100, right: 180, top: 20, bottom: 20 }}
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
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <PieChartIcon className="w-6 h-6 opacity-30 text-slate-400" />
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Add inputs below to generate flow</p>
              </div>
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

              <h2 className="text-2xl font-medium text-slate-700 tracking-tight">{fmt(metrics.totalIncome)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Total Monthly Expenses</p>

              <h2 className="text-2xl font-medium text-slate-700 tracking-tight">{fmt(metrics.totalExpenses)}</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-500" />
            </div>
          </motion.div>
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}} className={`rounded-xl p-4 border shadow-sm flex items-center justify-between ${metrics.balance >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-widest mb-1 ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Remaining Balance</p>
              <h2 className={`text-2xl font-medium tracking-tight ${metrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {metrics.balance >= 0 ? '+' : '-'}{fmt(Math.abs(metrics.balance))}
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


            
            {/* Income Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Income Sources</h3>
                  <p className="text-xs text-slate-400">Add your monthly income streams</p>
                </div>
                <div className="flex items-center justify-end flex-nowrap gap-1.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyFromPrevious} 
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 h-8 rounded-lg px-2.5 text-xs font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Copy Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={addIncome} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 h-8 rounded-lg px-2.5 text-xs font-medium">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
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
                        onChange={(e) => updateIncome(inc.id, "monthlyAmount", parseNum(e.target.value))}

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
                <div className="flex items-center justify-end flex-nowrap gap-1.5">
                  <BankConnect onSyncSuccess={handleBankSync} />
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100/50 h-8 rounded-lg px-2.5 font-medium text-xs"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Import
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
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 h-8 rounded-lg px-2.5 text-xs font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" /> Copy Prev
                  </Button>
                  <Button variant="outline" size="sm" onClick={addExpense} className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 h-8 rounded-lg px-2.5 text-xs font-medium">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add
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
                        onChange={(e) => updateExpense(exp.id, "monthlyAmount", parseNum(e.target.value))}

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
                        <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest block mb-0.5">{fmt(b.targetAmount)} Goal</span>
                        {b.isOver ? (
                          <span className="text-[10px] font-medium text-rose-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <AlertCircle className="w-3 h-3" /> {fmt(Math.abs(b.diff))} Variance
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3" /> {fmt(Math.abs(b.diff))} Savings
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
