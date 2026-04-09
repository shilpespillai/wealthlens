import React from "react";
import { 
  Building2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Wallet,
  Landmark,
  Car,
  CreditCard,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const COLORS = ['#818CF8', '#6366F1', '#D946EF', '#F472B6'];

const MOCK_PIE_DATA = [
  { name: 'Vehicles', value: 8990 },
  { name: 'Bank', value: 3547 },
  { name: 'Credit Cards', value: 2346 },
  { name: 'Loans', value: 5000 },
];

export default function NetWorthReport() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Building2 className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-medium text-white tracking-tight">Net Worth as of today</h1>
            </div>
            <div className="flex items-center gap-8">
               <div className="hidden lg:flex items-center gap-6 border-r border-slate-700 pr-8">
                  <div className="flex items-center gap-2">
                     <Switch id="hideZero" checked />
                     <label htmlFor="hideZero" className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Hide $0 accounts</label>
                  </div>
                  <div className="flex items-center gap-2">
                     <Switch id="expandAll" checked />
                     <label htmlFor="expandAll" className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Expand all sections</label>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1">
                     <span className="text-xs text-slate-400 px-3 py-1.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        April 2026
                     </span>
                  </div>
                  <div className="flex items-center border border-slate-700 rounded-lg bg-slate-800/50">
                     <button className="p-2 border-r border-slate-700 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
                     <button className="p-2 text-slate-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel starts below Navbar */}
      <div className="flex-1 overflow-y-auto bg-[#F8F9FB] p-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Analysis View (Left Card) */}
          <div className="lg:col-span-4 bg-[#E0E7FF] border border-slate-200 rounded-[32px] p-10 flex flex-col items-center shadow-lg relative overflow-hidden h-full min-h-[600px]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full -mr-12 -mt-12 blur-3xl opacity-50" />
             
             <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-lg p-1 mb-8 self-center shadow-sm">
                <Button variant="ghost" size="sm" className="text-[10px] font-semibold uppercase tracking-widest px-6 h-8 text-slate-500">Assets</Button>
                <Button variant="ghost" size="sm" className="bg-[#4338CA] text-white text-[10px] font-semibold uppercase tracking-widest px-6 h-8 shadow-md">Net Worth</Button>
                <Button variant="ghost" size="sm" className="text-[10px] font-semibold uppercase tracking-widest px-6 h-8 text-slate-500">Debt</Button>
             </div>

             <div className="text-center mb-8">
                <p className="text-3xl font-bold text-slate-800 tracking-tight">$5,192</p>
             </div>

             <div className="w-full h-[280px] mb-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={MOCK_PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {MOCK_PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ fontSize: '12px' }}
                      />
                   </PieChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                {MOCK_PIE_DATA.map((item, idx) => (
                   <div key={idx} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                         <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-800 ml-4.5">{formatCurrency(item.value)}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Breakdown List (Center/Right) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
             
             {/* Assets Column */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assets</h2>
                      <p className="text-[10px] uppercase font-semibold text-teal-600 tracking-widest">What I Own</p>
                   </div>
                   <span className="text-lg font-bold text-teal-600">$12,537</span>
                </div>

                <div className="space-y-4">
                   <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group hover:border-[#C5A059]/40 transition-all">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold">1</div>
                            <span className="text-xs font-bold text-slate-700">Bank</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">$3,547</span>
                      </div>
                      <div className="flex items-center gap-3 pl-11">
                         <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">S</div>
                         <span className="flex-1 text-[11px] font-medium text-slate-500 underline decoration-slate-200 cursor-pointer">Sample Bank Account</span>
                         <span className="text-[11px] font-bold text-slate-700">$3,547</span>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group hover:border-[#C5A059]/40 transition-all">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold">1</div>
                            <span className="text-xs font-bold text-slate-700">Vehicles</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">$8,990</span>
                      </div>
                      <div className="flex items-center gap-3 pl-11">
                         <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white"><Car className="w-3 h-3" /></div>
                         <span className="flex-1 text-[11px] font-medium text-slate-500 underline decoration-slate-200 cursor-pointer">Mazda Premacy</span>
                         <span className="text-[11px] font-bold text-slate-700">$8,990</span>
                      </div>
                   </div>

                   <Button className="w-full h-14 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-widest gap-3 rounded-2xl">
                      <Plus className="w-4 h-4" /> Add Asset
                   </Button>
                </div>
             </div>

             {/* Debts Column */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Debts</h2>
                      <p className="text-[10px] uppercase font-semibold text-rose-500 tracking-widest">What I Owe</p>
                   </div>
                   <span className="text-lg font-bold text-rose-500">($7,346)</span>
                </div>

                <div className="space-y-4">
                   <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group hover:border-[#C5A059]/40 transition-all">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold">1</div>
                            <span className="text-xs font-bold text-slate-700">Credit Cards</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">($2,346)</span>
                      </div>
                      <div className="flex items-center gap-3 pl-11">
                         <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">S</div>
                         <span className="flex-1 text-[11px] font-medium text-slate-500 underline decoration-slate-200 cursor-pointer">Sample Credit Card</span>
                         <span className="text-[11px] font-bold text-slate-700">($2,346)</span>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm group hover:border-[#C5A059]/40 transition-all">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold">1</div>
                            <span className="text-xs font-bold text-slate-700">Loans</span>
                         </div>
                         <span className="text-xs font-bold text-slate-800">($5,000)</span>
                      </div>
                      <div className="flex items-center gap-3 pl-11">
                         <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-white"><Landmark className="w-3 h-3" /></div>
                         <span className="flex-1 text-[11px] font-medium text-slate-500 underline decoration-slate-200 cursor-pointer">Car Loan</span>
                         <span className="text-[11px] font-bold text-slate-700">($5,000)</span>
                      </div>
                   </div>

                   <Button className="w-full h-14 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-widest gap-3 rounded-2xl">
                      <Plus className="w-4 h-4" /> Add Debt
                   </Button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
