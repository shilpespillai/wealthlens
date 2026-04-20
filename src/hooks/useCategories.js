import { useState, useEffect, useCallback } from 'react';
import { INITIAL_CATEGORIES } from '@/utils/constants';
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
      const data = await base44.db.getTable('categories');
      
      if (data && data.length > 0) {
        // Sort alphabetically for a high-density, professional UI feel
        const sorted = data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setCategories(sorted);
      } else {
        // Fallback to constants if DB table is empty or 404
        setCategories(INITIAL_CATEGORIES);
      }
    } catch (err) {
      console.warn("[useCategories] Fetch failed, using local fallbacks:", err);
      setCategories(INITIAL_CATEGORIES);
    } finally {
      setIsLoading(false);
    }
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
      // 1. Fetch current categories to check for existence
      const current = await base44.db.getTable('categories');
      const existingNames = new Set((current || []).map(c => c.name.toLowerCase()));

      // 2. Filter to only new categories to minimize DB calls
      const newToSeed = flatList.filter(cat => !existingNames.has((cat.category || cat.name || "").toLowerCase()));

      if (newToSeed.length === 0) return;

      const promises = newToSeed.map(cat => {
        return base44.db.upsertRow('categories', {
          name: cat.category || cat.name,
          type: (cat.type === 'income' || cat.spendType === 'income') ? 'income' : 'expense',
          icon_id: cat.iconId || cat.icon_id || 'circle',
          color: cat.color || 'slate'
        });
      });
      
      await Promise.all(promises);
      await fetchCategories();
      console.log(`[useCategories] Synchronization complete. Added ${newToSeed.length} missing categories.`);
    } catch (err) {
      console.error("[useCategories] Seeding failed:", err);
    }
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    addCategory,
    seedCategories,
    refresh: fetchCategories
  };
};

export default useCategories;
