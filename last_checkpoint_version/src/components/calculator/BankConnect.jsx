import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Landmark, Loader2, CheckCircle2, AlertCircle, Calendar, ExternalLink, Smartphone, ShieldCheck, Lock, Building2, Info, ChevronRight, Check, Zap, Sparkles, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getBasiqToken, 
  getOrCreateBasiqUser, 
  getBasiqAuthLink, 
  pollLatestJob,
  fetchBasiqTransactions, 
  normalizeBasiqToWealthLens 
} from '@/api/basiqAdapter';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";

export default function BankConnect({ onSyncSuccess, className, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [months, setMonths] = useState("3");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | waiting | syncing | success | error
  
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = (token, userId) => {
    setStatus('waiting');
    toast.info("Awaiting authorization...");
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await pollLatestJob(token, userId);
        if (!job) return;

        if (job.status === 'success' || (job.step === 'retrieve-transactions' && job.status === 'in-progress')) {
          clearInterval(pollIntervalRef.current);
          handleSyncData(token, userId);
        } else if (job.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setStatus('error');
          toast.error("Link failed. Please retry.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 4000);
  };

  const handleSyncData = async (token, userId) => {
    setStatus('syncing');
    try {
      const rawData = await fetchBasiqTransactions(token, userId, Number(months));
      const normalizedData = normalizeBasiqToWealthLens(rawData);
      
      if (normalizedData && normalizedData.length > 0) {
        onSyncSuccess(normalizedData);
        setStatus('success');
        toast.success(`WealthLens Synced: ${normalizedData.length} records added.`);
        setIsOpen(false);
      } else {
        toast.info("No fresh data found.");
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error("Data extraction failed.");
      setStatus('idle');
    }
  };

  const handleConnectInitiation = async () => {
    if (!mobile || mobile.length < 10) {
      toast.error("Verification Required", { description: "Enter a valid mobile number." });
      return;
    }

    setIsLoading(true);
    setStatus('connecting');
    
    try {
      const sessionStr = localStorage.getItem('mockUser') || '{}';
      let session = {};
      try { session = JSON.parse(sessionStr); } catch(e) {}
      const email = session.email || "dev@wealthlens.info";

      const token = await getBasiqToken('SERVER_ACCESS');
      let userId = await base44.user.loadData('wl_basiq_id');
      
      if (!userId) {
        userId = await getOrCreateBasiqUser(token, "User", mobile);
        if (userId) await base44.user.saveData('wl_basiq_id', userId);
      }
      
      if (!userId) throw new Error("ID generation failed.");
      const authLink = await getBasiqAuthLink(token, userId);
      window.open(authLink, '_blank');
      startPolling(token, userId);
      
    } catch (err) {
      toast.error("Protocol Error", { description: err.message });
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (status === 'waiting' || status === 'syncing') return;
      setIsOpen(val);
      if (!val) setStatus('idle');
    }}>
      <DialogTrigger asChild>
        <Button 
          disabled={disabled}
          className={`
            relative overflow-hidden group transition-all duration-500
            ${disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'}
            font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8 rounded-2xl
            ${disabled ? 'shadow-none border-slate-300' : 'shadow-lg shadow-emerald-500/20 border-t border-white/20'}
            ${className}
          `}
        >
          {!disabled && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />}
          <div className="flex items-center gap-2.5 relative z-10">
            {status === 'syncing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : disabled ? (
              <Lock className="w-4 h-4 text-slate-300" />
            ) : (
              <Zap className="w-4 h-4 fill-emerald-300" />
            )}
            {status === 'syncing' ? 'Syncing...' : disabled ? 'Link Bank (Coming Soon)' : 'Link Bank'}
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[3rem] bg-white">
        {/* VIBRANT AURORA BACKGROUNDS */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* VIBRANT GRADIENT HEADER */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 p-10 pt-12 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                 <Landmark className="w-5 h-5 text-emerald-200" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100">Direct Connect</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter leading-none">Automated <span className="text-emerald-100/60">Wealth</span></h2>
            </div>
            <div className="w-16 h-16 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
               <Fingerprint className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Open Banking 2.1
             </div>
             <div className="px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Bank Grade
             </div>
          </div>
        </div>

        <div className="p-10 space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mobile Column */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1 text-left">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                   <Smartphone className="w-3 h-3 text-indigo-500" />
                </div>
                Verification
              </label>
              <div className="relative group">
                <Input 
                  placeholder="04XX XXX XXX" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={status !== 'idle'}
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner text-lg font-black tracking-widest placeholder:text-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all pl-6"
                />
              </div>
            </div>

            {/* Depth Column */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1 text-left">
                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                   <Calendar className="w-3 h-3 text-amber-500" />
                </div>
                History Depth
              </label>
              <Select value={months} onValueChange={setMonths} disabled={status !== 'idle'}>
                <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 shadow-inner text-xs font-black uppercase tracking-widest focus:bg-white transition-all">
                  <SelectValue placeholder="Depth" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-md">
                  <SelectItem value="3" className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4">3 Months</SelectItem>
                  <SelectItem value="6" className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4">6 Months</SelectItem>
                  <SelectItem value="12" className="rounded-xl font-black uppercase tracking-widest text-[10px] py-4">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-6 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-12 h-12 text-teal-600" />
             </div>
             <p className="text-[11px] text-slate-500 font-bold leading-relaxed relative z-10 text-left">
               <span className="text-emerald-600 block mb-1 font-black uppercase tracking-widest">Protocol Intelligence</span>
               Your credentials are never stored. WealthLens receives a secure token to fetch your data using end-to-end encryption.
             </p>
          </div>

          {/* STATUS OVERLAY */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl p-10 flex flex-col items-center justify-center text-center space-y-6 rounded-[3rem]"
              >
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-[6px] border-emerald-50 flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-t-[6px] border-emerald-500 animate-spin" />
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-emerald-500 animate-pulse" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                     {status === 'connecting' && "Securing Link..."}
                     {status === 'waiting' && "Auth Pending"}
                     {status === 'syncing' && "Fetching Wealth"}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                     {status === 'waiting' ? "Complete the bank login in the new window" : "Processing institutional bridge"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FINAL ACTION */}
          <div className="space-y-4">
            <Button 
              onClick={handleConnectInitiation} 
              disabled={isLoading || status !== 'idle'}
              className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/20 transition-all group flex items-center justify-center gap-4 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-sm font-black uppercase tracking-[0.3em] relative z-10">{isLoading ? "Requesting Access..." : "Open Secure Bridge"}</span>
              {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />}
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
               <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Read-Only</span>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Encrypted</span>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Gov Compliant</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-6 border-t border-emerald-100 flex items-center justify-center">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
             Secured by Basiq Network Infrastructure
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
