import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ChevronDown, 
  Download, 
  Plus, 
  Calendar, 
  Info,
  CheckCircle2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export default function IncomeExpenseReport() {
  const [expandAll, setExpandAll] = useState(false);
  const [includeTransfers, setIncludeTransfers] = useState(false);

  const INCOME_DATA = [
     { category: "Salary and Wages", budgeted: 3188.36, actual: 0, diff: -3188.36 },
  ];

  const EXPENSE_DATA = [
     { category: "Rent", budgeted: -1028.57, actual: 0, diff: 1028.57 },
     { category: "Utilities", budgeted: -281.89, actual: 0, diff: 281.89 },
     { category: "Groceries", budgeted: -535.71, actual: 0, diff: 535.71 },
     { category: "Eating Out", budgeted: -200.00, actual: 0, diff: 200.00 },
     { category: "Entertainment", budgeted: -321.43, actual: 0, diff: 321.43 },
     { category: "Healthcare", budgeted: -41.10, actual: 0, diff: 41.10 },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
               <FileText className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-medium text-white tracking-tight">Income & Expense</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1">
                  <span className="text-xs text-slate-400 px-3 py-1.5 flex items-center gap-2">
                     <Calendar className="w-3.5 h-3.5" />
                     Apr 1, 2026 - Apr 30, 2026
                  </span>
               </div>
               <Button variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-xs uppercase tracking-widest gap-2">
                  <Download className="w-4 h-4" /> Export
               </Button>
               <Button className="bg-[#C5A059] hover:bg-[#B38F4D] text-white text-xs uppercase tracking-widest gap-2">
                  <Plus className="w-4 h-4" /> Add to reports
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel starts below Navbar */}
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Filter Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 shadow-sm">
           <div className="space-y-6">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Analysis Options</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Expand all categories</span>
                    <Switch checked={expandAll} onCheckedChange={setExpandAll} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Include transfers</span>
                    <Switch checked={includeTransfers} onCheckedChange={setIncludeTransfers} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Nest categories</span>
                    <Switch checked={true} />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Show % of total</span>
                    <Switch />
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Reports</p>
              <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-3 rounded-xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-[#C5A059] flex items-center justify-center text-white">
                    <Info className="w-4 h-4" />
                 </div>
                 <span className="text-xs font-semibold text-[#C5A059]">Default report</span>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Accounts</p>
              <div className="space-y-2">
                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                    <Checkbox id="account1" checked />
                    <div className="flex-1">
                       <p className="text-[10px] font-semibold text-slate-700 truncate">Sample Bank Account</p>
                       <p className="text-[11px] font-bold text-teal-600">$3,547.45</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                 </div>
                 <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                    <Checkbox id="account2" checked />
                    <div className="flex-1">
                       <p className="text-[10px] font-semibold text-slate-700 truncate">Sample Credit Card</p>
                       <p className="text-[11px] font-bold text-rose-500">($2,345.54)</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                 </div>
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#F8F9FB]">
           <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
              <table className="w-full text-left">
                 <thead className="bg-white border-b border-slate-100">
                    <tr>
                       <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">Category</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-slate-400 text-right">Budgeted</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-slate-400 text-right">Actual</th>
                       <th className="px-8 py-6 text-[10px] uppercase font-bold tracking-widest text-slate-400 text-right">Difference</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="bg-slate-50/50">
                       <td className="px-8 py-3 text-[11px] font-bold text-slate-800"></td>
                       <td className="px-8 py-3 text-[11px] font-bold text-slate-800 text-right">679.66</td>
                       <td className="px-8 py-3 text-[11px] font-bold text-slate-800 text-right">0.00</td>
                       <td className="px-8 py-3 text-[11px] font-bold text-rose-500 text-right">(679.66)</td>
                    </tr>

                    {/* INCOME SECTION */}
                    <tr>
                       <td colSpan={4} className="px-8 pt-10 pb-4">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-teal-500 uppercase">Income</span>
                       </td>
                    </tr>
                    {INCOME_DATA.map((item, idx) => (
                       <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full border border-teal-400" />
                             <span className="text-xs font-medium text-slate-600">{item.category}</span>
                          </td>
                          <td className="px-8 py-4 text-xs font-medium text-indigo-600 text-right">{formatCurrency(item.budgeted)}</td>
                          <td className="px-8 py-4 text-xs font-medium text-slate-600 text-right">{formatCurrency(item.actual)}</td>
                          <td className="px-8 py-4 text-xs font-medium text-rose-500 text-right">({formatCurrency(Math.abs(item.diff))})</td>
                       </tr>
                    ))}
                    <tr className="border-t border-slate-100">
                       <td className="px-8 py-4 italic text-xs font-medium text-teal-500">Total Income</td>
                       <td className="px-8 py-4 text-xs font-bold text-slate-800 text-right">3,188.36</td>
                       <td className="px-8 py-4 text-xs font-bold text-slate-800 text-right">0.00</td>
                       <td className="px-8 py-4 text-xs font-bold text-rose-500 text-right">(3,188.36)</td>
                    </tr>

                    {/* EXPENSE SECTION */}
                    <tr>
                       <td colSpan={4} className="px-8 pt-12 pb-4">
                          <span className="text-[10px] font-bold tracking-[0.2em] text-rose-500 uppercase">Expense</span>
                       </td>
                    </tr>
                    {EXPENSE_DATA.map((item, idx) => (
                       <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full border border-rose-400" />
                             <span className="text-xs font-medium text-slate-600">{item.category}</span>
                          </td>
                          <td className="px-8 py-4 text-xs font-medium text-indigo-600 text-right">({formatCurrency(Math.abs(item.budgeted))})</td>
                          <td className="px-8 py-4 text-xs font-medium text-slate-600 text-right">{formatCurrency(item.actual)}</td>
                          <td className="px-8 py-4 text-xs font-medium text-teal-600 text-right">{formatCurrency(Math.abs(item.diff))}</td>
                       </tr>
                    ))}
                    <tr className="border-t border-slate-100 bg-slate-50/30">
                       <td className="px-8 py-5 italic text-xs font-medium text-rose-500">Total Expense</td>
                       <td className="px-8 py-5 text-xs font-bold text-slate-800 text-right">(2,508.70)</td>
                       <td className="px-8 py-5 text-xs font-bold text-slate-800 text-right">0.00</td>
                       <td className="px-8 py-5 text-xs font-bold text-teal-600 text-right">2,508.70</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </main>
      </div>
    </div>
  );
}
