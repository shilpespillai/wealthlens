import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from "date-fns";
import { resolveCanonicalCategory } from '@/utils/constants';

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
   * Consolidates complex budget reduction logic based on raw DB fields.
   */
  const calculateMetrics = useCallback((incomes = [], expenses = []) => {
    // Priority: Actual Amount (realized) > Monthly Target (planned)
    const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount !== undefined && i.amount !== null ? i.amount : (i.monthly_target || 0))), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount !== undefined && e.amount !== null ? e.amount : (e.monthly_target || 0))), 0);
    const savings = expenses
      .filter(e => e.spendType === 'savings' || (e.name && e.name.toLowerCase().includes('save')))
      .reduce((sum, e) => sum + (Number(e.amount || e.monthly_target || 0)), 0);
    
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
      const inc = (incomes || []).reduce((s, i) => s + (Number(i.amount || i.monthly_target || 0)), 0);
      const exp = (expenses || []).reduce((s, e) => s + (Number(e.amount || e.monthly_target || 0)), 0);
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
   * Aligned with DB Schema: Uses 'amount' for actuals and 'monthly_target' for targets.
   * Performs category-based aggregation of raw transactions.
   */
  const normalizeTransactionData = useCallback((saved, selectedDate, transactions, accounts = []) => {
    const rawTransactions = transactions || [];
    
    // Support both legacy flat structure and new relational payload structure
    const data = saved?.payload || saved || {};
    // FORCE IGNORE incomes from budget records - income is a ledger-only funding source.
    const budgetData = { ...data, incomes: [] };
    
    // Account Resolution Helper
    const resolveAccountId = (tx) => {
      if (tx.account_id) return tx.account_id;
      if (!tx.account || tx.account === 'Manual Vault') return null;
      // Try to find ID by name
      const found = accounts.find(a => a.name === tx.account);
      return found ? found.id : null;
    };

    // Aggregation Helper
    const aggregateByCategory = (categoryName, type) => {
      const canonicalTarget = resolveCanonicalCategory(categoryName);
      
      const filtered = rawTransactions.filter(t => {
        const transactionCategory = resolveCanonicalCategory(t.category);
        const amount = Number(t.amount) || 0;
        // Heuristic: If amount is positive and type is expense, or vice versa, trust the amount?
        // Actually, let's just use the explicit type but be aware of mismatches.
        return t.type === type && transactionCategory === canonicalTarget;
      });
      
      return {
        amount: filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
        count: filtered.length,
        lastDate: filtered.length > 0 ? filtered[0].date : null,
        transactionIds: new Set(filtered.map(t => t.id))
      };
    };

    // Keep track of all "consumed" transactions to prevent double-counting in 'missing' lists
    const consumedTransactionIds = new Set();

    // Normalize Incomes
    const baseIncs = (budgetData.incomes || []).map(i => {
      const agg = aggregateByCategory(i.category || i.name || 'Income', 'income');
      agg.transactionIds.forEach(id => consumedTransactionIds.add(id));
      
      const resolvedAccId = resolveAccountId(i);
      return { 
        ...i, 
        amount: agg.amount, // Realized income
        date: agg.lastDate || i.date,
        name: i.name || i.merchant || i.category || 'Income',
        category: resolveCanonicalCategory(i.category || i.name || 'Income'),
        type: 'income',
        account_id: resolvedAccId,
        account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
      };
    });

    const missingIncs = rawTransactions.filter(m => {
      const amount = Number(m.amount) || 0;
      const isIncome = m.type === 'income' || resolveCanonicalCategory(m.category) === 'Income' || amount > 0;
      return isIncome && !consumedTransactionIds.has(m.id);
    }).map(t => {
      const resolvedAccId = resolveAccountId(t);
      return { 
        ...t,
        name: t.merchant || t.name || t.category || 'Income Item',
        category: 'Income', // Standardize to unified category
        type: 'income',
        spendType: 'income',
        account_id: resolvedAccId,
        account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
      };
    });
    
    // Normalize Expenses
    const baseExps = (budgetData.expenses || []).map(e => {
      const agg = aggregateByCategory(e.category || e.name || 'Misc', 'expense');
      agg.transactionIds.forEach(id => consumedTransactionIds.add(id));

      const resolvedAccId = resolveAccountId(e);
      return { 
        ...e, 
        amount: Math.abs(agg.amount || 0), // Realized spend
        date: agg.lastDate || e.date,
        name: e.name || e.merchant || e.category || 'Misc Expense',
        category: resolveCanonicalCategory(e.category || e.name || 'Misc'),
        type: 'expense',
        account_id: resolvedAccId,
        account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
      };
    });

    const missingExps = rawTransactions.filter(m => {
      const amount = Number(m.amount) || 0;
      const isExpense = m.type === 'expense' || (m.type !== 'income' && amount < 0);
      return isExpense && !consumedTransactionIds.has(m.id);
    }).map(t => {
      const resolvedAccId = resolveAccountId(t);
      return { 
        ...t,
        name: t.merchant || t.name || t.category || 'Expense Item',
        type: 'expense',
        amount: Math.abs(t.amount || 0),
        account_id: resolvedAccId,
        account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
      };
    });

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
    
    // Support direct timestamp/date ranges (used by Dashboard)
    if (filter.startDate) {
      const startVal = typeof filter.startDate === 'number' ? format(new Date(filter.startDate), 'yyyy-MM-dd') : filter.startDate;
      queryOptions.filters.push({ column: 'date', op: 'gte', value: startVal });
    }
    if (filter.endDate) {
      const endVal = typeof filter.endDate === 'number' ? format(new Date(filter.endDate), 'yyyy-MM-dd') : filter.endDate;
      queryOptions.filters.push({ column: 'date', op: 'lte', value: endVal });
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
      // Nuclear Purge: Resets all user-specific data to enable fresh provisioning/seeding
      const success = await base44.db.execute("DELETE FROM transactions;");
      await base44.db.execute("DELETE FROM budgets;");
      await base44.db.execute("DELETE FROM portfolio_holdings;");
      await base44.db.execute("DELETE FROM user_accounts;");
      await base44.db.execute("DELETE FROM monthly_summaries;");
      
      if (success) {
        toast.success("Identity ledger purged successfully", { id: tId });
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
