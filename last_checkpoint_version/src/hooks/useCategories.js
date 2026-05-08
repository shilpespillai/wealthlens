import { useState, useEffect, useCallback } from 'react';
import { CORE_CATEGORY_REGISTRY, resolveCanonicalCategory } from '@/utils/constants';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useCategories
 * Centralized hook for managing a flat, global category list.
 * Ensures consistency across Transactions, SetBudget, and Reports.
 */
export const useCategories = (monthKey = null, options = {}) => {
  const { global = false } = options;
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async (forcedMonth = null) => {
    try {
      setIsLoading(true);
      const targetMonth = forcedMonth || monthKey;
      console.log(`[useCategories] Fetching catalog (${global ? 'Global' : 'Registry + ' + (targetMonth ? targetMonth : 'Latest') + ' Budget'})...`);
      
      // 1. Fetch from the dedicated categories registry
      // If global, we fetch all categories from the DB (the central repository)
      const dbCategories = await base44.db.getTable('categories', global ? {} : { month: targetMonth });
      
      // 2. Proactively pull categories from Budget Planner entries (ONLY if not in global mode)
      // In global mode, we rely on Rule 3 (budget categories are seeded to the registry table)
      let budgetCategories = [];
      if (!global) {
        const allBudgets = await base44.db.getTable('budgets');
        if (allBudgets && allBudgets.length > 0) {
          let selectedBudget;
          if (targetMonth) {
              selectedBudget = allBudgets.find(b => b.month === targetMonth);
          }
          
          if (!selectedBudget) {
              selectedBudget = allBudgets.sort((a, b) => b.month.localeCompare(a.month))[0];
          }

          const payload = selectedBudget?.payload || {};
          const sourceList = payload.visualData || [...(payload.incomes || []), ...(payload.expenses || [])];
          budgetCategories = sourceList.map(item => ({
            name: item.category || item.name,
            type: item.type === 'income' ? 'income' : 'expense',
            icon_id: item.iconId || item.icon_id || 'circle',
            color: item.color || 'slate'
          }));
        }
      }

      // 3. Merge and Deduplicate
      const unifiedMap = new Map();
      
      CORE_CATEGORY_REGISTRY.forEach(c => {
        unifiedMap.set((c.name || "").toLowerCase().trim(), {
          name: c.name,
          type: c.type,
          icon_id: c.iconId || 'circle',
          color: c.color || 'slate'
        });
      });
      
      dbCategories.forEach(c => unifiedMap.set((c.name || "").toLowerCase().trim(), c));
      budgetCategories.forEach(c => {
        const key = (c.name || "").toLowerCase().trim();
        if (key) unifiedMap.set(key, c);
      });

      const finalData = Array.from(unifiedMap.values());
      
      if (finalData.length > 0) {
        const sorted = finalData.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setCategories(sorted);
      } else {
        setCategories(CORE_CATEGORY_REGISTRY);
      }
    } catch (err) {
      console.error("[useCategories] Catalog fetch failure:", err);
      setCategories(CORE_CATEGORY_REGISTRY);
    } finally {
      setIsLoading(false);
    }
    return await base44.db.getTable('categories');
  }, [global, monthKey]);

  const addCategory = useCallback(async (name, type = 'expense') => {
    if (!name || name.trim() === '') return null;
    
    // Check for existing (case-insensitive) to prevent duplicates
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newCat = {
      name: name.trim(),
      type: type,
      icon_id: 'circle-slate', // Default neutral icon for flat list
      color: 'slate'           // Default neutral color
    };

    try {
      const result = await base44.db.upsertRow('categories', newCat, { month: monthKey });
      await fetchCategories(); // Refresh list
      return result;
    } catch (err) {
      console.error("[useCategories] Add failed:", err);
      toast.error(`Failed to add category: ${name}`);
      return null;
    }
  }, [categories, fetchCategories]);

  const seedCategories = useCallback(async (flatList) => {
    try {
      console.log(`[useCategories] Synchronization check initiated with ${flatList.length} registry items.`);
      // 1. Fetch current categories to check for existence
      const current = await base44.db.getTable('categories', { month: monthKey });
      console.log(`[useCategories] Current DB count: ${current?.length || 0}`);
      
      const existingNames = new Set((current || []).map(c => (c.name || "").toLowerCase().trim()));

      // 2. Filter to only new categories to minimize DB calls
      // Use alias-aware matching to prevent seeding if a variant already exists
      const newToSeed = flatList.filter(cat => {
        const canonicalName = (cat.name || "").toLowerCase().trim();
        if (existingNames.has(canonicalName)) return false;
        
        // Check if any alias of this registry item exists in DB
        const hasAliasMatch = cat.aliases?.some(alias => existingNames.has(alias.toLowerCase().trim()));
        return !hasAliasMatch;
      });

      console.log(`[useCategories] New categories identified for seeding: ${newToSeed.length}`);

      if (newToSeed.length === 0) {
        console.log("[useCategories] Synchronization complete: Registry already fully established.");
        return;
      }

      const payloads = newToSeed.map(cat => ({
        name: cat.category || cat.name,
        type: (cat.type === 'income' || cat.spendType === 'income') ? 'income' : 'expense',
        icon_id: cat.iconId || cat.icon_id || 'circle',
        color: cat.color || 'slate'
      }));
      
      console.log(`[useCategories] Executing atomic batch commit for ${payloads.length} registry items...`);
      await base44.db.upsertRows('categories', payloads, { month: monthKey });
      
      console.log("[useCategories] Batch committed. Refreshing catalog...");
      await fetchCategories();
      console.log(`[useCategories] Synchronization complete. Final catalog verified.`);
    } catch (err) {
      console.error("[useCategories] Critical synchronization failure:", err);
    }
  }, [fetchCategories]);

  const removeCategory = useCallback(async (name) => {
    if (!name) return;
    try {
      // Rule 1: Deletion only removes from the central repository (Registry)
      // This stops it from propagating to future months.
      console.log(`[useCategories] Removing '${name}' from Central Repository...`);
      
      // 1. Delete from the categories table (Registry)
      await base44.db.deleteByFilter('categories', 'name', name);

      await fetchCategories();
      toast.success(`'${name}' removed from Central Repository. (Future months only)`);
    } catch (err) {
      console.error("[useCategories] Registry removal failed:", err);
      toast.error(`Failed to remove category: ${name}`);
    }
  }, [fetchCategories]);

  useEffect(() => {
    let mounted = true;

    const runSeeding = async (currentCount) => {
      // Automatic baseline synchronization: Ensures the core registry exists 
      // but allows the budget planner to extend it dynamically.
      if (currentCount < 5) { // Only force seed if catalog is nearly empty
        await seedCategories(CORE_CATEGORY_REGISTRY);
        if (mounted) fetchCategories();
      }
    };
    
    fetchCategories().then((data) => {
      if (mounted) {
        const count = Array.isArray(data) ? data.length : 0;
        runSeeding(count);
      }
    });

    return () => { mounted = false; };
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    addCategory,
    removeCategory,
    seedCategories,
    resolveCategory: resolveCanonicalCategory,
    refresh: fetchCategories
  };
};

export default useCategories;
