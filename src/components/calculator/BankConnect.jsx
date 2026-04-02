import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Landmark, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

import { usePlaidLink } from 'react-plaid-link';

export default function BankConnect({ onSyncSuccess }) {
  const [linkToken, setLinkToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const initPlaid = async () => {
      try {
        const response = await base44.functions.invoke('createPlaidLinkToken');
        if (response.data?.link_token) {
          setLinkToken(response.data.link_token);
        }
      } catch (error) {
        console.error("Error creating link token:", error);
      }
    };
    initPlaid();
  }, []);

  const onSuccess = React.useCallback(async (public_token, metadata) => {
    setStatus('linking');
    setIsLoading(true);
    try {
      await base44.functions.invoke('exchangePlaidPublicToken', { publicToken: public_token });
      const transactionsResp = await base44.functions.invoke('getPlaidTransactions', { itemId: 'item_sandbox_abc123' });
      
      if (transactionsResp.data?.transactions) {
        onSyncSuccess(transactionsResp.data.transactions);
        setStatus('success');
        toast.success("Bank account linked and synced successfully!");
      }
    } catch (error) {
      setStatus('error');
      toast.error("Failed to sync bank data.");
    } finally {
      setIsLoading(false);
    }
  }, [onSyncSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  const handleSync = () => {
    if (ready) {
      open();
    } else {
        // Fallback simulation for dev/sandbox if token isn't ready or for quick testing
        handleSimulation();
    }
  };

  const handleSimulation = async () => {
    setIsLoading(true);
    setStatus('linking');
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const transactionsResp = await base44.functions.invoke('getPlaidTransactions', { itemId: 'item_mock_123' });
        if (transactionsResp.data?.transactions) {
            onSyncSuccess(transactionsResp.data.transactions);
            setStatus('success');
            toast.success("Bank account linked (Simulated)!");
        }
    } catch (error) {
        setStatus('error');
    } finally {
        setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 animate-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider">Bank Linked</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading || !linkToken}
      className={`relative overflow-hidden group transition-all duration-300 ${
        status === 'error' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700'
      } text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : status === 'error' ? (
          <AlertCircle className="w-4 h-4" />
        ) : (
          <Landmark className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <span>{isLoading ? 'Connecting...' : status === 'error' ? 'Try Again' : 'Link Bank Account'}</span>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/20 animate-pulse" />
      )}
    </Button>
  );
}
