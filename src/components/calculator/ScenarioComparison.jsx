import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getCurrencySymbol } from "./CurrencySelector";
import { ShieldAlert, Target, Rocket } from "lucide-react";

function formatCompact(value, symbol) {
  if (value >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value}`;
}

const scenarioMeta = {
  conservative: { label: "Conservative", icon: ShieldAlert, color: "#64748b", bg: "bg-slate-50" },
  moderate: { label: "Moderate", icon: Target, color: "#6366f1", bg: "bg-indigo-50" },
  aggressive: { label: "Aggressive", icon: Rocket, color: "#10b981", bg: "bg-emerald-50" },
};

export default function ScenarioComparison({ scenarios, currency }) {
  const sym = getCurrencySymbol(currency);

  const chartData = Object.entries(scenarios).map(([key, result]) => ({
    name: scenarioMeta[key].label,
    value: result.summary.finalValue,
    afterTax: result.summary.afterTax,
    color: scenarioMeta[key].color,
  }));

  return (
    <div className="space-y-6">
      {/* Scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(scenarios).map(([key, result], i) => {
          const meta = scenarioMeta[key];
          const Icon = meta.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${meta.bg} rounded-2xl p-5 border border-slate-100`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                  {meta.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mb-1">
                {formatCompact(result.summary.finalValue, sym)}
              </p>
              <p className="text-xs text-slate-500">
                After tax: {formatCompact(result.summary.afterTax, sym)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Return: {result.summary.totalReturnPercent}%
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompact(v, sym)} width={70} />
            <Tooltip
              formatter={(value) => formatCompact(value, sym)}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "13px" }}
            />
            <Bar dataKey="value" name="Portfolio Value" radius={[8, 8, 0, 0]} barSize={50}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}