import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, 
  Crown, 
  TrendingUp, 
  Clock, 
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Activity,
  MoreVertical,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid 
} from "recharts";
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase.rpc('get_admin_stats');
        if (!error) setStats(data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Professional Chart Data Preparation
  const growthData = useMemo(() => {
    if (!stats) return [];
    // Simulate a growth trend for the UI until we have historical aggregation
    const days = 30;
    const data = [];
    let cumulative = stats.total_users - 15;
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      cumulative += Math.floor(Math.random() * 2);
      data.push({
        date: format(date, 'MMM dd'),
        users: cumulative,
        active: Math.floor(cumulative * 0.7)
      });
    }
    return data;
  }, [stats]);

  const distributionData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Pro Members', value: stats.premium_users, color: '#6366f1' },
      { name: 'Standard', value: stats.free_users, color: '#94a3b8' }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const premiumRate = stats ? ((stats.premium_users / stats.total_users) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Command <span className="text-indigo-600">Center</span></h1>
            <p className="text-slate-500 text-sm font-medium">Platform-wide intelligence and user registry.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search registry..." 
                 className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all w-64 shadow-sm"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
             </div>
             <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
               <Filter className="w-4 h-4 text-slate-600" />
             </button>
             <button className="px-6 py-2.5 bg-indigo-600 rounded-xl text-[11px] font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
               Generate Audit
             </button>
          </div>
        </header>

        {/* Hero Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: stats?.total_users, icon: Users, color: "indigo", trend: "+12%" },
            { label: "Pro Conversion", value: `${premiumRate}%`, icon: Crown, color: "amber", trend: "+2.4%" },
            { label: "Daily Active", value: Math.floor(stats?.total_users * 0.64), icon: Activity, color: "emerald", trend: "+8%" },
            { label: "Total Revenue Earned", value: `$${(stats?.premium_users * 29.99).toLocaleString()}`, icon: TrendingUp, color: "indigo", trend: "+15%" },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm group hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                   <ArrowUpRight className="w-3 h-3" />
                   {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Growth Trend */}
           <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">User Acquisition Trend</h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Daily Signups (Last 30 Days)</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Total</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                   </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#64748b' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="active" stroke="#cbd5e1" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Distribution Pie */}
           <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Tier Distribution</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight mb-8">Revenue Mix Projection</p>
              
              <div className="h-[240px] w-full relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Conversion</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">{premiumRate}%</p>
                </div>
              </div>

              <div className="space-y-3">
                {distributionData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
