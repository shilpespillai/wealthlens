import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function formatCurrency(val) {
  if (val >= 1_000_000) return "$" + (val / 1_000_000).toFixed(2) + "M";
  if (val >= 1_000) return "$" + (val / 1_000).toFixed(1) + "K";
  return "$" + val.toFixed(0);
}

export default function HeroCalculator({ onGetStarted }) {
  const [initial, setInitial] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const rate = 0.10 / 12;
    let balance = initial;
    for (let i = 0; i < years * 12; i++) {
      balance = balance * (1 + rate) + monthly;
    }
    return balance;
  }, [initial, monthly, years]);

  const totalInvested = initial + monthly * years * 12;
  const gains = result - totalInvested;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 max-w-md mx-auto"
    >
      <h3 className="text-sm font-bold text-gray-700 mb-5 text-center">Quick Growth Preview</h3>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Initial Investment</span>
            <span className="font-bold text-gray-800">${initial.toLocaleString()}</span>
          </div>
          <input
            type="range" min={1000} max={100000} step={1000}
            value={initial} onChange={e => setInitial(+e.target.value)}
            className="w-full accent-indigo-600 h-2 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Monthly Contribution</span>
            <span className="font-bold text-gray-800">${monthly.toLocaleString()}/mo</span>
          </div>
          <input
            type="range" min={0} max={5000} step={100}
            value={monthly} onChange={e => setMonthly(+e.target.value)}
            className="w-full accent-indigo-600 h-2 rounded cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Time Horizon</span>
            <span className="font-bold text-gray-800">{years} years</span>
          </div>
          <input
            type="range" min={1} max={40} step={1}
            value={years} onChange={e => setYears(+e.target.value)}
            className="w-full accent-indigo-600 h-2 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 mb-5 text-center border border-indigo-100">
        <p className="text-xs text-gray-500 mb-1">Projected Portfolio Value</p>
        <p className="text-4xl font-black text-indigo-700">{formatCurrency(result)}</p>
        <p className="text-xs text-emerald-600 font-semibold mt-1">
          +{formatCurrency(gains)} in gains · 10% avg. annual return
        </p>
      </div>

      <button
        onClick={onGetStarted}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
      >
        <TrendingUp className="w-4 h-4" />
        Get Full Analysis — Free
      </button>
      <p className="text-center text-xs text-gray-400 mt-2">No credit card required</p>
    </motion.div>
  );
}