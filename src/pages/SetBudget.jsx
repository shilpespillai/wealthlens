import React, { useState } from "react";
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
import AuthGuard from "@/components/AuthGuard";

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
        budget: "$0 spent",
        status: "$536 left",
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
          <span className={`text-sm font-medium ${isGroup ? 'text-slate-700' : 'text-slate-600'}`}>
            {item.category}
          </span>
        </div>

        {/* Budget Column */}
        <div className="w-80 flex items-center px-6">
          <div className="w-full bg-slate-100 rounded-xl h-10 flex items-center px-4 relative overflow-hidden">
             {/* Progress Fill Placeholder */}
             <div className="absolute left-0 top-0 bottom-0 bg-slate-200/50 transition-all duration-500" style={{ width: `${item.progress || 0}%` }} />
             
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
            {item.amount !== "0 / mo" ? `$${item.amount}` : item.amount}
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
  const [data, setData] = useState(INITIAL_BUDGET_DATA);
  const [isAllExpanded, setIsAllExpanded] = useState(true);

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
                    <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 gap-2">
                       <Plus className="w-3.5 h-3.5" /> New budget
                    </Button>
                    <Button variant="ghost" className="h-9 px-4 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 gap-2">
                       <Zap className="w-3.5 h-3.5" /> Auto-budget tool
                    </Button>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="Search items..." 
                         className="h-9 pl-9 pr-4 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-300 w-64"
                       />
                    </div>
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
