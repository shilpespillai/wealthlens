/**
 * WealthLens Core Constants
 * Centralized source of truth for categories and system defaults.
 */

export const INITIAL_CATEGORIES = [
  { name: "Salary and Wages", type: "income", iconId: "salary", color: "emerald" },
  { name: "Rent", type: "expense", iconId: "home", color: "indigo" },
  { name: "Utilities", type: "expense", iconId: "zap", color: "sky" },
  { name: "Groceries", type: "expense", iconId: "shopping", color: "orange" },
  { name: "Eating Out", type: "expense", iconId: "utensils", color: "amber" },
  { name: "Entertainment", type: "expense", iconId: "play", color: "emerald" },
  { name: "Fuel / Gas", type: "expense", iconId: "fuel", color: "purple" },
  { name: "Healthcare", type: "expense", iconId: "activity", color: "yellow" },
  { name: "Repay Credit Card", type: "expense", iconId: "credit-card", color: "rose" },
  { name: "Repay Car Loan", type: "expense", iconId: "car", color: "rose" },
  { name: "Health Insurance", type: "expense", iconId: "activity", color: "sky" },
  { name: "Dining & Social", type: "expense", iconId: "utensils", color: "amber" }
];

export const MOCK_USER_ID = "5178b5ca-b1cb-4baf-b307-aa3ae92941cb"; // Active Google Session
