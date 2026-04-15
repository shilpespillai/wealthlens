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
  Minus
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

export const INITIAL_BUDGET_DATA = [
  {
    id: "income",
    category: "Salary and Wages",
    budget: "$0 earned",
    status: "3,188 to go",
    amount: "3,188 / mo",
    icon: <Circle className="w-4 h-4 text-emerald-400" />,
    type: "income",
    progress: 0,
    color: "emerald"
  },
  {
    id: "household",
    category: "Household",
    budget: "Start",
    amount: "0 / mo",
    icon: <Folder className="w-4 h-4 text-indigo-400" />,
    type: "group",
    isExpanded: true,
    children: [
      {
        id: "rent",
        category: "Rent",
        budget: "$0 spent",
        status: "$1,029 left",
        amount: "1,029 / mo",
        icon: <Circle className="w-4 h-4 text-indigo-300" />,
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
        icon: <Circle className="w-4 h-4 text-sky-300" />,
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
    icon: <Folder className="w-4 h-4 text-orange-400" />,
    type: "group",
    isExpanded: true,
    children: [
      {
        id: "groceries",
        category: "Groceries",
        budget: "$268 spent",
        status: "$268 left",
        amount: "536 / mo",
        icon: <Circle className="w-4 h-4 text-orange-200" />,
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
        icon: <Circle className="w-4 h-4 text-amber-300" />,
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
    icon: <Circle className="w-4 h-4 text-emerald-300" />,
    type: "item",
    progress: 0,
    color: "emerald"
  },
  {
    id: "fuel",
    category: "Fuel / Gas",
    budget: "Start",
    amount: "0 / mo",
    icon: <Folder className="w-4 h-4 text-purple-400" />,
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
    icon: <Circle className="w-4 h-4 text-yellow-300" />,
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
    icon: <Zap className="w-4 h-4 text-rose-400" />,
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
    icon: <Zap className="w-4 h-4 text-rose-400" />,
    type: "item",
    progress: 0,
    color: "rose"
  }
];

function BudgetRow({ item, level = 0, onToggle }) {
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
            {item.icon}
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
                const target = parseCurrency(item.amount);
                const spent = parseCurrency(item.budget);
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
          <span className={`text-[11px] font-bold ${item.amount.includes('earned') || item.type === "income" ? 'text-emerald-600' : 'text-slate-500'}`}>
            {item.amount}
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

        {/* Action Column */}
        <div className="w-16 px-4 flex items-center justify-center">
          <button className="text-slate-200 group-hover:text-slate-400 transition-colors">
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
              <BudgetRow key={child.id} item={child} level={level + 1} />
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
  const monthKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `wealthlens-budget-${y}-${m}`;
  }, []);

  useEffect(() => {
    const init = async () => {
      const saved = await base44.user.loadData(monthKey);
      if (saved && saved.visualData) {
        setData(saved.visualData);
      }
    };
    init();
  }, [monthKey]);

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

  const flattenCategories = (items) => {
    let result = [];
    items.forEach(item => {
      if (item.type === "item" || item.type === "income") {
        result.push(item);
      }
      if (item.children) {
        result = [...result, ...flattenCategories(item.children)];
      }
    });
    return result;
  };

  const leafCategories = useMemo(() => flattenCategories(INITIAL_BUDGET_DATA), []);

  const handleSaveNewBudget = () => {
    if (!newBudget.category) {
      toast.error("Please select a category");
      return;
    }

    const newTarget = parseFloat(newBudget.amount) || 0;

    const updateRecursive = (items) => {
      return items.map(item => {
        if (item.id === newBudget.category || item.category === newBudget.category) {
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
      const updated = updateRecursive(prev);
      syncData(monthKey, { visualData: updated }, { silent: true });
      return updated;
    });

    toast.success(`Updated budget for ${newBudget.category}`);
    setIsNewBudgetOpen(false);
  };

  const toggleGroup = (id) => {
    setData(prev => prev.map(item => {
      if (item.id === id) return { ...item, isExpanded: !item.isExpanded };
      if (item.children) {
         return {
            ...item,
            children: item.children.map(child => {
               if (child.id === id) return { ...child, isExpanded: !child.isExpanded };
               return child;
            })
         }
      }
      return item;
    }));
  };

  const toggleAll = () => {
    const newState = !isAllExpanded;
    setIsAllExpanded(newState);
    setData(prev => prev.map(item => {
      if (item.type === "group") return { ...item, isExpanded: newState };
      return item;
    }));
  };

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

                        <DialogFooter className="p-6 pt-2 border-t border-slate-50 gap-3 sm:justify-between items-center sm:flex-row">
                          <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 p-0 h-auto">
                            Advanced Options
                          </Button>
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
                    <Button onClick={toggleAll} variant="ghost" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                       {isAllExpanded ? "Collapse All" : "Expand All"}
                    </Button>
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
                />
              ))}
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
