const fs = require('fs');
const path = require('path');

const USER_ID = '5178b5ca-b1cb-4baf-b307-aa3ae92941cb';
const START_DATE = new Date('2026-01-01');
const END_DATE = new Date('2026-04-19');

const CATEGORIES = [
  { name: 'Salary and Wages', merchant: 'Monthly Salary', type: 'income', spendType: 'income', frequency: 1, amountRange: [6000, 7000] },
  { name: 'Rent', merchant: 'Skyline Apartments', type: 'expense', spendType: 'fixed', frequency: 1, amountRange: [-2500, -2200] },
  { name: 'Utilities', merchant: ['City Power', 'Water Works', 'Fiber Internet'], type: 'expense', spendType: 'fixed', frequency: 3, amountRange: [-150, -80] },
  { name: 'Groceries', merchant: ['Woolworths', 'Coles', 'Whole Foods'], type: 'expense', spendType: 'variable', frequency: 6, amountRange: [-180, -40] },
  { name: 'Eating Out', merchant: ['Italian Bistro', 'Sushi Central', 'The Coffee Club'], type: 'expense', spendType: 'variable', frequency: 5, amountRange: [-60, -15] },
  { name: 'Entertainment', merchant: ['Cineplex', 'Spotify', 'Netflix', 'GameStop'], type: 'expense', spendType: 'variable', frequency: 3, amountRange: [-40, -12] },
  { name: 'Fuel / Gas', merchant: ['Shell', 'Caltex', '7-Eleven'], type: 'expense', spendType: 'variable', frequency: 4, amountRange: [-85, -45] },
  { name: 'Healthcare', merchant: ['City Pharmacy', 'General Clinic'], type: 'expense', spendType: 'variable', frequency: 1, amountRange: [-120, -30] },
  { name: 'Repay Credit Card', merchant: 'Credit Card Repayment', type: 'expense', spendType: 'fixed', frequency: 1, amountRange: [-500, -400] },
  { name: 'Repay Car Loan', merchant: 'Auto Finance Repayment', type: 'expense', spendType: 'fixed', frequency: 1, amountRange: [-450, -450] },
  { name: 'Health Insurance', merchant: 'Global Mutual Health', type: 'expense', spendType: 'fixed', frequency: 1, amountRange: [-180, -180] },
  { name: 'Dining & Social', merchant: ['Pub & Grill', 'Nightscape Bar', 'Gala Event'], type: 'expense', spendType: 'variable', frequency: 4, amountRange: [-120, -40] },
];

function generateTransactions() {
  const transactions = [];
  const current = new Date(START_DATE);

  while (current <= END_DATE) {
    const month = current.getMonth();
    const year = current.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    CATEGORIES.forEach(cat => {
      const frequency = cat.frequency;
      
      for (let i = 0; i < frequency; i++) {
        let day;
        if (cat.name === 'Salary and Wages') {
          day = 15; // Set salary to 15th
        } else if (cat.spendType === 'fixed' && cat.name === 'Rent') {
          day = 1; // Rent on 1st
        } else {
          day = Math.floor(Math.random() * daysInMonth) + 1;
        }

        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Prevent generating future dates for the current month
        if (new Date(date) > END_DATE) continue;

        const merchant = Array.isArray(cat.merchant) 
          ? cat.merchant[Math.floor(Math.random() * cat.merchant.length)] 
          : cat.merchant;
        
        const amount = (Math.random() * (cat.amountRange[1] - cat.amountRange[0]) + cat.amountRange[0]).toFixed(2);

        transactions.push({
          user_id: USER_ID,
          date,
          merchant,
          amount,
          category: cat.name,
          type: cat.type,
          spend_type: cat.spendType
        });
      }
    });

    current.setMonth(current.getMonth() + 1);
  }

  return transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function writeSQL() {
  const transactions = generateTransactions();
  let sql = `-- Recreated WealthLens Ledger (Jan 2026 - April 19, 2026)\n`;
  sql += `-- Clear existing data\n`;
  sql += `DELETE FROM transactions;\n`;
  sql += `DELETE FROM budgets;\n\n`;
  
  // 1. Generate Budgets
  const months = ['2026-01', '2026-02', '2026-03', '2026-04'];
  sql += `INSERT INTO budgets (user_id, month, currency, payload) VALUES\n`;
  
  const budgetChunks = months.map(m => {
    const incomes = CATEGORIES.filter(c => c.type === 'income').map(c => ({
      id: c.name.toLowerCase().replace(/\s+/g, '_'),
      category: c.name,
      monthly_target: c.amountRange[0], // Use lower bound as target
      budget: `$0 earned`, // Dashboard will calculate actuals
      type: 'income'
    }));

    const expenses = CATEGORIES.filter(c => c.type === 'expense').map(c => ({
      id: c.name.toLowerCase().replace(/\s+/g, '_'),
      category: c.name,
      monthly_target: Math.abs(c.amountRange[0] * c.frequency), // Total target for month
      budget: `$0 spent`,
      type: 'expense'
    }));

    const payload = JSON.stringify({ incomes, expenses });
    return `('${USER_ID}', '${m}', 'USD', '${payload.replace(/'/g, "''")}')`;
  });

  sql += budgetChunks.join(',\n') + ';\n\n';

  // 2. Generate Transactions
  sql += `INSERT INTO transactions (user_id, date, merchant, amount, category, type, spend_type) VALUES\n`;
  
  const chunks = transactions.map(t => 
    `('${t.user_id}', '${t.date}', '${t.merchant.replace(/'/g, "''")}', ${t.amount}, '${t.category}', '${t.type}', '${t.spend_type}')`
  );

  sql += chunks.join(',\n') + ';\n';

  fs.writeFileSync(path.join(__dirname, 'recreated_ledger.sql'), sql);
  
  // Also copy to the parent scratch directory for the user
  const parentPath = path.join(__dirname, '../../scratch/recreated_ledger.sql');
  try {
    fs.writeFileSync(parentPath, sql);
  } catch(e) {}

  console.log(`Successfully generated ${transactions.length} transactions and ${months.length} budgets.`);
}

writeSQL();
