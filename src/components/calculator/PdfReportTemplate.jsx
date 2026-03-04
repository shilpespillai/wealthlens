import React, { forwardRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getCurrencySymbol } from "./CurrencySelector";

const fmt = (n, sym = "$") => {
  const v = n || 0;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}K`;
  return `${sym}${v.toLocaleString()}`;
};

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const MetricCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: accent || "#1e1b4b",
    borderRadius: 12,
    padding: "18px 22px",
    flex: "1 1 0",
    minWidth: 130,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
  }}>
    <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#818cf8" }}>{sub}</div>}
  </div>
);

const PdfReportTemplate = forwardRef(function PdfReportTemplate({ params, results, instrument }, ref) {
  if (!results?.summary || !results?.yearlyData) return null;
  const sym = getCurrencySymbol(params.currency);
  const s = results.summary;
  const yearlyData = results.yearlyData;

  // Pie chart data
  const pieData = [
    { name: "Contributions", value: s.totalContributed || 0 },
    { name: "Returns", value: Math.max(0, s.totalReturns || 0) },
    { name: "Tax Paid", value: s.taxPaid || 0 },
  ];

  // Yearly chart data (sample every year)
  const chartData = yearlyData.map(d => ({
    year: `Y${d.year}`,
    Contributions: d.totalContributed,
    "Portfolio Value": d.nominalValue,
    "Real Value": d.realValue,
    "After-Tax": d.afterTax,
  }));

  // Milestone rows
  const milestones = [0.25, 0.5, 0.75, 1].map(pct => {
    const idx = Math.floor(pct * (yearlyData.length - 1));
    const d = yearlyData[idx];
    return { year: d?.year, value: d?.nominalValue, real: d?.realValue };
  });

  const instrName = {
    stocks: "Stocks", etf: "ETFs", bonds: "Bonds", crypto: "Crypto",
    gold: "Gold", mutual_funds: "Mutual Funds", fixed_deposit: "Fixed Deposit", property: "Property"
  }[instrument] || instrument;

  return (
    <div ref={ref} style={{
      width: 900,
      background: "#0f172a",
      fontFamily: "'Inter', system-ui, sans-serif",
      color: "#fff",
      padding: 48,
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)",
        borderRadius: 16,
        padding: "36px 40px",
        marginBottom: 36,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#c4b5fd", textTransform: "uppercase", marginBottom: 8 }}>
            Investment Analysis Report
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
            {instrName} Portfolio
          </div>
          <div style={{ fontSize: 14, color: "#c4b5fd" }}>
            {params.years}-Year Projection · {params.currency} · Generated {new Date().toLocaleDateString()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#c4b5fd", marginBottom: 4 }}>Projected Net Worth</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{fmt(s.finalValue, sym)}</div>
          <div style={{ fontSize: 13, color: "#a5b4fc" }}>+{s.totalReturnPercent}% total return</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: "flex", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
        <MetricCard label="Final Value" value={fmt(s.finalValue, sym)} sub={`After ${params.years} years`} accent="#1e1b4b" />
        <MetricCard label="After-Tax Value" value={fmt(s.afterTax, sym)} sub={`${params.taxRate}% tax rate`} accent="#14532d" />
        <MetricCard label="Real Value" value={fmt(s.realValue, sym)} sub={`Inflation adj. ${params.inflationRate}%`} accent="#1e3a5f" />
        <MetricCard label="Total Returns" value={fmt(s.totalReturns, sym)} sub={`${s.totalReturnPercent}% ROI`} accent="#3b1f6e" />
        <MetricCard label="Annual Return" value={`${(s.annualizedReturn || 0).toFixed(1)}%`} sub="Net of fees" accent="#1a1a3e" />
      </div>

      {/* Growth Chart */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>Portfolio Growth Over Time</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fill: "#94a3b8", fontSize: 10 }} width={70} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(v, name) => [fmt(v, sym), name]}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            <Area type="monotone" dataKey="Contributions" stroke="#8b5cf6" fill="url(#contribGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Real Value" stroke="#10b981" fill="url(#realGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Portfolio Value" stroke="#6366f1" fill="url(#portfolioGrad)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two column: Pie + Parameters */}
      <div style={{ display: "flex", gap: 24, marginBottom: 36 }}>
        {/* Pie Chart */}
        <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Wealth Breakdown</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <PieChart width={170} height={170}>
              <Pie data={pieData} cx={85} cy={85} innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i], flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{fmt(item.value, sym)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Investment Parameters</div>
          {[
            ["Asset Class", instrName],
            ["Initial Investment", `${sym}${(params.initialAmount || 0).toLocaleString()}`],
            ["Monthly Contribution", `${sym}${(params.monthlyContribution || 0).toLocaleString()}`],
            ["Time Horizon", `${params.years} years`],
            ["Expected Return", `${params.returnRate}% p.a.`],
            ["Inflation Rate", `${params.inflationRate}%`],
            ["Tax Rate", `${params.taxRate}%`],
            ["Annual Fees", `${params.fees}%`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #334155" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Yearly bar chart */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>Year-by-Year Contributions vs Returns</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 9 }} />
            <YAxis tickFormatter={v => fmt(v, sym)} tick={{ fill: "#94a3b8", fontSize: 9 }} width={70} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              formatter={(v, name) => [fmt(v, sym), name]}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            <Bar dataKey="Contributions" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="After-Tax" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: 28, marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 20 }}>Wealth Milestones</div>
        <div style={{ display: "flex", gap: 16 }}>
          {milestones.map((m, i) => (
            <div key={i} style={{
              flex: 1, background: "#0f172a", borderRadius: 12, padding: "18px 16px",
              borderLeft: `4px solid ${COLORS[i]}`, textAlign: "center"
            }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Year {m.year}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{fmt(m.value, sym)}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>{fmt(m.real, sym)} real</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: "#1c1a00",
        borderRadius: 12,
        padding: "16px 20px",
        border: "1px solid #713f12"
      }}>
        <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>⚠ Disclaimer</div>
        <div style={{ fontSize: 10, color: "#fde68a", lineHeight: 1.6 }}>
          This report provides estimates for educational purposes only. Actual returns will vary based on market conditions, timing, and other factors. Past performance does not guarantee future results. Always consult a qualified financial advisor before making investment decisions.
        </div>
      </div>
    </div>
  );
});

export default PdfReportTemplate;