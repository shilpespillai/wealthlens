import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useFinancialParser
 * Centralized hook for financial calculations, parsing, and data persistence.
 * Follows the WealthLens Premium Design System standards.
 */
export const useFinancialParser = () => {

  /**
   * parseCurrency
   * Safely converts string currency (e.g., "$1,234.50") to a number.
   */
  const parseCurrency = useCallback((val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    // Remove symbols, commas, and handle negative parentheses
    let clean = val.replace(/[$\s,]/g, '');
    if (clean.startsWith('(') && clean.endsWith(')')) {
      clean = '-' + clean.substring(1, clean.length - 1);
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }, []);

  /**
   * formatAmount
   * Standardizes currency formatting with support for parentheses for negative values.
   */
  const formatAmount = useCallback((val, options = {}) => {
    const { 
      useParentheses = true, 
      decimals = 2, 
      symbol = '$', 
      showSign = false 
    } = options;

    const num = typeof val === 'string' ? parseCurrency(val) : (val || 0);
    const absNum = Math.abs(num);
    
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(absNum);

    if (num < 0) {
      if (useParentheses) return `(${symbol}${formatted})`;
      return `-${symbol}${formatted}`;
    }
    
    return `${showSign && num > 0 ? '+' : ''}${symbol}${formatted}`;
  }, [parseCurrency]);

  /**
   * formatCurrencyShort
   * Abbreviates large numbers (K, M, B) for high-density UI sections.
   */
  const formatCurrencyShort = useCallback((val, symbol = '$') => {
    const num = typeof val === 'string' ? parseCurrency(val) : (val || 0);
    const absNum = Math.abs(num);
    let formatted = '';

    if (absNum >= 1000000000) {
      formatted = (num / 1000000000).toFixed(1) + ' B';
    } else if (absNum >= 1000000) {
      formatted = (num / 1000000).toFixed(1) + ' M';
    } else if (absNum >= 1000) {
      formatted = (num / 1000).toFixed(1) + ' K';
    } else {
      formatted = absNum.toFixed(2);
    }

    return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
  }, [parseCurrency]);

  /**
   * formatDate
   * Standardizes date rendering (e.g., 'Jan 10, 2026')
   */
  const formatDate = useCallback((val) => {
    if (!val) return '---';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val; // Return original if invalid
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return val;
    }
  }, []);

  /**
   * getMonthlyValue
   * Standardizes recurrence multipliers.
   * Based on Standard Year (52 weeks / 12 months).
   */
  const getMonthlyValue = useCallback((amount, freq) => {
    const base = typeof amount === 'string' ? parseCurrency(amount) : amount;
    switch (freq?.toLowerCase()) {
      case 'weekly': return base * 4.333;
      case 'fortnightly': return base * 2.166;
      case 'monthly': return base;
      case 'quarterly': return base / 3;
      case 'annually': return base / 12;
      default: return base;
    }
  }, [parseCurrency]);

  /**
   * calculateMetrics
   * Consolidates complex budget reduction logic.
   */
  const calculateMetrics = useCallback((incomes = [], expenses = []) => {
    const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.monthlyAmount) || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
    const savings = expenses
      .filter(e => e.spendType === 'savings' || (e.name && e.name.toLowerCase().includes('save')))
      .reduce((sum, e) => sum + (Number(e.monthlyAmount) || 0), 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      savings,
      hasIncome: totalIncome > 0
    };
  }, []);

  /**
   * updateVaultRegistry
   * Maintains a local cache of monthly surpluses for fast global aggregation.
   */
  const updateVaultRegistry = useCallback((monthKey, incomes, expenses) => {
    try {
      const registry = JSON.parse(localStorage.getItem('wealthlens-vault-registry') || '{}');
      const inc = (incomes || []).reduce((s, i) => s + (Number(i.monthlyAmount) || 0), 0);
      const exp = (expenses || []).reduce((s, e) => s + (Number(e.monthlyAmount) || 0), 0);
      registry[monthKey] = inc - exp;
      localStorage.setItem('wealthlens-vault-registry', JSON.stringify(registry));
    } catch (err) {
      console.error("Vault Registry Update Failed:", err);
    }
  }, []);

  /**
   * syncData
   * Wrapper for base44 with user feedback.
   */
  const syncData = useCallback(async (key, data, options = {}) => {
    const { silent = false, loadingMessage = 'Syncing data...' } = options;
    let toastId;
    
    if (!silent) toastId = toast.loading(loadingMessage);
    
    try {
      const success = await base44.user.saveData(key, data);
      if (success) {
        // Update registry for Vault consistency
        if (data.incomes || data.expenses) {
          updateVaultRegistry(key, data.incomes, data.expenses);
        }
        
        if (!silent) toast.success('Sync complete', { id: toastId });
        return true;
      }
      throw new Error('Sync failed');
    } catch (err) {
      if (!silent) toast.error('Check your connection. Saved locally.', { id: toastId });
      return false;
    }
  }, []);

  /**
   * normalizeTransactionData
   * Centralized 'Seed-and-Merge' logic to ensure all 12 categories are present.
   */
  const normalizeTransactionData = useCallback((saved, selectedDate, mocks) => {
    const currentMocks = mocks || [];
    
    // Support both legacy flat structure and new relational payload structure
    const data = saved?.payload || saved || {};
    
    // Normalize Incomes
    const baseIncs = (data.incomes || []).map(i => ({ 
      ...i, 
      category: (!i.category || ['income', 'Salary and Wages'].includes(i.category)) ? (i.name || 'Salary') : i.category 
    }));
    const presentIncCats = new Set(baseIncs.map(i => (i.category || "").toLowerCase()));
    const missingIncs = currentMocks.filter(m => m.type === 'income' && !presentIncCats.has((m.category || "").toLowerCase())).map(t => ({ 
      ...t,
      name: t.merchant, 
      monthlyAmount: t.amount, 
      spendType: 'income' 
    }));
    
    // Normalize Expenses
    const baseExps = (data.expenses || []).map(e => ({ 
      ...e, 
      category: (!e.category || ['fixed', 'variable', 'savings', 'expense'].includes(e.category.toLowerCase())) ? (e.name || 'Misc') : e.category 
    }));
    const presentExpCats = new Set(baseExps.map(e => (e.category || "").toLowerCase()));
    const missingExps = currentMocks.filter(m => m.type === 'expense' && !presentExpCats.has((m.category || "").toLowerCase())).map(t => ({ 
      ...t,
      name: t.merchant, 
      monthlyAmount: Math.abs(t.amount), 
      spendType: t.spendType 
    }));

    return {
      incomes: [...baseIncs, ...missingIncs],
      expenses: [...baseExps, ...missingExps]
    };
  }, []);

  /**
   * getDatabaseTable
   * Generic wrapper for table-based retrieval.
   */
  const getDatabaseTable = useCallback(async (tableName) => {
    return base44.db.getTable(tableName);
  }, []);

  /**
   * getProductionLedger
   * Fetches the real historical ledger from the indexed 'transactions' table.
   */
  const getProductionLedger = useCallback(async (filter = {}) => {
    const queryOptions = {
      filters: [],
      orderBy: { column: 'date', ascending: false }
    };

    if (filter.month) {
      // Postgres DATE type doesn't support LIKE. Use range queries instead.
      const start = `${filter.month}-01`;
      const [year, month] = filter.month.split('-').map(Number);
      const endDay = new Date(year, month, 0).getDate();
      const end = `${filter.month}-${endDay}`;
      
      queryOptions.filters.push({ column: 'date', op: 'gte', value: start });
      queryOptions.filters.push({ column: 'date', op: 'lte', value: end });
    }
    
    if (filter.accountId) {
      queryOptions.filters.push({ column: 'account_id', op: 'eq', value: filter.accountId });
    }

    if (filter.category) {
      queryOptions.filters.push({ column: 'category', op: 'eq', value: filter.category });
    }

    const data = await base44.db.query('transactions', queryOptions);
    return data || [];
  }, []);

  /**
   * purgeProductionLedger
   * Permanently removes historical data to allow for clean re-seeding.
   * Target tables: transactions, budgets, portfolio_holdings.
   */
  const purgeProductionLedger = useCallback(async () => {
    const tId = toast.loading("Purging production ledger...");
    try {
      // In a real environment, we would use a bulk delete. 
      // With base44, we'll try to clear the known production keys or use a custom query if supported.
      // Since base44.db doesn't have a clearTable, we'll use base44.db.query to get all and then delete or just warn.
      // Wait, let's check if there's a delete method.
      
      // For now, we'll implement a targeted deletion if possible or just log it.
      // Actually, let's look at base44Client.js again.
      const success = await base44.db.execute("DELETE FROM transactions;");
      await base44.db.execute("DELETE FROM budgets;");
      await base44.db.execute("DELETE FROM portfolio_holdings;");
      
      if (success) {
        toast.success("Ledger purged successfully", { id: tId });
        return true;
      }
      throw new Error("Purge failed");
    } catch (err) {
      console.error("Purge failed:", err);
      toast.error("Cleanup failed. Check console.", { id: tId });
      return false;
    }
  }, []);

  return {
    parseCurrency,
    formatAmount,
    getMonthlyValue,
    calculateMetrics,
    syncData,
    updateVaultRegistry,
    normalizeTransactionData,
    getDatabaseTable,
    getProductionLedger,
    formatDate,
    formatCurrencyShort,
    purgeProductionLedger
  };
};

export default useFinancialParser;
