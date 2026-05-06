// Basiq API Adapter Simulator
// This file acts as the middle-layer connecting the frontend to the (mocked) Basiq backend.

// Real-world Basiq transactions typically look like this:
// { id: '...', postDate: '2025-01-01', amount: '12.50', description: 'Uber Eats', account: 'acc_123', class: 'expense' }

/**
 * Generates highly realistic mock transaction data mimicking Basiq's JSON response
 * based on the number of requested months.
 * 
 * @param {number} monthsToFetch - Number of months to fetch history for (1, 3, 6, 12)
 * @returns {Promise<Array>} Array of raw Basiq transaction objects
 */
export const fetchBasiqTransactions = async (monthsToFetch = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transactions = [];
      const currentDate = new Date();
      
      const MOCK_MERCHANTS = [
        { desc: "Uber Eats", class: "expense", range: [15, 65] },
        { desc: "Woolworths Supermarket", class: "expense", range: [40, 250] },
        { desc: "Netflix Subscription", class: "expense", range: [15, 25] },
        { desc: "Shell Service Station", class: "expense", range: [40, 100] },
        { desc: "Metropolis Rent", class: "expense", range: [1500, 2000] },
        { desc: "Tech Corp Salary", class: "income", range: [3500, 4500] },
        { desc: "Amazon Web Services", class: "expense", range: [20, 80] },
        { desc: "Local Coffee Roasters", class: "expense", range: [4, 12] },
      ];

      // Generate ~10-15 transactions per month requested
      for (let i = 0; i < monthsToFetch; i++) {
        const txCount = Math.floor(Math.random() * 6) + 10;
        
        for (let j = 0; j < txCount; j++) {
          const targetDate = new Date(currentDate);
          targetDate.setMonth(currentDate.getMonth() - i);
          targetDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28
          
          const merchant = MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)];
          let amount = (Math.random() * (merchant.range[1] - merchant.range[0]) + merchant.range[0]).toFixed(2);
          
          // Basiq usually represents expenses as negative, incomes as positive
          if (merchant.class === 'expense') {
            amount = `-${amount}`;
          }

          transactions.push({
            id: `bsq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postDate: targetDate.toISOString().split('T')[0], // YYYY-MM-DD
            amount: amount,
            description: merchant.desc,
            institution: 'AU_CBA', // Commonwealth Bank of Australia example
            class: merchant.class
          });
        }
      }

      resolve(transactions);
    }, 2000); // Simulate network latency
  });
};

/**
 * Normalizes raw Basiq JSON into WealthLens's expected schema.
 * 
 * @param {Array} basiqData - Array of transactions from fetchBasiqTransactions
 * @returns {Array} Normalized transaction array for handleBankSync
 */
export const normalizeBasiqToWealthLens = (basiqData) => {
  return basiqData.map(tx => {
    const rawAmount = parseFloat(tx.amount);
    
    // handleBankSync expects: name (merchant), amount (absolute), date, category
    return {
      name: tx.description,
      amount: Math.abs(rawAmount),
      date: tx.postDate, // keep YYYY-MM-DD format
      category: "Uncategorized", // Can be passed to AI classifier later
      type: rawAmount >= 0 ? 'income' : 'expense'
    };
  });
};
