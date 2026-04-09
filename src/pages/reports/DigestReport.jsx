import React from "react";
import { 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  TrendingDown,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from "recharts";
import { Button } from "@/components/ui/button";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const COLORS = ['#10B981', '#F43F5E'];

const PIE_DATA = [
  { name: 'Earned', value: 1487.90 },
  { name: 'Spent', value: 1878.35 },
];

const BAR_DATA = [
  { month: 'December', spent: 980, groceries: 400, entertainment: 300, utilities: 280 },
  { month: 'January', spent: 1250, groceries: 550, entertainment: 400, utilities: 300 },
  { month: 'February', spent: 1050, groceries: 480, entertainment: 320, utilities: 250 },
  { month: 'March', spent: 850, groceries: 310, entertainment: 320, utilities: 220 },
];

export default function DigestReport() {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Container for Navbar Area — purely white background */}
      <div className="w-full px-6 pt-4 pb-2 bg-white">
        <div className="bg-[#1E293B] rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between shadow-lg relative z-10">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-[#C5A059]/10 rounded-lg">
                  <FileText className="w-6 h-6 text-[#C5A059]" />
               </div>
               <h1 className="text-xl font-medium text-white tracking-tight">Financial Digest</h1>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center bg-slate-800/50 rounded-lg border border-slate-700 p-1 px-4 py-2 text-xs text-slate-400 gap-3">
                  <Calendar className="w-4 h-4 text-[#C5A059]" />
                  Mar 1, 2026 - Mar 31, 2026
               </div>
               <Button className="bg-[#C5A059] hover:bg-[#B38F4D] text-white text-xs uppercase tracking-widest gap-2 font-medium px-6 shadow-xl">
                  <Sparkles className="w-4 h-4" /> Regenerate
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content starts below Navbar */}
      <div className="flex flex-1 overflow-hidden bg-[#F8F9FB]">
        {/* Reports Navigation Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-8 shadow-sm">
           <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Timeframe Coverage</p>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                    <Calendar className="w-4 h-4" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-700">March 2026</p>
                    <p className="text-[9px] text-slate-400 truncate tracking-tight">31 days overview</p>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Linked Accounts</p>
              <div className="space-y-3">
                 {[
                   { name: "Sample Bank Account", balance: 3547.45, color: "bg-teal-500" },
                   { name: "Sample Credit Card", balance: -2345.54, color: "bg-rose-500" }
                 ].map((acc, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl hover:border-[#C5A059]/40 transition-all cursor-pointer group">
                       <div className="flex items-center gap-3 mb-2">
                          <div className={`w-2 h-2 rounded-full ${acc.color}`} />
                          <p className="text-[10px] font-bold text-slate-700 truncate">{acc.name}</p>
                       </div>
                       <p className={`text-sm font-bold tracking-tight ${acc.balance >= 0 ? 'text-teal-600' : 'text-rose-500'}`}>
                          {formatCurrency(acc.balance)}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-12 bg-white">
           <div className="max-w-4xl mx-auto space-y-24">
              
              {/* Header Title Section */}
              <div className="text-center space-y-4">
                 <p className="text-xs font-bold text-[#C5A059] uppercase tracking-[0.3em]">Monthly Digest</p>
                 <h2 className="text-4xl font-bold text-slate-900 tracking-tightest">Financial Overview <span className="text-slate-200 font-light">|</span> March 2026</h2>
                 <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">A strategic breakdown of your cash velocity and spending footprint across all accounts.</p>
              </div>

              {/* Big Insight Section 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-slate-50 pt-16">
                 <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-100">
                       <TrendingDown className="w-3 h-3" /> Warning Insight
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tightest leading-tight">You spent more than you earned.</h3>
                    <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
                       <p>In March, your total inflow reached <span className="text-teal-600 font-bold">$1,487.90</span>, while outgoings surged to <span className="text-rose-500 font-bold">$1,878.35</span>.</p>
                       <p className="font-bold text-slate-800">This resulted in a net loss of <span className="text-rose-500">$390.45</span> for the monthly cycle.</p>
                    </div>
                    <Button variant="link" className="text-[#C5A059] p-0 h-auto font-bold text-xs uppercase tracking-widest gap-2 group">
                       View reconciliation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </div>
                 <div className="relative h-[300px]">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total cycle</p>
                          <p className="text-2xl font-bold text-slate-900">$3,366</p>
                       </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={PIE_DATA}
                             cx="50%"
                             cy="50%"
                             innerRadius={90}
                             outerRadius={120}
                             paddingAngle={8}
                             dataKey="value"
                             stroke="none"
                          >
                             {PIE_DATA.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Big Insight Section 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center border-t border-slate-50 pt-16 pb-24">
                 <div className="h-[300px] border border-slate-100 rounded-[24px] p-6 bg-slate-50/50">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={BAR_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} />
                          <YAxis hide />
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff' }}
                             itemStyle={{ fontSize: '11px' }}
                          />
                          <Bar dataKey="spent" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                          <Bar dataKey="groceries" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={32} />
                          <Bar dataKey="entertainment" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                          <Bar dataKey="utilities" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                       <BarIcon className="w-3 h-3" /> Historical Snapshot
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tightest leading-tight">Your primary leak is Rent.</h3>
                    <div className="space-y-6 text-slate-500 text-sm leading-relaxed">
                       <p>Historical trends indicate a persistent concentration in housing costs and utilities. Recurring patterns show:</p>
                       <ul className="space-y-3">
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                             <span>Rent consistently accounts for <span className="text-slate-800 font-bold">$720</span> of monthly budget.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                             <span>Grocery spend increased <span className="text-amber-600 font-bold">12%</span> since January.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                             <span>Entertainment remains stable at <span className="text-teal-600 font-bold">$250</span>.</span>
                          </li>
                       </ul>
                    </div>
                 </div>
              </div>

           </div>
        </main>
      </div>
    </div>
  );
}
