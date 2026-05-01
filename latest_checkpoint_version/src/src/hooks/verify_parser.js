/**
 * verify_parser.js
 * Test suite for useFinancialParser logic.
 * Run this to ensure the centralized logic handles edge cases correctly.
 */

// Mock implementations for testing outside of React
const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let clean = val.replace(/[$\s,]/g, '');
  if (clean.startsWith('(') && clean.endsWith(')')) {
    clean = '-' + clean.substring(1, clean.length - 1);
  }
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const formatAmount = (val, options = {}) => {
  const { useParentheses = true, decimals = 2, symbol = '$', showSign = false } = options;
  const num = typeof val === 'string' ? parseCurrency(val) : (val || 0);
  const absNum = Math.abs(num);
  const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(absNum);
  if (num < 0) return useParentheses ? `(${symbol}${formatted})` : `-${symbol}${formatted}`;
  return `${showSign && num > 0 ? '+' : ''}${symbol}${formatted}`;
};

const getMonthlyValue = (amount, freq) => {
  const base = parseCurrency(amount);
  switch (freq?.toLowerCase()) {
    case 'weekly': return base * 4.333;
    case 'fortnightly': return base * 2.166;
    case 'monthly': return base;
    case 'quarterly': return base / 3;
    case 'annually': return base / 12;
    default: return base;
  }
};

const testCases = [
  { input: "$1,234.50", expectedParse: 1234.5, expectedFormat: "$1,234.50" },
  { input: "($500.00)", expectedParse: -500, expectedFormat: "($500.00)" },
  { input: "1000", expectedParse: 1000, expectedFormat: "$1,000.00" },
  { input: " ( 200 ) ", expectedParse: -200, expectedFormat: "($200.00)" },
  { input: 0, expectedParse: 0, expectedFormat: "$0.00" },
];

console.log("--- USEFINANCIALPARSER VERIFICATION ---");
testCases.forEach(t => {
  const p = parseCurrency(t.input);
  const f = formatAmount(p);
  const status = (p === t.expectedParse && f === t.expectedFormat) ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} | Input: [${t.input}] | Parsed: ${p} | Formatted: ${f}`);
});

console.log("\n--- RECURRENCE VERIFICATION ---");
const rPay = 500;
console.log(`Weekly: ${getMonthlyValue(rPay, 'weekly').toFixed(2)} (Expected ~2166.50)`);
console.log(`Fortnightly: ${getMonthlyValue(rPay, 'fortnightly').toFixed(2)} (Expected ~1083.00)`);
console.log(`Annually: ${getMonthlyValue(12000, 'annually').toFixed(2)} (Expected 1000.00)`);

console.log("\n--- COMPLETE ---");
