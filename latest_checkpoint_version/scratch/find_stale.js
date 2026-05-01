
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const envContent = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findStale() {
  console.log("Searching for potential stale transactions...");

  // Check total count first
  const { count: txCount, error: txError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });
  
  const { count: catCount, error: catError } = await supabase
    .from('user_categories')
    .select('*', { count: 'exact', head: true });

  if (txError) console.error("Error fetching tx count:", txError);
  else console.log("Total transactions:", txCount);

  if (catError) console.error("Error fetching cat count:", catError);
  else console.log("Total categories:", catCount);

  // STEP 1: Find duplicate amounts per user/type
  const { data, error } = await supabase
    .from('transactions')
    .select('user_id, type, amount, merchant, date, id');

  if (error) {
    console.error("Error fetching transactions:", error);
    return;
  }

  const groups = {};
  data.forEach(tx => {
    const key = `${tx.user_id}|${tx.type}|${tx.amount}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  const duplicates = Object.entries(groups)
    .filter(([key, list]) => list.length > 1)
    .map(([key, list]) => ({
      key,
      count: list.length,
      examples: list.slice(0, 3).map(l => ({ id: l.id, merchant: l.merchant, date: l.date })),
      ids: list.map(l => l.id)
    }));

  if (duplicates.length === 0) {
    console.log("No duplicate amounts found.");
  } else {
    console.log("Found suspicious duplicates:");
    duplicates.forEach(d => {
      console.log(`\nKey: ${d.key}`);
      console.log(`Count: ${d.count}`);
      console.log(`IDs: ${d.ids.join(', ')}`);
    });
  }
}

findStale();
