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
  income: { logic: 'OR', groups: [{ id: 'legacy-inc', logic: 'AND', conditions: [{ field: 'category', operator: 'equals', value: 'Income' }] }] },
  expense: { logic: 'OR', groups: [] },
  transfer: { logic: 'OR', groups: [] }
};

export const useFinancialParser = () => {
  const [classificationRules, setClassificationRules] = useState(DEFAULT_CLASSIFICATION_RULES);
  const [rulesLoaded, setRulesLoaded] = useState(false);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const rules = await base44.user.loadData('wl_classification_rules');
        if (rules) {
          // Merge with defaults to ensure new buckets (like 'transfer') exist
          setClassificationRules(prev => ({
            ...DEFAULT_CLASSIFICATION_RULES,
            ...rules
          }));
        }
      } catch (err) {
        console.error("Failed to load classification rules:", err);
      } finally {
        setRulesLoaded(true);
      }
    };
    loadRules();

    // Re-load rules whenever DataMaintenance saves new ones (same-tab broadcast)
    const handleRulesUpdated = (e) => {
      // Prevent infinite loop if this update came from our own maintenance screen
      if (e.detail?.source === 'DataMaintenance') return;
      
      console.log(`[Parser] Rules updated at ${e.detail?.timestamp || 'unknown'}. Refreshing engine...`);
      loadRules();
    };
    window.addEventListener('wl_rules_updated', handleRulesUpdated);
    return () => window.removeEventListener('wl_rules_updated', handleRulesUpdated);
  }, []);

  const matchRule = useCallback((tx, rule) => {
    if (!rule) return false;
    
    // Support both new Group structure and legacy flat structures
    const groupsToEval = rule.groups || (rule.conditions ? [{ logic: 'AND', conditions: rule.conditions }] : []);
    
    // CRITICAL: If there are zero groups/conditions, it's NOT a match.
    if (groupsToEval.length === 0) return false;
    
    const groupResults = groupsToEval.map(group => {
      // CRITICAL: An empty group MUST NOT match anything. 
      if (!group.conditions || group.conditions.length === 0) return false;
      
      const condResults = group.conditions.map(c => {
        const field = c.field;
        const operator = c.operator;
        const target = String(c.value || "").toLowerCase().trim();
        
        if (!target && operator !== 'not_equals') return false;
        
        let txVal = '';
        let matched = false;

        if (field === 'category') {
          txVal = resolveCanonicalCategory(tx.category || tx.merchant || tx.name || '');
        }
        else if (field === 'merchant') {
          txVal = String(tx.merchant || tx.name || "");
        }
        else if (field === 'account') {
          const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, '');
          const currentAccName = clean(tx.account);
          const currentAccId = clean(tx.account_id);
          const cleanTarget = clean(target);
          
          if (operator === 'equals' || operator === 'contains') {
            matched = currentAccName.includes(cleanTarget) || currentAccId.includes(cleanTarget) || cleanTarget.includes(currentAccName);
          } else if (operator === 'not_equals') {
            matched = !currentAccName.includes(cleanTarget) && !currentAccId.includes(cleanTarget);
          }
        }
        else {
          const val = String(txVal || "").toLowerCase().trim();
          switch (operator) {
            case 'equals': matched = val === target; break;
            case 'not_equals': matched = val !== target; break;
            case 'contains': matched = val.includes(target); break;
            case 'greater_than': matched = (Number(tx.amount) || 0) > Number(c.value); break;
            case 'less_than': matched = (Number(tx.amount) || 0) < Number(c.value); break;
          }
        }

        return matched;
      });

      return group.logic === 'AND' ? condResults.every(r => r === true) : condResults.some(r => r === true);
    });

    // FINAL GUARD: If we have zero results, it's false.
    if (groupResults.length === 0) return false;
    return rule.logic === 'AND' ? groupResults.every(r => r === true) : groupResults.some(r => r === true);
  }, []);

  const getClassificationRules = useCallback(async () => {
    let rules = await base44.user.loadData('wl_classification_rules');
    
    // Auto-migrate legacy rules to groups schema
    if (rules) {
      let migrated = false;
      if (rules.income && rules.income.conditions && !rules.income.groups) {
        rules.income.groups = [{ id: 'legacy-inc', logic: 'AND', conditions: rules.income.conditions }];
        delete rules.income.conditions;
        migrated = true;
      }
      if (rules.expense && rules.expense.conditions && !rules.expense.groups) {
        rules.expense.groups = [{ id: 'legacy-exp', logic: 'AND', conditions: rules.expense.conditions }];
        delete rules.expense.conditions;
        migrated = true;
      }
      if (migrated) {
        await base44.user.saveData('wl_classification_rules', rules);
      }
    }

    return { ...DEFAULT_CLASSIFICATION_RULES, ...(rules || {}) };
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

    // 1. Pre-classify everything using the Master Rule Engine
    const { 
      incomes: classifiedIncomes, 
      expenses: classifiedExpenses,
      transfers: classifiedTransfers,
      uncategorized: classifiedUncategorized 
    } = getNormalizedLedger(rawTransactions, accounts, classificationRules);

    // Aggregation Helper
    const aggregateByCategory = (categoryName, type) => {
      const canonicalTarget = resolveCanonicalCategory(categoryName);
      const targetPool = type === 'income' ? classifiedIncomes : classifiedExpenses;
      
      const filtered = targetPool.filter(t => {
        const transactionCategory = resolveCanonicalCategory(t.category || t.merchant || t.name);
        return transactionCategory.toLowerCase() === canonicalTarget.toLowerCase();
      });
      
      return {
        amount: Math.abs(filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)),
        count: filtered.length,
        lastDate: filtered.length > 0 ? filtered[0].date : null,
        transactionIds: new Set(filtered.map(t => t.id))
      };
    };

    const { incomes: classifiedIncs, expenses: classifiedExps, uncategorized: classifiedUncats } = getNormalizedLedger(rawTransactions, accounts);

    // 1. Process Incomes
    const incomeMap = new Map();
    (budgetData.incomes || []).forEach(i => {
      const cat = resolveCanonicalCategory(i.category || i.name || 'Income');
      incomeMap.set(cat, {
        ...i,
        amount: 0,
        monthly_target: Number(i.monthly_target || i.amount || 0),
        type: 'income',
        category: cat,
        transactionIds: []
      });
    });

    classifiedIncs.forEach(tx => {
      const cat = resolveCanonicalCategory(tx.category || 'Uncategorized Income');
      const existing = incomeMap.get(cat);
      if (existing) {
        existing.amount += tx.amount;
        existing.transactionIds = [...(existing.transactionIds || []), tx.id];
      } else {
        incomeMap.set(cat, {
          id: `unmatched-inc-${cat}`,
          name: tx.merchant || tx.name || cat,
          category: cat,
          amount: tx.amount,
          monthly_target: 0,
          type: 'income',
          transactionIds: [tx.id]
        });
      }
    });

    // 2. Process Expenses
    const expenseMap = new Map();
    (budgetData.expenses || []).forEach(e => {
      const cat = resolveCanonicalCategory(e.category || e.name || 'Expense');
      expenseMap.set(cat, {
        ...e,
        amount: 0,
        monthly_target: Number(e.monthly_target || e.amount || 0),
        type: 'expense',
        category: cat,
        transactionIds: []
      });
    });

    classifiedExps.forEach(tx => {
      const cat = resolveCanonicalCategory(tx.category || 'Uncategorized Expense');
      const existing = expenseMap.get(cat);
      if (existing) {
        existing.amount += tx.amount;
        existing.transactionIds = [...(existing.transactionIds || []), tx.id];
      } else {
        expenseMap.set(cat, {
          id: `unmatched-exp-${cat}`,
          name: tx.merchant || tx.name || cat,
          category: cat,
          amount: tx.amount,
          monthly_target: 0,
          type: 'expense',
          transactionIds: [tx.id]
        });
      }
    });

    return {
      incomes: Array.from(incomeMap.values()),
      expenses: Array.from(expenseMap.values())
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
      const amount = Number(t.amount || 0);
      const rawAmt = Math.abs(amount);
      const category = resolveCanonicalCategory(t.category || t.name);
      
      const acc = accounts.find(a => String(a.id) === String(t.account_id));
      const txWithAcc = { ...t, account: acc?.name || t.account || 'Manual Vault' };

      // PRIORITY SHARDING: 1. Manual Overrides -> 2. Transfer Rules -> 3. Expense/Income Rules
      if (t.type && t.type !== 'uncategorized' && t.type !== 'null') {
        if (t.type === 'income') incomes.push({ ...txWithAcc, amount: rawAmt });
        else if (t.type === 'expense') expenses.push({ ...txWithAcc, amount: rawAmt });
        else if (t.type === 'transfer') transfers.push({ ...txWithAcc, amount: rawAmt, category: 'Transfer' });
      }
      else if (matchRule(txWithAcc, activeRules.transfer)) {
        transfers.push({ ...t, type: 'transfer', amount: rawAmt, category: 'Transfer' });
      } 
      else if (matchRule(txWithAcc, activeRules.expense)) {
        expenses.push({ ...txWithAcc, type: 'expense', amount: rawAmt, category });
      } 
      else if (matchRule(txWithAcc, activeRules.income)) {
        incomes.push({ ...txWithAcc, type: 'income', amount: rawAmt, category });
      } 
      else {
        uncategorized.push({ ...t, type: 'uncategorized', amount: rawAmt, category: category || 'Uncategorized' });
      }
    });

    return { incomes, expenses, transfers, uncategorized };
  }, [matchRule, classificationRules]);

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
    matchRule,
    rulesLoaded
  };
};

export default useFinancialParser;
