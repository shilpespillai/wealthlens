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

        {/* Amount Column */}
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
const normalizeStructure = (savedItems, userCategories = []) => {
  // 1. Build the baseline from BOTH Core Registry and User's DB Categories
  // This ensures newly added categories persist across all months even before targets are set.
  const finalMap = new Map();
  
  // A. Start with Core Categories (Filtered for Expenses)
  CORE_CATEGORY_REGISTRY
    .filter(cat => cat.type !== 'income')
    .forEach(cat => {
      finalMap.set(cat.name.toLowerCase(), {
        ...cat,
        category: cat.name,
        monthly_target: 0,
        amount: "0",
        budget: "$0 spent",
        status: "0.00 left"
      });
    });

  // B. Merge User DB Categories (Override core if exists, or add as new)
  // This is the key for persistence: it pulls from the 'user_categories' table.
  userCategories
    .filter(cat => cat.type !== 'income')
    .forEach(cat => {
      const name = cat.name || cat.category;
      const key = name.toLowerCase();
      const existing = finalMap.get(key);
      
      finalMap.set(key, {
        ...(existing || { id: `cat-${cat.id || Date.now()}` }),
        ...cat,
        iconId: cat.iconId || cat.icon_id || existing?.iconId || 'circle',
        category: name,
        monthly_target: existing?.monthly_target || 0,
        amount: existing?.amount || "0",
        budget: existing?.budget || "$0 spent",
        status: existing?.status || "0.00 left"
      });
    });

  // 2. Overlay specific saved items for THIS month (carrying the targets/actuals)
  savedItems.forEach(s => {
    const canonicalName = resolveCanonicalCategory(s.category || s.name);
    const key = canonicalName.toLowerCase();
    
    const existing = finalMap.get(key);
    if (existing) {
      finalMap.set(key, { ...existing, ...s, category: canonicalName });
    } else {
      finalMap.set(key, { ...s, category: s.category || s.name });
    }
  });

  return Array.from(finalMap.values());
};

export default function SetBudget() {
  const { parseCurrency, formatAmount } = useFinancialParser();
  const { categories, addCategory, seedCategories, isLoading: categoriesLoading } = useCategories();

  const [data, setData] = useState([]);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [budgetId, setBudgetId] = useState(null);
  const [expectedIncome, setExpectedIncome] = useState(0);
  const [actualsMap, setActualsMap] = useState({});
  const [monthTransactions, setMonthTransactions] = useState([]);
  const hasGroups = useMemo(() => data.some(item => item.type === "group"), [data]);
  const leafCategories = useMemo(() => 
    flattenCategories(CORE_CATEGORY_REGISTRY).filter(c => c.type !== 'income'), 
    []
  );

  const [selectedDate, setSelectedDate] = useState(new Date());
  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  const loadBudgetAndActuals = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      
      // 1. Fetch budget definition
      let results = await base44.db.query("budgets", {
        filters: [{ column: 'month', op: 'eq', value: monthKey }]
      });
      
      let saved;
      let isTemplate = false;

      if (results && results.length > 0) {
        saved = results[0];
      } else {
        const allBudgets = await base44.db.getTable("budgets");
        if (allBudgets && allBudgets.length > 0) {
          const sorted = allBudgets.sort((a, b) => b.month.localeCompare(a.month));
          saved = sorted[0];
          isTemplate = true;
        }
      }

      // 2. Fetch actual transactions for this month to calculate consumption
      const txResults = await base44.db.getTable("transactions");
      const [targetYear, targetMonth] = monthKey.split('-').map(Number);

      const monthTransactions = (txResults || []).filter(tx => 
        isSameMonthYear(tx.date || tx.actualDate, targetMonth, targetYear)
      );

      // Aggregate spent amounts by canonical category name
      const currentActuals = {};
      const EXCLUDED_CATEGORIES = ['Transfer', 'Reimbursement', 'Payment', 'Internal Transfer', 'Credit Card Payment'];
      
      monthTransactions.forEach(tx => {
        const canonical = resolveCanonicalCategory(tx.category);
        if (EXCLUDED_CATEGORIES.includes(canonical)) return;
        
        const rawAmt = parseFloat(tx.amount) || 0;
        const isExpense = tx.type === 'expense' || (tx.type !== 'income' && rawAmt < 0);
        
        if (isExpense) {
          const amount = Math.abs(rawAmt);
          currentActuals[canonical.toLowerCase()] = (currentActuals[canonical.toLowerCase()] || 0) + amount;
        }
      });

      setActualsMap(currentActuals);
      setMonthTransactions(monthTransactions);

      if (saved) {
        if (!isTemplate) setBudgetId(saved.id);
        else setBudgetId(null);

        if (saved.payload && saved.payload.expectedIncome !== undefined) {
           setExpectedIncome(Number(saved.payload.expectedIncome));
        } else if (saved.payload && saved.payload.incomes) {
           const legacySum = saved.payload.incomes.reduce((s, i) => s + Number(i.monthly_target || 0), 0);
           setExpectedIncome(legacySum);
        }

        let dataToLoad = [];
        if (saved.payload) {
          dataToLoad = [
            ...(saved.payload.visualData || []),
            ...(saved.payload.expenses || [])
          ];
        }
        
        if (dataToLoad.length > 0) {
          dataToLoad = dataToLoad.filter(item => item.type !== 'income');
          
          // Inject actuals into the loaded data
          const enrichedData = dataToLoad.map(item => {
            const canonical = resolveCanonicalCategory(item.category || item.name);
            const spent = actualsMap[canonical.toLowerCase()] || 0;
            const target = parseFloat(item.monthly_target) || parseCurrency(item.amount || "0") || 0;
            
            return {
              ...item,
              // Always use the live calculated 'spent' from the ledger actualsMap
              budget: formatAmount(spent),
              status: target > 0 
                ? (spent > target ? `${formatAmount(spent - target)} over` : `${formatAmount(target - spent)} left`)
                : "No target set"
            };
          });

          setData(normalizeStructure(enrichedData, categories));
        }
      } else {
        const defaults = normalizeStructure([], categories);
        const enrichedDefaults = defaults.map(item => {
           const canonical = resolveCanonicalCategory(item.category || item.name);
           const spent = actualsMap[canonical.toLowerCase()] || 0;
           return {
              ...item,
              budget: formatAmount(spent),
              status: `${formatAmount(0)} left`
           };
        });
        setData(enrichedDefaults);
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

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      // Flatten data for compatibility with simpler views (FamilyBudget Sankey, etc)
      const flatItems = flattenCategories(data);
      const incomesToSave = flatItems.filter(i => i.type === "income");
      const expensesToSave = flatItems.filter(i => i.type !== "income");

      // Institutional Sync: Ensure all categories in the budget are registered in user_categories
      // This allows the full 16-suite to propagate to the transaction ledger on the first save.
      await seedCategories(flatItems.map(item => ({
        category: item.category,
        type: item.type === 'income' ? 'income' : 'expense',
        iconId: item.iconId,
        color: item.color
      })));

      // Commit to the relational budgets table with the structured payload
      // EXCLUDES income as budgets are strictly for consumption control (expenses)
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

      setHasChanges(false);
      toast.success("Budget plan and category registry synchronized");
    } catch (err) {
      console.error("[SetBudget] Save failed:", err);
      toast.error("Failed to save budget");
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

    // Calculate actual income from actualsMap (we need to update actualsMap to include income)
    // Actually, it's easier to just sum all actuals from monthTransactions that are income
    // Calculate actual income from actualsMap (we need to update actualsMap to include income)
    const actualIncome = monthTransactions.reduce((sum, tx) => {
       const category = resolveCanonicalCategory(tx.category);
       const EXCLUDED = ['Transfer', 'Internal Transfer', 'Credit Card Payment', 'Payment', 'Reimbursement'];
       if (EXCLUDED.includes(category)) return sum;
       
       const rawAmt = Number(tx.amount || 0);
       const isIncome = tx.type === 'income' || (tx.type !== 'expense' && rawAmt > 0);
       return isIncome ? sum + Math.abs(rawAmt) : sum;
    }, 0);
    
    return {
      income: expectedIncome,
      actualIncome,
      expense: plannedExpense,
      actualExpense,
      net: expectedIncome - plannedExpense,
      actualNet: actualIncome - actualExpense
    };
  }, [flatItems, expectedIncome, parseCurrency, actualsMap, monthTransactions]);


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
    setData(prev => {
      const updated = prev.filter(item => item.id !== targetId);
      setHasChanges(true);
      return updated;
    });
    setIsNewBudgetOpen(false);
    setEditingItem(null);
    toast.success("Category removed from current month's budget");
  };

  const handleSaveNewBudget = async () => {
    // 1. Ensure the category exists in the central list
    const searchName = newBudget.categoryName || "";
    let catObj = categories.find(c => c.name.toLowerCase() === searchName.toLowerCase());
    
    if (!catObj && searchName) {
      catObj = await addCategory(searchName, newBudget.type);
    }

    const newTarget = parseFloat(newBudget.amount) || 0;
    
    const budgetItem = {
      id: catObj ? `cat-${catObj.id}` : `custom-${Date.now()}`,
      category: searchName || (catObj ? catObj.name : "Uncategorized"),
      budget: newBudget.type === "income" ? "$0 earned" : "$0 spent",
      status: newBudget.type === "income" ? `${formatAmount(newTarget, { decimals: 0, useParentheses: false })} to go` : `${formatAmount(newTarget, { decimals: 0 })} left`,
      monthly_target: newTarget,
      amount: formatAmount(newTarget, { decimals: 0 }) + " / mo",
      iconId: catObj?.icon_id || (newBudget.type === "income" ? "circle-emerald" : "circle-indigo"),
      type: newBudget.type === "income" ? "income" : "item",
      progress: 0,
      color: catObj?.color || (newBudget.type === "income" ? "emerald" : "indigo")
    };

    setData(prev => {
      let updated;
      if (editingItem) {
        updated = prev.map(item => (item.id === editingItem.id ? { ...item, ...budgetItem } : item));
      } else {
        updated = [...prev, budgetItem];
      }
      setHasChanges(true);
      return updated;
    });

    toast.success(`${editingItem ? 'Updated' : 'Created'} budget for ${budgetItem.category}. Remember to save changes.`);
    setIsNewBudgetOpen(false);
    setEditingItem(null);
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
              <div className="flex items-center justify-end w-full gap-4">
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

                   <Button
                     onClick={handleSaveBudget}
                     disabled={!hasChanges || isSaving}
                     className={`h-9 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border-0 shadow-lg ${hasChanges ? 'bg-[#0f846a] hover:bg-[#0c6b56] text-white shadow-emerald-500/20 animate-pulse' : 'bg-slate-200 text-slate-400 cursor-default'}`}
                   >
                     {isSaving ? "Saving..." : "Save Budget Changes"}
                   </Button>
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
               <div className="w-80 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  Money flow
               </div>
               <div className="w-48 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-right flex items-center justify-end gap-2">
                  Amount
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

            {/* Institutional Signature Summary */}
            <div className="mx-0 my-0 p-8 pt-10 pb-12 bg-white border-t border-slate-100 flex items-center relative overflow-hidden">
               <div className="flex-1 flex items-center gap-10 px-12">
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Target Surplus</p>
                     <p className={`text-xl font-black tabular-nums tracking-tighter ${totals.net >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {formatAmount(totals.net)}
                     </p>
                  </div>
               </div>

               {/* Right: Aligned Total Amount with Institutional Accents */}
               <div className="flex items-center">
                  <div className="w-80 flex justify-end pr-12">
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right leading-tight">
                        TOTAL MONTHLY<br />EXPENSE TARGET
                     </p>
                  </div>
                  
                  {/* The Figure: Aligned to Amount Column */}
                  <div className="w-48 px-6 text-right relative">
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C5A059] rounded-full opacity-30" />
                     <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                        {formatAmount(totals.expense)}
                     </p>
                  </div>
                  
                  <div className="w-16 flex items-center justify-center">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.5)]" />
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
