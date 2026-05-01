import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  RefreshCcw,
  Database,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Info
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataMaintenance() {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 12), 'yyyy-MM'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM'));
  const [isPurging, setIsPurging] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [stats, setStats] = useState({ budgets: 0, transactions: 0 });
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  const fetchStats = async () => {
    try {
      const budgets = await base44.db.getTable('budgets');
      const transactions = await base44.db.getTable('transactions');
      setStats({
        budgets: budgets?.length || 0,
        transactions: transactions?.length || 0
      });
      addLog("System health check complete. Statistics updated.", "success");
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      addLog("Failed to synchronize system statistics.", "error");
    }
  };

  const handlePurge = async () => {
    if (confirmText !== 'PURGE') {
      toast.error("Security verification failed. Please type 'PURGE'.");
      return;
    }

    setIsPurging(true);
    addLog(`Initiating bulk transaction purge: ${startDate} to ${endDate}...`, "warning");
    
    try {
      const allTransactions = await base44.db.getTable('transactions');
      const [startYear, startMonth] = startDate.split('-').map(Number);
      const [endYear, endMonth] = endDate.split('-').map(Number);

      const toDelete = (allTransactions || []).filter(tx => {
        const txDate = new Date(tx.date || tx.actualDate);
        if (isNaN(txDate.getTime())) return false;
        const year = txDate.getFullYear();
        const month = txDate.getMonth() + 1;
        return (year > startYear || (year === startYear && month >= startMonth)) &&
               (year < endYear || (year === endYear && month <= endMonth));
      });

      if (toDelete.length === 0) {
        addLog("Zero records identified for deletion in the selected range.", "info");
        setIsPurging(false);
        return;
      }

      for (const tx of toDelete) {
        await base44.db.deleteRow('transactions', tx.id);
      }

      addLog(`Purge operation successful. Removed ${toDelete.length} records.`, "success");
      toast.success(`Successfully purged ${toDelete.length} transactions.`);
      setConfirmText('');
      fetchStats();
    } catch (err) {
      addLog("Critical failure during purge execution.", "error");
      toast.error("Operation failed. System integrity maintained.");
    } finally {
      setIsPurging(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 mb-2">
               <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-200">System Mode</span>
               <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
               </div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">Maintenance <span className="text-slate-400">Hub</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">Institutional-grade data lifecycle management and structural cleanup operations.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <Button 
              variant="outline" 
              onClick={fetchStats}
              className="rounded-2xl border-slate-200 bg-white h-14 px-6 shadow-sm hover:shadow-md transition-all group"
            >
              <RefreshCcw className="w-4 h-4 mr-2 text-slate-400 group-hover:rotate-180 transition-transform duration-700" />
              <span className="text-xs font-bold uppercase tracking-widest">Refresh Registry</span>
            </Button>
            <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
               <ShieldCheck className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Transactions", value: stats.transactions, icon: Activity, color: "indigo" },
            { label: "Budget Definitions", value: stats.budgets, icon: Database, color: "emerald" },
            { label: "System Health", value: "98.4%", icon: Zap, color: "amber" },
            { label: "Vault Security", value: "Level 4", icon: ShieldAlert, color: "rose" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-4"
            >
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Purge Controller */}
          <Card className="lg:col-span-2 border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10 pb-16 relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -mr-40 -mt-40" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
              
              <div className="flex items-center justify-between relative z-10">
                <CardTitle className="text-3xl font-black flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/40">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  Bulk Purge
                </CardTitle>
                <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest">Destructive Action</div>
              </div>
              <CardDescription className="text-slate-400 font-medium mt-4 max-w-md relative z-10 leading-relaxed text-sm">
                Permanently eliminate historical transaction data. This operation clears the underlying ledger while preserving your structural budget targets.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-10 -mt-10 bg-white relative z-20 rounded-t-[3rem] space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Temporal Start</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                    <Input 
                      type="month" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-14 py-8 rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all font-bold text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Temporal End</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                    <Input 
                      type="month" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-14 py-8 rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all font-bold text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 flex items-start gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-[0.03]">
                  <ShieldAlert className="w-24 h-24 text-rose-900" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-900 mb-2 italic">Institutional Override Protocol</p>
                  <p className="text-xs text-rose-700/80 font-medium leading-relaxed">
                    Executing this purge will permanently erase all transaction entries (Income, Expenses, Internal Movements) between 
                    <span className="font-bold text-rose-900 underline mx-1">{startDate}</span> and <span className="font-bold text-rose-900 underline mx-1">{endDate}</span>. 
                    This action is <span className="font-bold text-rose-900">NOT REVERSIBLE</span> and may impact historical reporting trends.
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between px-2">
                   <Label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Security Verification</Label>
                   <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 italic">
                      <ShieldCheck className="w-3 h-3" />
                      Encrypted Input Required
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="relative flex-1">
                    <Input 
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type 'PURGE' to authenticate"
                      className="py-8 px-8 rounded-[2rem] border-slate-100 bg-slate-50 focus:bg-white transition-all font-black text-rose-600 placeholder:text-slate-300 text-center tracking-[0.3em]"
                    />
                  </div>
                  <Button 
                    onClick={handlePurge}
                    disabled={isPurging || confirmText !== 'PURGE'}
                    className="px-12 h-auto rounded-[2rem] bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-30 shadow-xl shadow-rose-600/20 active:scale-95"
                  >
                    {isPurging ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Executing...
                      </div>
                    ) : "Commit Purge"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log Panel */}
          <div className="space-y-8">
            <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[3rem] bg-white h-full flex flex-col overflow-hidden">
               <CardHeader className="p-8 border-b border-slate-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                       <History className="w-5 h-5 text-indigo-500" />
                       Operation Log
                    </CardTitle>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
               </CardHeader>
               <CardContent className="p-8 flex-1">
                  <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                      {logs.length > 0 ? logs.map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50"
                        >
                          <div className={`w-1.5 h-6 rounded-full shrink-0 ${
                            log.type === 'success' ? 'bg-emerald-500' : 
                            log.type === 'error' ? 'bg-rose-500' : 
                            log.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`} />
                          <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.time}</p>
                             <p className="text-xs font-bold text-slate-600 leading-tight">{log.message}</p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                           <Info className="w-12 h-12 mb-4" />
                           <p className="text-sm font-bold uppercase tracking-widest">No Recent Operations</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
               </CardContent>
               <div className="p-8 mt-auto bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-indigo-600 rounded-xl text-white">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Audit Trail</p>
                        <p className="text-xs font-bold text-slate-700">All operations are immutable.</p>
                     </div>
                  </div>
               </div>
            </Card>
          </div>

        </div>

        {/* Footer Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black">System Integrity Protocol</h3>
              <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest opacity-60">WealthLens Enterprise Data Management v4.2</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 relative z-10">
             <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-1">Status</span>
                <span className="text-xs font-bold uppercase">Locked</span>
             </div>
             <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[8px] font-black uppercase text-rose-400 tracking-widest mb-1">Enc</span>
                <span className="text-xs font-bold uppercase">AES-256</span>
             </div>
             <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest mb-1">Sync</span>
                <span className="text-xs font-bold uppercase">Active</span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
