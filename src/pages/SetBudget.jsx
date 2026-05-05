import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { isSameMonthYear } from "@/utils/dateParser";
import { useCategories } from "@/hooks/useCategories";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MoreHorizontal, 
  Upload, 
  ArrowUpRight, 
  Folder,
  Trash2,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  Check,
  Settings2,
  Minus
} from "lucide-react";
import { CategoryIcon } from "@/utils/iconMap";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "sonner";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

import { CORE_CATEGORY_REGISTRY, resolveCanonicalCategory } from "@/utils/constants";

// Map colors based on registry values
const getColorClass = (color) => {
  return {
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    sky: "text-sky-300",
    orange: "text-orange-400",
    amber: "text-amber-300",
    purple: "text-purple-400",
    yellow: "text-yellow-300",
    rose: "text-rose-400",
    slate: "text-slate-400",
    blue: "text-blue-400",
    violet: "text-violet-400",
    cyan: "text-cyan-300",
    pink: "text-pink-400",
    red: "text-red-400",
    grey: "text-slate-400"
  }[color || "slate"];
};

function BudgetRow({ item, onEdit, onDelete }) {
  const { parseCurrency, formatAmount } = useFinancialParser();

  return (
    <>
      <div className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors flex items-center h-16 min-w-max">
        {/* Drag Handle Area */}
        <div className="w-12 flex items-center justify-center text-slate-200">
          <LayoutGrid className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        </div>

        {/* Category Column */}
        <div className="flex-1 flex items-center gap-3 min-w-[300px] px-4">
          <div className="p-2 border border-slate-100 rounded-lg shadow-sm">
            <CategoryIcon 
              iconId={item.iconId} 
              category={item.category} 
              colorClass={getColorClass(item.color)} 
            />
          </div>
          <Link 
            to={`/reports/Trends?category=${encodeURIComponent(item.category)}`}
            className="text-sm font-medium transition-colors hover:text-indigo-600 hover:underline decoration-indigo-200 underline-offset-4 cursor-pointer text-slate-600"
          >
            {item.category}
          </Link>
        </div>

        {/* Budget Column */}
        <div className="w-80 flex items-center px-6">
          <div className="w-full bg-slate-100/50 border border-slate-200/40 rounded-lg h-9 flex items-center px-4 relative overflow-hidden shadow-inner">
             {/* Progress Fill Indicator (Vibrant Slider Style) */}
             {(() => {
                const target = parseFloat(item.monthly_target) || parseCurrency(item.amount || "0") || 0;
                const spent = parseCurrency(item.budget || "0");
                const progress = target > 0 ? Math.min((spent / target) * 100, 100) : 0;
                const isOverspent = spent > target && target > 0;
                
                return (
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isOverspent ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`} 
                    style={{ width: `${progress}%` }} 
                  >
                    <div className={`absolute right-0 top-0 bottom-0 w-[3px] ${isOverspent ? 'bg-rose-500' : 'bg-emerald-500'} shadow-[0_0_8px_rgba(16,185,129,0.6)]`} />
                  </div>
                );
             })()}
             
             <div className="relative z-10 flex items-center justify-between w-full">
                {item.budget === "Start" ? (
                   <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[9px] cursor-pointer hover:text-indigo-700">
                      <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
                      Start
                   </div>
                ) : (
                   <>
                      <span className="text-[11px] font-black text-slate-800 tracking-tight">{item.budget}</span>
                      {item.status && (
                         <div className="flex items-center gap-1.5">
                            {item.status.includes('over') ? (
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            ) : (
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.status}</span>
                         </div>
                      )}
                   </>
                )}
             </div>
          </div>
        </div>

        {/* Actual Column */}
        <div className="w-32 px-4 text-right">
           <span className="text-[11px] font-bold text-slate-700 tabular-nums">
             {formatAmount(item.actual || 0, { useParentheses: false })}
           </span>
        </div>

        {/* Budget Column (Target) */}
        <div className="w-48 px-6 text-right">
           <span className={`text-[11px] font-bold tabular-nums ${(String(item.amount || "").includes('earned') || item.type === "income") ? 'text-emerald-600' : 'text-slate-500'}`}>
             {(() => {
               const target = parseFloat(item.monthly_target) || parseCurrency(item.amount || "0") || 0;
               return formatAmount(target, { useParentheses: false });
             })()}
           </span>
        </div>

        {/* Actions Column (Settings / Trash) */}
        <div className="w-24 px-4 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
             onClick={() => onEdit && onEdit(item)}
             className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
             title="Edit Category"
          >
             <Settings2 className="w-4 h-4" />
          </button>
          <button 
             onClick={() => onDelete && onDelete(item.id)}
             className="text-slate-400 hover:text-rose-500 transition-colors p-1"
             title="Delete Category"
          >
             <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Actions Column (Legacy dots) */}
        <div className="w-16 px-4 flex items-center justify-center">
          <button className="text-slate-200 hover:text-slate-400 transition-colors p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}

// Utility: Flatten nested categories for processing
const flattenCategories = (items) => {
  let result = [];
  if (!items) return result;
  items.forEach(item => {
    // Force all items into a flat structure
    const flatItem = { ...item, type: item.type === 'income' ? 'income' : 'item' };
    delete flatItem.children;
    result.push(flatItem);
    
    if (item.children && item.children.length > 0) {
      result = [...result, ...flattenCategories(item.children)];
    }
  });
  return result;
};

// Utility: Normalize structure against the core registry AND user's personal registry
const normalizeStructure = (savedItems = [], userCategories = [], currentActuals = {}, formatAmount) => {
  const finalMap = new Map();
  const hasSavedItems = savedItems.length > 0;
  
  // 1. Initialize with Saved Items (The user's defined budget targets)
  // This is now the authoritative source of truth for the budget structure.
  savedItems.forEach(s => {
    const name = s.category || s.name || "Uncategorized";
    const canonical = resolveCanonicalCategory(name).trim();
    const key = canonical.toLowerCase();
    if (!key) return;
    
    finalMap.set(key, { 
      ...s, 
      category: canonical,
      id: s.id || `saved-${key}`,
      type: s.type === 'income' ? 'income' : 'item'
    });
  });

  // 2. Add Active Spending (Ensures visibility of unbudgeted expenses)
  Object.keys(currentActuals).forEach(rawKey => {
    const key = rawKey.trim().toLowerCase();
    const spent = currentActuals[rawKey] || 0;
    
    if (spent > 0) {
      const existing = finalMap.get(key);
      if (existing) {
        existing.budget = formatAmount(spent);
      } else {
        const canonical = resolveCanonicalCategory(key).trim();
        finalMap.set(key, {
          id: `auto-${key}`,
          category: canonical,
          monthly_target: 0,
          amount: "0",
          budget: formatAmount(spent),
          status: "UNBUDGETED",
          type: 'item'
        });
      }
    }
  });

  // 3. Registry Baseline: Ensure all core AND user-defined categories exist in the view.
  // This makes custom categories "sticky" across months even if they aren't in the template.
  const registries = [...CORE_CATEGORY_REGISTRY, ...userCategories];
  registries.forEach(reg => {
    if (reg.type === 'income') return; // Income is handled separately
    
    const name = reg.name || reg.category;
    const canonical = resolveCanonicalCategory(name).trim();
    const key = canonical.toLowerCase();
    
    if (key && !finalMap.has(key)) {
      finalMap.set(key, {
        id: `reg-${key}`,
        ...reg,
        category: canonical,
        monthly_target: 0,
        amount: "0",
        budget: formatAmount(0),
        status: "NO TARGET SET",
        type: 'item'
      });
    }
  });

  // 4. Metadata Enrichment: Overlay icons/colors from registries for ANY item missing them
  const enrichFromRegistry = (registry) => {
    registry.forEach(reg => {
      const canonical = resolveCanonicalCategory(reg.name || reg.category).trim();
      const key = canonical.toLowerCase();
      const existing = finalMap.get(key);
      if (existing) {
        existing.iconId = existing.iconId || reg.iconId || reg.icon_id;
        existing.color = existing.color || reg.color;
      }
    });
  };

  enrichFromRegistry(CORE_CATEGORY_REGISTRY);
  enrichFromRegistry(userCategories);

  return Array.from(finalMap.values()).sort((a, b) => a.category.localeCompare(b.category));
};

export default function SetBudget() {
  const { parseCurrency, formatAmount, normalizeTransactionData } = useFinancialParser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  const { categories, addCategory, seedCategories, isLoading: categoriesLoading } = useCategories(monthKey, { global: true });

  const [data, setData] = useState([]);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [budgetId, setBudgetId] = useState(null);
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [actualIncome, setActualIncome] = useState(0);
  const [actualsMap, setActualsMap] = useState({});
  const [monthTransactions, setMonthTransactions] = useState([]);
  const hasGroups = useMemo(() => data.some(item => item.type === "group"), [data]);
  const leafCategories = useMemo(() => 
    flattenCategories(CORE_CATEGORY_REGISTRY).filter(c => c.type !== 'income'), 
    []
  );


  const loadBudgetAndActuals = useCallback(async () => {
    if (isSaving) return;
    try {
      setIsInitialLoading(true);
      
      // 1. Fetch budget definition
      let results = await base44.db.query("budgets", {
        filters: [{ column: 'month', op: 'eq', value: monthKey }]
      });
      
      let saved;
      let isTemplate = false;

      if (results && results.length > 0) {
        // DATA INTEGRITY: If multiple records exist for the same month, 
        // always prioritize the most recently updated one.
        saved = results.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0];
      } else {
        const allBudgets = await base44.db.getTable("budgets", { month: monthKey });
        if (allBudgets && allBudgets.length > 0) {
          const sorted = allBudgets.sort((a, b) => b.month.localeCompare(a.month));
          saved = sorted[0];
          isTemplate = true;
        }
      }

      // 2. Fetch actual transactions for this month to calculate consumption
      const txResults = await base44.db.getTable("transactions", { month: monthKey });
      
      // 3. Normalize data using the UNIFIED PARSER for 100% parity
      const { expenses: normExps, incomes: normIncs } = normalizeTransactionData(saved, selectedDate, txResults, categories);
      
      // Aggressively deduplicate and ensure every category has its actual total
      const currentActuals = {};
      normExps.forEach(e => {
        const key = resolveCanonicalCategory(e.category).trim().toLowerCase();
        currentActuals[key] = (currentActuals[key] || 0) + (Number(e.amount) || 0);
      });

      const totalActualInc = normIncs.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      setActualIncome(totalActualInc);
      setActualsMap(currentActuals);
      setMonthTransactions(txResults);

      if (saved || Object.keys(currentActuals).length > 0) {
        if (saved && !isTemplate) setBudgetId(saved.id);
        else setBudgetId(null);

        if (saved && saved.payload && saved.payload.expectedIncome !== undefined) {
           setExpectedIncome(Number(saved.payload.expectedIncome));
        } else {
           setExpectedIncome(totalActualInc);
        }

        const structuralData = normalizeStructure(
          (saved?.payload?.visualData || saved?.payload?.expenses || []).filter(item => item.type !== 'income'), 
          categories,
          currentActuals,
          formatAmount
        );
        
        // Inject actuals into the loaded data
        const finalArray = structuralData.map(item => {
          const canonical = resolveCanonicalCategory(item.category || item.name).trim();
          const spent = currentActuals[canonical.toLowerCase()] || 0;
          const target = parseFloat(item.monthly_target) || parseCurrency(item.amount || "0") || 0;
          
          return {
            ...item,
            category: canonical,
            actual: spent,
            budget: formatAmount(spent),
            status: target > 0 
              ? (spent > target ? `${formatAmount(spent - target)} over` : `${formatAmount(target - spent)} left`)
              : (spent > 0 ? "UNBUDGETED" : "NO TARGET SET")
          };
        }).sort((a, b) => a.category.localeCompare(b.category));

        setData(finalArray);
      } else {
        const structuralData = normalizeStructure([], categories, currentActuals, formatAmount);
        setData(structuralData);
        setBudgetId(null);
      }
    } catch (err) {
      console.error("Failed to load budget and actuals:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [monthKey, parseCurrency, formatAmount, categories]);

  useEffect(() => {
    loadBudgetAndActuals();
  }, [loadBudgetAndActuals]);

  const handleCopyFromPreviousMonth = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${(prevDate.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!window.confirm(`Copy budget from ${prevMonthKey}? This will overwrite your current targets for ${monthKey}.`)) return;
    
    setIsSaving(true);
    try {
      const results = await base44.db.query("budgets", {
        filters: [{ column: 'month', op: 'eq', value: prevMonthKey }]
      });

      if (results && results.length > 0) {
        const prevBudget = results[0];
        let prevData = [];
        if (prevBudget.payload) {
          prevData = prevBudget.payload.visualData || [...(prevBudget.payload.incomes || []), ...(prevBudget.payload.expenses || [])];
        }

        // Sanitize: carry over targets but clear actuals
        const clonedData = prevData.map(item => ({
          ...item,
          budget: item.type === 'income' ? "$0 earned" : "$0 spent",
          status: item.type === 'income' ? `${formatAmount(item.monthly_target || 0, { decimals: 0, useParentheses: false })} to go` : `${formatAmount(item.monthly_target || 0, { decimals: 0 })} left`,
          progress: 0
        }));

        setData(normalizeStructure(clonedData, categories));
        setHasChanges(true);
        toast.success(`Leads from ${prevMonthKey} synchronized successfully.`);
      } else {
        toast.error(`No previous budget found for ${prevMonthKey}`);
      }
    } catch (err) {
      console.error("Copy budget failed:", err);
      toast.error("Failed to clone budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBudget = async (overrideData = null) => {
    setIsSaving(true);
    try {
      const activeData = overrideData || data;
      const flatItems = flattenCategories(activeData);
      const expensesToSave = flatItems.filter(i => i.type !== "income");

      // 1. Commit to the relational budgets table
      const result = await base44.db.upsertRow("budgets", { 
        id: budgetId,
        month: monthKey, 
        payload: { 
          visualData: expensesToSave,
          expenses: expensesToSave.map(i => ({ ...i, icon: null }))
        } 
      });

      if (result && result.id) {
        setBudgetId(result.id);
      }

      // 2. Synchronize the category registry
      await seedCategories(flatItems.map(item => ({
        category: item.category,
        type: item.type === 'income' ? 'income' : 'expense',
        iconId: item.iconId,
        color: item.color
      })));

      setHasChanges(false);
      // Removed toast for auto-save to prevent noise
      
      // 3. Force a clean refresh from the DB truth (using currentActuals logic internally)
      // but only if we aren't in the middle of a UI update
    } catch (err) {
      console.error("[SetBudget] Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Sync Global Category Registry (Flat Only)
  useEffect(() => {
    if (!categoriesLoading && categories.length === 0) {
      console.log("[SetBudget] Category registry empty. Seeding defaults...");
      seedCategories(CORE_CATEGORY_REGISTRY);
    }
  }, [categoriesLoading, categories.length, seedCategories]);

  // New Budget Form State
  const initialFormState = {
    category: "",
    categoryName: "",
    repeat: false,
    frequency: "1",
    freqUnit: "weeks",
    amount: "0.00",
    type: "expense",
    account: "Sample Bank Account"
  };

  const [newBudget, setNewBudget] = useState(initialFormState);

  // Clear form when dialog opens/closes
  useEffect(() => {
    if (!isNewBudgetOpen) {
      setNewBudget(initialFormState);
    }
  }, [isNewBudgetOpen]);
  
  const flatItems = useMemo(() => flattenCategories(data), [data]);
  
  const totals = useMemo(() => {
    let plannedExpense = 0;
    let actualExpense = 0;
    
    flatItems.forEach(item => {
      const val = Number(item.monthly_target || parseCurrency(item.amount || "0"));
      plannedExpense += val;
      
      const canonical = resolveCanonicalCategory(item.category || item.name);
      actualExpense += (actualsMap[canonical.toLowerCase()] || 0);
    });

    return {
      income: expectedIncome,
      actualIncome: actualIncome,
      expense: plannedExpense,
      actualExpense: actualExpense,
      net: expectedIncome - plannedExpense,
      actualNet: actualIncome - actualExpense
    };
  }, [flatItems, expectedIncome, actualIncome, parseCurrency, actualsMap]);


  const handleEditItem = (item) => {
    // Determine the likely type if missing
    let likelyType = item.type;
    const cat = (item.category || "").toLowerCase();
    
    // Explicitly check for "Rent" which might be misclassified in legacy data
    if (cat.includes("rent") || cat.includes("mortgage")) {
      likelyType = "expense";
    } else if (!likelyType) {
      likelyType = (cat.includes("salary") || cat.includes("income")) ? "income" : "expense";
    }

    setEditingItem(item);
    setNewBudget({
      category: item.id,
      categoryName: item.category,
      repeat: true,
      frequency: "1",
      freqUnit: "months",
      amount: (item.monthly_target || parseCurrency(item.amount || "0")).toString(),
      type: likelyType === "income" ? "income" : "expense",
      account: "Sample Bank Account"
    });
    setIsNewBudgetOpen(true);
  };

  const handleDeleteItem = (targetId) => {
    const itemToDelete = data.find(i => i.id === targetId);
    if (!itemToDelete) return;
    
    const canonicalToDelete = resolveCanonicalCategory(itemToDelete.category).toLowerCase().trim();
    
    const updated = data.filter(item => {
      const itemCanonical = resolveCanonicalCategory(item.category).toLowerCase().trim();
      // Remove both the specific ID and any canonical duplicates
      return item.id !== targetId && itemCanonical !== canonicalToDelete;
    });
    
    const sorted = updated.sort((a, b) => a.category.localeCompare(b.category));
    setData(sorted);
    setIsNewBudgetOpen(false);
    setEditingItem(null);
    handleSaveBudget(updated);
    toast.success(`Removed ${itemToDelete.category} from budget.`);
  };

  const handleSaveNewBudget = async () => {
    // 1. Ensure the category exists in the central list
    const searchName = newBudget.categoryName || "";
    let catObj = categories.find(c => c.name.toLowerCase() === searchName.toLowerCase());
    
    if (!catObj && searchName) {
      catObj = await addCategory(searchName, newBudget.type);
    }

    const newTarget = parseFloat(newBudget.amount) || 0;
    const spent = actualsMap[searchName.toLowerCase()] || 0;
    
    const canonicalName = resolveCanonicalCategory(searchName || (catObj ? catObj.name : "Uncategorized"));
    
    const budgetItem = {
      id: editingItem ? editingItem.id : (catObj?.id ? `cat-${catObj.id}` : `custom-${Date.now()}`),
      category: canonicalName,
      monthly_target: newTarget,
      amount: formatAmount(newTarget, { decimals: 0 }) + " / mo",
      iconId: catObj?.icon_id || editingItem?.iconId || (newBudget.type === "income" ? "circle-emerald" : "circle-indigo"),
      type: newBudget.type === "income" ? "income" : "item",
      color: catObj?.color || editingItem?.color || (newBudget.type === "income" ? "emerald" : "indigo"),
      budget: formatAmount(spent),
      status: newBudget.type === "income" 
        ? (spent >= newTarget ? "Target Reached" : `${formatAmount(newTarget - spent)} to go`)
        : (spent > newTarget ? `${formatAmount(spent - newTarget)} over` : `${formatAmount(newTarget - spent)} left`),
      progress: newTarget > 0 ? Math.min(100, (spent / newTarget) * 100) : 0
    };

    let updatedData;
    const targetCanonical = canonicalName.toLowerCase().trim();
    
    // Aggressively purge any existing entries (by ID or by Canonical Name) 
    // to ensure this save results in exactly ONE canonical entry.
    const filteredData = data.filter(item => {
      const itemCanonical = resolveCanonicalCategory(item.category).toLowerCase().trim();
      const isEditingThis = editingItem && item.id === editingItem.id;
      const isSameCategory = itemCanonical === targetCanonical;
      return !isEditingThis && !isSameCategory;
    });

    updatedData = [...filteredData, budgetItem];

    const sorted = updatedData.sort((a, b) => a.category.localeCompare(b.category));
    setData(sorted);
    toast.success(`${editingItem ? 'Updated' : 'Created'} budget for ${budgetItem.category}. Auto-saving...`);
    setIsNewBudgetOpen(false);
    setEditingItem(null);
    
    // Trigger automated save
    handleSaveBudget(updatedData);
  };

  const toggleGroup = (id) => {
    const toggleRecursive = (items) => {
      return items.map(item => {
        if (item.id === id) return { ...item, isExpanded: !item.isExpanded };
        if (item.children) {
          return { ...item, children: toggleRecursive(item.children) };
        }
        return item;
      });
    };
    setData(prev => toggleRecursive(prev));
  };

  const toggleAll = () => {
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    setData(prev => prev.map(item => {
      if (item.type === "group") return { ...item, isExpanded: newState };
      return item;
    }));
  };

   if (isInitialLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
           <div className="relative mb-12">
              <div className="w-24 h-24 rounded-[32px] bg-slate-900 flex items-center justify-center animate-pulse">
                 <LayoutGrid className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#C5A059] flex items-center justify-center shadow-xl animate-bounce">
                 <ShieldCheck className="w-5 h-5 text-white" />
              </div>
           </div>
           
           <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Initializing Strategic Ledger</h2>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="h-full bg-slate-900" 
                 />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A059]">Syncing Global Allocation Parameters · {monthKey}</p>
           </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        {/* Header Area */}
        <div className="w-full px-6 pt-6 pb-4 border-b border-slate-100">
           <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between w-full gap-4">
                  <h1 className="text-[28px] font-medium text-slate-800 tracking-tight">Budget Planner</h1>
                  {/* Institutional Premium Date Navigator */}
                  <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-1 shadow-sm backdrop-blur-sm">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
                        onClick={() => {
                           const newDate = new Date(selectedDate);
                           newDate.setMonth(selectedDate.getMonth() - 1);
                           setSelectedDate(newDate);
                        }}
                     >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                     </Button>

                     <div className="flex items-center gap-0 px-1">
                        <Select 
                          value={selectedDate.getMonth().toString()} 
                          onValueChange={(val) => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(parseInt(val));
                            setSelectedDate(newDate);
                          }}
                        >
                          <SelectTrigger className="w-auto min-w-[75px] border-none bg-transparent h-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 focus:ring-0 p-0 shadow-none hover:text-indigo-600 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()} className="text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                {format(new Date(2026, i, 1), 'MMMM')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="w-4 flex justify-center text-[11px] font-black text-slate-300">/</div>

                        <Select 
                          value={selectedDate.getFullYear().toString()} 
                          onValueChange={(val) => {
                            const newDate = new Date(selectedDate);
                            newDate.setFullYear(parseInt(val));
                            setSelectedDate(newDate);
                          }}
                        >
                          <SelectTrigger className="w-auto min-w-[45px] border-none bg-transparent h-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 focus:ring-0 p-0 shadow-none hover:text-indigo-600 transition-colors">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                            {[2025, 2026, 2027, 2028].map(y => (
                              <SelectItem key={y} value={y.toString()} className="text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                     </div>

                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm transition-all"
                        onClick={() => {
                           const newDate = new Date(selectedDate);
                           newDate.setMonth(selectedDate.getMonth() + 1);
                           setSelectedDate(newDate);
                        }}
                     >
                        <ChevronRight className="w-4 h-4" />
                     </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    onClick={handleCopyFromPreviousMonth}
                    className="h-9 px-4 text-xs font-bold text-slate-400 border border-slate-200 rounded-xl hover:bg-slate-50 gap-2"
                  >
                     <Upload className="w-3.5 h-3.5" /> Copy Last Month
                  </Button>

                  <Dialog open={isNewBudgetOpen} onOpenChange={setIsNewBudgetOpen}>
                   <DialogTrigger asChild>
                     <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 gap-2">
                        <Plus className="w-3.5 h-3.5" /> New budget
                     </Button>
                   </DialogTrigger>


                      <DialogContent className="sm:max-w-[480px] p-0 rounded-[24px] overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="bg-[#f2f1ef] px-6 py-4 flex flex-row items-center justify-between border-b border-slate-200/60">
                          <div className="space-y-0.5">
                            <DialogTitle className="text-[22px] font-medium text-slate-700 tracking-tight">New budget</DialogTitle>
                            <p className="text-[11px] font-medium text-slate-400">Scheduled for Apr 10, 2026</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-700">{formatAmount(newBudget.amount || 0)}</span>
                          </div>
                        </DialogHeader>

                        <div className="p-8 space-y-8">
                          {/* Category Selection (Centralized Registry) */}
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600">What is this budget for?</label>
                            <div className="relative group">
                              <Input 
                                list="category-list"
                                placeholder="Type to search or add category..."
                                value={newBudget.categoryName || ""}
                                onChange={(e) => setNewBudget({ ...newBudget, categoryName: e.target.value })}
                                className="w-full bg-white border-none border-b border-slate-300 rounded-none px-0 h-10 text-slate-700 shadow-none focus-visible:ring-0 focus:border-slate-800 transition-all font-medium"
                              />
                              <datalist id="category-list">
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.name} />
                                ))}
                              </datalist>
                            </div>
                          </div>

                          {/* Repeat Logic */}
                          <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-600">Does this budget repeat?</label>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Checkbox 
                                  id="repeat" 
                                  checked={newBudget.repeat} 
                                  onCheckedChange={(val) => setNewBudget({ ...newBudget, repeat: val })}
                                  className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                />
                                <Label htmlFor="repeat" className="text-sm font-medium text-slate-700">Yes</Label>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-400">every</span>
                                <Input 
                                  type="number" 
                                  value={newBudget.frequency}
                                  onChange={(e) => setNewBudget({ ...newBudget, frequency: e.target.value })}
                                  className="w-12 h-8 border-none border-b border-slate-200 rounded-none bg-transparent px-1 text-center text-sm font-bold text-slate-700 focus-visible:ring-0 focus:border-slate-800"
                                />
                                <Select 
                                  value={newBudget.freqUnit} 
                                  onValueChange={(val) => setNewBudget({ ...newBudget, freqUnit: val })}
                                >
                                  <SelectTrigger className="w-24 bg-transparent border-none text-sm font-medium text-slate-400 shadow-none focus:ring-0 p-0 h-auto">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="days">days</SelectItem>
                                    <SelectItem value="weeks">weeks</SelectItem>
                                    <SelectItem value="fortnight">fortnight</SelectItem>
                                    <SelectItem value="months">months</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          {/* Amount & Type */}
                          <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-600">How much?</label>
                            <div className="flex items-center justify-between gap-8">
                              <div className="flex-1 relative">
                                <Input 
                                  type="number" 
                                  value={newBudget.amount}
                                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                  className="w-full bg-white border-none border-b border-slate-300 rounded-none px-0 h-10 text-lg font-medium text-slate-700 shadow-none focus-visible:ring-0 focus:border-slate-800 transition-all tabular-nums"
                                />
                              </div>
                              {/* Type is now effectively hardcoded to expense for the planner list */}
                            </div>
                          </div>

                          {/* Account Selection */}
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600">Which account's forecast is this budget for?</label>
                            <Select 
                              value={newBudget.account} 
                              onValueChange={(val) => setNewBudget({ ...newBudget, account: val })}
                            >
                              <SelectTrigger className="w-full bg-white border-none border-b border-slate-300 rounded-none px-0 h-10 text-slate-700 shadow-none focus:ring-0 focus:border-slate-800 transition-all font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="Sample Bank Account" className="text-sm py-2.5">Sample Bank Account</SelectItem>
                                <SelectItem value="Savings Account" className="text-sm py-2.5">Savings Account</SelectItem>
                                <SelectItem value="Credit Card" className="text-sm py-2.5">Credit Card</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <DialogFooter className="p-6 pt-2 border-t border-slate-50 gap-3 justify-between items-center flex flex-row">
                          <div className="flex items-center gap-2">
                             {editingItem && (
                                <Button 
                                   variant="ghost" 
                                   size="sm"
                                   className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 h-8 text-[10px] font-black uppercase tracking-widest"
                                   onClick={() => handleDeleteItem(editingItem.id)}
                                >
                                   Delete Category
                                </Button>
                             )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="ghost" 
                              onClick={() => setIsNewBudgetOpen(false)}
                              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 px-6"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleSaveNewBudget}
                              className="bg-[#0f846a] hover:bg-[#0c6b56] text-white font-black uppercase tracking-widest px-8 h-12 rounded-[18px] shadow-lg shadow-[#0f846a]/20"
                            >
                              Save
                            </Button>
                          </div>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                 
                  <div className="flex items-center gap-2">
                    {hasGroups && (
                      <Button onClick={toggleAll} variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                         {isAllExpanded ? "Collapse All" : "Expand All"}
                      </Button>
                    )}
                  </div>
              </div>


           </div>
        </div>

        {/* Content Area */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Table Header */}
            <div className="flex items-center h-16 border-b border-slate-100 bg-slate-50/30 px-0">
               <div className="w-12" />
               <div className="flex-1 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2 min-w-[300px]">
                  Category
               </div>
               <div className="w-80 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                  Budget Progress
               </div>
               <div className="w-32 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-right">
                  Actual
               </div>
               <div className="w-48 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-right">
                  Target
               </div>
               <div className="w-24" />
               <div className="w-16" />
            </div>

            {/* Table Body */}
            <div>
              {data.map((item) => (
                <BudgetRow 
                   item={item} 
                   key={item.id} 
                   onEdit={handleEditItem}
                   onDelete={handleDeleteItem}
                />
              ))}
            </div>

            {/* Institutional Pulse Bar */}
            <div className="mx-0 my-0 p-10 bg-slate-50/30 border-t border-slate-100 relative overflow-hidden">
               <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                  
                  {/* Pillar 1: Allocation Target */}
                  <div className="flex-1 flex flex-col gap-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Total Target</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">
                           {formatAmount(totals.expense)}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Planned</span>
                     </div>
                  </div>

                  <div className="h-12 w-px bg-slate-200" />

                  {/* Pillar 2: Actual Performance */}
                  <div className="flex-1 flex flex-col gap-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Actual Spent</p>
                     <div className="flex items-baseline gap-3">
                        <p className={`text-3xl font-black tabular-nums tracking-tighter ${totals.actualExpense > totals.expense ? 'text-rose-600' : 'text-slate-900'}`}>
                           {formatAmount(totals.actualExpense)}
                        </p>
                        <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${totals.actualExpense > totals.expense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                           {totals.actualExpense > totals.expense ? 'Over Budget' : 'On Track'}
                        </div>
                     </div>
                  </div>

                  <div className="h-12 w-px bg-slate-200" />

                  {/* Pillar 3: Budget Variance (The Overspend) */}
                  <div className="flex-1 flex flex-col gap-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Budget Variance</p>
                     <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-black tabular-nums tracking-tighter ${totals.actualExpense > totals.expense ? 'text-rose-600' : 'text-emerald-600'}`}>
                           {formatAmount(Math.abs(totals.expense - totals.actualExpense))}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${totals.actualExpense > totals.expense ? 'text-rose-400' : 'text-emerald-400'}`}>
                           {totals.actualExpense > totals.expense ? 'Overspend' : 'Savings'}
                        </span>
                     </div>
                  </div>

                  <div className="h-12 w-px bg-slate-200" />

                  {/* Pillar 4: Realized Profit */}
                  <div className="flex-1 flex flex-col gap-2 items-end">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Net Monthly Surplus</p>
                     <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-black tabular-nums tracking-tighter ${totals.actualNet >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                           {formatAmount(totals.actualNet)}
                        </p>
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
                     </div>
                  </div>

               </div>
            </div>

            {/* Footer / Empty State placeholder */}
            <div className="p-12 border-t border-slate-100 flex flex-col items-center justify-center gap-4 bg-slate-50/20">
               <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <LayoutGrid className="w-6 h-6 text-slate-300" />
               </div>
               <div className="text-center">
                  <p className="text-sm font-bold text-slate-400">End of budget list</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Add items above to expand your tracking</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
