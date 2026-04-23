import { useState, useEffect, useCallback } from 'react';
import { CORE_CATEGORY_REGISTRY, resolveCanonicalCategory } from '@/utils/constants';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

/**
 * useCategories
 * Centralized hook for managing a flat, global category list.
 * Ensures consistency across Transactions, SetBudget, and Reports.
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[useCategories] Fetching unified catalog (Registry + Latest Budget)...");
      
      // 1. Fetch from the dedicated categories registry
      const dbCategories = await base44.db.getTable('categories');
      
      // 2. Proactively pull categories from the latest Budget Planner entry 
      // to ensure Transactions matches 'Set Budget' exactly as requested.
      const allBudgets = await base44.db.getTable('budgets');
      let budgetCategories = [];
      
      if (allBudgets && allBudgets.length > 0) {
        // Find the absolute latest budget payload
        const latestBudget = allBudgets.sort((a, b) => b.month.localeCompare(a.month))[0];
        const payload = latestBudget.payload || {};
        
        // Extract flat categories from visualData or standard buckets
        const sourceList = payload.visualData || [...(payload.incomes || []), ...(payload.expenses || [])];
        budgetCategories = sourceList.map(item => ({
          name: item.category || item.name,
          type: item.type === 'income' ? 'income' : 'expense',
          icon_id: item.iconId || item.icon_id || 'circle',
          color: item.color || 'slate'
        }));
      }

      // 3. Merge and Deduplicate (Preferring Budget names and icons)
      const unifiedMap = new Map();
      
      // Load registry first
      dbCategories.forEach(c => unifiedMap.set((c.name || "").toLowerCase().trim(), c));
      
      // Overwrite/Extend with Budget items (the authoritative source)
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
  }, []);

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
      const result = await base44.db.upsertRow('categories', newCat);
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
      const current = await base44.db.getTable('categories');
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
      await base44.db.upsertRows('categories', payloads);
      
      console.log("[useCategories] Batch committed. Refreshing catalog...");
      await fetchCategories();
      console.log(`[useCategories] Synchronization complete. Final catalog verified.`);
    } catch (err) {
      console.error("[useCategories] Critical synchronization failure:", err);
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
    seedCategories,
    resolveCategory: resolveCanonicalCategory,
    refresh: fetchCategories
  };
};

export default useCategories;
