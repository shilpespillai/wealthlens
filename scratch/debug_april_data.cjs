const { base44 } = require('./src/api/base44Client');

async function debug() {
  try {
    const budgets = await base44.db.getTable('budgets');
    console.log("Registered Budgets (Months):", budgets.map(b => b.month).join(', '));
    
    const april = budgets.find(b => b.month === '2026-04');
    if (april) {
      console.log("April Budget VisualData Sample:", JSON.stringify(april.payload.visualData.slice(0, 3), null, 2));
    } else {
      console.log("NO BUDGET FOUND FOR 2026-04");
    }

    const tx = await base44.db.getTable('transactions');
    const groceries = tx.filter(t => (t.category || '').toLowerCase() === 'groceries' && (t.date || '').includes('2026-04'));
    console.log("April Groceries Tx Count:", groceries.length);
    console.log("April Groceries sample:", JSON.stringify(groceries.slice(0, 1), null, 2));

  } catch (err) {
    console.error(err);
  }
}

debug();
