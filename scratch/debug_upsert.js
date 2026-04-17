import { base44 } from '../src/api/base44Client.js';

async function testUpsert() {
  const monthKey = '2026-04';
  const tableName = 'budgets';
  
  console.log('--- Step 1: Query existing budget ---');
  const results = await base44.db.query(tableName, {
    filters: [{ column: 'month', op: 'eq', value: monthKey }]
  });
  console.log('Results:', results);

  console.log('--- Step 2: Attempt upsert (should trigger onConflict) ---');
  try {
    const res = await base44.db.upsertRow(tableName, {
      month: monthKey,
      payload: { test: true, timestamp: Date.now() }
    });
    console.log('Upsert response:', res);
  } catch (err) {
    console.error('Upsert Error:', err);
  }
}

testUpsert();
