import React from "react";
import { 
  ArrowRightLeft, 
  Settings, 
  Download,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

const months = [
  "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26", 
  "Jul '26", "Aug '26", "Sep '26", "Oct '26"
];

const formatNum = (val) => val === 0 ? "0" : val.toLocaleString();

export default function CashflowsReport() {
  const summaryData = [
    { label: "CLOSING BALANCES", values: [5510, 10652, 5723, 10832, 4788, 5192, 4930, 6815, 6800, 7200] },
    { label: "SURPLUS / DEFICIT", values: [167, -977, 481, 306, 378, -544, 142, 1885, -15, 408], isDiff: true },
  ];

  const incomeCategories = [
    { label: "Salary and Wages", values: [2976, 2976, 2976, 2976, 2976, 1488, 2976, 4464, 2976, 2976] },
    { label: "Repay Credit Card", values: [300, 225, 300, 225, 300, 150, 300, 450, 300, 300] },
    { label: "Repay Car Loan", values: [250, 0, 250, 0, 250, 0, 250, 250, 250, 0] },
  ];

  const expenseCategories = [
    { label: "Household", values: [0, -40, 0, 0, 0, -47, 0, 0, 0, 0] },
    { label: "Rent", values: [-1200, -1200, -960, -960, -960, -720, -960, -1200, -960, -960] },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <ArrowRightLeft className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-medium text-white tracking-tight">Cashflows</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1">
                  <span className="text-xs text-slate-400 px-3 py-1.5 flex items-center gap-2">
                     <Calendar className="w-3.5 h-3.5" />
                     Jan 2026 - Oct 2026
                  </span>
               </div>
               <Button variant="ghost" className="text-[#C5A059] hover:bg-[#C5A059]/10 text-xs uppercase tracking-widest gap-2">
                  <Settings className="w-4 h-4" /> Display Settings
               </Button>
               <Button className="bg-[#C5A059] hover:bg-[#B38F4D] text-white text-xs uppercase tracking-widest gap-2">
                  <Download className="w-4 h-4" /> Download CSV
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel starts below Navbar */}
      <div className="flex-1 overflow-auto bg-[#F8F9FB] p-8">
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden min-w-max">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-8 text-[10px] uppercase font-semibold tracking-widest text-slate-400 w-64">Summary</th>
                {months.map((m, idx) => (
                  <th 
                    key={m} 
                    className={`px-6 py-8 text-[10px] uppercase font-semibold tracking-widest text-center ${idx === 3 ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* SUMMARY SECTION */}
              {summaryData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-[10px] font-medium text-slate-500 uppercase tracking-widest">{row.label}</td>
                  {row.values.map((v, vIdx) => (
                    <td 
                      key={vIdx} 
                      className={`px-6 py-4 text-xs font-semibold text-center ${vIdx === 3 ? 'bg-indigo-50/30' : ''} ${row.isDiff ? (v >= 0 ? 'text-teal-600' : 'text-rose-500') : 'text-slate-700'}`}
                    >
                      {formatNum(v)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* INCOME CATEGORIES SECTION */}
              <tr>
                 <td colSpan={11} className="px-6 pt-10 pb-4">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-teal-500 uppercase">Income Categories</span>
                 </td>
              </tr>
              {incomeCategories.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-medium text-slate-600">{row.label}</td>
                  {row.values.map((v, vIdx) => (
                    <td key={vIdx} className={`px-6 py-3 text-xs text-center text-slate-400 group-hover:text-slate-600 ${vIdx === 3 ? 'bg-indigo-50/20' : ''}`}>
                      {formatNum(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-teal-50/30">
                 <td className="px-6 py-4 text-xs font-semibold text-teal-600 italic">TOTAL INCOME</td>
                 {months.map((_, i) => (
                    <td key={i} className={`px-6 py-4 text-xs font-semibold text-teal-600 text-center ${i === 3 ? 'bg-indigo-50/40' : ''}`}>
                       {formatNum(incomeCategories.reduce((acc, cat) => acc + cat.values[i], 0))}
                    </td>
                 ))}
              </tr>

              {/* EXPENSE CATEGORIES SECTION */}
              <tr>
                 <td colSpan={11} className="px-6 pt-10 pb-4">
                    <span className="text-[10px] font-semibold tracking-[0.2em] text-rose-500 uppercase">Expense Categories</span>
                 </td>
              </tr>
              {expenseCategories.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-xs font-medium text-slate-600">{row.label}</td>
                  {row.values.map((v, vIdx) => (
                    <td key={vIdx} className={`px-6 py-3 text-xs text-center text-slate-400 group-hover:text-slate-600 ${vIdx === 3 ? 'bg-indigo-50/20' : ''}`}>
                      {formatNum(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-rose-50/30">
                 <td className="px-6 py-4 text-xs font-semibold text-rose-600 italic">TOTAL EXPENSE</td>
                 {months.map((_, i) => (
                    <td key={i} className={`px-6 py-4 text-xs font-semibold text-rose-600 text-center ${i === 3 ? 'bg-indigo-50/40' : ''}`}>
                       {formatNum(expenseCategories.reduce((acc, cat) => acc + cat.values[i], 0))}
                    </td>
                 ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
