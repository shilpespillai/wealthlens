import { base44 } from './base44Client';
import { encryptPayload } from './crypto';

/**
 * WealthLens Migration Engine
 * Converts relational tables (transactions, accounts, categories, budgets)
 * into encrypted Unified Monthly Shards in the wealthlens_vault table.
 */
export async function startVaultMigration() {
  try {
    const user = await base44.auth.me();
    if (!user) {
      console.error("[Migration] User not authenticated.");
      return { success: false, error: "Auth required" };
    }

    console.log("[Migration] Starting Institutional Vault Migration...");

    // 1. Fetch all legacy relational data
    const [transactions, accounts, categories, budgets] = await Promise.all([
      base44.db.getTable('transactions') || [],
      base44.db.getTable('user_accounts') || [],
      base44.db.getTable('user_categories') || [],
      base44.db.getTable('budgets') || []
    ]);

    console.log(`[Migration] Found ${transactions.length} transactions and ${accounts.length} accounts.`);

    // 2. Group transactions and state by month
    const shards = {};
    
    // We create a shard for every month that has transactions
    transactions.forEach(tx => {
      const dateStr = tx.date || tx.actualDate;
      if (!dateStr) return;
      
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!shards[monthKey]) {
        shards[monthKey] = {
          transactions: [],
          accounts: [...accounts],
          categories: [...categories],
          budget: null,
          metadata: {
            month: monthKey,
            migrated_at: new Date().toISOString(),
            version: "1.0"
          }
        };
      }
      shards[monthKey].transactions.push(tx);
    });

    // Attach budget payloads to the relevant shards
    budgets.forEach(b => {
      if (shards[b.month]) {
        shards[b.month].budget = b.payload;
      }
    });

    // 3. Encrypt and Upload shards to the new table
    const shardKeys = Object.keys(shards);
    console.log(`[Migration] Prepared ${shardKeys.length} monthly shards. Encrypting...`);

    for (const monthKey of shardKeys) {
      const bundle = shards[monthKey];
      
      // Encrypt the entire bundle (Zero-Knowledge)
      const encryptedPayload = await encryptPayload(bundle, user.id);
      
      if (encryptedPayload) {
        await base44.db.upsertRow('wealthlens_vault', {
          shard_key: monthKey,
          payload: encryptedPayload
        });
        console.log(`[Migration] ✓ Shard ${monthKey} uploaded.`);
      } else {
        console.error(`[Migration] ✗ Failed to encrypt shard ${monthKey}`);
      }
    }

    console.log("[Migration] SUCCESS: All data migrated to the Secure Vault.");
    return { success: true, count: shardKeys.length };
  } catch (err) {
    console.error("[Migration] FATAL ERROR:", err);
    return { success: false, error: err.message };
  }
}
