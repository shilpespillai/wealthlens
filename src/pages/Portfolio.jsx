import React, { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon, TrendingUp, DollarSign, Plus, Trash2, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ASSET_CLASSES = [
  { id: "stocks", label: "Stocks", color: "#6366f1" },
  { id: "etf", label: "ETF", color: "#8b5cf6" },
  { id: "property", label: "Property", color: "#10b981" },
  { id: "crypto", label: "Crypto", color: "#f59e0b" },
  { id: "bonds", label: "Bonds", color: "#3b82f6" },
  { id: "fixed_deposit", label: "Fixed Deposit", color: "#06b6d4" },
  { id: "mutual_funds", label: "Mutual Funds", color: "#ec4899" },
  { id: "gold", label: "Gold", color: "#d97706" },
];

const CURRENCIES = ["USD", "AUD", "EUR", "GBP", "JPY", "CAD", "SGD", "INR", "NZD"];

function PortfolioContent() {
  const [currency, setCurrency] = useState("AUD");
  const [holdings, setHoldings] = useState([
    { id: 1, asset: "stocks", currentValue: 50000, invested: 35000, label: "US Stocks" },
    { id: 2, asset: "property", currentValue: 450000, invested: 380000, label: "Investment Property" },
    { id: 3, asset: "etf", currentValue: 25000, invested: 20000, label: "Index ETF" },
  ]);
  const [nextId, setNextId] = useState(4);

  const sym = getCurrencySymbol(currency);

  const fmt = (n) => `${sym}${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

  const addHolding = () => {
    setHoldings([...holdings, { id: nextId, asset: "stocks", currentValue: 0, invested: 0, label: "" }]);
    setNextId(nextId + 1);
  };

  const removeHolding = (id) => setHoldings(holdings.filter((h) => h.id !== id));

  const updateHolding = (id, field, value) => {
    setHoldings(holdings.map((h) => h.id === id ? { ...h, [field]: value } : h));
  };

  const metrics = useMemo(() => {
    const totalValue = holdings.reduce((s, h) => s + Number(h.currentValue || 0), 0);
    const totalInvested = holdings.reduce((s, h) => s + Number(h.invested || 0), 0);
    const totalGain = totalValue - totalInvested;
    const totalReturnPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    // Pie chart data — group by asset class
    const grouped = {};
    holdings.forEach((h) => {
      if (!grouped[h.asset]) grouped[h.asset] = 0;
      grouped[h.asset] += Number(h.currentValue || 0);
    });
    const pieData = Object.entries(grouped).map(([asset, value]) => {
      const cls = ASSET_CLASSES.find((a) => a.id === asset);
      return { name: cls?.label || asset, value, color: cls?.color || "#888" };
    }).filter((d) => d.value > 0);

    // Bar chart data — per holding
    const barData = holdings
      .filter((h) => h.currentValue > 0 || h.invested > 0)
      .map((h) => {
        const cls = ASSET_CLASSES.find((a) => a.id === h.asset);
        return {
          name: h.label || cls?.label,
          invested: Number(h.invested || 0),
          value: Number(h.currentValue || 0),
          gain: Number(h.currentValue || 0) - Number(h.invested || 0),
        };
      });

    // Per-class summary
    const classSummary = ASSET_CLASSES.map((cls) => {
      const clsHoldings = holdings.filter((h) => h.asset === cls.id);
      const value = clsHoldings.reduce((s, h) => s + Number(h.currentValue || 0), 0);
      const invested = clsHoldings.reduce((s, h) => s + Number(h.invested || 0), 0);
      const gain = value - invested;
      const returnPct = invested > 0 ? (gain / invested) * 100 : 0;
      const allocation = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return { ...cls, value, invested, gain, returnPct, allocation, count: clsHoldings.length };
    }).filter((c) => c.value > 0 || c.invested > 0);

    return { totalValue, totalInvested, totalGain, totalReturnPct, pieData, barData, classSummary };
  }, [holdings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Calculator")} className="text-slate-500 hover:text-slate-700 text-sm">← Calculator</Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-black text-slate-900">Portfolio Dashboard</h1>
          </div>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-28 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Portfolio Value", value: fmt(metrics.totalValue), color: "from-indigo-500/10 to-violet-500/10", border: "border-indigo-300/30", text: "text-indigo-700" },
            { label: "Total Invested", value: fmt(metrics.totalInvested), color: "from-slate-100 to-slate-200/60", border: "border-slate-300/30", text: "text-slate-700" },
            { label: "Total Gain / Loss", value: fmt(metrics.totalGain), color: metrics.totalGain >= 0 ? "from-emerald-500/10 to-green-500/10" : "from-rose-500/10 to-red-500/10", border: metrics.totalGain >= 0 ? "border-emerald-300/30" : "border-rose-300/30", text: metrics.totalGain >= 0 ? "text-emerald-700" : "text-rose-700" },
            { label: "Overall Return", value: pct(metrics.totalReturnPct), color: "from-amber-500/10 to-orange-500/10", border: "border-amber-300/30", text: "text-amber-700" },
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 border ${card.border}`}>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">{card.label}</p>
              <p className={`text-2xl font-black ${card.text}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Allocation Pie */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-indigo-500" /> Asset Allocation
            </h3>
            {metrics.pieData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={metrics.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                      {metrics.pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2">
                  {metrics.pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-slate-600">{entry.name}</span>
                      <span className="text-xs font-bold text-slate-900 ml-1">
                        {metrics.totalValue > 0 ? pct((entry.value / metrics.totalValue) * 100) : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">Add holdings to see allocation</p>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" /> Invested vs Current Value
            </h3>
            {metrics.barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${sym}${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="invested" name="Invested" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" name="Current Value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">Add holdings to see chart</p>
            )}
          </div>
        </div>

        {/* Asset Class Summary */}
        {metrics.classSummary.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" /> Performance by Asset Class
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left pb-3 font-bold">Asset Class</th>
                    <th className="text-right pb-3 font-bold">Invested</th>
                    <th className="text-right pb-3 font-bold">Current Value</th>
                    <th className="text-right pb-3 font-bold">Gain / Loss</th>
                    <th className="text-right pb-3 font-bold">Return</th>
                    <th className="text-right pb-3 font-bold">Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {metrics.classSummary.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }} />
                          <span className="font-semibold text-slate-800">{cls.label}</span>
                          <span className="text-xs text-slate-400">({cls.count})</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-600">{fmt(cls.invested)}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{fmt(cls.value)}</td>
                      <td className={`py-3 text-right font-bold ${cls.gain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {cls.gain >= 0 ? "+" : ""}{fmt(cls.gain)}
                      </td>
                      <td className={`py-3 text-right font-bold ${cls.returnPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {cls.returnPct >= 0 ? "+" : ""}{pct(cls.returnPct)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${cls.allocation}%`, backgroundColor: cls.color }} />
                          </div>
                          <span className="text-slate-600 text-xs w-10 text-right">{pct(cls.allocation)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Holdings Editor */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500" /> My Holdings
            </h3>
            <Button onClick={addHolding} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Holding
            </Button>
          </div>

          <div className="space-y-3">
            {holdings.map((h) => {
              const gain = Number(h.currentValue || 0) - Number(h.invested || 0);
              const returnPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;
              return (
                <div key={h.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="col-span-12 sm:col-span-3">
                    <Input
                      placeholder="Label (e.g. US Stocks)"
                      value={h.label}
                      onChange={(e) => updateHolding(h.id, "label", e.target.value)}
                      className="h-9 text-sm bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Select value={h.asset} onValueChange={(v) => updateHolding(h.id, "asset", v)}>
                      <SelectTrigger className="h-9 text-sm bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_CLASSES.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input
                      type="number"
                      placeholder={`Invested (${sym})`}
                      value={h.invested || ""}
                      onChange={(e) => updateHolding(h.id, "invested", parseFloat(e.target.value) || 0)}
                      className="h-9 text-sm bg-white"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <Input
                      type="number"
                      placeholder={`Current Value (${sym})`}
                      value={h.currentValue || ""}
                      onChange={(e) => updateHolding(h.id, "currentValue", parseFloat(e.target.value) || 0)}
                      className="h-9 text-sm bg-white"
                    />
                  </div>
                  <div className="col-span-5 sm:col-span-2 text-right">
                    <span className={`text-sm font-bold ${gain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {gain >= 0 ? "+" : ""}{pct(returnPct)}
                    </span>
                    <p className={`text-xs ${gain >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {gain >= 0 ? "+" : ""}{fmt(gain)}
                    </p>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeHolding(h.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {holdings.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No holdings yet. Click "Add Holding" to get started.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <AuthGuard>
      <PortfolioContent />
    </AuthGuard>
  );
}