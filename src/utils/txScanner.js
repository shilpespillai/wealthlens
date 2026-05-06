import { base44, invokeUniversalAI } from '@/api/base44Client';

/**
 * Shared Transaction Scanner Engine
 * Handles deduplication, historical learning, and AI-driven categorization.
 */
export const enrichTransactions = async (newItems, existingLedger = [], accountId = null) => {
  console.log(`[Scanner Engine]: Processing ${newItems.length} items...`);
  
  // 1. Deduplication (Strict check)
  const enriched = newItems.map(item => {
    const isDuplicate = existingLedger.some(existing => 
      (accountId === null || String(existing.account_id) === String(accountId)) &&
      (existing.merchant || "").toLowerCase() === (item.name || item.merchant || "").toLowerCase() &&
      Math.abs(existing.amount) === Math.abs(item.amount) &&
      (existing.date === item.date)
    );
    return { ...item, isDuplicate, selected: !isDuplicate };
  });

  // 2. Historical Auto-Categorization & Neural Dictionary
  for (let item of enriched) {
    if (item.category && item.category !== "Uncategorized" && item.category !== "Other") continue;

    const merchant = (item.name || item.merchant || "").toLowerCase();
    
    // Look through historical transactions
    const match = existingLedger.find(t => 
      t.merchant && 
      (t.merchant.toLowerCase().includes(merchant) || merchant.includes(t.merchant.toLowerCase())) &&
      t.category && 
      t.category !== "Uncategorized"
    );

    if (match) {
      item.category = match.category;
    } else {
      // Fallback to hardcoded neural dictionary
      if (merchant.includes('woolworths') || merchant.includes('coles') || merchant.includes('aldi')) item.category = "Groceries";
      else if (merchant.includes('uber') || merchant.includes('transport') || merchant.includes('train') || merchant.includes('petrol')) item.category = "Fuel & Transport";
      else if (merchant.includes('netflix') || merchant.includes('spotify') || merchant.includes('cinema')) item.category = "Lifestyle";
      else if (merchant.includes('pharmacy') || merchant.includes('chemist') || merchant.includes('doctor')) item.category = "Healthcare";
      else if (merchant.includes('mcdonald') || merchant.includes('kfc') || merchant.includes('cafe') || merchant.includes('coffee') || merchant.includes('restaurant')) item.category = "Dining & Food";
      else if (merchant.includes('insurance') || merchant.includes('bupa') || merchant.includes('medibank')) item.category = "Insurance";
      else item.category = "Uncategorized";
    }
  }

  // 3. AI Batch Categorization (for remainders)
  const uncategorized = enriched.filter(i => i.category === "Uncategorized" && !i.isDuplicate);
  const uniqueMerchants = [...new Set(uncategorized.map(i => i.name || i.merchant))];

  if (uniqueMerchants.length > 0) {
    try {
      const prompt = `Map these merchants to one of the following canonical categories: Income, Housing, Utilities, Financial, Groceries, Dining & Food, Fuel & Transport, Healthcare, Lifestyle, Insurance, Education, Travel, Shopping, Gifts & Donations, Maintenance, Transfer, Reimbursement. 
      Respond ONLY with a JSON object: { "categories": { "Merchant": "Category" } }.
      Merchants: ${JSON.stringify(uniqueMerchants)}`;
      
      const aiResponse = await invokeUniversalAI(prompt);
      if (aiResponse && aiResponse.categories) {
        enriched.forEach(item => {
          const m = item.name || item.merchant;
          if (aiResponse.categories[m]) {
            item.category = aiResponse.categories[m];
          }
        });
      }
    } catch (err) {
      console.warn("[Scanner Engine]: AI batch classification skipped/failed:", err);
    }
  }

  return enriched;
};
