import { base44 } from '../src/api/base44Client.js';

async function checkSchema() {
  try {
    const data = await base44.db.query('transactions', { limit: 5 });
    console.log('Keys in transaction object:');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
      console.log('Sample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('No transactions found in DB.');
    }
  } catch (e) {
    console.error(e);
  }
}

checkSchema();
