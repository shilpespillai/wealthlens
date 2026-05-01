import { base44 } from '../src/api/base44Client.js';

async function checkBudgetData() {
  const monthKey = '2026-04'; // or whatever month was used
  const results = await base44.db.query('budgets', {
    filters: [{ column: 'month', op: 'eq', value: monthKey }]
  });
  
  if (results && results.length > 0) {
    console.log('Budget payload:', JSON.stringify(results[0].payload, null, 2));
  } else {
    console.log('No budget found for', monthKey);
    // Check all budgets
    const all = await base44.db.query('budgets', {});
    console.log('All budgets count:', all.length);
    if (all.length > 0) {
      console.log('Sample budget payload:', JSON.stringify(all[0].payload, null, 2));
    }
  }
}

checkBudgetData();
