import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Bitcoin, Home, Landmark, Coins, PieChart, Lock } from "lucide-react";

const ASSETS = [
  { icon: TrendingUp, label: "Stocks", desc: "US & global equities", color: "from-blue-500 to-cyan-500" },
  { icon: BarChart3, label: "ETFs", desc: "Index & sector funds", color: "from-indigo-500 to-blue-500" },
  { icon: Bitcoin, label: "Crypto", desc: "BTC, ETH & more", color: "from-orange-400 to-amber-500" },
  { icon: Home, label: "Property", desc: "Real estate analysis", color: "from-emerald-500 to-teal-500" },
  { icon: Landmark, label: "Bonds", desc: "Fixed income securities", color: "from-slate-500 to-gray-600" },
  { icon: Coins, label: "Gold", desc: "Precious metals", color: "from-yellow-400 to-amber-400" },
  { icon: PieChart, label: "Mutual Funds", desc: "Diversified fund portfolios", color: "from-green-500 to-emerald-600" },
  { icon: Lock, label: "Fixed Deposit", desc: "Guaranteed term returns", color: "from-violet-500 to-purple-600" },
];

export default function AssetShowcase() {
  return (
    <section className="bg-gray-50 py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">All Your Asset Classes, One Platform</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Model and compare every major investment type with professional-grade accuracy.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ASSETS.map((asset, i) => {
            const Icon = asset.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-md hover:border-indigo-200 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{asset.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{asset.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}