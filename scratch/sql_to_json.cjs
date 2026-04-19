const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'recreated_ledger.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Use regex to extract the VALUES part
const valuesMatch = sqlContent.match(/INSERT INTO transactions .* VALUES\n([\s\S]+?);/);
if (!valuesMatch) {
  console.error("Could not find VALUES in SQL");
  process.exit(1);
}

const rowsRaw = valuesMatch[1].trim();
const rows = rowsRaw.split(/,\n/).map(row => {
  // Extract values: ('user_id', 'date', 'merchant', amount, 'category', 'type', 'spend_type')
  const match = row.match(/\('([^']+)', '([^']+)', '([^']+)', ([\d.-]+), '([^']+)', '([^']+)', '([^']+)'\)/);
  if (match) {
    return {
      user_id: match[1],
      date: match[2],
      merchant: match[3],
      amount: parseFloat(match[4]),
      category: match[5],
      type: match[6],
      spend_type: match[7],
      id: `seed_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  return null;
}).filter(Boolean);

fs.writeFileSync(path.join(__dirname, 'recreated_ledger.json'), JSON.stringify(rows, null, 2));
console.log(`Converted ${rows.length} rows to JSON.`);
