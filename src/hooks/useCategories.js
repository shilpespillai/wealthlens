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
      const data = await base44.db.getTable('user_categories');
      
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
      const result = await base44.db.upsertRow('user_categories', newCat);
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
      const promises = flatList.map(cat => {
        return base44.db.upsertRow('user_categories', {
          name: cat.category,
          type: cat.type === 'income' ? 'income' : 'expense',
          icon_id: cat.iconId || 'circle',
          color: cat.color || 'slate'
        });
      });
      await Promise.all(promises);
      await fetchCategories();
      console.log("[useCategories] Seeding complete.");
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
