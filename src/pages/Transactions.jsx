import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Save,
  Clock,
  LayoutGrid,
  List,
  Wrench,
  ExternalLink,
  Edit2,
  RefreshCw,
  Calendar as CalendarIcon
} from "lucide-react";
import { CategoryIcon } from "@/utils/iconMap";
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
import { CORE_CATEGORY_REGISTRY } from "@/utils/constants";
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
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import SmartImporter from "@/components/SmartImporter";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { supabase } from "@/lib/supabaseClient";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";

// --- Mock Data ---

const MOCK_TRANSACTIONS = (() => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];
  const transactions = [];
  
  const CATEGORY_MAP = [
    { name: "Income", type: "income", spendType: "income", amount: 5500, merchant: "Monthly Salary" },
    { name: "Income", type: "income", spendType: "income", amount: 2000, merchant: "Performance Bonus" },
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

// Dynamic Categories and Accounts will be computed in the component

const CATEGORY_COLORS = {
  "Housing": "#3b82f6", // Blue
  "Transportation": "#f97316", // Orange
  "Food": "#ef4444", // Red
  "Utilities": "#f59e0b", // Amber/Light Yellow
  "Healthcare": "#10b981", // Emerald
  "Insurance": "#6366f1", // Indigo
  "Entertainment": "#d946ef", // Fuchsia
  "Personal": "#f43f5e", // Rose
  "Education": "#8b5cf6", // Violet
  "Savings": "#06b6d4", // Cyan
  "Income": "#22c55e", // Green
  "Salary": "#22c55e", // Green
  "Investment": "#8b5cf6", // Violet
  "Shopping": "#fb923c", // Vibrant Orange
  "Travel": "#14b8a6", // Teal
  "Miscellaneous": "#d4d4d8", // Light Slate
  "Uncategorized": "#94a3b8", // Slate
};

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Miscellaneous"];
}

function getMerchantTextColor(category, type) {
    if (type === 'income') return "#166534"; // Deep Green
    const blueCategories = ["Housing", "Insurance", "Education"];
    if (blueCategories.includes(category)) return "#1e40af"; // Deep Blue
    return "#0f172a"; // Near Black
}

// Category registry will be pulled dynamically from centralized useCategories hook
const CATEGORIES_FALLBACK = []; 

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
  const { categories, seedCategories, isLoading: categoriesLoading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("all");
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedSearches, setSavedSearches] = useState([]);
  const [isSaveSearchModalOpen, setIsSaveSearchModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Deep filter helpers
  const handleSidebarFilter = (type, value = "") => {
    if (type === 'tab') {
      setSelectedTab(value);
      setSearchQuery("");
      setSelectedCategory(null);
      setSelectedAccountId(null);
    } else if (type === 'category') {
      const catObj = categories.find(c => c.name === value);
      setSelectedCategory(value);
      setSelectedTab(catObj?.type || "all"); // Sync tab to category type (income/expense)
      setSearchQuery("");
      setSelectedAccountId(null);
    } else if (type === 'account') {
      setSelectedAccountId(value);
      setSelectedTab("all");
      setSelectedCategory(null);
      setSearchQuery("");
    } else if (type === 'search') {
      setSearchQuery(value);
      setSelectedTab("all");
      setSelectedCategory(null);
      setSelectedAccountId(null);
    }
  };
  
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCommiting, setIsCommiting] = useState(false);
  const [dbAccounts, setDbAccounts] = useState([]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "asset", category: "Bank", balance: "" });
  const fileInputRef = React.useRef(null);

  // Automated Category Synchronization
  useEffect(() => {
    if (seedCategories) {
      seedCategories(CORE_CATEGORY_REGISTRY);
    }
  }, [seedCategories]);

  // Dynamic derivations - Migration to centralized hook
  const categoryNames = useMemo(() => {
    return categories.map(c => c.name).sort();
  }, [categories]);

  const ACCOUNTS_SIDEBAR = useMemo(() => {
    const sidebar = dbAccounts.map(acc => {
      // Calculate current month delta for this account
      const accIncomes = incomes.filter(i => i.account_id === acc.id).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      const accExpenses = expenses.filter(e => e.account_id === acc.id).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      const liveBalance = accIncomes - accExpenses;
      
      return {
        id: acc.id,
        name: acc.name,
        balance: liveBalance,
        color: liveBalance < 0 ? "bg-rose-500" : "bg-emerald-500",
        isVirtual: false,
        isSystem: !!acc.is_system
      };
    });

    // Add Virtual "Manual Vault" for unassigned items
    const manualIncs = incomes.filter(i => !i.account_id || String(i.account_id) === "manual" || String(i.account_id) === "null" || i.account_id === "").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const manualExps = expenses.filter(e => !e.account_id || String(e.account_id) === "manual" || String(e.account_id) === "null" || e.account_id === "").reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const manualBal = manualIncs - manualExps;

    sidebar.push({
      id: "manual",
      name: "Manual Vault",
      balance: manualBal,
      color: "bg-slate-400",
      isVirtual: true,
      isSystem: true
    });

    return sidebar;
  }, [dbAccounts, incomes, expenses]);

  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  const [manualForm, setManualForm] = useState({
    merchant: "",
    amount: "",
    category: "",
    spendType: "variable",
    type: "expense",
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
    account_id: ""
  });

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 0. Fetch accounts to enable attribution mapping
      let accounts = await base44.db.getTable("user_accounts");
      
      // Default Account Provisioning Safety
      if (!accounts || accounts.length === 0) {
        const defaults = [
          { id: `sys-savings`, name: "Salary / Savings", type: "asset", category: "Bank", base_balance: 0, is_system: true },
          { id: `sys-credit`, name: "Primary Credit Card", type: "debt", category: "Credit Cards", base_balance: 0, is_system: true }
        ];
        for (const acc of defaults) {
          await base44.db.upsertRow("user_accounts", acc);
        }
        accounts = await base44.db.getTable("user_accounts");
      }
      
      setDbAccounts(accounts || []);

      // 1. Fetch raw transactions directly from the production ledger.
      //    The Transactions page is a ledger view — it must show each
      //    individual transaction record, NOT budget-aggregated totals.
      //    Using normalizeTransactionData here caused every budget income
      //    item (Salary, Monthly Salary, Salary & Wages) to display the
      //    same canonical-category aggregate, creating duplicate rows.
      const ledger = await getProductionLedger({ month: monthKey });

      const resolveAccount = (tx) => {
        if (tx.account_id) {
          return accounts.find(a => String(a.id) === String(tx.account_id))?.name || 'Manual Vault';
        }
        return tx.account || 'Manual Vault';
      };

      const rawIncs = (ledger || [])
        .filter(t => {
          const rawType = (t.type || t.spend_type || "").toLowerCase();
          const amount = Number(t.amount) || 0;
          return rawType === 'income' || (rawType !== 'expense' && amount > 0);
        })
        .map(t => ({
          ...t,
          name:       t.merchant || t.name || t.category || 'Income Item',
          merchant:   t.merchant || t.name || t.category || 'Income Item',
          amount:     Math.abs(Number(t.amount) || 0),
          account_id: t.account_id || null,
          account:    resolveAccount(t),
          type:       'income',
          spendType:  t.spendType || t.spend_type || 'income'
        }));

      const rawExps = (ledger || [])
        .filter(t => {
          const rawType = (t.type || t.spend_type || "").toLowerCase();
          const amount = Number(t.amount) || 0;
          return rawType === 'expense' || (rawType !== 'income' && amount < 0);
        })
        .map(t => ({
          ...t,
          name:       t.merchant || t.name || t.category || 'Expense Item',
          merchant:   t.merchant || t.name || t.category || 'Expense Item',
          amount:     Math.abs(Number(t.amount) || 0),
          account_id: t.account_id || null,
          account:    resolveAccount(t),
          type:       'expense',
          spendType:  t.spendType || t.spend_type || 'variable'
        }));

      setIncomes(rawIncs);
      setExpenses(rawExps);

      // Preserve currency preference from budget if set
      const allBudgets = await getDatabaseTable("budgets");
      const saved = (allBudgets || []).find(b => b.month === monthKey);
      if (saved?.currency) setCurrency(saved.currency);

    } catch (err) {
      console.error("Transactions fetch failure:", err);
    } finally {
      setIsLoading(false);
    }
  }, [monthKey, selectedDate, getProductionLedger, getDatabaseTable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Re-fetch once Supabase auth session is confirmed ready.
  // Without this, fetchData fires before the PKCE session resolves,
  // falls through to the empty localStorage fallback, and shows $0.
  useEffect(() => {
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchData();
      }
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, [fetchData]);


  // Load Saved Searches on mount
  useEffect(() => {
    const loadSearches = async () => {
      const stored = await base44.user.loadData('wl_saved_searches');
      if (stored) setSavedSearches(stored);
    };
    loadSearches();
  }, []);

  const handleSaveCurrentSearch = async () => {
    if (!saveSearchName) return toast.error("Please enter a name for the search");
    
    const newSearch = {
      id: Date.now(),
      name: saveSearchName,
      query: searchQuery,
      tab: selectedTab,
      category: selectedCategory,
      accountId: selectedAccountId
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    await base44.user.saveData('wl_saved_searches', updated);
    setIsSaveSearchModalOpen(false);
    setSaveSearchName("");
    toast.success(`Search "${saveSearchName}" saved to sidebar`);
  };

  const handleDeleteSavedSearch = async (e, id) => {
    e.stopPropagation();
    const updated = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updated);
    await base44.user.saveData('wl_saved_searches', updated);
    toast.info("Saved search removed");
  };

  const applySavedSearch = (search) => {
    setSearchQuery(search.query || "");
    setSelectedTab(search.tab || "all");
    setSelectedCategory(search.category || null);
    setSelectedAccountId(search.accountId || null);
    setCurrentPage(1); // Reset pagination on filter change
  };

  const handleEditClick = (tx) => {
    setEditingTransaction({ ...tx });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    try {
      // 1. Map fields to DB schema (merchant, spend_type)
      const dbRecord = {
        ...editingTransaction,
        merchant:   editingTransaction.merchant || editingTransaction.name,
        spend_type: editingTransaction.spendType || editingTransaction.spend_type,
      };
      // Clean up UI-only fields
      delete dbRecord.spendType;
      delete dbRecord.name;
      delete dbRecord.account; // Account name is derived from account_id in DB

      // 2. Perform real individual UPSERT
      await base44.db.upsertRow('transactions', dbRecord);

      // 3. Update local state
      const targetState = editingTransaction.type === 'income' ? incomes : expenses;
      const setState = editingTransaction.type === 'income' ? setIncomes : setExpenses;
      
      const newState = targetState.map(item => 
        item.id === editingTransaction.id ? { ...editingTransaction } : item
      );
      
      setState(newState);
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      toast.success("Transaction updated successfully");
      
      // Refresh to ensure everything is in sync
      fetchData();
    } catch (err) {
      console.error("Failed to save edit:", err);
      toast.error("Failed to update transaction");
    }
  };

  const persistTransactionData = async (newIncomes, newExpenses) => {
    setHasChanges(true); // Don't auto-sync anymore
  };

  const handleCommit = async () => {
    setIsCommiting(true);
    try {
      // Save budget-level settings (like currency)
      // Transactions are now handled individually via insertRow/upsertRow
      await base44.db.upsert("budgets", {
        month: monthKey,
        currency,
        updated_at: new Date()
      }, "month");
      
      setHasChanges(false);
      toast.success("Budget settings committed to production");
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
      ...incomes.map(i => ({ 
        ...i, 
        type: 'income', 
        amount: i.amount || 0, 
        target: i.monthly_target, 
        merchant: i.name || i.merchant || i.category || 'Income Item', 
        date: (i.date && i.date !== 'Monthly') ? i.date : fallbackDate 
      })),
      ...expenses.map(e => ({ 
        ...e, 
        type: 'expense', 
        amount: e.amount || 0, 
        target: e.monthly_target, 
        merchant: e.name || e.merchant || e.category || 'Expense Item', 
        date: (e.date && e.date !== 'Monthly') ? e.date : fallbackDate 
      }))
    ];
  }, [incomes, expenses, selectedDate]);

  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter(tx => {
        // 1. Account Filter
        if (selectedAccountId) {
          if (selectedAccountId === 'manual') {
            if (tx.account_id && tx.account_id !== 'manual' && tx.account_id !== '') return false;
          } else {
            const accMatch = String(tx.account_id) === String(selectedAccountId);
            // Fallback: match by account name if ID is missing (for seeded data)
            const foundAcc = dbAccounts.find(a => String(a.id) === String(selectedAccountId));
            const nameMatch = foundAcc && tx.account === foundAcc.name;
            if (!accMatch && !nameMatch) return false;
          }
        }

        // 2. Tab Filter (Income/Expense/Uncategorized)
        if (selectedTab !== 'all') {
          if (selectedTab === 'uncategorized') {
            if (tx.category?.toLowerCase() !== 'uncategorized') return false;
          } else {
            // Strict type matching for Income/Expense tabs
            if (tx.type !== selectedTab) return false;
          }
        }

        // 3. Category Filter
        if (selectedCategory) {
          if (tx.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        // 4. Search Filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matches = (tx.merchant?.toLowerCase() || "").includes(q) || 
                          (tx.name?.toLowerCase() || "").includes(q) ||
                          (tx.category?.toLowerCase() || "").includes(q) ||
                          (tx.note?.toLowerCase() || "").includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allTransactions, selectedTab, searchQuery, selectedAccountId, selectedCategory, dbAccounts]);



  const handleAddAccount = async () => {
    if (!newAccount.name) return toast.error("Account name is required");
    try {
      await base44.db.upsert("user_accounts", {
        name: newAccount.name,
        type: newAccount.type,
        category: newAccount.category,
        base_balance: parseFloat(newAccount.balance) || 0
      });
      const accounts = await base44.db.getTable("user_accounts");
      setDbAccounts(accounts || []);
      setIsAddAccountOpen(false);
      setNewAccount({ name: "", type: "asset", category: "Bank", balance: "" });
      toast.success("Account created successfully");
    } catch (err) {
      console.error("Add account failed:", err);
      toast.error("Failed to add account");
    }
  };

  const handleDeleteAccount = async (id, name) => {
    try {
      await base44.db.deleteRow('user_accounts', id);
      
      // Migration Engine: Reassign all staged transactions to the Manual Vault
      const migrate = (items) => items.map(item => item.account_id === id ? { ...item, account_id: null, account: "Manual Vault" } : item);
      const updatedIncs = migrate(incomes);
      const updatedExps = migrate(expenses);
      
      setIncomes(updatedIncs);
      setExpenses(updatedExps);
      setHasChanges(true); // Flag for Commit synchronization

      const accounts = await base44.db.getTable("user_accounts");
      setDbAccounts(accounts || []);
      toast.success("Account deleted. Transactions migrated to Manual Vault.");
    } catch (err) {
      console.error("Delete account failed:", err);
      toast.error("Failed to delete account");
    }
  };

  const handlePurgeMonth = async () => {
    setIsLoading(true);
    try {
      // 1. Purge raw transactions for the month using a bounded date range deletion
      await base44.db.deleteByDatePrefix('transactions', 'date', monthKey);
      
      // 2. Purge budget state
      await base44.db.deleteByFilter('budgets', 'month', monthKey);
      
      // 3. Purge monthly summaries
      await base44.db.deleteByFilter('monthly_summaries', 'month', monthKey);

      toast.success(`Data purged for ${monthKey}`);
      
      // 4. Force refresh the data
      window.location.reload(); 
    } catch (err) {
      console.error("Purge failed:", err);
      toast.error("Failed to purge: " + (err.message || err));
    } finally {
      setIsLoading(true);
    }
  };

  const handleManualAdd = async () => {
    const parsedAmount = Number(manualForm.amount);
    if (!manualForm.merchant) return toast.error("Please enter a merchant/label");
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) return toast.error("Please enter a valid amount greater than 0");

    const newItem = {
      // DB schema columns: merchant, amount, category, type, spend_type, date, account_id
      merchant:   manualForm.merchant.trim(),
      category:   manualForm.type === 'income' ? 'Income' : (manualForm.category || "Uncategorized"),
      amount:     parsedAmount,
      type:       manualForm.type,
      spend_type: manualForm.type === 'income' ? 'income' : (manualForm.spendType || 'variable'),
      date:       manualForm.date,
      account_id: manualForm.account_id || null,
    };
    console.log('[handleManualAdd] Saving transaction:', newItem);

    try {
      // 1. Persist as a brand-new record (pure INSERT — no conflict/update)
      const savedItem = await base44.db.insertRow('transactions', newItem);
      
      // 2. Update local state for immediate feedback
      if (manualForm.type === 'income') {
        setIncomes(prev => [...prev, { ...newItem, id: savedItem.id || Date.now() }]);
      } else {
        setExpenses(prev => [...prev, { ...newItem, id: savedItem.id || Date.now() }]);
      }

      toast.success("Transaction saved permanently to ledger.");
      
      // 3. Fully refresh all component states from the database
      await fetchData();

      // 4. Reset form and close modal
      setManualForm({ 
        merchant: "", 
        amount: "", 
        type: "expense", 
        category: "Fixed", 
        date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0],
        account_id: ""
      });
      setIsAddModalOpen(false);

    } catch (err) {
      console.error("[Transactions] Manual add failed:", err);
      toast.error(`Persistence Error: ${err.message || 'Failed to save to ledger'}`);
    }
  };

  const handleUpdateItem = async (id, updates, type) => {
    const targetState = type === 'income' ? incomes : expenses;
    const item = targetState.find(i => i.id === id);
    if (!item) return;

    const updatedItem = { ...item, ...updates };
    
    try {
      // 1. Map fields to DB schema
      const dbRecord = {
        ...updatedItem,
        merchant:   updatedItem.merchant || updatedItem.name,
        spend_type: updatedItem.spendType || updatedItem.spend_type,
      };
      delete dbRecord.spendType;
      delete dbRecord.name;
      delete dbRecord.account;

      // 2. Immediate individual UPSERT
      await base44.db.upsertRow('transactions', dbRecord);

      // 3. Update local state
      if (type === 'income') {
        setIncomes(incomes.map(i => i.id === id ? updatedItem : i));
      } else {
        setExpenses(expenses.map(e => e.id === id ? updatedItem : e));
      }
      toast.success("Transaction updated");
    } catch (err) {
      console.error("Inline update failed:", err);
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id, type) => {
    // 1. Permanent Purge from Production Ledger
    // If the ID is a real database record (UUID or system-assigned long string), we must purge it from the ledger.
    // Mock IDs in this system are typically numbers or short strings.
    const isRealRecord = (typeof id === 'string' && id.length > 10);
    
    if (isRealRecord) {
      try {
        await base44.db.deleteRow('transactions', id);
      } catch (err) {
        console.error("[Transactions] Failed to purge record from ledger:", err);
      }
    }

    // 2. Update local state
    if (type === 'income') {
      const updated = incomes.filter(i => i.id !== id);
      setIncomes(updated);
      persistTransactionData(updated, expenses);
    } else {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      persistTransactionData(incomes, updated);
    }
    toast.info("Transaction removed and purged from ledger");
  };

  const handleBankSync = async (newItems) => {
    const fallbackDate = selectedDate.toLocaleString('default', { month: 'short' });
    const formatted = newItems.map(item => ({
      id: Date.now() + Math.random(),
      name: item.name || item.merchant || item.description || "Synced Transaction",
      category: item.category || "Uncategorized",
      amount: item.amount,
      date: item.date || `${fallbackDate} 01`
    }));
    const existing = new Set(expenses.map(e => `${e.name}-${e.amount}`));
    const uniqueNew = formatted.filter(f => !existing.has(`${f.name}-${f.amount}`));
    
    if (uniqueNew.length > 0) {
      try {
        // Map to DB schema
        const toInsert = uniqueNew.map(item => ({
          merchant: item.name,
          amount: item.amount,
          category: item.category,
          date: item.date,
          spend_type: 'variable', // Default for bank sync
          type: 'expense'
        }));
        
        // Bulk insert to production ledger
        await base44.db.insertRows('transactions', toInsert);
        
        const updated = [...expenses, ...uniqueNew];
        setExpenses(updated);
        toast.success(`Synced ${uniqueNew.length} new transactions to ledger!`);
        fetchData(); // Refresh to get DB IDs
      } catch (err) {
        console.error("Bank sync persistence failed:", err);
        toast.error("Failed to save synced transactions");
      }
    } else {
      toast.info("No new transactions found.");
    }
  };





  const summary = calculateMetrics(incomes, expenses, dbAccounts);
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
               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pt-px">
                  <button 
                    onClick={() => {
                        setSaveSearchName(searchQuery || "");
                        setIsSaveSearchModalOpen(true);
                    }}
                    className="text-white/40 hover:text-white transition-colors"
                    title="Save this search"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-[1px] h-3 bg-white/20 mx-0.5" />
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <Plus className="w-3 h-3 rotate-45" />
                  </button>
               </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-full hover:bg-white/10 transition-all text-white/70 hover:text-white"
              title={viewMode === 'list' ? "Switch to Grid View" : "Switch to List View"}
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
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
                  onClick={() => handleSidebarFilter('tab', item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${selectedTab === item.id && !selectedCategory && !selectedAccountId ? 'bg-purple-600 text-white shadow-md' : (selectedTab === item.id ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-white hover:shadow-sm')}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${selectedTab === item.id ? 'text-white' : item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {item.id === 'all' ? allTransactions.length : allTransactions.filter(tx => tx.type === item.id || (item.id === 'uncategorized' && tx.category === 'Uncategorized')).length}
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
              {savedSearches.length === 0 ? (
                <p className="px-4 py-3 text-[10px] text-slate-400 italic">No saved searches yet. Create one by clicking + next to the search bar.</p>
              ) : (
                savedSearches.map(s => (
                  <div 
                    key={s.id} 
                    className="group relative"
                  >
                    <button 
                      onClick={() => applySavedSearch(s)}
                      className={`w-full text-left px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 pr-10 truncate ${searchQuery === s.query ? 'bg-white shadow-sm text-purple-600 font-bold' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
                    >
                      <Search className="w-3 h-3 text-slate-300" /> 
                      <span className="truncate">{s.name}</span>
                    </button>
                    <button 
                      onClick={(e) => handleDeleteSavedSearch(e, s.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accounts</p>
              <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
                <DialogTrigger asChild>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-purple-600 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Account Name</label>
                       <Input 
                         placeholder="e.g. Savings Vault" 
                         value={newAccount.name}
                         onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                         <Select value={newAccount.type} onValueChange={(v) => setNewAccount(prev => ({ ...prev, type: v }))}>
                           <SelectTrigger><SelectValue /></SelectTrigger>
                           <SelectContent>
                             <SelectItem value="asset">Asset (Cash/Bank)</SelectItem>
                             <SelectItem value="debt">Debt (Credit Card)</SelectItem>
                           </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase">Initial Balance</label>
                         <Input 
                           type="number"
                           placeholder="0.00" 
                           value={newAccount.balance}
                           onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                         />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddAccount} className="w-full bg-purple-600 hover:bg-purple-700">Create Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2 px-2">
              {ACCOUNTS_SIDEBAR.map(acc => (
                <div 
                  key={acc.id} 
                  onClick={() => handleSidebarFilter('account', acc.id)}
                  className={`relative space-y-1 cursor-pointer group pr-8 p-1.5 rounded-xl transition-all ${selectedAccountId === acc.id ? 'bg-purple-50 ring-1 ring-purple-100 shadow-sm' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${acc.color}`} />
                    <span className={`text-xs font-medium transition-colors uppercase tracking-tight ${selectedAccountId === acc.id ? 'text-purple-600 font-bold' : 'text-slate-600 group-hover:text-purple-600'}`}>{acc.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 tabular-nums ml-5">
                    {(acc.balance || 0) < 0 ? `(${Math.abs(acc.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : (acc.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                  
                  {!acc.isVirtual && !acc.isSystem && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.currentTarget.dataset.confirmed === 'true') {
                          handleDeleteAccount(acc.id, acc.name);
                        } else {
                          e.currentTarget.dataset.confirmed = 'true';
                          e.currentTarget.classList.add('text-rose-600', 'bg-rose-100', 'opacity-100');
                          e.currentTarget.classList.remove('text-slate-300', 'hover:bg-rose-50', 'opacity-0', 'group-hover:opacity-100');
                          setTimeout(() => {
                            if (e.currentTarget) {
                              e.currentTarget.dataset.confirmed = 'false';
                              e.currentTarget.classList.remove('text-rose-600', 'bg-rose-100', 'opacity-100');
                              e.currentTarget.classList.add('text-slate-300', 'hover:bg-rose-50', 'opacity-0', 'group-hover:opacity-100');
                            }
                          }, 3000);
                        }
                      }}
                      className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-600 transition-all z-10 pointer-events-auto"
                      title="Click twice to delete account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
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
              {categoryNames.map(c => (
                <button 
                  key={c} 
                  onClick={() => handleSidebarFilter("category", c)}
                  className={`w-full text-left px-4 py-1.5 text-xs transition-colors truncate ${selectedCategory === c ? 'text-purple-600 font-bold bg-purple-50 rounded-lg shadow-sm' : 'text-slate-500 hover:text-purple-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Premium Header Metrics */}
          <div className="px-6 py-4 bg-[#fcfcfc] border-b border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-10">
               <div className="flex flex-col gap-0.5">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Income</span>
                 <span className="text-lg font-bold text-emerald-600 tabular-nums">{formatAmount(summary.totalIncome)}</span>
               </div>
               <div className="w-[1px] h-8 bg-slate-100" />
               <div className="flex flex-col gap-0.5">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expenses</span>
                 <span className="text-lg font-bold text-slate-700 tabular-nums">{formatAmount(summary.totalExpenses)}</span>
               </div>
               <div className="w-[1px] h-8 bg-slate-100" />
               <div className="flex flex-col gap-0.5">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Balance</span>
                 <span className={`text-lg font-bold tabular-nums ${summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                   {formatAmount(summary.balance)}
                 </span>
               </div>
            </div>
            
            <div className="flex items-center gap-2">

                <BankConnect onSyncSuccess={handleBankSync} />
                
                <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 text-xs font-medium border-slate-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                      <Download className="w-4 h-4" /> Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black tracking-tighter">Institutional Data Importer</DialogTitle>
                    </DialogHeader>
                    <SmartImporter 
                      accounts={dbAccounts}
                      onComplete={() => {
                        setIsImportModalOpen(false);
                        fetchData();
                      }}
                      onCancel={() => setIsImportModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                        min="0.01"
                        value={manualForm.amount}
                        onChange={(e) => setManualForm(prev => ({ ...prev, amount: e.target.valueAsNumber || '' }))}
                      />
                      <Input 
                        type="date"
                        value={manualForm.date}
                        onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                      <Select 
                        value={manualForm.type}
                        onValueChange={(v) => setManualForm(prev => ({ 
                          ...prev, 
                          type: v,
                          category: v === 'income' ? 'Income' : (prev.category === 'Income' ? 'Uncategorized' : prev.category)
                        }))}
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
                        <SelectContent className="max-h-[300px]">
                          {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
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
                      <Select 
                        value={manualForm.account_id}
                        onValueChange={(v) => setManualForm(prev => ({ ...prev, account_id: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Assign Account" /></SelectTrigger>
                        <SelectContent>
                          {dbAccounts.map(acc => (
                             <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleManualAdd}>Save Transaction</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  if (e.currentTarget.dataset.confirmed === 'true') {
                    handlePurgeMonth();
                  } else {
                    e.currentTarget.dataset.confirmed = 'true';
                    e.currentTarget.classList.add('bg-rose-600', 'text-white', 'border-rose-600');
                    e.currentTarget.classList.remove('bg-rose-50', 'text-rose-600', 'border-rose-200');
                    e.currentTarget.querySelector('span').innerText = 'Click again to confirm';
                    setTimeout(() => {
                      if (e.currentTarget) {
                        e.currentTarget.dataset.confirmed = 'false';
                        e.currentTarget.classList.remove('bg-rose-600', 'text-white', 'border-rose-600');
                        e.currentTarget.classList.add('border-rose-200', 'text-rose-600');
                        e.currentTarget.querySelector('span').innerText = 'Purge Month';
                      }
                    }, 3000);
                  }
                }}
                className="h-9 px-4 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Month</span>
              </Button>


              </div>
            </div>

            <Dialog open={isSaveSearchModalOpen} onOpenChange={setIsSaveSearchModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Save Filter Strategy</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                            Store your current keyword and category filters for instant access.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Input 
                            placeholder="e.g. London Whole Foods"
                            value={saveSearchName}
                            onChange={(e) => setSaveSearchName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentSearch()}
                            className="h-12 bg-slate-50 text-base font-medium border-slate-200 focus:bg-white transition-all shadow-inner"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button 
                            onClick={handleSaveCurrentSearch}
                            className="w-full bg-[#5e1d8d] hover:bg-[#4a1670] text-white font-bold h-12 shadow-lg shadow-purple-100"
                        >
                            Save Selection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Edit Transaction</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                            Refine details for this {editingTransaction?.type} entry.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant / Branding</label>
                            <Input 
                                value={editingTransaction?.merchant || ""}
                                onChange={(e) => setEditingTransaction(prev => ({ ...prev, merchant: e.target.value }))}
                                className="h-11 bg-slate-50 border-slate-200 font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</label>
                                <Input 
                                    type="number"
                                    value={editingTransaction?.amount || 0}
                                    onChange={(e) => setEditingTransaction(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                    className="h-11 bg-slate-50 border-slate-200 font-medium tabular-nums"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                                <Input 
                                    value={editingTransaction?.date || ""}
                                    onChange={(e) => setEditingTransaction(prev => ({ ...prev, date: e.target.value }))}
                                    className="h-11 bg-slate-50 border-slate-200 font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                                <Select 
                                    value={editingTransaction?.category || ""}
                                    onValueChange={(v) => setEditingTransaction(prev => ({ ...prev, category: v }))}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 font-medium">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account</label>
                                <Select 
                                    value={editingTransaction?.account_id || "manual"}
                                    onValueChange={(v) => setEditingTransaction(prev => ({ ...prev, account_id: v }))}
                                >
                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 font-medium">
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual Vault</SelectItem>
                                        {dbAccounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsEditModalOpen(false)}
                            className="font-bold text-slate-400"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveEdit}
                            className="bg-[#5e1d8d] hover:bg-[#4a1670] text-white font-bold h-11 px-8"
                        >
                            Update Transaction
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Entries</span>
                 <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                   <SelectTrigger className="h-8 border-none bg-slate-100/50 hover:bg-slate-100 text-xs font-bold w-20 rounded-full px-4 transition-all">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="10">10</SelectItem>
                     <SelectItem value="25">25</SelectItem>
                     <SelectItem value="50">50</SelectItem>
                     <SelectItem value="100">100</SelectItem>
                   </SelectContent>
                 </Select>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">items per page</span>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full border-slate-200 hover:bg-purple-50 hover:text-purple-600 transition-all"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2 px-3 h-8 bg-slate-100/50 rounded-full border border-slate-100">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page</span>
                   <span className="text-xs font-medium text-slate-900 tabular-nums">{currentPage}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">of</span>
                   <span className="text-xs font-medium text-slate-500 tabular-nums">{Math.ceil(filteredTransactions.length / itemsPerPage) || 1}</span>
                </div>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full border-slate-200 hover:bg-purple-50 hover:text-purple-600 transition-all"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredTransactions.length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredTransactions.length / itemsPerPage)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

          <div className="px-6 py-3 bg-[#fcfcfc] border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 italic">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} items.
            </p>
            {selectedTransactions.length > 0 && (
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-medium shadow-sm shadow-purple-100 animate-in zoom-in-50">
                {selectedTransactions.length} selected
              </span>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto bg-[#f8fafc]/50">
            {viewMode === 'list' ? (
              <Table className="w-full border-collapse">
                <TableHeader className="bg-slate-50/50 sticky top-0 z-20 backdrop-blur-md">
                  <TableRow className="hover:bg-transparent border-slate-100 h-12">
                    <TableHead className="w-12 p-4 text-center">
                      <Checkbox 
                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12 p-4"></TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Date</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Merchant</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4 text-right">Amount</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Category</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Type</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4">Account</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-4 text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                  {filteredTransactions
                    .slice((currentPage - 1) * parseInt(itemsPerPage), currentPage * parseInt(itemsPerPage))
                    .map((tx) => (
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
                                  <DropdownMenuItem 
                                    onClick={() => handleEditClick(tx)}
                                    className="gap-2 cursor-pointer text-slate-600"
                                  >
                                    <Edit2 className="w-4 h-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(tx.id, tx.type)} className="gap-2 text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                             </DropdownMenu>
                             {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-normal text-slate-500 whitespace-nowrap p-4">{formatDate(tx.date)}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex flex-col">
                            <span 
                              className="text-[13px] font-medium tracking-tight"
                              style={{ color: getMerchantTextColor(tx.category, tx.type) }}
                            >
                              {tx.merchant}
                            </span>
                            {tx.note && <span className="text-[11px] text-slate-500 mt-1.5 leading-relaxed max-w-md bg-slate-50 p-2 rounded-lg border border-slate-100 font-normal">{tx.note}</span>}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right text-sm font-normal p-4 tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {formatAmount(tx.amount || 0)}
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex items-center gap-2">
                            <Select 
                              value={tx.category || "Uncategorized"} 
                              onValueChange={(v) => handleUpdateItem(tx.id, { category: v }, tx.type)}
                            >
                              <SelectTrigger className="h-8 bg-white text-[11px] font-medium border-slate-200 px-3 w-[150px] hover:border-purple-300 hover:shadow-sm transition-all text-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px] w-[180px]">
                                {categories
                                  .filter(c => c.name.toLowerCase() !== "uncategorized")
                                  .map(c => (
                                    <SelectItem key={c.id || c.name} value={c.name} className="text-[11px] py-1.5 focus:bg-purple-50">
                                      <div className="flex items-center gap-2.5">
                                        <CategoryIcon iconId={c.icon_id || c.iconId} category={c.name} className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate leading-none">{c.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                {!categories.some(c => c.name.toLowerCase() === (tx.category || "").toLowerCase()) && tx.category && tx.category !== "Uncategorized" && (
                                  <SelectItem value={tx.category} className="text-[11px] py-1.5 focus:bg-purple-50">
                                    <div className="flex items-center gap-2.5">
                                      <CategoryIcon category={tx.category} className="w-3.5 h-3.5 shrink-0" />
                                      <span className="truncate leading-none">{tx.category}</span>
                                    </div>
                                  </SelectItem>
                                )}
                                <SelectItem value="Uncategorized" className="text-[11px] py-1.5 focus:bg-slate-50 border-t border-slate-50 mt-1">
                                  <div className="flex items-center gap-2.5 text-slate-400">
                                    <CategoryIcon category="Uncategorized" className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate leading-none italic">Uncategorized</span>
                                  </div>
                                </SelectItem>
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
                        <TableCell className="p-4">
                          <Select 
                            value={tx.account_id || "manual"} 
                            onValueChange={(v) => handleUpdateItem(tx.id, { account_id: v }, tx.type)}
                          >
                            <SelectTrigger className="h-7 bg-white text-[10px] font-normal border-slate-200 px-2 py-0.5 w-[140px] hover:border-purple-300 transition-all text-slate-700">
                              <SelectValue placeholder="Manual Vault" />
                            </SelectTrigger>
                            <SelectContent side="top">
                              <SelectItem value="manual" className="text-[10px] font-bold text-slate-400 uppercase">Manual Vault</SelectItem>
                              {dbAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id} className="text-[10px]">{acc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right text-xs font-normal text-slate-400 p-4 tabular-nums">
                          {(tx.balance || 0) < 0 ? `(${Math.abs(tx.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : (tx.balance || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-[1600px] mx-auto auto-rows-fr">
                {filteredTransactions
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((tx) => (
                    <div 
                      key={tx.id} 
                      className={`group relative p-6 rounded-[32px] border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-hidden ${selectedTransactions.includes(tx.id) ? 'ring-2 ring-purple-600' : ''}`}
                      style={{ 
                        backgroundColor: getCategoryColor(tx.category) + '0a', 
                        borderColor: getCategoryColor(tx.category) + '30' 
                      }}
                      onClick={() => toggleSelect(tx.id)}
                    >
                      {/* Premium Accent Line */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1.5 opacity-60" 
                        style={{ backgroundColor: getCategoryColor(tx.category) }}
                      />

                      <div>
                        {/* Card Top: Branding & Category */}
                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-14 h-14 rounded-2xl shadow-inner flex items-center justify-center border border-white/50 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                            <CategoryIcon 
                                category={tx.category} 
                                iconId={categories.find(c => c.name === tx.category)?.icon_id} 
                                className="w-6 h-6" 
                            />
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                           {tx.category && tx.category.toLowerCase() !== tx.merchant.toLowerCase() && (
                             <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                 {tx.category}
                             </span>
                           )}
                            <div className="flex items-center gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleEditClick(tx); }}
                                    className="p-2 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(tx.id, tx.type); }} 
                                    className="p-2 hover:bg-rose-50 rounded-full text-slate-300 hover:text-rose-500"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          </div>
                        </div>

                        {/* Card Center: Merchant Identity */}
                        <div className="space-y-1.5 mb-8">
                          <h3 
                            className="text-lg font-medium tracking-tight leading-none transition-opacity hover:opacity-80"
                            style={{ color: getMerchantTextColor(tx.category, tx.type) }}
                          >
                            {tx.merchant}
                          </h3>
                          {tx.name && 
                           tx.name.trim().toLowerCase() !== tx.merchant.trim().toLowerCase() && 
                           tx.name.trim().toLowerCase() !== tx.category.trim().toLowerCase() && (
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest truncate">{tx.name}</p>
                          )}
                          {tx.note && (
                             <div className="mt-3 text-[11px] text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-50 border-dashed leading-relaxed">
                                "{tx.note.length > 60 ? tx.note.substring(0, 60) + '...' : tx.note}"
                             </div>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Financial Summary */}
                      <div className="pt-6 border-t border-slate-50 flex items-end justify-between mt-auto">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{formatDate(tx.date)}</span>
                          <span className="text-xs font-black text-slate-700 tracking-tight flex items-center gap-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            {tx.account || "Manual Vault"}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-medium tabular-nums tracking-tighter leading-none mb-1 ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount || 0)}
                          </div>
                          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                            Balance: {formatAmount(tx.balance || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
