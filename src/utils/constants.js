/**
 * WealthLens Core Constants
 * Centralized source of truth for categories and system defaults.
 */

export const CORE_CATEGORY_REGISTRY = [
  { name: "Income", type: "income", iconId: "trending-up", color: "emerald", aliases: ["salary", "wages", "income", "payroll", "dividend", "interest", "monthly salary", "salary and wages", "rent income", "rental income", "investment income"] },
  { name: "Housing", type: "expense", iconId: "home", color: "indigo", aliases: ["rent", "mortgage", "housing", "accommodation"] },
  { name: "Utilities", type: "expense", iconId: "zap", color: "sky", aliases: ["bills", "electricity", "water", "utilities", "energy", "gas bill", "phone", "internet"] },
  { name: "Financial", type: "expense", iconId: "banknote", color: "slate", aliases: ["bank fees", "interest", "financial", "taxes", "superannuation"] },
  { name: "Groceries", type: "expense", iconId: "shopping-cart", color: "orange", aliases: ["food", "groceries", "supermarket", "woolworths", "coles", "aldi"] },
  { name: "Dining & Food", type: "expense", iconId: "utensils", color: "amber", aliases: ["dining", "restaurants", "dining & food", "eating out", "takeaway", "cafe"] },
  { name: "Fuel & Transport", type: "expense", iconId: "fuel", color: "purple", aliases: ["fuel", "gas", "petrol", "transport", "fuel & gas", "fuel & transport", "uber", "train", "bus", "parking"] },
  { name: "Healthcare", type: "expense", iconId: "activity", color: "yellow", aliases: ["medical", "health", "doctor", "pharmacy", "dentist"] },
  { name: "Lifestyle", type: "expense", iconId: "heart", color: "rose", aliases: ["fun", "entertainment", "lifestyle", "gym", "hobbies", "netflix", "spotify"] },
  { name: "Insurance", type: "expense", iconId: "shield", color: "blue", aliases: ["insurance", "health insurance", "car insurance", "home insurance"] },
  { name: "Education", type: "expense", iconId: "graduation-cap", color: "violet", aliases: ["school", "uni", "education", "books", "tuition", "course"] },
  { name: "Travel", type: "expense", iconId: "plane", color: "cyan", aliases: ["holiday", "travel", "flights", "hotel", "vacation"] },
  { name: "Shopping", type: "expense", iconId: "shopping-bag", color: "pink", aliases: ["shopping", "clothes", "amazon", "electronics", "gifts"] },
  { name: "Gifts & Donations", type: "expense", iconId: "gift", color: "red", aliases: ["charity", "gifts", "donations", "presents"] },
  { name: "Maintenance", type: "expense", iconId: "wrench", color: "grey", aliases: ["repairs", "maintenance", "service", "home improvement"] },
  { name: "Uncategorized", type: "expense", iconId: "circle", color: "slate", aliases: ["misc", "other", "uncategorized", "general"] }
];

/**
 * resolveCanonicalCategory
 * Global helper to safe-resolve any category variant to its canonical WealthLens system name.
 */
export const resolveCanonicalCategory = (inputName) => {
  if (!inputName) return "Uncategorized";
  const search = inputName.toLowerCase().trim();
  
  // 1. Direct Match
  const direct = CORE_CATEGORY_REGISTRY.find(c => c.name.toLowerCase() === search);
  if (direct) return direct.name;
  
  // 2. Alias Match
  const aliasMatch = CORE_CATEGORY_REGISTRY.find(c => 
    c.aliases && c.aliases.some(a => a.toLowerCase() === search)
  );
  if (aliasMatch) return aliasMatch.name;
  
  return "Uncategorized";
};

export const MOCK_USER_ID = "5178b5ca-b1cb-4baf-b307-aa3ae92941cb"; // Active Google Session
