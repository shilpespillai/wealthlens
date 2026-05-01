import { base44 } from '../src/api/base44Client.js';

async function dumpTransactions() {
  const month = '2026-01'; // or current month
  const start = `${month}-01`;
  const end = `${month}-31`;
  
  try {
    const data = await base44.db.query('transactions', {
      filters: [
        { column: 'date', op: 'gte', value: start },
        { column: 'date', op: 'lte', value: end }
      ]
    });
    
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

dumpTransactions();
