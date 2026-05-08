const { base44 } = require('./src/api/base44Client');

async function debug() {
  try {
    const tx = await base44.db.query('transactions', {
      filters: [
        { column: 'date', op: 'gte', value: '2026-04-01' },
        { column: 'date', op: 'lte', value: '2026-04-30' }
      ]
    });
    
    const groceries = tx.filter(t => (t.category || '').toLowerCase() === 'groceries');
    const totalGroceries = groceries.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    console.log("April Transactions Count:", tx.length);
    console.log("April Groceries Count:", groceries.length);
    console.log("April Groceries Total:", totalGroceries);
    
    const budgets = await base44.db.query('budgets', {
      filters: [{ column: 'month', op: 'eq', value: '2026-04' }]
    });
    
    console.log("April Budget Row:", JSON.stringify(budgets[0], null, 2));

  } catch (err) {
    console.error(err);
  }
}

debug();
