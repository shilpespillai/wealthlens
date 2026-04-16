import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Download, 
  Filter, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  CreditCard,
  Building2,
  Tag,
  Search as SearchIcon,
  User,
  Settings,
  HelpCircle,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  Wrench,
  ExternalLink,
  Edit2,
  Calendar as CalendarIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import BankConnect from "@/components/calculator/BankConnect";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";

// --- Mock Data ---

const MOCK_TRANSACTIONS = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];
  const transactions = [];
  
  const CATEGORY_MAP = [
    { name: "Salary", type: "income", spendType: "income", amount: 5500, merchant: "Global Corp Salary" },
    { name: "Bonus", type: "income", spendType: "income", amount: 2000, merchant: "Performance Bonus" },
    { name: "Housing", type: "expense", spendType: "fixed", amount: -1850, merchant: "Metropolis Housing" },
    { name: "Groceries", type: "expense", spendType: "variable", amount: -150, merchant: "Whole Foods Market" },
    { name: "Dining Out", type: "expense", spendType: "variable", amount: -45, merchant: "Local Bistro" },
    { name: "Transport", type: "expense", spendType: "variable", amount: -25, merchant: "Uber Trip" },
    { name: "Utilities", type: "expense", spendType: "variable", amount: -85, merchant: "Shell Energy" },
    { name: "Healthcare", type: "expense", spendType: "fixed", amount: -210, merchant: "City Health Premium" },
    { name: "Entertainment", type: "expense", spendType: "fixed", amount: -45.99, merchant: "Cloud Streaming Hub" },
    { name: "Shopping", type: "expense", spendType: "variable", amount: -60, merchant: "Amazon Store" },
    { name: "Savings", type: "expense", spendType: "savings", amount: -500, merchant: "High-Yield Savings" },
    { name: "Investments", type: "expense", spendType: "savings", amount: -500, merchant: "Vanguard ETF Index" }
  ];

  months.forEach((m, mIdx) => {
    CATEGORY_MAP.forEach((cat, cIdx) => {
      // Bonus only in Jan
      if (cat.name === "Bonus" && m !== "Jan") return;

      const day = (5 + (cIdx * 2)) % 28;
      transactions.push({
        id: `mock-${m}-${cat.name.replace(/\s+/g, '-')}`,
        date: `${m} ${day.toString().padStart(2, '0')}`,
        merchant: cat.merchant,
        amount: cat.amount + (Math.random() * 10 - 5), 
        category: cat.name,
        spendType: cat.spendType,
        type: cat.type,
        account: cIdx % 2 === 0 ? "Sample Bank Account" : "Sample Credit Card",
        balance: 10000 - (cIdx * 200)
      });
    });
  });

  return transactions;
})();

const SIDEBAR_ITEMS = [
  { id: "all", label: "All items", icon: List, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "income", label: "Income", icon: ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "expense", label: "Expenses", icon: ArrowDownRight, color: "text-rose-600", bg: "bg-rose-50" },
  { id: "uncategorized", label: "Uncategorized", icon: Tag, color: "text-orange-600", bg: "bg-orange-50" },
];

const ACCOUNTS = [
  { name: "Sample Bank Account", balance: 3547.45, color: "bg-rose-500" },
  { name: "Sample Credit Card", balance: -2345.54, color: "bg-rose-500" },
];

const CATEGORIES = [
  "Salary", "Bonus", "Housing", "Groceries", "Dining Out", "Transport", "Utilities", "Healthcare", "Entertainment", "Shopping", "Savings", "Investments"
];

const SPEND_TYPES = [
  { id: "fixed", label: "Fixed", color: "text-emerald-600 bg-emerald-50" },
  { id: "variable", label: "Variable", color: "text-rose-600 bg-rose-50" },
  { id: "savings", label: "Savings", color: "text-blue-600 bg-blue-50" },
  { id: "income", label: "Income", color: "text-cyan-600 bg-cyan-50" },
];

function TransactionsContent() {
  const { 
    parseCurrency, 
    formatAmount, 
    formatDate,
    syncData, 
    calculateMetrics, 
    normalizeTransactionData,
    getProductionLedger,
    getDatabaseTable
  } = useFinancialParser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("all");
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("25");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Deep filter helpers
  const handleSidebarFilter = (type, q = "") => {
    setSelectedTab(type);
    setSearchQuery(q);
  };
  
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [importText, setImportText] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCommiting, setIsCommiting] = useState(false);
  const fileInputRef = React.useRef(null);

  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  // Deep Link Handling
  useEffect(() => {
    const monthParam = searchParams.get("month"); // Format: YYYY-MM
    if (monthParam) {
      const [y, m] = monthParam.split("-");
      if (y && m) {
        setSelectedDate(new Date(parseInt(y), parseInt(m) - 1, 1));
      }
    }
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        // 1. Fetch real transactions from the production ledger
        const ledger = await getProductionLedger({ month: monthKey });
        
        // 2. Load the current month's budget/saved state from relativistic budgets table
        const allBudgets = await getDatabaseTable("budgets");
        const saved = (allBudgets || []).find(b => b.month === monthKey);
        
        const { incomes: normIncs, expenses: normExps } = normalizeTransactionData(saved, selectedDate, ledger);
        
        setIncomes(normIncs);
        setExpenses(normExps);
        if (saved?.currency) setCurrency(saved.currency);
      } catch (err) {
        console.error("Transactions initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [monthKey, normalizeTransactionData, selectedDate, getProductionLedger, getDatabaseTable]);

  const persistTransactionData = async (newIncomes, newExpenses) => {
    setHasChanges(true); // Don't auto-sync anymore
  };

  const handleCommit = async () => {
    setIsCommiting(true);
    try {
      // Upsert into relational budgets table to maintain single source of truth
      await base44.db.upsert("budgets", {
        month: monthKey,
        currency,
        payload: {
          incomes,
          expenses
        }
      }, "month");
      
      setHasChanges(false);
      toast.success("Ledger committed to production database");
    } catch (err) {
      console.error("Commit failed:", err);
      toast.error("Commit failed");
    } finally {
      setIsCommiting(false);
    }
  };

  const allTransactions = useMemo(() => {
    const fallbackDate = selectedDate.toLocaleString('default', { month: 'short' }) + ' 01';
    return [
      ...incomes.map(i => ({ ...i, type: 'income', amount: i.monthlyAmount, merchant: i.name, date: (i.date && i.date !== 'Monthly') ? i.date : fallbackDate })),
      ...expenses.map(e => ({ ...e, type: 'expense', amount: e.monthlyAmount, merchant: e.name, date: (e.date && e.date !== 'Monthly') ? e.date : fallbackDate }))
    ];
  }, [incomes, expenses, selectedDate]);

  const filteredTransactions = useMemo(() => {
    let list = allTransactions;
    if (selectedTab !== 'all') {
      if (selectedTab === 'uncategorized') list = list.filter(tx => tx.category === 'Uncategorized');
      else list = list.filter(tx => tx.type === selectedTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Enhanced filtering: Match merchant OR exactly match category if the search is from a sidebar category click
      list = list.filter(tx => 
        tx.merchant.toLowerCase().includes(q) || 
        (tx.category && tx.category.toLowerCase() === q) ||
        (tx.category && tx.category.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allTransactions, selectedTab, searchQuery]);

  // Controlled Form State
  const [manualForm, setManualForm] = useState({
    merchant: "",
    amount: "",
    type: "expense",
    category: "Groceries",
    spendType: "variable",
    date: new Date().toISOString().split('T')[0]
  });

  const handleManualAdd = () => {
    if (!manualForm.merchant || !manualForm.amount) return toast.error("Please fill required fields");

    const newItem = {
      id: Date.now() + Math.random(),
      name: manualForm.merchant,
      category: manualForm.category || "Uncategorized",
      monthlyAmount: parseFloat(manualForm.amount) || 0,
      spendType: manualForm.type === 'income' ? 'income' : (manualForm.spendType || 'variable'),
      date: manualForm.date
    };

    if (manualForm.type === 'income') {
      setIncomes(prev => [...prev, newItem]);
    } else {
      setExpenses(prev => [...prev, newItem]);
    }
    setHasChanges(true);
    setManualForm({ 
      merchant: "", 
      amount: "", 
      type: "expense", 
      category: "Fixed", 
      date: selectedDate.toISOString().split('T')[0] 
    });
    toast.success("Transaction staged. Click Commit to save.");
  };

  const handleUpdateItem = async (id, updates, type) => {
    if (type === 'income') {
      const updated = incomes.map(i => i.id === id ? { ...i, ...updates } : i);
      setIncomes(updated);
      persistTransactionData(updated, expenses);
    } else {
      const updated = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
      setExpenses(updated);
      persistTransactionData(incomes, updated);
    }
    toast.success("Transaction updated");
  };

  const handleDelete = (id, type) => {
    if (type === 'income') {
      const updated = incomes.filter(i => i.id !== id);
      setIncomes(updated);
      persistTransactionData(updated, expenses);
    } else {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      persistTransactionData(incomes, updated);
    }
    toast.info("Transaction removed");
  };

  const handleBankSync = (newItems) => {
    const fallbackDate = selectedDate.toLocaleString('default', { month: 'short' });
    const formatted = newItems.map(item => ({
      id: Date.now() + Math.random(),
      name: item.name,
      category: item.category,
      monthlyAmount: item.amount,
      date: item.date || `${fallbackDate} 01`
    }));
    const existing = new Set(expenses.map(e => `${e.name}-${e.monthlyAmount}`));
    const uniqueNew = formatted.filter(f => !existing.has(`${f.name}-${f.monthlyAmount}`));
    
    if (uniqueNew.length > 0) {
      const updated = [...expenses, ...uniqueNew];
      setExpenses(updated);
      persistTransactionData(incomes, updated);
      toast.success(`Synced ${uniqueNew.length} new transactions!`);
    } else {
      toast.info("No new transactions found.");
    }
  };

  const handleImportResults = (parsedData) => {
    const fallbackDate = selectedDate.toLocaleString('default', { month: 'short' });
    const formatted = parsedData.map(item => ({
      id: Date.now() + Math.random(),
      name: item.name || "Imported Item",
      category: item.category || "variable",
      monthlyAmount: Number(item.monthlyAmount) || 0,
      date: item.date || `${fallbackDate} 01`
    }));
    const updated = [...expenses, ...formatted];
    setExpenses(updated);
    persistTransactionData(incomes, updated);
    toast.success(`Imported ${formatted.length} transactions!`);
  };

  const handleCopyFromPrevious = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const y = prevDate.getFullYear();
    const m = (prevDate.getMonth() + 1).toString().padStart(2, '0');
    const prevKey = `wealthlens-budget-${y}-${m}`;
    const tId = toast.loading("Copying previous month...");
    
    const saved = await base44.user.loadData(prevKey);
    if (saved && (saved.incomes?.length || saved.expenses?.length)) {
      setIncomes(saved.incomes || []);
      setExpenses(saved.expenses || []);
      persistTransactionData(saved.incomes, saved.expenses);
      toast.success("Copied data from " + prevDate.toLocaleString('default', { month: 'short' }), { id: tId });
    } else {
      toast.error("No data found in previous month", { id: tId });
    }
  };

  const summary = calculateMetrics(incomes, expenses);
  const sym = getCurrencySymbol(currency);

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Header - Institutional Grade */}
    <header className="h-14 bg-[#5e1d8d] flex items-center justify-between px-6 shrink-0 transition-all">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-lg font-medium tracking-tight">Transactions</h1>
          <div className="h-4 w-[1px] bg-white/20 mx-2" />
          
          {/* Date Picker - High Visibility */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs font-bold gap-3 px-4 h-9 shadow-sm"
              >
                <CalendarIcon className="w-4 h-4 text-purple-200" />
                {format(startOfMonth(selectedDate), "MMMM yyyy")}
                <ChevronDown className="w-3 h-3 text-white/50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#5e1d8d] border-purple-400/30" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                month={selectedDate}
                onMonthChange={setSelectedDate}
                initialFocus
                className="rounded-xl border-none bg-[#5e1d8d]"
                classNames={{
                  day_selected: "bg-white text-purple-600 hover:bg-white hover:text-purple-600 focus:bg-white focus:text-purple-600",
                  day_today: "bg-white/10 text-white",
                  head_cell: "text-white/50",
                  nav_button: "hover:bg-white/10 text-white",
                  day: "text-white hover:bg-white/10",
                  caption_label: "text-white font-medium"
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 text-white text-xs rounded-full py-1.5 pl-9 pr-8 w-64 outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
            />
            {searchQuery && (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
               >
                 <Plus className="w-3 h-3 rotate-45" />
               </button>
            )}
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <LayoutGrid className="w-4 h-4 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Secondary Sidebar */}
        <aside className="w-72 bg-[#f8f9fa] border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-8 shrink-0">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Overview</p>
            <div className="space-y-1">
              <div className="bg-slate-200/50 rounded-lg p-3 border border-slate-200 mb-4 text-center">
                 <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Monthly Balance</span>
                 <span className={`text-sm font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {formatAmount(summary.balance)}
                 </span>
              </div>

              {SIDEBAR_ITEMS.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleSidebarFilter(item.id, "")}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${selectedTab === item.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${selectedTab === item.id ? 'text-white' : item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {selectedTab === item.id ? 'all' : (item.id === 'all' ? allTransactions.length : allTransactions.filter(tx => tx.type === item.id || (item.id === 'uncategorized' && tx.category === 'Uncategorized')).length)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved searches</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {["All uncategorised", "Craft beer", "Good food", "Healthcare", "London", "Bargains"].map(s => (
                <button 
                  key={s} 
                  onClick={() => handleSidebarFilter("all", s)}
                  className={`w-full text-left px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 ${searchQuery === s ? 'bg-white shadow-sm text-purple-600 font-bold' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                >
                  <Search className="w-3 h-3 text-slate-300" /> {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accounts</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-2 px-2">
              {ACCOUNTS.map(acc => (
                <div key={acc.name} className="space-y-1 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${acc.color}`} />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{acc.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 tabular-nums ml-5">
                    {(acc.balance || 0) < 0 ? `(${Math.abs(acc.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : (acc.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categories</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button 
                  key={c} 
                  onClick={() => handleSidebarFilter("all", c)}
                  className={`w-full text-left px-4 py-1.5 text-xs transition-colors truncate ${searchQuery === c ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-purple-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Action Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCommit}
                  disabled={!hasChanges || isCommiting}
                  className={`h-9 px-6 gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${hasChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 animate-pulse' : 'bg-slate-200 text-slate-400 cursor-default'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCommiting ? "Commiting..." : "Commit Changes"}
                </Button>

                <BankConnect onSyncSuccess={handleBankSync} />
                
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 text-xs font-medium border-slate-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                      <Download className="w-4 h-4" /> Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    {/* Reuse Import Logic UI */}
                    <DialogHeader>
                      <DialogTitle>AI Bank Statement Import</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <Textarea 
                        placeholder="Paste your bank statement text here..."
                        className="min-h-[200px] bg-slate-50"
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleImportResults(JSON.parse(importText))}>Import Raw JSON</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                      <Plus className="w-4 h-4 text-slate-400" /> Add Manually
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transaction</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input 
                        placeholder="Merchant/Label" 
                        value={manualForm.merchant}
                        onChange={(e) => setManualForm(prev => ({ ...prev, merchant: e.target.value }))}
                      />
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        step="0.01" 
                        value={manualForm.amount}
                        onChange={(e) => setManualForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                      <Input 
                        type="date"
                        value={manualForm.date}
                        onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                      <Select 
                        value={manualForm.type}
                        onValueChange={(v) => setManualForm(prev => ({ ...prev, type: v }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={manualForm.category}
                        onValueChange={(v) => setManualForm(prev => ({ ...prev, category: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {manualForm.type === 'expense' && (
                        <Select 
                          value={manualForm.spendType}
                          onValueChange={(v) => setManualForm(prev => ({ ...prev, spendType: v }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Spend Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleManualAdd}>Save Transaction</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleCopyFromPrevious} className="h-9 gap-2 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
                   <CalendarIcon className="w-4 h-4 text-slate-400" /> Copy Prev
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Show</span>
                 <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                   <SelectTrigger className="h-8 w-20 text-[10px] font-bold">
                     <SelectValue placeholder="25" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="10">10 entries</SelectItem>
                     <SelectItem value="25">25 entries</SelectItem>
                     <SelectItem value="50">50 entries</SelectItem>
                     <SelectItem value="100">100 entries</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                <button className="p-1.5 hover:bg-slate-50 transition-colors border-r border-slate-200 disabled:opacity-30" disabled>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button className="p-1.5 hover:bg-slate-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-normal">
            <span className="px-2">Showing 1-{Math.min(filteredTransactions.length, parseInt(entriesPerPage))} of {filteredTransactions.length} transactions.</span>
            {selectedTransactions.length > 0 && (
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-medium shadow-sm shadow-purple-100 animate-in zoom-in-50">
                {selectedTransactions.length} selected
              </span>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-[#fcfcfc] border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px] p-4">
                    <Checkbox 
                      checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0} 
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[80px] p-4">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400 cursor-pointer hover:text-purple-600 transition-colors">
                    Date <span className="text-[8px] ml-1">▼</span>
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Merchant</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Amount</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Category</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Spend Type</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Account</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest p-4 text-slate-400">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, parseInt(entriesPerPage)).map((tx) => (
                  <React.Fragment key={tx.id}>
                    <TableRow className={`group transition-colors ${selectedTransactions.includes(tx.id) ? 'bg-purple-50/50' : 'hover:bg-slate-50/50'}`}>
                      <TableCell className="p-4">
                        <Checkbox 
                          checked={selectedTransactions.includes(tx.id)} 
                          onCheckedChange={() => toggleSelect(tx.id)}
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded">
                                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="gap-2 cursor-not-allowed text-slate-400"><Edit2 className="w-4 h-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(tx.id, tx.type)} className="gap-2 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                           {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-normal text-slate-500 whitespace-nowrap p-4">{formatDate(tx.date)}</TableCell>
                      <TableCell className="p-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-normal tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.merchant}</span>
                          {tx.note && <span className="text-[11px] text-slate-500 mt-1.5 leading-relaxed max-w-md bg-slate-50 p-2 rounded-lg border border-slate-100 font-normal">{tx.note}</span>}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right text-sm font-normal p-4 tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {formatAmount(tx.amount || 0)}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-1">
                          <Select 
                            value={tx.category || "Uncategorized"} 
                            onValueChange={(v) => handleUpdateItem(tx.id, { category: v }, tx.type)}
                          >
                            <SelectTrigger className="h-7 bg-white text-[10px] font-normal border-slate-200 px-2 py-0.5 w-[140px] hover:border-purple-300 transition-all text-slate-700">
                              <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-[10px]">{c}</SelectItem>)}
                              <SelectItem value="Uncategorized" className="text-[10px]">Uncategorized</SelectItem>
                            </SelectContent>
                          </Select>
                          <button 
                            onClick={() => handleSidebarFilter("all", tx.category)}
                            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-purple-600 transition-colors"
                            title="Filter by this category"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Select 
                          value={tx.spendType || (tx.type === 'income' ? 'income' : 'variable')} 
                          onValueChange={(v) => handleUpdateItem(tx.id, { spendType: v }, tx.type)}
                          disabled={tx.type === 'income'}
                        >
                          <SelectTrigger className="h-7 bg-white text-[10px] font-normal border-slate-200 px-2 py-0.5 w-[100px] hover:border-purple-300 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed" className="text-[10px]">Fixed</SelectItem>
                            <SelectItem value="variable" className="text-[10px]">Variable</SelectItem>
                            <SelectItem value="savings" className="text-[10px]">Savings</SelectItem>
                            <SelectItem value="income" className="text-[10px]" disabled>Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-xs font-normal text-slate-500 p-4 whitespace-nowrap">{tx.account}</TableCell>
                      <TableCell className="text-right text-xs font-normal text-slate-400 p-4 tabular-nums">
                        {(tx.balance || 0) < 0 ? `(${Math.abs(tx.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : (tx.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <TransactionsContent />
    </AuthGuard>
  );
}
