import { useCallback, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from "date-fns";
import { resolveCanonicalCategory } from '@/utils/constants';
import { getYearMonth, isSameMonthYear, robustParseDate } from "@/utils/dateParser";

/**
 * useFinancialParser
 * Centralized hook for financial calculations, parsing, and data persistence.
 * Follows the WealthLens Premium Design System standards.
 */
const EXCLUDED_CATEGORIES = ['Transfer', 'Payment', 'Internal Transfer', 'Credit Card Payment'];

const DEFAULT_CLASSIFICATION_RULES = {
  income: {
    logic: 'OR',
    conditions: [
      { field: 'category', operator: 'equals', value: 'Income' }
    ]
  },
  expense: {
    logic: 'OR',
    conditions: []
  }
};

export const useFinancialParser = () => {
  const [classificationRules, setClassificationRules] = useState(DEFAULT_CLASSIFICATION_RULES);

  useEffect(() => {
    const loadRules = async () => {
      const rules = await base44.user.loadData('wl_classification_rules');
      if (rules) setClassificationRules(rules);
    };
    loadRules();

    // Re-load rules whenever DataMaintenance saves new ones (same-tab broadcast)
    const handleRulesUpdated = () => loadRules();
    window.addEventListener('wl_rules_updated', handleRulesUpdated);
    return () => window.removeEventListener('wl_rules_updated', handleRulesUpdated);
  }, []);

  const matchRule = useCallback((tx, rule) => {
    if (!rule || !rule.conditions || rule.conditions.length === 0) return false;
    
    const results = rule.conditions.map(c => {
      let txVal = '';
      if (c.field === 'category') {
        txVal = resolveCanonicalCategory(tx.category || "");
      }
      else if (c.field === 'merchant') txVal = String(tx.merchant || tx.name || "");
      else if (c.field === 'account') txVal = String(tx.account_id || "");
      
      const target = c.value;
      switch (c.operator) {
        case 'equals': return txVal === target;
        case 'not_equals': return txVal !== target;
        case 'contains': return String(txVal).toLowerCase().includes(String(target).toLowerCase());
        case 'greater_than': return (Number(tx.amount) || 0) > Number(target);
        case 'less_than': return (Number(tx.amount) || 0) < Number(target);
        case 'in': return Array.isArray(target) ? target.includes(txVal) : (String(txVal) === String(target));
        case 'not_in': return Array.isArray(target) ? !target.includes(txVal) : (String(txVal) !== String(target));
        default: return false;
      }
    });

    if (rule.logic === 'AND') return results.every(r => r === true);
    return results.some(r => r === true);
  }, []);

  const getClassificationRules = useCallback(async () => {
    const rules = await base44.user.loadData('wl_classification_rules');
    return rules || DEFAULT_CLASSIFICATION_RULES;
  }, []);


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
  const calculateMetrics = useCallback((incomes = [], expenses = [], accounts = []) => {
    // Parity: We now trust the pre-filtered arrays from getNormalizedLedger
    // to follow the user's manual categorization (Category = Income).
    const totalIncome = (incomes || []).reduce((sum, i) => sum + (Number(i.amount !== undefined ? i.amount : (i.monthly_target || 0))), 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (Number(e.amount !== undefined ? e.amount : (e.monthly_target || 0))), 0);
    
    // Sub-segment for savings-specific calculations in reports
    const savings = (expenses || [])
      .filter(e => e.spendType === 'savings' || (resolveCanonicalCategory(e.category || e.name).toLowerCase().includes('save')))
      .reduce((sum, e) => sum + (Number(e.amount !== undefined ? e.amount : (e.monthly_target || 0))), 0);
    
    return {
      totalIncome: Math.abs(totalIncome),
      totalExpenses: Math.abs(totalExpenses),
      balance: Math.abs(totalIncome) - Math.abs(totalExpenses),
      savings: Math.abs(savings),
      hasIncome: Math.abs(totalIncome) > 0
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
  const normalizeTransactionData = useCallback((saved, selectedDate, transactions, accounts = [], options = {}) => {
    // 0. Temporal Filtering: Format-agnostic parser to prevent DD/MM vs MM/DD leakage
    const targetDate = selectedDate || new Date();
    const targetMonth = targetDate.getMonth() + 1; // 1-12
    const targetYear = targetDate.getFullYear();

    const { ignoreMonthFilter = false, hiddenCategories = [] } = options;
    const mutedSet = new Set(hiddenCategories.map(c => c.toLowerCase().trim()));

    const rawTransactions = (transactions || []).filter(t => {
      const isCorrectMonth = ignoreMonthFilter || isSameMonthYear(t.date || t.actualDate, targetMonth, targetYear);
      if (!isCorrectMonth) return false;
      
      const canonical = resolveCanonicalCategory(t.category).toLowerCase().trim();
      return !mutedSet.has(canonical);
    });
    
    // Support both legacy flat structure and new relational payload structure
    const budgetData = saved?.payload || saved || {};

    
    // Account Resolution Helper
    const resolveAccountId = (tx) => {
      if (tx.account_id && tx.account_id !== 'null' && tx.account_id !== '') return tx.account_id;
      if (!tx.account || tx.account === 'Manual Vault') return 'sys-vault';
      
      const accName = String(tx.account).toLowerCase();
      
      // Prioritize System Mappings
      if (accName.includes('primary credit card') || accName.includes('credit card')) return 'sys-credit';
      if (accName.includes('salary') || accName.includes('savings')) return 'sys-savings';
      if (accName.includes('offset')) return 'sys-offset';
      
      // Try to find ID by name (Case-Insensitive)
      const found = accounts.find(a => 
        String(a.name).toLowerCase() === accName
      );
      return found ? found.id : 'sys-vault';
    };

    // Aggregation Helper
    const aggregateByCategory = (categoryName, type) => {
      const canonicalTarget = resolveCanonicalCategory(categoryName);
      
      const filtered = rawTransactions.filter(t => {
        const transactionCategory = resolveCanonicalCategory(t.category);
        return transactionCategory.toLowerCase() === canonicalTarget.toLowerCase();
      });
      
      return {
        amount: Math.abs(filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)),
        count: filtered.length,
        lastDate: filtered.length > 0 ? filtered[0].date : null,
        transactionIds: new Set(filtered.map(t => t.id))
      };
    };

    // Keep track of all "consumed" transactions to prevent double-counting in 'missing' lists
    const consumedTransactionIds = new Set();

    const activeRules = classificationRules;

    // 1. Process Incomes
    const incomeMap = new Map();
    (budgetData.incomes || []).forEach(i => {
      const agg = aggregateByCategory(i.category || i.name || 'Income', 'income');
      const resolvedAccId = resolveAccountId(i);
      const cat = resolveCanonicalCategory(i.category || i.name || 'Income');
      const target = Number(i.monthly_target || i.amount || 0);
      
      const existing = incomeMap.get(cat);
      if (existing) {
        existing.amount = (Number(existing.amount) || 0) + agg.amount;
        existing.monthly_target = (Number(existing.monthly_target) || 0) + target;
        agg.transactionIds.forEach(id => consumedTransactionIds.add(id));
      } else {
        incomeMap.set(cat, { 
          ...i, 
          amount: agg.amount, // Set to ACTUAL from ledger
          monthly_target: target, // Preserve TARGET
          date: agg.lastDate || i.date,
          name: i.name || i.merchant || i.category || 'Income',
          category: cat,
          type: 'income',
          account_id: resolvedAccId,
          account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
        });
        agg.transactionIds.forEach(id => consumedTransactionIds.add(id));
      }
    });
    const baseIncs = Array.from(incomeMap.values());

    const missingIncs = rawTransactions.filter(m => {
      return matchRule(m, activeRules.income) && !consumedTransactionIds.has(m.id);
    }).map(t => {
      const resolvedAccId = resolveAccountId(t);
      return { 
        ...t,
        name: t.merchant || t.name || t.category || 'Income Item',
        category: 'Income', 
        type: 'income',
        spendType: 'income',
        amount: Math.abs(Number(t.amount || 0)),
        monthly_target: 0,
        account_id: resolvedAccId,
        account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
      };
    });
    
    // 2. Process Expenses
    const expenseMap = new Map();
    (budgetData.expenses || []).forEach(e => {
      const agg = aggregateByCategory(e.category || e.name || 'Expense', 'expense');
      const resolvedAccId = resolveAccountId(e);
      const cat = resolveCanonicalCategory(e.category || e.name || 'Expense');
      const target = Number(e.monthly_target || e.amount || 0);
      
      const existing = expenseMap.get(cat);
      if (existing) {
        existing.amount = (Number(existing.amount) || 0) + agg.amount;
        existing.monthly_target = (Number(existing.monthly_target) || 0) + target;
        agg.transactionIds.forEach(id => consumedTransactionIds.add(id));
      } else {
        expenseMap.set(cat, { 
          ...e, 
          amount: agg.amount, // Set to ACTUAL from ledger
          monthly_target: target, // Preserve TARGET
          date: agg.lastDate || e.date,
          name: e.name || e.merchant || e.category || 'Expense',
          category: cat,
          type: 'expense',
          account_id: resolvedAccId,
          account: (accounts.find(a => String(a.id) === String(resolvedAccId))?.name) || 'Manual Vault'
        });
        agg.transactionIds.forEach(id => consumedTransactionIds.add(id));
      }
    });
    const baseExps = Array.from(expenseMap.values());

    const missingExps = rawTransactions.filter(m => {
      return matchRule(m, activeRules.expense) && !consumedTransactionIds.has(m.id);
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
  }, [classificationRules, matchRule]);
  /**
   * getDatabaseTable
   * Generic wrapper for table-based retrieval.
   */
  const getDatabaseTable = useCallback(async (tableName, options = {}) => {
    return base44.db.getTable(tableName, options);
  }, []);

  /**
   * getProductionLedger
   * Fetches the real historical ledger from the indexed 'transactions' table.
   */
  const getProductionLedger = useCallback(async (filter = {}) => {
    // Discovery: DB-level range queries fail for non-ISO string dates (e.g., 01/04/2026).
    // To ensure 100% parity with reports, we fetch the table and apply the polymorphic parser logic.
    const allData = await base44.db.getTable('transactions');
    
    if (!filter.month && !filter.startDate && !filter.endDate && !filter.accountId && !filter.category) {
      return allData || [];
    }

    // Apply the same robust logic as normalizeTransactionData
    return (allData || []).filter(t => {
      const rawDate = t.date || t.actualDate;
      if (!rawDate) return false;

      // accountId filter
      if (filter.accountId && String(t.account_id) !== String(filter.accountId)) return false;
      // category filter
      if (filter.category && t.category !== filter.category) return false;

      // Month/Range Filtering
      if (filter.month) {
        const [targetYear, targetMonth] = filter.month.split('-').map(Number);
        return isSameMonthYear(rawDate, targetMonth, targetYear);
      }

      // Strict Range Filtering (if provided)
      if (filter.startDate || filter.endDate) {
        const d = robustParseDate(rawDate);
        if (!d) return false;
        const txTime = d.getTime();
        if (filter.startDate && txTime < filter.startDate) return false;
        if (filter.endDate && txTime > filter.endDate) return false;
      }

      return true;
    });
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

  const getNormalizedLedger = useCallback((transactions = [], accounts = [], rules = null) => {
    const activeRules = rules || classificationRules;
    const incomes = [];
    const expenses = [];
    const transfers = [];
    const uncategorized = [];

    (transactions || []).forEach(t => {
      const rawAmt = Math.abs(Number(t.amount || 0));
      const category = resolveCanonicalCategory(t.category || t.name);

      if (matchRule(t, activeRules.income)) {
        incomes.push({ ...t, type: 'income', amount: rawAmt, category });
      } else if (matchRule(t, activeRules.expense)) {
        expenses.push({ ...t, type: 'expense', amount: rawAmt, category });
      } else if (['Transfer', 'Payment', 'Internal Transfer', 'Credit Card Payment'].includes(category)) {
        transfers.push({ ...t, type: 'transfer', amount: rawAmt, category });
      } else {
        uncategorized.push({ ...t, type: 'uncategorized', amount: rawAmt, category });
      }
    });

    return { incomes, expenses, transfers, uncategorized };
  }, [matchRule]);

  return {
    parseCurrency,
    formatAmount,
    formatCurrencyShort,
    formatDate,
    getMonthlyValue,
    calculateMetrics,
    syncData,
    updateVaultRegistry,
    normalizeTransactionData,
    getDatabaseTable,
    getProductionLedger,
    getNormalizedLedger,
    getClassificationRules,
    purgeProductionLedger,
    matchRule
  };
};


export default useFinancialParser;
