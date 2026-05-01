
import { base44 } from "../src/api/base44Client.js";

async function cleanGhostRecords() {
  try {
    console.log("--- Starting Budget Cleanup ---");
    const allBudgets = await base44.db.getTable("budgets");
    console.log(`Found ${allBudgets.length} total budget records.`);

    // Group by month
    const monthGroups = {};
    allBudgets.forEach(b => {
      if (!monthGroups[b.month]) monthGroups[b.month] = [];
      monthGroups[b.month].push(b);
    });

    for (const month in monthGroups) {
      const records = monthGroups[month];
      if (records.length > 1) {
        console.log(`\nMonth [${month}] has ${records.length} records. Cleaning...`);
        
        // Sort by updated_at descending
        records.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
        
        // Keep the first one (latest), delete the rest
        const toKeep = records[0];
        const toDelete = records.slice(1);
        
        console.log(`KEEPING: ID ${toKeep.id} (Updated: ${toKeep.updated_at})`);
        
        for (const ghost of toDelete) {
          console.log(`DELETING Ghost: ID ${ghost.id} (Updated: ${ghost.updated_at})`);
          await base44.db.deleteRow("budgets", ghost.id);
        }
      }
    }
    
    console.log("\n--- Cleanup Complete ---");
  } catch (err) {
    console.error("Cleanup failed:", err);
  }
}

cleanGhostRecords();
