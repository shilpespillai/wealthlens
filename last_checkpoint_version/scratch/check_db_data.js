import { base44 } from './src/api/base44Client.js';

async function checkData() {
  try {
    const user = await base44.auth.me();
    if (!user) {
      console.log("No user found.");
      return;
    }
    console.log("User ID:", user.id);

    const accounts = await base44.db.getTable('accounts');
    console.log("Accounts Found:", accounts.length);
    console.log(JSON.stringify(accounts, null, 2));

    const transactions = await base44.db.getTable('transactions');
    console.log("Transactions Found:", transactions.length);
    if (transactions.length > 0) {
      console.log("First 5 transactions:");
      console.log(JSON.stringify(transactions.slice(0, 5), null, 2));
    }

    const budgets = await base44.db.getTable('budgets');
    console.log("Budgets Found:", budgets.length);
    console.log(JSON.stringify(budgets, null, 2));

  } catch (err) {
    console.error("Error checking data:", err);
  }
}

checkData();
