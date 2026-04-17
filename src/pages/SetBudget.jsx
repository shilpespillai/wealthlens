import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
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
  LayoutGrid,
  Settings2,
  Check,
  Search,
  Zap,
  MoreVertical,
  Minus,
  Trash2,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
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

export const INITIAL_BUDGET_DATA = [
  {
    id: "income",
    category: "Salary and Wages",
    budget: "$0 earned",
    status: "3,188 to go",
    amount: "3,188 / mo",
    iconId: "circle-emerald",
    type: "income",
    progress: 0,
    color: "emerald"
  },
  {
    id: "household",
    category: "Household",
    budget: "Start",
    amount: "0 / mo",
    iconId: "folder-indigo",
    type: "group",
    isExpanded: true,
    children: [
      {
        id: "rent",
        category: "Rent",
        budget: "$0 spent",
        status: "$1,029 left",
        amount: "1,029 / mo",
        iconId: "circle-indigo",
        type: "item",
        progress: 0,
        color: "indigo"
      },
      {
        id: "utilities",
        category: "Utilities",
        budget: "$0 spent",
        status: "$282 left",
        amount: "282 / mo",
        iconId: "circle-sky",
        type: "item",
        progress: 0,
        color: "sky"
      }
    ]
  },
  {
    id: "food",
    category: "Food",
    budget: "Start",
    amount: "0 / mo",
    iconId: "folder-orange",
    type: "group",
    isExpanded: true,
    children: [
      {
        id: "groceries",
        category: "Groceries",
        budget: "$268 spent",
        status: "$268 left",
        amount: "536 / mo",
        iconId: "circle-orange",
        type: "item",
        progress: 0,
        color: "orange"
      },
      {
        id: "eating_out",
        category: "Eating Out",
        budget: "$0 spent",
        status: "$300 left",
        amount: "300 / mo",
        iconId: "circle-amber",
        type: "item",
        progress: 0,
        color: "amber"
      }
    ]
  },
  {
    id: "entertainment",
    category: "Entertainment",
    budget: "$0 spent",
    status: "$321 left",
    amount: "321 / mo",
    iconId: "circle-emerald",
    type: "item",
    progress: 0,
    color: "emerald"
  },
  {
    id: "fuel",
    category: "Fuel / Gas",
    budget: "Start",
    amount: "0 / mo",
    iconId: "folder-purple",
    type: "item",
    progress: 0,
    color: "purple"
  },
  {
    id: "healthcare",
    category: "Healthcare",
    budget: "$0 spent",
    status: "$41 left",
    amount: "41 / mo",
    iconId: "circle-yellow",
    type: "item",
    progress: 0,
    color: "yellow"
  },
  {
    id: "credit_card",
    category: "Repay Credit Card",
    budget: "$0 transferred",
    status: "$321 remaining",
    amount: "321 / mo",
    iconId: "zap-rose",
    type: "item",
    progress: 0,
    color: "rose"
  },
  {
    id: "car_loan",
    category: "Repay Car Loan",
    budget: "$0 transferred",
    status: "$249 remaining",
    amount: "249 / mo",
    iconId: "zap-rose",
    type: "item",
    progress: 0,
    color: "rose"
  }
];

const getCategoryIcon = (iconId, category = "") => {
  if (!iconId && category) {
    const cat = category.toLowerCase();
    if (cat.includes("folder") || ["household", "food"].includes(cat)) iconId = "folder-slate";
    else if (cat.includes("income") || cat.includes("salary")) iconId = "circle-emerald";
    else if (cat.includes("repay") || cat.includes("credit") || cat.includes("loan")) iconId = "zap-rose";
    else iconId = "circle-slate";
  }

  const [type, color] = (iconId || "circle-slate").split("-");
  const colorClass = {
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    sky: "text-sky-300",
    orange: "text-orange-400",
    amber: "text-amber-300",
    purple: "text-purple-400",
    yellow: "text-yellow-300",
    rose: "text-rose-400",
    slate: "text-slate-400"
  }[color || "slate"];

  switch (type) {
    case "folder": return <Folder className={`w-4 h-4 ${colorClass}`} />;
    case "zap": return <Zap className={`w-4 h-4 ${colorClass}`} />;
    default: return <Circle className={`w-4 h-4 ${colorClass}`} />;
  }
};

function BudgetRow({ item, level = 0, onToggle, onEdit, onDelete }) {
  const { parseCurrency } = useFinancialParser();
  const isGroup = item.type === "group";
  const paddingLeft = level * 24 + 16;

  return (
    <>
      <div className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors flex items-center h-16 min-w-max">
        {/* Drag Handle Area */}
        <div className="w-12 flex items-center justify-center text-slate-200">
          <LayoutGrid className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        </div>

        {/* Category Column */}
        <div className="flex-1 flex items-center gap-3 min-w-[300px]" style={{ paddingLeft }}>
          {isGroup ? (
            <button onClick={() => onToggle(item.id)} className="p-1 hover:bg-slate-100 rounded text-slate-400">
              {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className="p-2 border border-slate-100 rounded-lg shadow-sm">
            {getCategoryIcon(item.iconId, item.category)}
          </div>
          <Link 
            to={`/reports/Trends?category=${encodeURIComponent(item.category)}`}
            className={`text-sm font-medium transition-colors hover:text-indigo-600 hover:underline decoration-indigo-200 underline-offset-4 cursor-pointer ${isGroup ? 'text-slate-700' : 'text-slate-600'}`}
          >
            {item.category}
          </Link>
        </div>

        {/* Budget Column */}
        <div className="w-80 flex items-center px-6">
          <div className="w-full bg-slate-100 rounded-xl h-10 flex items-center px-4 relative overflow-hidden">
             {/* Progress Fill Indicator */}
             {(() => {
                const target = parseCurrency(item.amount || "0");
                const spent = parseCurrency(item.budget || "0");
                const progress = target > 0 ? Math.min((spent / target) * 100, 100) : 0;
                const isOverspent = spent > target && target > 0;
                
                return (
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out ${isOverspent ? 'bg-rose-100/60' : 'bg-emerald-100/80'}`} 
                    style={{ width: `${progress}%` }} 
                  />
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
                      <span className="text-[11px] font-bold text-slate-700">{item.budget}</span>
                      {item.status && (
                         <div className="flex items-center gap-1.5">
                            {item.type === "income" ? (
                               <Minus className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                               <Check className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                            <span className="text-[11px] font-bold text-slate-500">{item.status}</span>
                         </div>
                      )}
                   </>
                )}
             </div>
          </div>
        </div>

        {/* Amount Column */}
        <div className="w-48 px-6 text-right">
          <span className={`text-[11px] font-bold ${(item.amount?.includes('earned') || item.type === "income") ? 'text-emerald-600' : 'text-slate-500'}`}>
            {item.amount || "0 / mo"}
          </span>
        </div>

        {/* Roll Up Column */}
        <div className="w-24 px-4 flex items-center justify-center">
           {isGroup && (
              <button className="text-slate-300 hover:text-slate-500 transition-colors">
                 <ArrowUpRight className="w-4 h-4 rotate-[-45deg]" />
              </button>
           )}
        </div>

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

      <AnimatePresence>
        {isGroup && item.isExpanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {item.children.map((child) => (
              <BudgetRow key={child.id} item={child} level={level + 1} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SetBudget() {
  const { parseCurrency, formatAmount } = useFinancialParser();
  const [data, setData] = useState(INITIAL_BUDGET_DATA);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [budgetId, setBudgetId] = useState(null);

  const hasGroups = useMemo(() => data.some(item => item.type === "group"), [data]);
  const monthKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, []);

   useEffect(() => {
    const init = async () => {
      try {
        setIsInitialLoading(true);
        // Fetch specifically from the relational budgets table
        const results = await base44.db.query("budgets", {
          filters: [{ column: 'month', op: 'eq', value: monthKey }]
        });
        
        if (results && results.length > 0) {
          const saved = results[0];
          setBudgetId(saved.id);
          if (saved.payload && saved.payload.visualData) {
            setData(normalizeStructure(saved.payload.visualData));
          }
        }
      } catch (err) {
        console.error("Failed to load budget:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [monthKey]);

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      // Flatten data for compatibility with simpler views (FamilyBudget Sankey, etc)
      const flatItems = flattenCategories(data);
      const incomesToSave = flatItems.filter(i => i.type === "income");
      const expensesToSave = flatItems.filter(i => i.type !== "income");

      // Commit to the relational budgets table with the structured payload
      await base44.db.upsertRow("budgets", { 
        id: budgetId,
        month: monthKey, 
        payload: { 
          visualData: sanitizeData(data),
          incomes: incomesToSave.map(i => ({ ...i, icon: null })),
          expenses: expensesToSave.map(i => ({ ...i, icon: null }))
        } 
      });
      setHasChanges(false);
      toast.success("Budget plan saved to relational database");
    } catch (err) {
      console.error("[SetBudget] Save failed:", err);
      toast.error("Failed to save budget");
    } finally {
      setIsSaving(false);
    }
  };

  // New Budget Form State
  const initialFormState = {
    category: "",
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
  
   const normalizeStructure = (savedItems) => {
    // 1. Get our standard template
    const template = JSON.parse(JSON.stringify(INITIAL_BUDGET_DATA));
    
    // 2. Extract all "leaf" items from the saved data (in case it's partially nested)
    const savedLeaves = flattenCategories(savedItems);
    
    // 3. Create a map for quick lookup
    const leafMap = new Map();
    savedLeaves.forEach(leaf => {
      const key = (leaf.id || leaf.category || '').toLowerCase();
      leafMap.set(key, leaf);
    });

    // 4. Populate the template with saved data
    const populate = (items) => {
      return items.map(tItem => {
         const tKey = (tItem.id || tItem.category || '').toLowerCase();
         // If this template item exists in saved data, use the saved values
         if (leafMap.has(tKey)) {
            const saved = leafMap.get(tKey);
            leafMap.delete(tKey); // Remove so we don't duplicate later
            return { ...tItem, ...saved };
         }
         // If it has children, recurse
         if (tItem.children) {
            return { ...tItem, children: populate(tItem.children) };
         }
         return tItem;
      });
    };

    const structured = populate(template);

    // 5. Add any "orphaned" saved items (that aren't in the template) to the top level
    const orphans = Array.from(leafMap.values());
    
    return [...structured, ...orphans];
  };

  const sanitizeData = (items) => {
    return items.map(item => {
      const { icon, ...rest } = item;
      if (rest.children) {
        rest.children = sanitizeData(rest.children);
      }
      return rest;
    });
  };

  const flattenCategories = (items) => {
    let result = [];
    items.forEach(item => {
      // If it has children, recurse and get the leaves
      if (item.children && item.children.length > 0) {
        result = [...result, ...flattenCategories(item.children)];
      } else {
        // If it's a leaf, add it to our flat list
        result.push(item);
      }
    });
    return result;
  };

  const leafCategories = useMemo(() => flattenCategories(INITIAL_BUDGET_DATA), []);

  const flatItems = useMemo(() => flattenCategories(data), [data]);
  
  const totals = useMemo(() => {
    let expense = 0;
    flatItems.forEach(item => {
      if (item.type !== "income") {
        expense += parseCurrency(item.amount || "0");
      }
    });
    return expense;
  }, [flatItems, parseCurrency]);


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
      category: item.id || item.category,
      repeat: true,
      frequency: "1",
      freqUnit: "months",
      amount: parseCurrency(item.amount || "0").toString(),
      type: likelyType === "income" ? "income" : "expense",
      account: "Sample Bank Account"
    });
    setIsNewBudgetOpen(true);
  };

  const handleDeleteItem = (targetId) => {
    const removeRecursive = (items) => {
      return items.filter(item => {
        if (item.id === targetId) return false;
        // Search in children if any
        return true;
      }).map(item => {
        if (item.children) {
          return { ...item, children: removeRecursive(item.children) };
        }
        return item;
      });
    };
    
    setData(prev => {
      const updated = removeRecursive([...prev]);
      setHasChanges(true);
      return updated;
    });
    setIsNewBudgetOpen(false);
    setEditingItem(null);
    toast.success("Category removed from current month's budget");
  };

  const handleSaveNewBudget = () => {
    if (!newBudget.category) {
      toast.error("Please select a category");
      return;
    }

    const newTarget = parseFloat(newBudget.amount) || 0;
    let found = false;

    const updateRecursive = (items) => {
      return items.map(item => {
        if (item.id === newBudget.category || item.category === newBudget.category) {
          found = true;
          const currentSpent = parseCurrency(item.budget || "$0");
          const remaining = newTarget - currentSpent;
          const isIncome = item.type === "income" || newBudget.type === "income";

          return { 
            ...item, 
            amount: formatAmount(newTarget, { decimals: 0 }) + " / mo",
            budget: item.budget || (isIncome ? "$0 earned" : "$0 spent"),
            status: isIncome 
              ? `${formatAmount(remaining, { decimals: 0, useParentheses: false })} to go`
              : `${formatAmount(remaining, { decimals: 0 })} left`
          };
        }
        if (item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    setData(prev => {
      let updated = updateRecursive(prev);
      
      // If not found, add as a new item
      if (!found) {
        const fallbackInfo = leafCategories.find(c => (c.id || '').toLowerCase() === (newBudget.category || '').toLowerCase() || (c.category || '').toLowerCase() === (newBudget.category || '').toLowerCase());
        const isIncome = newBudget.type === "income";
        
        const newItem = {
          id: newBudget.category,
          category: fallbackInfo?.category || newBudget.category,
          budget: isIncome ? "$0 earned" : "$0 spent",
          status: isIncome ? `${formatAmount(newTarget, { decimals: 0, useParentheses: false })} to go` : `${formatAmount(newTarget, { decimals: 0 })} left`,
          amount: formatAmount(newTarget, { decimals: 0 }) + " / mo",
          iconId: fallbackInfo?.iconId || (isIncome ? "circle-emerald" : "circle-indigo"),
          type: isIncome ? "income" : "item",
          progress: 0,
          color: fallbackInfo?.color || (isIncome ? "emerald" : "indigo")
        };

        // Attempt to nest under Household if it's a known household category
        const householdCats = ["rent", "utilities", "mortgage", "rates", "internet", "food", "groceries", "health insurance", "dining & social"];
        const lowerCat = (newItem.category || '').toLowerCase();
        
        const isHousehold = householdCats.includes(lowerCat);
        
        if (isHousehold) {
          let householdFound = false;
          updated = updated.map(group => {
            if (group.id === "household") {
              householdFound = true;
              return { ...group, isExpanded: true, children: [...(group.children || []), newItem] };
            }
            return group;
          });
          
          if (!householdFound) updated = [...updated, newItem];
        } else {
          updated = [...updated, newItem];
        }
      }

      setHasChanges(true);
      return updated;
    });

    toast.success(`${editingItem ? 'Updated' : 'Created'} budget for ${newBudget.category}. Remember to save changes.`);
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
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
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
                          {/* Category Selection */}
                          <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-600">What is this budget for?</label>
                            <Select 
                              value={newBudget.category} 
                              onValueChange={(val) => setNewBudget({ ...newBudget, category: val })}
                            >
                              <SelectTrigger className="w-full bg-white border-none border-b border-slate-300 rounded-none px-0 h-10 text-slate-400 shadow-none focus:ring-0 focus:border-slate-800 transition-all">
                                <SelectValue placeholder="Choose budget category" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                {leafCategories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id} className="text-sm py-2.5">{cat.category}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              <RadioGroup 
                                value={newBudget.type} 
                                onValueChange={(val) => setNewBudget({ ...newBudget, type: val })}
                                className="flex items-center gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="expense" id="expense" className="text-[#3b4754] border-[#3b4754]" />
                                  <Label htmlFor="expense" className="text-sm font-medium text-slate-600">Expense</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="income" id="income" className="text-[#3b4754] border-[#3b4754]" />
                                  <Label htmlFor="income" className="text-sm font-medium text-slate-600">Income</Label>
                                </div>
                              </RadioGroup>
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
                 </div>
                 
                  <div className="flex items-center gap-2">
                    {hasGroups && (
                      <Button onClick={toggleAll} variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                         {isAllExpanded ? "Collapse All" : "Expand All"}
                      </Button>
                    )}
                  </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                 <Checkbox id="use-date-range" checked />
                 <label htmlFor="use-date-range" className="text-[10px] font-bold text-slate-400 uppercase tracking-tight cursor-pointer">
                    Use total budget summary date range for budget amount analysis
                 </label>
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
                  Category <ChevronDown className="w-3.5 h-3.5" />
               </div>
               <div className="w-80 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  Budget <ChevronDown className="w-3.5 h-3.5" />
               </div>
               <div className="w-48 px-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-right flex items-center justify-end gap-2">
                  Amount <ChevronDown className="w-3.5 h-3.5 text-slate-200" />
               </div>
               <div className="w-24 px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 text-center">
                  Roll Up
               </div>
               <div className="w-16" />
            </div>

            {/* Table Body */}
            <div>
              {data.map((item) => (
                <BudgetRow 
                  key={item.id} 
                  item={item} 
                  onToggle={toggleGroup}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>

            {/* Institutional Signature Summary */}
            <div className="mx-0 my-0 p-8 pt-10 pb-12 bg-white border-t border-slate-100 flex items-center relative overflow-hidden">
               {/* Left: Branding & Integrity Badge */}
               <div className="flex-1 flex items-center gap-6 px-12">
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Ledger Integrity</p>
                     <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Plan Verified</span>
                     </div>
                  </div>
                  <div className="h-10 w-px bg-slate-100" />
                  <div className="flex flex-col gap-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Monthly Intensity</p>
                     <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#C5A059]" />
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Optimized Flow</span>
                     </div>
                  </div>
               </div>

               {/* Right: Aligned Total Amount with Institutional Accents */}
               <div className="flex items-center">
                  <div className="w-80 flex justify-end pr-12">
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right leading-tight">
                        TOTAL MONTHLY<br />BUDGET SET
                     </p>
                  </div>
                  
                  {/* The Figure: Aligned to Amount Column */}
                  <div className="w-48 px-6 text-right relative">
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C5A059] rounded-full opacity-30" />
                     <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">
                        {formatAmount(totals)}
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
