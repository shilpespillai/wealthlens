import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const ROWS = [
  { feature: "Investment growth calculator", wealthlens: true, spreadsheet: "Manual", others: "Basic" },
  { feature: "AI investment coaching", wealthlens: true, spreadsheet: false, others: false },
  { feature: "AI portfolio builder", wealthlens: true, spreadsheet: false, others: false },
  { feature: "Real-time market data", wealthlens: true, spreadsheet: false, others: "Partial" },
  { feature: "Property vs ETF analysis", wealthlens: true, spreadsheet: false, others: false },
  { feature: "Tax optimisation strategies", wealthlens: true, spreadsheet: false, others: false },
  { feature: "Retirement planner", wealthlens: true, spreadsheet: false, others: "Basic" },
  { feature: "20+ currencies", wealthlens: true, spreadsheet: "Manual", others: "Partial" },
  { feature: "PDF export", wealthlens: true, spreadsheet: true, others: "Paid" },
  { feature: "One-time price", wealthlens: "$29", spreadsheet: "Free*", others: "$15/mo" },
];

function Cell({ val }) {
  if (val === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (val === false) return <X className="w-5 h-5 text-red-400 mx-auto" />;
  return <span className="text-xs text-gray-500 font-medium">{val}</span>;
}

export default function ComparisonTable() {
  return (
    <section className="bg-white py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Why WealthLens Wins</h2>
          <p className="text-gray-500 text-sm">See how we compare to spreadsheets and generic finance apps.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-4 font-bold text-gray-700 w-1/2">Feature</th>
                <th className="text-center px-4 py-4 font-black text-indigo-600 bg-indigo-50">WealthLens</th>
                <th className="text-center px-4 py-4 font-bold text-gray-500">Spreadsheet</th>
                <th className="text-center px-4 py-4 font-bold text-gray-500">Others</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-5 py-3 text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center bg-indigo-50/30"><Cell val={row.wealthlens} /></td>
                  <td className="px-4 py-3 text-center"><Cell val={row.spreadsheet} /></td>
                  <td className="px-4 py-3 text-center"><Cell val={row.others} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <p className="text-xs text-gray-400 mt-3 text-center">*Spreadsheets require manual setup, formulas, and ongoing maintenance.</p>
      </div>
    </section>
  );
}