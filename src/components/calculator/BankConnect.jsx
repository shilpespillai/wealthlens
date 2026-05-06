import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Landmark, Loader2, CheckCircle2, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
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

export default function BankConnect({ onSyncSuccess, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [months, setMonths] = useState("3");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | waiting | syncing | success | error
  const [jobId, setJobId] = useState(null);
  
  const pollIntervalRef = useRef(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const startPolling = (token, userId) => {
    setStatus('waiting');
    toast.info("Waiting for you to complete the bank login...");
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const job = await pollLatestJob(token, userId);
        if (!job) return;

        console.log("[Basiq Job Status]:", job.status);

        if (job.status === 'success') {
          clearInterval(pollIntervalRef.current);
          handleSyncData(token, userId);
        } else if (job.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setStatus('error');
          toast.error("Bank connection failed. Please try again.");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleSyncData = async (token, userId) => {
    setStatus('syncing');
    toast.loading("Fetching transaction data...");
    
    try {
      const rawData = await fetchBasiqTransactions(token, userId, Number(months));
      const normalizedData = normalizeBasiqToWealthLens(rawData);
      
      if (normalizedData && normalizedData.length > 0) {
        onSyncSuccess(normalizedData);
        setStatus('success');
        toast.success(`Success! Imported ${normalizedData.length} transactions.`);
        setIsOpen(false);
      } else {
        toast.info("No new transactions found in this timeframe.");
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast.error("Failed to fetch transactions from Basiq.");
    }
  };

  const handleConnectInitiation = async () => {
    setIsLoading(true);
    setStatus('connecting');
    
    try {
      // 1. Get the current user email (from mock session or actual auth)
      const session = JSON.parse(localStorage.getItem('mockUser') || '{}');
      const email = session.email || "dev@wealthlens.info";

      // 2. Get tokens and Setup User
      const token = await getBasiqToken('SERVER_ACCESS');
      const userId = await getOrCreateBasiqUser(token, email);
      const authLink = await getBasiqAuthLink(token, userId);

      // 3. Open Basiq Connect in a new tab
      window.open(authLink, '_blank');

      // 4. Start polling for the job success
      startPolling(token, userId);

    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error(error.message || "Failed to initialize Basiq connection.");
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 h-8 rounded-lg border border-emerald-100 animate-in zoom-in-95 duration-300 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">Synced</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`relative overflow-hidden group transition-all duration-300 ${
            status === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
          } text-white font-medium px-3 rounded-lg shadow-sm text-xs hover:shadow-md ${className}`}
        >
          <div className="flex items-center gap-1.5">
            {status === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : status === 'waiting' || status === 'syncing' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Landmark className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
            <span>
              {status === 'error' ? 'Try Again' : 
               status === 'waiting' ? 'Waiting...' : 
               status === 'syncing' ? 'Syncing...' : 'Link Bank'}
            </span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
            <Landmark className="w-6 h-6 text-indigo-600" />
            Real-Time Bank Sync
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Link your bank via Basiq Open Banking for automated, encrypted transaction fetching.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Sync Timeframe
            </label>
            <p className="text-xs text-slate-500 font-medium">
              How much historical data should we fetch once connected?
            </p>
            <Select value={months} onValueChange={setMonths} disabled={status !== 'idle' && status !== 'error'}>
              <SelectTrigger className="w-full font-bold h-11 border-slate-200">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 1 Month</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className={`p-4 rounded-xl border transition-all ${
            status === 'waiting' ? 'bg-indigo-50 border-indigo-100 animate-pulse' : 'bg-slate-50 border-slate-100'
          }`}>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {status === 'waiting' ? (
                <span className="flex items-center gap-2 text-indigo-700 font-black">
                  <ExternalLink className="w-3 h-3" />
                  Please complete the login in the new tab...
                </span>
              ) : (
                "Upon clicking connect, a secure Basiq window will open for you to choose your institution and provide consent."
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Cancel
          </Button>
          <Button 
            onClick={handleConnectInitiation} 
            disabled={status === 'waiting' || status === 'syncing' || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-6"
          >
            {status === 'connecting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Initializing...
              </>
            ) : status === 'waiting' ? (
              "Waiting for Login"
            ) : (
              "Open Secure Connection"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
