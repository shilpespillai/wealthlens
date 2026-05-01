const fs = require('fs');
const path = require('path');
const { base44 } = require('../src/api/base44Client');

async function applySeed() {
  console.log("[ApplySeed] Loading recreated_ledger.sql...");
  const sqlPath = path.join(__dirname, 'recreated_ledger.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolon, but be careful not to split inside strings
  // A simple split by ;\n should work for our generated file structure
  const statements = sqlContent.split(/;\s*\n/).filter(s => s.trim().length > 0);

  console.log(`[ApplySeed] Found ${statements.length} logic blocks to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const rawStmt = statements[i].trim();
    if (!rawStmt) continue;

    const stmt = rawStmt + ';'; // Add semicolon back
    console.log(`[ApplySeed] Executing block ${i + 1}/${statements.length}...`);
    
    try {
      // Use execute for DELETE and INSERT
      const result = await base44.db.execute(stmt);
      console.log(`[ApplySeed] Result:`, result ? "Success" : "Failed");
    } catch (err) {
      console.error(`[ApplySeed] Error in block ${i + 1}:`, err.message);
    }
  }

  console.log("[ApplySeed] Synchronization Complete.");
}

applySeed();
