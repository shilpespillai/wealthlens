import jsPDF from "jspdf";
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";

const ASSET_CLASSES = [
  { id: "stocks",        label: "Stocks",        color: [99, 102, 241] },
  { id: "etf",           label: "ETF",           color: [139, 92, 246] },
  { id: "property",      label: "Property",      color: [16, 185, 129] },
  { id: "crypto",        label: "Crypto",        color: [245, 158, 11] },
  { id: "bonds",         label: "Bonds",         color: [59, 130, 246] },
  { id: "fixed_deposit", label: "Fixed Deposit", color: [6, 182, 212] },
  { id: "mutual_funds",  label: "Mutual Funds",  color: [236, 72, 153] },
  { id: "gold",          label: "Gold",          color: [217, 119, 6] },
];

const INDIGO  = [99, 102, 241];
const VIOLET  = [139, 92, 246];
const EMERALD = [16, 185, 129];
const AMBER   = [245, 158, 11];
const ROSE    = [239, 68, 68];
const SLATE_900 = [15, 23, 42];
const SLATE_700 = [51, 65, 85];
const SLATE_500 = [100, 116, 139];
const SLATE_200 = [226, 232, 240];
const SLATE_50  = [248, 250, 252];
const WHITE     = [255, 255, 255];

const fmtNum = (n, sym = "") => {
  const v = n || 0;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000)     return `${sym}${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000)         return `${sym}${(v / 1_000).toFixed(1)}K`;
  return `${sym}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export function generatePortfolioPdf({ holdings, currency }) {
  const sym = getCurrencySymbol(currency);
  const fmt = (n) => fmtNum(n, sym);
  const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

  // ─── Compute metrics ────────────────────────────────────────────────────
  const totalValue    = holdings.reduce((s, h) => s + Number(h.currentValue || 0), 0);
  const totalInvested = holdings.reduce((s, h) => s + Number(h.invested || 0), 0);
  const totalGain     = totalValue - totalInvested;
  const totalReturnPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const grouped = {};
  holdings.forEach(h => {
    if (!grouped[h.asset]) grouped[h.asset] = { value: 0, invested: 0 };
    grouped[h.asset].value    += Number(h.currentValue || 0);
    grouped[h.asset].invested += Number(h.invested || 0);
  });

  const classSummary = ASSET_CLASSES.map(cls => {
    const g = grouped[cls.id] || { value: 0, invested: 0 };
    const gain = g.value - g.invested;
    const returnPct = g.invested > 0 ? (gain / g.invested) * 100 : 0;
    const allocation = totalValue > 0 ? (g.value / totalValue) * 100 : 0;
    return { ...cls, ...g, gain, returnPct, allocation };
  }).filter(c => c.value > 0 || c.invested > 0);

  // ─── Setup ──────────────────────────────────────────────────────────────
  const pdf = new jsPDF("p", "mm", "a4");
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const M  = 16;
  const CW = PW - M * 2;

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

  const drawPageBg = () => { setFill(SLATE_50); pdf.rect(0, 0, PW, PH, "F"); };
  const drawFooter = () => {
    setStroke(SLATE_200);
    pdf.setLineWidth(0.3);
    pdf.line(M, PH - 12, PW - M, PH - 12);
    setFont(SLATE_500, 7);
    pdf.text("WealthLens Portfolio Report  •  Confidential", M, PH - 6);
    pdf.text(new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }), PW - M, PH - 6, { align: "right" });
  };
  const newPage = () => { pdf.addPage(); drawPageBg(); drawFooter(); };

  const sectionTitle = (title, y) => {
    setFont(SLATE_900, 11, "bold");
    pdf.text(title, M, y + 5);
    setFill(INDIGO);
    pdf.rect(M, y + 7, CW, 0.8, "F");
    return y + 14;
  };

  const metricCard = (x, y, w, label, value, sub, accentColor = INDIGO) => {
    roundedRect(x, y, w, 24, 4, WHITE, SLATE_200);
    setFill(accentColor);
    pdf.roundedRect(x, y, w, 2, 1, 1, "F");
    setFont(SLATE_500, 6, "bold");
    pdf.text(label.toUpperCase(), x + 5, y + 8);
    setFont(SLATE_900, 10, "bold");
    pdf.text(value, x + 5, y + 16);
    if (sub) { setFont(SLATE_500, 6); pdf.text(sub, x + 5, y + 21); }
  };

  // ─── PAGE 1 ─────────────────────────────────────────────────────────────
  drawPageBg();

  // Hero header
  roundedRect(M, M, CW, 46, 6, INDIGO);
  setFill(VIOLET);
  pdf.triangle(PW - M - 50, M, PW - M, M, PW - M, M + 46, "F");
  setFont(WHITE, 7, "bold");
  pdf.text("WEALTHLENS  ·  PORTFOLIO REPORT", M + 8, M + 10);
  setFont(WHITE, 16, "bold");
  pdf.text("Investment Portfolio Dashboard", M + 8, M + 24);
  setFont([196, 181, 253], 8);
  pdf.text(`${currency}  ·  ${new Date().toLocaleDateString()}`, M + 8, M + 34);

  setFont([196, 181, 253], 7);
  pdf.text("TOTAL PORTFOLIO VALUE", PW - M - 8, M + 14, { align: "right" });
  setFont(WHITE, 16, "bold");
  pdf.text(fmt(totalValue), PW - M - 8, M + 26, { align: "right" });
  setFont([196, 181, 253], 8);
  pdf.text(`${totalReturnPct >= 0 ? "+" : ""}${pct(totalReturnPct)} overall return`, PW - M - 8, M + 35, { align: "right" });

  let y = M + 56;

  // Summary metric cards
  const cardW = (CW - 6) / 4;
  const gainColor = totalGain >= 0 ? EMERALD : ROSE;
  metricCard(M,                    y, cardW, "Total Value",    fmt(totalValue),    `${holdings.length} holdings`, INDIGO);
  metricCard(M + cardW + 2,        y, cardW, "Total Invested", fmt(totalInvested), "Cost basis", VIOLET);
  metricCard(M + (cardW + 2) * 2,  y, cardW, "Total Gain/Loss",fmt(totalGain),    `${totalGain >= 0 ? "+" : ""}${pct(totalReturnPct)} return`, gainColor);
  metricCard(M + (cardW + 2) * 3,  y, cardW, "Asset Classes",  `${classSummary.length}`, "Active classes", AMBER);
  y += 32;

  // Asset Allocation horizontal stacked bar
  y = sectionTitle("Asset Allocation", y);
  roundedRect(M, y, CW, 40, 4, WHITE, SLATE_200);

  // Stacked bar
  let bx = M + 8;
  const barW = CW - 16;
  classSummary.forEach(cls => {
    const sw = totalValue > 0 ? (cls.value / totalValue) * barW : 0;
    setFill(cls.color);
    pdf.rect(bx, y + 8, sw, 10, "F");
    bx += sw;
  });
  // Legend inline
  let lx = M + 8;
  let ly2 = y + 26;
  classSummary.forEach((cls, i) => {
    if (lx > M + CW - 30) { lx = M + 8; ly2 += 8; }
    setFill(cls.color);
    pdf.roundedRect(lx, ly2 - 3, 6, 4, 1, 1, "F");
    setFont(SLATE_700, 6);
    const alloc = totalValue > 0 ? (cls.value / totalValue) * 100 : 0;
    pdf.text(`${cls.label} ${alloc.toFixed(1)}%`, lx + 8, ly2);
    lx += 38;
  });
  y += 48;

  // Performance by asset class table
  y = sectionTitle("Performance by Asset Class", y);

  const tCols = [
    { label: "Asset Class",    w: 40, align: "left" },
    { label: "Invested",       w: 30, align: "right" },
    { label: "Current Value",  w: 32, align: "right" },
    { label: "Gain / Loss",    w: 30, align: "right" },
    { label: "Return",         w: 24, align: "right" },
    { label: "Allocation",     w: 22, align: "right" },
  ];
  const tW = tCols.reduce((a, c) => a + c.w, 0);
  const tX = M + (CW - tW) / 2;

  // Header
  roundedRect(tX, y, tW, 8, 3, INDIGO);
  let cx = tX;
  tCols.forEach(col => {
    setFont(WHITE, 6.5, "bold");
    pdf.text(col.label, col.align === "right" ? cx + col.w - 3 : cx + 4, y + 5.5, { align: col.align === "right" ? "right" : "left" });
    cx += col.w;
  });
  y += 8;

  classSummary.forEach((cls, idx) => {
    if (y > PH - 30) { drawFooter(); newPage(); y = M + 10; }
    setFill(idx % 2 === 0 ? WHITE : SLATE_50);
    pdf.rect(tX, y, tW, 8, "F");

    const rowData = [
      { v: cls.label, align: "left", color: SLATE_900, dot: cls.color },
      { v: fmt(cls.invested), align: "right", color: SLATE_700 },
      { v: fmt(cls.value),    align: "right", color: SLATE_900, bold: true },
      { v: `${cls.gain >= 0 ? "+" : ""}${fmt(cls.gain)}`, align: "right", color: cls.gain >= 0 ? EMERALD : ROSE, bold: true },
      { v: `${cls.returnPct >= 0 ? "+" : ""}${pct(cls.returnPct)}`, align: "right", color: cls.returnPct >= 0 ? EMERALD : ROSE, bold: true },
      { v: pct(cls.allocation), align: "right", color: SLATE_700 },
    ];

    let rx = tX;
    rowData.forEach((cell, ci) => {
      const col = tCols[ci];
      setFont(cell.color, 6.5, cell.bold ? "bold" : "normal");
      if (cell.dot) {
        setFill(cell.dot);
        pdf.circle(rx + 4, y + 4, 2, "F");
        pdf.text(cell.v, rx + 9, y + 5.5, { align: "left" });
      } else {
        const tx = cell.align === "right" ? rx + col.w - 3 : rx + 4;
        pdf.text(cell.v, tx, y + 5.5, { align: cell.align === "right" ? "right" : "left" });
      }
      rx += col.w;
    });
    setStroke(SLATE_200);
    pdf.setLineWidth(0.15);
    pdf.line(tX, y + 8, tX + tW, y + 8);
    y += 8;
  });

  y += 6;

  // Individual holdings table
  if (y > PH - 60) { drawFooter(); newPage(); y = M + 10; }
  y = sectionTitle("Individual Holdings", y);

  const hCols = [
    { label: "Holding",       w: 44, align: "left" },
    { label: "Asset Class",   w: 30, align: "left" },
    { label: "Invested",      w: 30, align: "right" },
    { label: "Current Value", w: 32, align: "right" },
    { label: "Gain / Loss",   w: 30, align: "right" },
    { label: "Return %",      w: 22, align: "right" },
  ];
  const hW = hCols.reduce((a, c) => a + c.w, 0);
  const hX = M + (CW - hW) / 2;

  roundedRect(hX, y, hW, 8, 3, INDIGO);
  cx = hX;
  hCols.forEach(col => {
    setFont(WHITE, 6.5, "bold");
    pdf.text(col.label, col.align === "right" ? cx + col.w - 3 : cx + 4, y + 5.5, { align: col.align === "right" ? "right" : "left" });
    cx += col.w;
  });
  y += 8;

  holdings.forEach((h, idx) => {
    if (y > PH - 24) { drawFooter(); newPage(); y = M + 10; }
    const gain = Number(h.currentValue || 0) - Number(h.invested || 0);
    const returnPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;
    const cls = ASSET_CLASSES.find(a => a.id === h.asset);

    setFill(idx % 2 === 0 ? WHITE : SLATE_50);
    pdf.rect(hX, y, hW, 8, "F");

    const rowData = [
      { v: h.label || cls?.label || h.asset, align: "left",  color: SLATE_900, bold: true },
      { v: cls?.label || h.asset,            align: "left",  color: SLATE_500 },
      { v: fmt(h.invested),                  align: "right", color: SLATE_700 },
      { v: fmt(h.currentValue),              align: "right", color: SLATE_900, bold: true },
      { v: `${gain >= 0 ? "+" : ""}${fmt(gain)}`, align: "right", color: gain >= 0 ? EMERALD : ROSE, bold: true },
      { v: `${returnPct >= 0 ? "+" : ""}${pct(returnPct)}`, align: "right", color: returnPct >= 0 ? EMERALD : ROSE, bold: true },
    ];

    let rx = hX;
    rowData.forEach((cell, ci) => {
      const col = hCols[ci];
      setFont(cell.color, 6.5, cell.bold ? "bold" : "normal");
      const tx = cell.align === "right" ? rx + col.w - 3 : rx + 4;
      const label = cell.v.length > 18 ? cell.v.slice(0, 17) + "…" : cell.v;
      pdf.text(label, tx, y + 5.5, { align: cell.align === "right" ? "right" : "left" });
      rx += col.w;
    });
    setStroke(SLATE_200);
    pdf.setLineWidth(0.15);
    pdf.line(hX, y + 8, hX + hW, y + 8);
    y += 8;
  });

  // Insights section
  y += 6;
  if (y > PH - 60) { drawFooter(); newPage(); y = M + 10; }
  y = sectionTitle("Portfolio Insights", y);

  const topHolding = [...holdings].sort((a, b) => Number(b.currentValue || 0) - Number(a.currentValue || 0))[0];
  const bestPerformer = [...holdings].filter(h => h.invested > 0).sort((a, b) => {
    const ra = (a.currentValue - a.invested) / a.invested;
    const rb = (b.currentValue - b.invested) / b.invested;
    return rb - ra;
  })[0];

  const insights = [
    { title: "Portfolio Concentration", color: INDIGO, text: topHolding ? `Your largest holding is "${topHolding.label || "Unnamed"}" at ${fmt(topHolding.currentValue)} (${pct((topHolding.currentValue / totalValue) * 100)} of portfolio). ${(topHolding.currentValue / totalValue) > 0.5 ? "Consider diversifying — over 50% concentration in one holding increases risk." : "Good diversification — no single holding dominates the portfolio."}` : "No holdings data." },
    { title: "Best Performer", color: EMERALD, text: bestPerformer ? `"${bestPerformer.label || "Unnamed"}" is your best performer with a ${pct(((bestPerformer.currentValue - bestPerformer.invested) / bestPerformer.invested) * 100)} return (${fmt(bestPerformer.currentValue - bestPerformer.invested)} gain).` : "Add invested amounts to identify your best performer." },
    { title: "Overall Performance", color: totalGain >= 0 ? EMERALD : ROSE, text: `Your portfolio has ${totalGain >= 0 ? "gained" : "lost"} ${fmt(Math.abs(totalGain))} (${pct(Math.abs(totalReturnPct))}) overall. ${totalReturnPct > 10 ? "Strong performance — above typical market benchmarks." : totalReturnPct > 0 ? "Positive returns — on track." : "Consider reviewing underperforming holdings."}` },
  ];

  insights.forEach(insight => {
    if (y > PH - 36) { drawFooter(); newPage(); y = M + 10; }
    const lines = pdf.splitTextToSize(insight.text, CW - 20);
    const boxH = lines.length * 5 + 16;
    roundedRect(M, y, CW, boxH, 4, WHITE, SLATE_200);
    setFill(insight.color);
    pdf.rect(M, y, 3, boxH, "F");
    setFont(SLATE_900, 8, "bold");
    pdf.text(insight.title, M + 8, y + 8);
    setFont(SLATE_700, 6.5);
    pdf.text(lines, M + 8, y + 14);
    y += boxH + 6;
  });

  drawFooter();
  pdf.save(`WealthLens-Portfolio-${new Date().toISOString().split("T")[0]}.pdf`);
}