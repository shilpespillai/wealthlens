/**
 * WealthLens Core Constants
 * Centralized source of truth for categories and system defaults.
 */

export const INITIAL_CATEGORIES = [
  { name: "Income", type: "income", iconId: "trending-up", color: "emerald" },
  { name: "Housing", type: "expense", iconId: "home", color: "indigo" },
  { name: "Utilities", type: "expense", iconId: "zap", color: "sky" },
  { name: "Financial", type: "expense", iconId: "banknote", color: "slate" },
  { name: "Groceries", type: "expense", iconId: "shopping-cart", color: "orange" },
  { name: "Dining & Food", type: "expense", iconId: "utensils", color: "amber" },
  { name: "Fuel & Transport", type: "expense", iconId: "fuel", color: "purple" },
  { name: "Healthcare", type: "expense", iconId: "activity", color: "yellow" },
  { name: "Lifestyle", type: "expense", iconId: "heart", color: "rose" },
  { name: "Insurance", type: "expense", iconId: "shield", color: "blue" },
  { name: "Education", type: "expense", iconId: "graduation-cap", color: "violet" },
  { name: "Travel", type: "expense", iconId: "plane", color: "cyan" },
  { name: "Shopping", type: "expense", iconId: "shopping-bag", color: "pink" },
  { name: "Gifts & Donations", type: "expense", iconId: "gift", color: "red" },
  { name: "Maintenance", type: "expense", iconId: "wrench", color: "grey" },
  { name: "Uncategorized", type: "expense", iconId: "circle", color: "slate" }
];

export const MOCK_USER_ID = "5178b5ca-b1cb-4baf-b307-aa3ae92941cb"; // Active Google Session
