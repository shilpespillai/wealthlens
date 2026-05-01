
import { base44 } from "../src/api/base44Client.js";

async function checkTransactions() {
  try {
    const txs = await base44.db.getTable("transactions");
    if (txs.length > 0) {
      console.log("--- Transaction Structure ---");
      console.log(JSON.stringify(txs[0], null, 2));
    } else {
      console.log("No transactions found.");
    }
  } catch (err) {
    console.error(err);
  }
}

checkTransactions();
