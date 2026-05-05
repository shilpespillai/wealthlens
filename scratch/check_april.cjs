const { base44 } = require('./src/api/base44Client');
const { robustParseDate } = require('./src/utils/dateParser');

async function checkApril() {
  const txs = await base44.db.getTable('transactions');
  const april = txs.filter(t => {
    const d = robustParseDate(t.date || t.actualDate);
    return d && d.getFullYear() === 2026 && d.getMonth() === 3; // April
  });
  
  console.log("April Transactions Count:", april.length);
  april.slice(0, 20).forEach(t => {
    console.log(`[${t.date}] ${t.merchant || t.name} | Cat: ${t.category} | Acc: ${t.account} (${t.account_id}) | Amt: ${t.amount}`);
  });
}

checkApril();
