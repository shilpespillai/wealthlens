import React, { useState } from "react";
import { 
  LineChart as TrendsIcon, 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Cell
} from "recharts";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const MOCK_TREND_DATA = [
  { month: "Nov 1, 2025", actual: 300, budgeted: 2000, overspent: 0 },
  { month: "Dec 1", actual: 1800, budgeted: 2200, overspent: 500 },
  { month: "Jan 1", actual: 2600, budgeted: 2800, overspent: 1200 },
  { month: "Feb 1", actual: 2400, budgeted: 2500, overspent: 100 },
  { month: "Mar 1", actual: 2700, budgeted: 2600, overspent: 800 },
  { month: "Apr 1", actual: 2500, budgeted: 2650, overspent: 0 },
];

export default function TrendsReport() {
  const [selectedCategory, setSelectedCategory] = useState("All categories");

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <TrendsIcon className="w-6 h-6 text-[#C5A059]" />
                <h1 className="text-xl font-medium text-white tracking-tight">Trends <span className="text-slate-500 font-normal px-2">›</span> <span className="text-[#C5A059]">{selectedCategory}</span></h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1">
                  <span className="text-xs text-slate-400 px-3 py-1.5 flex items-center gap-2">
                     <Calendar className="w-3.5 h-3.5" />
                     Nov 1, 2025 - Apr 30, 2026
                  </span>
               </div>
               <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1 px-3 py-1.5 text-xs text-slate-400">
                  View by <span className="text-[#C5A059] font-medium px-2">Month Period</span>
               </div>
               <Button className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-medium uppercase tracking-widest h-8 px-4 rounded-full shadow-lg">
                  Showing Expense
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel starts below Navbar */}
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Category Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto p-8 space-y-8 shadow-sm">
           <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-600">Roll up budgets</span>
              <Switch />
           </div>

           <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 px-2">Categories</p>
              <div className="space-y-1">
                 {["All categories", "Salary and Wages", "Household", "Food", "Entertainment", "Fuel / Gas", "Healthcare"].map((cat) => (
                    <button 
                      key={cat}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                       <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === cat ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                       <span className="text-xs tracking-tight">{cat}</span>
                       {selectedCategory === cat && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                 ))}
              </div>
           </div>
        </aside>

        {/* Main Chart Area */}
        <main className="flex-1 overflow-y-auto p-12 bg-[#F8F9FB]">
           <div className="max-w-6xl mx-auto space-y-8">
              
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                 {/* Large Chart Card */}
                 <div className="xl:col-span-3 bg-white border border-slate-200 rounded-[32px] p-10 shadow-sm relative">
                    <div className="absolute top-8 left-10 flex items-center gap-2">
                       <Info className="w-4 h-4 text-slate-300" />
                       <p className="text-[10px] text-slate-400 font-medium">Showing monthly expense analysis for {selectedCategory.toLowerCase()}</p>
                    </div>

                    <div className="w-full h-[400px] mt-12">
                       <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={MOCK_TREND_DATA}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                             <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                             <YAxis hide />
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }}
                                cursor={{ fill: '#F8F9FB' }}
                             />
                             <Bar dataKey="actual" stackId="a" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={40} />
                             <Bar dataKey="overspent" stackId="a" fill="#E11D48" radius={[4, 4, 0, 0]} barSize={40} />
                             <Line type="monotone" dataKey="budgeted" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#4338CA', r: 4 }} />
                          </ComposedChart>
                       </ResponsiveContainer>
                    </div>

                    {/* Bottom Legend */}
                    <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budgeted</p>
                          <div className="flex items-center gap-2">
                             <div className="w-4 h-0.5 bg-indigo-500" />
                             <span className="text-xs font-semibold text-slate-700">Budget</span>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</p>
                          <div className="flex flex-wrap gap-4">
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-teal-500 rounded-sm" />
                                <span className="text-[10px] font-medium text-slate-600">Within budget</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-rose-500 rounded-sm" />
                                <span className="text-[10px] font-medium text-slate-600">Overspent</span>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remainder</p>
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-slate-200 rounded-sm" />
                             <span className="text-[10px] font-medium text-slate-600">Pending/In progress</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Sidebar Stats Card */}
                 <div className="xl:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm h-full flex flex-col">
                       <h3 className="text-lg font-bold text-slate-800 mb-6">{selectedCategory}</h3>
                       <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-8">Jan 1 - 31</p>
                       
                       <div className="space-y-8 flex-1">
                          <div className="flex items-center justify-between">
                             <span className="text-sm font-medium text-slate-500">Budget</span>
                             <span className="text-sm font-bold text-indigo-900">2,591.04</span>
                          </div>
                          <div className="flex flex-col gap-4 border-t border-slate-50 pt-8">
                             <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-800">Actual</span>
                                <span className="text-sm font-bold text-indigo-600 underline cursor-pointer">3,703.25</span>
                             </div>
                             <div className="pl-4 space-y-3 border-l-2 border-slate-100">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-teal-500" />
                                      <span className="text-[11px] text-slate-400">Within budget</span>
                                   </div>
                                   <span className="text-[11px] font-semibold text-slate-600">2,591.04</span>
                                </div>
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                                      <span className="text-[11px] text-slate-400">Overspent</span>
                                   </div>
                                   <span className="text-[11px] font-semibold text-rose-500">1,112.21</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <Button className="mt-auto w-full h-12 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                          <Activity className="w-4 h-4" /> Burndown Chart
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
