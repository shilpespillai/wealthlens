import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useAccounts
 * Centralized hook for managing the Master Account Repository.
 * Follows User Rules:
 * 1) Central repository for global access.
 * 2) Monthly deletion (scoped to shard).
 * 3) Global deletion from registry (future months).
 * 4) Global addition to registry (future months).
 */

const DEFAULT_ACCOUNTS = [
  { id: 'sys-savings', name: "Salary / Savings", type: "asset", category: "Bank", base_balance: 0, is_system: true },
  { id: 'sys-credit', name: "Primary Credit Card", type: "debt", category: "Credit Cards", base_balance: 0, is_system: true },
  { id: 'sys-offset', name: "Global Offset Account", type: "asset", category: "Bank", base_balance: 0, is_system: true },
  { id: 'sys-vault', name: "Manual Vault", type: "asset", category: "Savings", base_balance: 0, is_system: true }
];

export const useAccounts = (monthKey = null) => {
  const [masterAccounts, setMasterAccounts] = useState([]);
  const [monthlyAccounts, setMonthlyAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Central Repository (Vault)
      let master = await base44.user.loadData('wl_account_master');
      if (!master || master.length === 0) {
        master = DEFAULT_ACCOUNTS;
        await base44.user.saveData('wl_account_master', master);
      }
      setMasterAccounts(master);

      // 2. Fetch Monthly Shard if monthKey is provided
      if (monthKey) {
        const monthly = await base44.db.getTable('user_accounts', { month: monthKey });
        setMonthlyAccounts(monthly || []);
      }
    } catch (err) {
      console.error("[useAccounts] Fetch failure:", err);
    } finally {
      setIsLoading(false);
    }
  }, [monthKey]);

  // Rule 4: Add to central repository
  const addAccountToMaster = async (account) => {
    try {
      const current = await base44.user.loadData('wl_account_master') || DEFAULT_ACCOUNTS;
      const id = account.id || `acc-${Date.now()}`;
      
      if (current.some(a => String(a.id) === String(id))) {
        toast.error("Account ID already exists in repository");
        return;
      }

      const newMaster = [...current, { ...account, id }];
      await base44.user.saveData('wl_account_master', newMaster);
      setMasterAccounts(newMaster);
      
      // If monthKey is active, also add to current month shard
      if (monthKey) {
        await base44.db.upsertRow('user_accounts', { ...account, id }, { month: monthKey });
        await fetchAccounts();
      }
      
      toast.success(`Account '${account.name}' added to Central Repository`);
    } catch (err) {
      console.error("[useAccounts] Master add failed:", err);
    }
  };

  // Rule 3: Delete from central repository (Affects future months)
  const deleteAccountFromMaster = async (id) => {
    try {
      const current = await base44.user.loadData('wl_account_master') || [];
      const newMaster = current.filter(a => String(a.id) !== String(id));
      await base44.user.saveData('wl_account_master', newMaster);
      setMasterAccounts(newMaster);
      toast.success("Account removed from Central Repository (Future months only)");
    } catch (err) {
      console.error("[useAccounts] Master delete failed:", err);
    }
  };

  // Rule 2: Delete from monthly shard only
  const deleteAccountMonthly = async (id) => {
    if (!monthKey) return;
    try {
      await base44.db.deleteByFilter('user_accounts', 'id', id, { month: monthKey });
      await fetchAccounts();
      toast.success("Account removed from current month only");
    } catch (err) {
      console.error("[useAccounts] Monthly delete failed:", err);
    }
  };

  // Synchronization: Ensure monthly shard has all master accounts
  const syncMonthlyWithMaster = useCallback(async (targetMonth) => {
    try {
      const master = await base44.user.loadData('wl_account_master') || DEFAULT_ACCOUNTS;
      const monthly = await base44.db.getTable('user_accounts', { month: targetMonth });
      const monthlyIds = new Set((monthly || []).map(a => String(a.id)));
      
      let neededSync = false;
      for (const masterAcc of master) {
        if (!monthlyIds.has(String(masterAcc.id))) {
          await base44.db.upsertRow('user_accounts', masterAcc, { month: targetMonth });
          neededSync = true;
        }
      }
      
      if (neededSync && targetMonth === monthKey) {
        await fetchAccounts();
      }
      return neededSync;
    } catch (err) {
      console.error("[useAccounts] Sync failure:", err);
      return false;
    }
  }, [monthKey, fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    masterAccounts,
    monthlyAccounts,
    isLoading,
    addAccountToMaster,
    deleteAccountFromMaster,
    deleteAccountMonthly,
    syncMonthlyWithMaster,
    refresh: fetchAccounts
  };
};

export default useAccounts;
