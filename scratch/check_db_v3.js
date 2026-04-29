
import { base44 } from "../src/api/base44Client.js";

async function checkData() {
  try {
    const monthKey = "2026-04";
    console.log("--- User Categories ---");
    const userCats = await base44.db.getTable("user_categories");
    console.log(JSON.stringify(userCats, null, 2));

    console.log("\n--- Budgets for " + monthKey + " ---");
    const budgets = await base44.db.query("budgets", {
      filters: [{ column: 'month', op: 'eq', value: monthKey }]
    });
    console.log(JSON.stringify(budgets, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkData();
