/**
 * seedWealthLensData.js
 * 
 * Generates a production-grade synthetic dataset for the WealthLens platform.
 * Aligned with the relational PostgreSQL schema.
 */

const generateSeedData = () => {
  const accounts = [
    { name: 'Global Offset Account', type: 'asset', category: 'Bank', base_balance: 12540 },
    { name: 'High Interest Vault', type: 'asset', category: 'Savings', base_balance: 45000 },
    { name: 'Interactive Brokers', type: 'asset', category: 'Investments', base_balance: 15600 },
    { name: 'Platinum Rewards', type: 'debt', category: 'Credit Cards', base_balance: -2345 },
  ];

  const transactions = [];
  const startDate = new Date(2025, 10, 1); // Nov 1, 2025
  const endDate = new Date(2026, 3, 15);   // Apr 15, 2026
  
  let currentDate = new Date(startDate);
  let txId = 1;

  while (currentDate <= endDate) {
    const day = currentDate.getDate();
    const isoDate = currentDate.toISOString().split('T')[0];

    // 1. Semi-Monthly Salary (1st and 15th)
    if (day === 1 || day === 15) {
      transactions.push({
        date: isoDate,
        merchant: 'WealthCorp Salary',
        amount: 4500,
        category: 'Salary',
        type: 'income',
        spend_type: 'income',
        account: 'Global Offset Account'
      });
    }

    // 2. Rent (1st of month)
    if (day === 1) {
      transactions.push({
        date: isoDate,
        merchant: 'Strategic Realty',
        amount: -3200,
        category: 'Housing',
        type: 'expense',
        spend_type: 'fixed',
        account: 'Global Offset Account'
      });
    }

    // 3. Weekly Groceries (Sundays)
    if (currentDate.getDay() === 0) {
      transactions.push({
        date: isoDate,
        merchant: 'Whole Foods Market',
        amount: -(180 + Math.random() * 50),
        category: 'Groceries',
        type: 'expense',
        spend_type: 'variable',
        account: 'Platinum Rewards'
      });
    }

    // 4. Random Weekend Dining (Fri/Sat)
    if (currentDate.getDay() === 5 || currentDate.getDay() === 6) {
      if (Math.random() > 0.3) {
        transactions.push({
          date: isoDate,
          merchant: Math.random() > 0.5 ? 'The Gilded Spoon' : 'Metropolis Bistro',
          amount: -(60 + Math.random() * 80),
          category: 'Dining',
          type: 'expense',
          spend_type: 'variable',
          account: 'Platinum Rewards'
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Monthly Snapshots for Portfolio (Net Worth Growth)
  const portfolioHoldings = [
    // Nov Snapshot
    { label: 'Sydney Apartment', asset_class: 'property', current_value: 840000, invested_amount: 720000, snapshot_date: '2025-11-01' },
    { label: 'US Tech Basket', asset_class: 'stocks', current_value: 42000, invested_amount: 38000, snapshot_date: '2025-11-01' },
    { label: 'Bitcoin', asset_class: 'crypto', current_value: 12000, invested_amount: 8000, snapshot_date: '2025-11-01' },
    // Dec Snapshot
    { label: 'Sydney Apartment', asset_class: 'property', current_value: 845000, invested_amount: 720000, snapshot_date: '2025-12-01' },
    { label: 'US Tech Basket', asset_class: 'stocks', current_value: 44500, invested_amount: 39000, snapshot_date: '2025-12-01' },
    { label: 'Bitcoin', asset_class: 'crypto', current_value: 15000, invested_amount: 8000, snapshot_date: '2025-12-01' },
    // Jan Snapshot
    { label: 'Sydney Apartment', asset_class: 'property', current_value: 855000, invested_amount: 720000, snapshot_date: '2026-01-01' },
    { label: 'US Tech Basket', asset_class: 'stocks', current_value: 46000, invested_amount: 40000, snapshot_date: '2026-01-01' },
    { label: 'Bitcoin', asset_class: 'crypto', current_value: 14000, invested_amount: 9000, snapshot_date: '2026-01-01' },
  ];

  const budgets = [
    { month: '2025-12', visualData: [
        { id: "rent", category: "Rent", amount: "2200 / mo", budget: "$2200 spent", progress: 100 },
        { id: "groceries", category: "Groceries", amount: "800 / mo", budget: "$750 spent", progress: 93 }
    ]},
    { month: '2026-01', visualData: [
        { id: "rent", category: "Rent", amount: "2200 / mo", budget: "$2200 spent", progress: 100 },
        { id: "groceries", category: "Groceries", amount: "900 / mo", budget: "$420 spent", progress: 46 }
    ]}
  ];

  return {
    accounts,
    transactions,
    budgets,
    portfolioHoldings,
    timestamp: new Date().toISOString()
  };
};

export const wealthLensSeed = generateSeedData();
