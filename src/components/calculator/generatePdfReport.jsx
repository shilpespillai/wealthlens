import jsPDF from "jspdf";
import { getCurrencySymbol } from "./CurrencySelector";

const fmt = (n, sym = "$") => {
  const v = n || 0;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
  return `${sym}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

// ─── Color Palette (light theme) ─────────────────────────────────────────────
const INDIGO     = [99, 102, 241];
const VIOLET     = [139, 92, 246];
const EMERALD    = [16, 185, 129];
const AMBER      = [245, 158, 11];
const ROSE       = [239, 68, 68];
const SLATE_900  = [15, 23, 42];
const SLATE_700  = [51, 65, 85];
const SLATE_500  = [100, 116, 139];
const SLATE_200  = [226, 232, 240];
const SLATE_50   = [248, 250, 252];
const WHITE      = [255, 255, 255];
const BG         = [255, 255, 255]; // page background

export async function generatePdfReport({ params, results, instrument }) {
  const sym = getCurrencySymbol(params.currency);
  const s = results.summary;
  const yearlyData = results.yearlyData;

  const pdf = new jsPDF("p", "mm", "a4");
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const M = 16;
  const CW = PW - M * 2;

  const instrName = {
    stocks: "Stocks", etf: "ETFs", bonds: "Bonds", crypto: "Crypto",
    gold: "Gold", mutual_funds: "Mutual Funds", fixed_deposit: "Fixed Deposit", property: "Property"
  }[instrument] || instrument;

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const setFill   = (rgb) => pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setStroke = (rgb) => pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setFont   = (color, size, style = "normal") => {
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
  };

  const roundedRect = (x, y, w, h, r = 4, fillColor = WHITE, strokeColor = null) => {
    setFill(fillColor);
    if (strokeColor) {
      setStroke(strokeColor);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, y, w, h, r, r, "FD");
    } else {
      pdf.roundedRect(x, y, w, h, r, r, "F");
    }
  };

  const drawPageBg = () => {
    setFill(SLATE_50);
    pdf.rect(0, 0, PW, PH, "F");
  };

  const drawFooter = () => {
    setStroke(SLATE_200);
    pdf.setLineWidth(0.3);
    pdf.line(M, PH - 12, PW - M, PH - 12);
    setFont(SLATE_500, 7);
    pdf.text("WealthLens Investment Report  •  Confidential", M, PH - 6);
    pdf.text(new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }), PW - M, PH - 6, { align: "right" });
  };

  const newPage = () => {
    pdf.addPage();
    drawPageBg();
    drawFooter();
  };

  const sectionTitle = (title, y) => {
    setFont(SLATE_900, 11, "bold");
    pdf.text(title, M, y + 5);
    setFill(INDIGO);
    pdf.rect(M, y + 7, CW, 0.8, "F");
    return y + 14;
  };

  const metricCard = (x, y, w, label, value, sub, accentColor = INDIGO) => {
    const h = 24;
    roundedRect(x, y, w, h, 4, WHITE, SLATE_200);
    setFill(accentColor);
    pdf.roundedRect(x, y, w, 2, 1, 1, "F");
    setFont(SLATE_500, 6, "bold");
    pdf.text(label.toUpperCase(), x + 5, y + 8);
    setFont(SLATE_900, 10, "bold");
    pdf.text(value, x + 5, y + 16);
    if (sub) { setFont(SLATE_500, 6); pdf.text(sub, x + 5, y + 21); }
    return h;
  };

  const lineChart = (x, y, w, h, series) => {
    roundedRect(x, y, w, h, 4, WHITE, SLATE_200);
    const pad = { t: 8, r: 8, b: 14, l: 14 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    const ox = x + pad.l;
    const oy = y + pad.t;
    const allVals = series.flatMap(s => s.data.map(d => d.value));
    const max = Math.max(...allVals, 1);
    const pts = series[0].data.length;
    // Grid lines
    for (let g = 0; g <= 4; g++) {
      const gy = oy + ch - (g / 4) * ch;
      setStroke(SLATE_200);
      pdf.setLineWidth(0.2);
      pdf.line(ox, gy, ox + cw, gy);
      setFont(SLATE_500, 5);
      pdf.text(fmt(max * g / 4, ""), ox - 2, gy + 1, { align: "right" });
    }
    // Lines
    series.forEach((s) => {
      pdf.setDrawColor(s.color[0], s.color[1], s.color[2]);
      pdf.setLineWidth(0.8);
      for (let i = 1; i < s.data.length; i++) {
        const x1 = ox + ((i - 1) / (pts - 1)) * cw;
        const y1 = oy + ch - (s.data[i - 1].value / max) * ch;
        const x2 = ox + (i / (pts - 1)) * cw;
        const y2 = oy + ch - (s.data[i].value / max) * ch;
        pdf.line(x1, y1, x2, y2);
      }
    });
    // X labels
    const step = Math.ceil(pts / 7);
    setFont(SLATE_500, 5);
    series[0].data.forEach((d, i) => {
      if (i % step === 0 || i === pts - 1) {
        pdf.text(`Y${d.year}`, ox + (i / (pts - 1)) * cw, oy + ch + 6, { align: "center" });
      }
    });
  };

  const barChart = (x, y, w, h, data) => {
    roundedRect(x, y, w, h, 4, WHITE, SLATE_200);
    const pad = { t: 8, r: 8, b: 14, l: 14 };
    const cw = w - pad.l - pad.r;
    const ch = h - pad.t - pad.b;
    const ox = x + pad.l;
    const oy = y + pad.t;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const bw = (cw / data.length) * 0.65;
    const gap = cw / data.length;
    data.forEach((d, i) => {
      const bh = (d.value / maxVal) * ch;
      setFill(d.color || INDIGO);
      pdf.roundedRect(ox + i * gap + (gap - bw) / 2, oy + ch - bh, bw, bh, 2, 2, "F");
      setFont(SLATE_500, 5);
      pdf.text(d.label.length > 7 ? d.label.slice(0, 7) + "…" : d.label, ox + i * gap + gap / 2, oy + ch + 5, { align: "center" });
      setFont(SLATE_700, 5.5, "bold");
      pdf.text(fmt(d.value, ""), ox + i * gap + gap / 2, oy + ch - bh - 2, { align: "center" });
    });
  };

  const horizontalStackedBar = (x, y, w, segments, total) => {
    roundedRect(x, y, w, 8, 3, WHITE, SLATE_200);
    let bx = x;
    segments.forEach(seg => {
      const sw = total > 0 ? (seg.value / total) * w : 0;
      setFill(seg.color);
      pdf.rect(bx, y, sw, 8, "F");
      bx += sw;
    });
  };

  // ─── PAGE 1: Cover & Key Metrics ──────────────────────────────────────────
  drawPageBg();

  // Hero header
  roundedRect(M, M, CW, 52, 6, INDIGO);
  // subtle accent triangle
  setFill(VIOLET);
  pdf.triangle(PW - M - 60, M, PW - M, M, PW - M, M + 52, "F");

  setFont(WHITE, 7, "bold");
  pdf.text("WEALTHLENS  ·  INVESTMENT ANALYSIS REPORT", M + 8, M + 10);
  setFont(WHITE, 18, "bold");
  pdf.text(`${instrName} Portfolio`, M + 8, M + 26);
  setFont([196, 181, 253], 8);
  pdf.text(`${params.years}-Year Projection  ·  ${params.currency}  ·  ${new Date().toLocaleDateString()}`, M + 8, M + 36);

  setFont([196, 181, 253], 7);
  pdf.text("PROJECTED NET WORTH", PW - M - 8, M + 14, { align: "right" });
  setFont(WHITE, 17, "bold");
  pdf.text(fmt(s.finalValue, sym), PW - M - 8, M + 28, { align: "right" });
  setFont([196, 181, 253], 8);
  pdf.text(`+${s.totalReturnPercent}% total return`, PW - M - 8, M + 38, { align: "right" });

  let y = M + 62;

  // Key Metrics row
  const metrics = [
    { label: "Final Value",       value: fmt(s.finalValue, sym),                 sub: `After ${params.years} years`,        color: INDIGO },
    { label: "After-Tax Value",   value: fmt(s.afterTax, sym),                   sub: `${params.taxRate}% tax rate`,        color: EMERALD },
    { label: "Real Value",        value: fmt(s.realValue, sym),                   sub: `Inflation adj. ${params.inflationRate}%`, color: [14, 116, 144] },
    { label: "Total Returns",     value: fmt(s.totalReturns, sym),               sub: `${s.totalReturnPercent}% ROI`,       color: VIOLET },
    { label: "Net Annual Return", value: `${(s.annualizedReturn || 0).toFixed(1)}%`, sub: "Net of fees",                    color: AMBER },
  ];
  const cardW = (CW - 8) / 5;
  metrics.forEach((m, i) => metricCard(M + i * (cardW + 2), y, cardW, m.label, m.value, m.sub, m.color));
  y += 32;

  // Parameters + Wealth Breakdown
  y = sectionTitle("Investment Parameters & Wealth Breakdown", y);
  const halfW = (CW - 6) / 2;

  // Parameters box
  roundedRect(M, y, halfW, 80, 4, WHITE, SLATE_200);
  setFont(SLATE_900, 8, "bold");
  pdf.text("Investment Parameters", M + 6, y + 8);
  const paramRows = [
    ["Asset Class", instrName],
    ["Initial Investment", `${sym}${(params.initialAmount || 0).toLocaleString()}`],
    ["Monthly Contribution", `${sym}${(params.monthlyContribution || 0).toLocaleString()}`],
    ["Time Horizon", `${params.years} years`],
    ["Expected Return", `${params.returnRate}% p.a.`],
    ["Inflation Rate", `${params.inflationRate}%`],
    ["Tax Rate", `${params.taxRate}%`],
    ["Annual Fees", `${params.fees}%`],
  ];
  paramRows.forEach(([k, v], i) => {
    const ry = y + 15 + i * 8;
    setFont(SLATE_500, 6.5);
    pdf.text(k, M + 6, ry);
    setFont(SLATE_900, 6.5, "bold");
    pdf.text(v, M + halfW - 6, ry, { align: "right" });
    if (i < paramRows.length - 1) {
      setStroke(SLATE_200);
      pdf.setLineWidth(0.2);
      pdf.line(M + 5, ry + 2, M + halfW - 5, ry + 2);
    }
  });

  // Wealth breakdown box
  const col2X = M + halfW + 6;
  roundedRect(col2X, y, halfW, 80, 4, WHITE, SLATE_200);
  setFont(SLATE_900, 8, "bold");
  pdf.text("Wealth Breakdown", col2X + 6, y + 8);

  const total = (s.totalContributed || 0) + Math.max(0, s.totalReturns || 0) + (s.taxPaid || 0);
  const segments = [
    { label: "Contributions",       value: s.totalContributed || 0,               color: VIOLET },
    { label: "Investment Returns",  value: Math.max(0, s.totalReturns || 0),      color: INDIGO },
    { label: "Tax Paid",            value: s.taxPaid || 0,                        color: ROSE },
  ];
  horizontalStackedBar(col2X + 6, y + 14, halfW - 12, segments, total);
  let ly = y + 30;
  segments.forEach(seg => {
    setFill(seg.color);
    pdf.roundedRect(col2X + 6, ly - 3, 8, 4, 1, 1, "F");
    setFont(SLATE_700, 7);
    pdf.text(seg.label, col2X + 18, ly);
    setFont(SLATE_900, 7, "bold");
    pdf.text(fmt(seg.value, sym), col2X + halfW - 8, ly, { align: "right" });
    ly += 11;
  });
  y += 88;

  // Growth line chart
  y = sectionTitle("Portfolio Growth Over Time", y);
  const chartData = yearlyData.map(d => ({ year: d.year, value: d.nominalValue }));
  const realData   = yearlyData.map(d => ({ year: d.year, value: d.realValue }));
  const contribs   = yearlyData.map(d => ({ year: d.year, value: d.totalContributed }));
  lineChart(M, y, CW, 62, [
    { data: contribs, color: [196, 181, 253] },
    { data: realData, color: EMERALD },
    { data: chartData, color: INDIGO },
  ]);
  // legend
  [[VIOLET, "Contributions"], [EMERALD, "Real Value"], [INDIGO, "Portfolio Value"]].forEach(([color, label], i) => {
    const lx = M + 10 + i * 58;
    setFill(color);
    pdf.rect(lx, y + 65, 10, 2, "F");
    setFont(SLATE_500, 6);
    pdf.text(label, lx + 13, y + 66.5);
  });
  y += 74;

  // Milestones
  y = sectionTitle("Wealth Milestones", y);
  const milestones = [0.25, 0.5, 0.75, 1].map(pct => {
    const idx = Math.max(0, Math.floor(pct * (yearlyData.length - 1)));
    return yearlyData[idx];
  });
  const mW = (CW - 6) / 4;
  milestones.forEach((m, i) => {
    roundedRect(M + i * (mW + 2), y, mW, 22, 4, WHITE, SLATE_200);
    setFill(INDIGO);
    pdf.roundedRect(M + i * (mW + 2), y, mW, 2, 1, 1, "F");
    setFont(SLATE_500, 6);
    pdf.text(`Year ${m?.year}`, M + i * (mW + 2) + mW / 2, y + 8, { align: "center" });
    setFont(SLATE_900, 9, "bold");
    pdf.text(fmt(m?.nominalValue, sym), M + i * (mW + 2) + mW / 2, y + 15, { align: "center" });
    setFont(SLATE_500, 5.5);
    pdf.text(`${fmt(m?.realValue, sym)} real`, M + i * (mW + 2) + mW / 2, y + 20, { align: "center" });
  });

  drawFooter();

  // ─── PAGE 2: Year-by-Year Table ───────────────────────────────────────────
  newPage();
  y = M + 8;
  y = sectionTitle("Year-by-Year Breakdown", y);

  const cols = [
    { label: "Year",           w: 14, align: "center" },
    { label: "Portfolio Value",w: 36, align: "right" },
    { label: "Total Invested", w: 36, align: "right" },
    { label: "Returns",        w: 30, align: "right" },
    { label: "Real Value",     w: 34, align: "right" },
    { label: "After-Tax",      w: 34, align: "right" },
    { label: "Tax Paid",       w: 26, align: "right" },
  ];
  const totalColW = cols.reduce((a, c) => a + c.w, 0);
  const tableX = M + (CW - totalColW) / 2;

  const drawTableHeader = (ty) => {
    roundedRect(tableX, ty, totalColW, 8, 3, INDIGO);
    let cx = tableX;
    cols.forEach(col => {
      setFont(WHITE, 6.5, "bold");
      pdf.text(col.label, cx + col.w / 2, ty + 5.5, { align: "center" });
      cx += col.w;
    });
    return ty + 8;
  };

  y = drawTableHeader(y);

  yearlyData.forEach((d, idx) => {
    if (y > PH - 30) {
      drawFooter();
      newPage();
      y = M + 10;
      y = drawTableHeader(y);
    }
    const rowBg = idx % 2 === 0 ? WHITE : SLATE_50;
    setFill(rowBg);
    pdf.rect(tableX, y, totalColW, 7, "F");

    const rowVals = [
      { v: `${d.year}`, align: "center" },
      { v: fmt(d.nominalValue, sym), align: "right" },
      { v: fmt(d.totalContributed, sym), align: "right" },
      { v: fmt(d.gains, sym), align: "right" },
      { v: fmt(d.realValue, sym), align: "right" },
      { v: fmt(d.afterTax, sym), align: "right" },
      { v: fmt(d.taxPaid, sym), align: "right" },
    ];
    let rx = tableX;
    rowVals.forEach((cell, ci) => {
      const col = cols[ci];
      const isGain = ci === 3;
      const gainColor = d.gains >= 0 ? EMERALD : ROSE;
      setFont(isGain ? gainColor : SLATE_900, 6.5, ci === 0 ? "bold" : "normal");
      const textX = cell.align === "right" ? rx + col.w - 3 : rx + col.w / 2;
      pdf.text(cell.v, textX, y + 5, { align: cell.align });
      rx += col.w;
    });
    // row bottom border
    setStroke(SLATE_200);
    pdf.setLineWidth(0.15);
    pdf.line(tableX, y + 7, tableX + totalColW, y + 7);
    y += 7;
  });

  drawFooter();

  // ─── PAGE 3: Market Analysis & Tax Strategies ─────────────────────────────
  newPage();
  y = M + 8;
  y = sectionTitle("Market Analysis Insights", y);

  const marketInsights = getMarketInsights(instrument, params, s, sym, pdf);
  for (const section of marketInsights) {
    const lines = section.items.flatMap(item => pdf.splitTextToSize(`• ${item}`, CW - 18));
    const boxH = lines.length * 5 + 16;
    if (y + boxH > PH - 30) { drawFooter(); newPage(); y = M + 10; }
    roundedRect(M, y, CW, boxH, 4, WHITE, SLATE_200);
    setFill(section.color);
    pdf.roundedRect(M, y, CW, 2, 2, 2, "F");
    setFont(SLATE_900, 8, "bold");
    pdf.text(section.title, M + 8, y + 9);
    setFont(SLATE_700, 6.5);
    pdf.text(lines, M + 8, y + 15);
    y += boxH + 6;
  }

  // Scenario bar chart
  if (y < PH - 70) {
    y = sectionTitle("Scenario Analysis", y);
    const scenarios = [
      { label: "Conservative", rate: params.returnRate * 0.6, color: AMBER },
      { label: "Moderate",     rate: params.returnRate,       color: INDIGO },
      { label: "Aggressive",   rate: params.returnRate * 1.5, color: EMERALD },
    ];
    const sW = (CW - 8) / 3;
    scenarios.forEach((sc, i) => {
      const finalVal = calcFinalValue(params, sc.rate);
      roundedRect(M + i * (sW + 4), y, sW, 30, 4, WHITE, SLATE_200);
      setFill(sc.color);
      pdf.roundedRect(M + i * (sW + 4), y, sW, 2, 2, 2, "F");
      setFont(SLATE_900, 8, "bold");
      pdf.text(sc.label, M + i * (sW + 4) + sW / 2, y + 10, { align: "center" });
      setFont(SLATE_500, 6.5);
      pdf.text(`${sc.rate.toFixed(1)}% return`, M + i * (sW + 4) + sW / 2, y + 17, { align: "center" });
      setFont(SLATE_900, 9, "bold");
      pdf.text(fmt(finalVal, sym), M + i * (sW + 4) + sW / 2, y + 26, { align: "center" });
    });
    y += 38;
  }

  // Tax strategies
  if (y > PH - 60) { drawFooter(); newPage(); y = M + 10; }
  y = sectionTitle("Tax Optimisation Strategies", y);

  const taxStrategies = getTaxStrategies(instrument, params, s, sym);
  for (const strategy of taxStrategies) {
    const lines = pdf.splitTextToSize(strategy.detail, CW - 20);
    const boxH = lines.length * 5 + 20;
    if (y + boxH > PH - 30) { drawFooter(); newPage(); y = M + 10; }
    roundedRect(M, y, CW, boxH, 4, WHITE, SLATE_200);
    setFill(strategy.color);
    pdf.rect(M, y, 3, boxH, "F");
    setFont(SLATE_900, 8, "bold");
    pdf.text(strategy.title, M + 8, y + 8);
    if (strategy.saving) {
      setFont(EMERALD, 7, "bold");
      pdf.text(`Potential saving: ${strategy.saving}`, M + CW - 6, y + 8, { align: "right" });
    }
    setFont(SLATE_700, 6.5);
    pdf.text(lines, M + 8, y + 15);
    y += boxH + 6;
  }

  // Disclaimer
  if (y > PH - 38) { drawFooter(); newPage(); y = M + 10; }
  roundedRect(M, y, CW, 28, 4, [255, 251, 235], [253, 230, 138]);
  setFill(AMBER);
  pdf.roundedRect(M, y, CW, 2, 2, 2, "F");
  setFont([146, 64, 14], 7, "bold");
  pdf.text("⚠  Disclaimer", M + 8, y + 8);
  setFont([120, 53, 15], 6.5);
  const disclaimer = "This report is for educational purposes only. Projections are estimates based on assumed rates and do not account for actual market volatility, inflation changes, or tax law changes. Past performance does not guarantee future results. Always seek advice from a qualified financial advisor before making investment decisions.";
  pdf.text(pdf.splitTextToSize(disclaimer, CW - 16), M + 8, y + 15);

  drawFooter();

  pdf.save(`WealthLens-${instrName}-${new Date().toISOString().split("T")[0]}.pdf`);
}

function calcFinalValue(params, returnRate) {
  const monthlyRate = (returnRate - params.fees) / 100 / 12;
  const totalMonths = params.years * 12;
  let balance = params.initialAmount;
  for (let m = 1; m <= totalMonths; m++) {
    balance += balance * monthlyRate + params.monthlyContribution;
  }
  return Math.round(balance);
}

function getMarketInsights(instrument, params, s, sym) {
  const instrumentInsights = {
    stocks: {
      title: "Stock Market Dynamics",
      color: INDIGO,
      items: [
        `With a ${params.returnRate}% expected return, you're targeting ${params.returnRate > 10 ? "above" : "near"} the historical average of ~10% for global equities.`,
        "Market volatility is normal — stock markets have historically recovered from every downturn over long periods.",
        `Your ${params.years}-year horizon ${params.years >= 10 ? "significantly reduces" : "somewhat mitigates"} the impact of short-term market fluctuations.`,
        `Dollar-cost averaging via your ${sym}${params.monthlyContribution?.toLocaleString()} monthly contributions smooths out market timing risk.`,
      ]
    },
    etf: {
      title: "ETF Market Dynamics",
      color: INDIGO,
      items: [
        `ETFs offer low-cost, broad market exposure. Your ${params.fees}% fee assumption ${params.fees <= 0.3 ? "is well-optimised" : "could be reduced — many index ETFs charge under 0.2%"}.`,
        "Passive index ETFs historically outperform the majority of actively managed funds over 10+ year periods.",
        `With ${params.years} years of consistent investing, compound growth will be your most powerful wealth-building tool.`,
      ]
    },
    crypto: {
      title: "Cryptocurrency Market Dynamics",
      color: VIOLET,
      items: [
        "Cryptocurrency markets are highly volatile — returns can deviate significantly from projections in either direction.",
        `A ${params.returnRate}% return assumption for crypto is moderate; historical crypto returns have been extreme in both directions.`,
        "Regulatory risk remains significant — consider limiting crypto to a small percentage (5-15%) of your total portfolio.",
      ]
    },
    bonds: {
      title: "Fixed Income Market Dynamics",
      color: [14, 116, 144],
      items: [
        `Bond yields are influenced by central bank rate decisions. Your ${params.returnRate}% return reflects current fixed income expectations.`,
        "Duration risk: longer-term bonds are more sensitive to interest rate changes.",
        `At ${params.inflationRate}% inflation, your real return on bonds is approximately ${(params.returnRate - params.inflationRate).toFixed(1)}%.`,
      ]
    },
    gold: {
      title: "Gold Market Dynamics",
      color: AMBER,
      items: [
        "Gold historically acts as a hedge against inflation and currency devaluation.",
        `Gold's long-term real return is approximately 1-2% above inflation. Your ${params.returnRate}% assumption may be optimistic for a gold-only strategy.`,
        "Consider gold as a 5-15% portfolio allocation alongside growth assets.",
      ]
    },
    property: {
      title: "Property Market Dynamics",
      color: EMERALD,
      items: [
        "Property provides both capital growth and rental yield income streams.",
        "Leverage through mortgages can amplify both gains and losses — manage debt levels carefully.",
        "Property is illiquid — factor in transaction costs (2-5%) when comparing to financial assets.",
      ]
    },
    mutual_funds: {
      title: "Managed Fund Dynamics",
      color: INDIGO,
      items: [
        `Active management fees can significantly impact net returns. Ensure your ${params.fees}% fee assumption accounts for all charges.`,
        "Compare fund performance against relevant benchmarks after fees before investing.",
      ]
    },
    fixed_deposit: {
      title: "Fixed Deposit Dynamics",
      color: [14, 116, 144],
      items: [
        "Fixed deposits offer capital protection and guaranteed returns — ideal for low-risk investors.",
        `At ${params.inflationRate}% inflation, ensure your FD rate exceeds inflation to maintain purchasing power.`,
      ]
    },
  };

  return [
    instrumentInsights[instrument] || instrumentInsights.stocks,
    {
      title: "Key Risks to Monitor",
      color: ROSE,
      items: [
        `Inflation Risk: At ${params.inflationRate}% inflation, your real return is approximately ${(params.returnRate - params.inflationRate - params.fees).toFixed(1)}%.`,
        `Sequence of Returns Risk: Poor returns early in your ${params.years}-year horizon can have outsized negative effects.`,
        `Fee Drag: Your ${params.fees}% annual fee compounds over time — minimise fees wherever possible.`,
      ]
    }
  ];
}

function getTaxStrategies(instrument, params, s, sym) {
  const strategies = [
    {
      title: "Tax-Deferred & Tax-Free Accounts",
      color: EMERALD,
      detail: `Maximise contributions to tax-advantaged accounts (e.g. superannuation in Australia, 401k/IRA in the USA). Deferring tax on ${fmt(s.totalReturns, sym)} in returns until retirement could significantly reduce your tax burden.`,
      saving: `Up to ${fmt(s.taxPaid * 0.2, sym)}`
    },
    {
      title: "Capital Gains Tax Management",
      color: INDIGO,
      detail: `Your projected tax liability is ${fmt(s.taxPaid, sym)} at a ${params.taxRate}% rate. Holding investments for more than 12 months qualifies for the 50% CGT discount in Australia, reducing your effective rate to ${(params.taxRate / 2).toFixed(1)}%. Staggering asset sales across tax years can also reduce annual taxable income.`,
      saving: `Up to ${fmt(s.taxPaid * 0.5, sym)} via CGT discount`
    },
    {
      title: "Tax Loss Harvesting",
      color: AMBER,
      detail: "Selling investments at a loss to offset capital gains elsewhere can reduce your tax bill. Replace sold assets with similar investments to maintain portfolio exposure.",
      saving: "Variable — up to full CGT offset"
    },
    {
      title: "Spouse & Family Structures",
      color: [14, 116, 144],
      detail: "Splitting income-producing investments with a spouse in a lower tax bracket can reduce the household tax burden. Consult a tax professional about family trusts or company structures.",
      saving: null
    },
  ];
  if (instrument === "property") {
    strategies.push({
      title: "Negative Gearing & Depreciation",
      color: EMERALD,
      detail: "For investment properties, mortgage interest, maintenance, insurance, and depreciation are tax-deductible. A quantity surveyor's depreciation schedule can maximise deductible claims.",
      saving: "Significant — consult a tax professional"
    });
  }
  return strategies;
}