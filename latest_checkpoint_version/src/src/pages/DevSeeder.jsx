import React, { useState } from 'react';
import { Database, Zap, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { wealthLensSeed } from "@/hooks/seedWealthLensData";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useFinancialParser } from "@/hooks/useFinancialParser";

export default function DevSeeder() {
  const [seeding, setSeeding] = useState(false);
  const [counts, setCounts] = useState(null);
  const { purgeProductionLedger } = useFinancialParser();

  const runSeed = async () => {
    setSeeding(true);
    let successCount = { transactions: 0, accounts: 0, budgets: 0, holdings: 0, scenarios: 0 };
    
    try {
      // 1. Seed Accounts first (Dependencies)
      const accountMap = {};
      for (const acc of wealthLensSeed.accounts) {
        const res = await base44.db.upsertRow('user_accounts', acc);
        if (res && res.id) accountMap[acc.name] = res.id;
        successCount.accounts++;
      }
      
      // 2. Seed Transactions with Account Mapping
      for (const tx of wealthLensSeed.transactions) {
        const txToInsert = { 
          ...tx, 
          account_id: accountMap[tx.account] || null 
        };
        // Clean up seeder-only properties
        delete txToInsert.account;
        
        await base44.db.upsertRow('transactions', txToInsert);
        successCount.transactions++;
      }
      
      // 3. Seed Budgets
      for (const b of wealthLensSeed.budgets) {
        // Ensure payload column is used for the budget data
        const budgetRow = { 
          month: b.month, 
          payload: { visualData: b.visualData } 
        };
        await base44.db.upsertRow('budgets', budgetRow);
        successCount.budgets++;
      }
      
      // 4. Seed Portfolio Holdings (Aggregated Historical Snapshots)
      const groupedHoldings = wealthLensSeed.portfolioHoldings.reduce((acc, h) => {
        if (!acc[h.snapshot_date]) acc[h.snapshot_date] = [];
        acc[h.snapshot_date].push(h);
        return acc;
      }, {});

      for (const [date, holdings] of Object.entries(groupedHoldings)) {
        await base44.db.upsertRow('portfolio_holdings', {
          snapshot_date: date,
          holdings: holdings.map(h => ({
            label: h.label,
            asset_class: h.asset_class,
            current_value: h.current_value,
            invested_amount: h.invested_amount
          }))
        }, 'user_id,snapshot_date');
        successCount.holdings++;
      }

      setCounts(successCount);
      toast.success("WealthLens Production Data Seeded Successfully!");
    } catch (error) {
      console.error("Seeding failed:", error);
      toast.error("Database Seeding Failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight">Production Seeder</h1>
            <p className="text-xs text-slate-400 font-medium">WealthLens Financial Suite v1.0</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
           <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50">
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                This utility will populate your instance with 6 months of historical data (Nov 2025 - Apr 2026).
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                   <div className="w-1 h-1 rounded-full bg-indigo-500" /> 180+ Dynamic Transactions
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                   <div className="w-1 h-1 rounded-full bg-indigo-500" /> 4 Core Bank Accounts
                </li>
                <li className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                   <div className="w-1 h-1 rounded-full bg-indigo-500" /> 3 Portfolio Assets (AAPL, BHP, TSLA)
                </li>
              </ul>
           </div>
        </div>

        {counts ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 animate-in zoom-in-95">
             <div className="flex items-center gap-3 mb-4">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Injection Complete</h2>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">TX Entries</p>
                   <p className="text-lg font-bold text-white">{counts.transactions}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase">Accounts</p>
                   <p className="text-lg font-bold text-white">{counts.accounts}</p>
                </div>
             </div>
             <p className="mt-4 text-[10px] text-emerald-500/60 font-bold uppercase tracking-tighter text-center">Charts will reflect new data on reload</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button 
              onClick={runSeed}
              disabled={seeding}
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
            >
              {seeding ? (
                <Zap className="w-5 h-5 animate-pulse" />
              ) : (
                <Database className="w-5 h-5" />
              )}
              {seeding ? 'INJECTING DATA...' : 'INITIALIZE PRODUCTION SEED'}
            </Button>

            <Button 
              variant="outline"
              onClick={async () => {
                if (window.confirm("Are you sure? This will delete all transactions, budgets, and holdings.")) {
                  await purgeProductionLedger();
                  setCounts(null);
                }
              }}
              className="w-full h-12 border-slate-700 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
            >
              <Trash2 className="w-4 h-4" />
              PURGE PRODUCTION LEDGER
            </Button>
          </div>
        )}

        <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase text-center flex items-center justify-center gap-2">
           <AlertCircle className="w-3 h-3" /> Warning: Overwrites existing local ledger
        </p>
      </div>
    </div>
  );
}
