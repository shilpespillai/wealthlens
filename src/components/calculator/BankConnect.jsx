import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Landmark, Loader2, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { fetchBasiqTransactions, normalizeBasiqToWealthLens } from '@/api/basiqAdapter';

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
  const [status, setStatus] = useState('idle');

  const handleConnect = async () => {
    setIsLoading(true);
    setStatus('linking');
    
    try {
      // 1. Fetch raw mock transactions from our Basiq Simulator
      const rawData = await fetchBasiqTransactions(Number(months));
      
      // 2. Normalize the Basiq schema into our internal WealthLens schema
      const normalizedData = normalizeBasiqToWealthLens(rawData);
      
      if (normalizedData && normalizedData.length > 0) {
        // 3. Pass data to Transactions.jsx via the existing prop
        onSyncSuccess(normalizedData);
        setStatus('success');
        toast.success(`Connected! Synced ${months} month(s) of history.`);
        setIsOpen(false);
      } else {
        throw new Error("No data returned");
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      toast.error("Failed to connect to bank via Basiq.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 h-8 rounded-lg border border-emerald-100 animate-in zoom-in-95 duration-300 ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">Bank Linked</span>
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
            ) : (
              <Landmark className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            )}
            <span>{status === 'error' ? 'Try Again' : 'Link Bank'}</span>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
            <Landmark className="w-6 h-6 text-indigo-600" />
            Open Banking Connection
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Connect your bank securely via Basiq API to automate your ledger.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              Historical Data Range
            </label>
            <p className="text-xs text-slate-500 font-medium">
              How far back should we pull transactions from your accounts?
            </p>
            <Select value={months} onValueChange={setMonths}>
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
          
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong className="font-bold text-amber-900 block mb-1">Developer Mode Active</strong>
              This will simulate the Basiq connection flow and generate mock transactions using our <code className="bg-amber-100 px-1 rounded">basiqAdapter.js</code> middle layer.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              "Connect via Basiq"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
