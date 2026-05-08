
import { base44 } from "./src/api/base44Client.js";

async function checkData() {
  try {
    console.log("--- User Categories ---");
    const userCats = await base44.db.getTable("user_categories");
    console.log(JSON.stringify(userCats, null, 2));

    console.log("\n--- Budgets ---");
    const budgets = await base44.db.getTable("budgets");
    console.log(JSON.stringify(budgets, null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkData();
