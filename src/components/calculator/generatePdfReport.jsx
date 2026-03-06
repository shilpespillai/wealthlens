import jsPDF from "jspdf";
import { getCurrencySymbol } from "./CurrencySelector";

const fmt = (n, sym = "$") => {
  const v = n || 0;
  if (v >= 1_000_000_000) return `${sym}${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
  return `${sym}${v.toLocaleString()}`;
};

const INDIGO = [99, 102, 241];
const VIOLET = [139, 92, 246];
const EMERALD = [16, 185, 129];
const AMBER = [245, 158, 11];
const SLATE_DARK = [15, 23, 42];
const SLATE_MID = [30, 41, 59];
const SLATE_LIGHT = [148, 163, 184];
const WHITE = [255, 255, 255];
const ROSE = [239, 68, 68];

export async function generatePdfReport({ params, results, instrument }) {
  const sym = getCurrencySymbol(params.currency);
  const s = results.summary;
  const yearlyData = results.yearlyData;

  const pdf = new jsPDF("p", "mm", "a4");
  const PW = pdf.internal.pageSize.getWidth();   // 210
  const PH = pdf.internal.pageSize.getHeight();  // 297
  const M = 16; // margin
  const CW = PW - M * 2; // content width

  const instrName = {
    stocks: "Stocks", etf: "ETFs", bonds: "Bonds", crypto: "Crypto",
    gold: "Gold", mutual_funds: "Mutual Funds", fixed_deposit: "Fixed Deposit", property: "Property"
  }[instrument] || instrument;

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const setFill = (rgb) => pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setDraw = (rgb) => pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setFont = (color, size, style = "normal") => {
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
  };

  const addPage = () => {
    pdf.addPage();
    // footer on each new page
    drawFooter();
  };

  const drawFooter = () => {
    const pageNum = pdf.internal.getCurrentPageInfo().pageNumber;
    const total = pdf.internal.pages.length - 1;
    setFont(SLATE_LIGHT, 7);
    pdf.text(`WealthLens Investment Report  •  Page ${pageNum}`, M, PH - 6);
    pdf.text(new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }), PW - M, PH - 6, { align: "right" });
    setFill([51, 65, 85]);
    pdf.rect(M, PH - 10, CW, 0.3, "F");
  };

  const sectionTitle = (title, y) => {
    setFill(INDIGO);
    pdf.rect(M, y, 3, 7, "F");
    setFont(WHITE, 13, "bold");
    pdf.text(title, M + 6, y + 5.5);
    return y + 14;
  };

  const card = (x, y, w, h, bg = SLATE_MID) => {
    setFill(bg);
    pdf.roundedRect(x, y, w, h, 3, 3, "F");
  };

  const metricCard = (x, y, w, label, value, sub, accentColor = INDIGO) => {
    const h = 22;
    card(x, y, w, h, SLATE_MID);
    setFill(accentColor);
    pdf.rect(x, y, w, 1.5, "F");
    setFont(SLATE_LIGHT, 6.5, "bold");
    pdf.text(label.toUpperCase(), x + 6, y + 7);
    setFont(WHITE, 11, "bold");
    pdf.text(value, x + 6, y + 14);
    if (sub) { setFont(SLATE_LIGHT, 6.5); pdf.text(sub, x + 6, y + 19.5); }
    return h;
  };

  const simpleBar = (x, y, w, h, data, sym) => {
    // Simple bar chart drawn natively
    const max = Math.max(...data.map(d => d.value));
    const barW = (w - (data.length - 1) * 2) / data.length;
    data.forEach((d, i) => {
      const barH = max > 0 ? (d.value / max) * h : 0;
      setFill(d.color || INDIGO);
      pdf.rect(x + i * (barW + 2), y + h - barH, barW, barH, "F");
      // label
      setFont(SLATE_LIGHT, 5);
      pdf.text(d.label, x + i * (barW + 2) + barW / 2, y + h + 5, { align: "center" });
    });
  };

  const lineChart = (x, y, w, h, series, sym) => {
    // Draw axes
    setFill([51, 65, 85]);
    pdf.rect(x, y, w, 0.3, "F");
    pdf.rect(x, y, 0.3, h, "F");

    const allVals = series.flatMap(s => s.data.map(d => d.value));
    const max = Math.max(...allVals);
    const pts = series[0].data.length;

    const mapX = (i) => x + (i / (pts - 1)) * w;
    const mapY = (v) => y + h - (v / max) * h;

    series.forEach((s) => {
      pdf.setDrawColor(s.color[0], s.color[1], s.color[2]);
      pdf.setLineWidth(0.8);
      for (let i = 1; i < s.data.length; i++) {
        pdf.line(mapX(i - 1), mapY(s.data[i - 1].value), mapX(i), mapY(s.data[i].value));
      }
    });

    // X axis labels (every 5 years or fewer)
    setFont(SLATE_LIGHT, 5.5);
    const step = Math.ceil(pts / 8);
    series[0].data.forEach((d, i) => {
      if (i % step === 0 || i === pts - 1) {
        pdf.text(`Y${d.year}`, mapX(i), y + h + 5, { align: "center" });
      }
    });
  };

  // ─── PAGE 1: Cover + Key Metrics ─────────────────────────────────────────
  // Header gradient block
  setFill(SLATE_DARK);
  pdf.rect(0, 0, PW, PH, "F");

  // Hero band
  setFill(INDIGO);
  pdf.rect(0, 0, PW, 68, "F");
  // overlay gradient feel
  setFill(VIOLET);
  pdf.triangle(PW - 80, 0, PW, 0, PW, 68, "F");

  setFont(WHITE, 8, "bold");
  pdf.text("WEALTHLENS · INVESTMENT ANALYSIS REPORT", M, 14);

  setFont(WHITE, 22, "bold");
  pdf.text(`${instrName} Portfolio`, M, 30);

  setFont([196, 181, 253], 9);
  pdf.text(`${params.years}-Year Projection  ·  ${params.currency}  ·  Generated ${new Date().toLocaleDateString()}`, M, 40);

  // Projected value on right
  setFont([196, 181, 253], 8);
  pdf.text("PROJECTED NET WORTH", PW - M, 18, { align: "right" });
  setFont(WHITE, 20, "bold");
  pdf.text(fmt(s.finalValue, sym), PW - M, 32, { align: "right" });
  setFont([165, 180, 252], 9);
  pdf.text(`+${s.totalReturnPercent}% total return`, PW - M, 41, { align: "right" });

  // Key Metrics row
  let y = 80;
  setFont(WHITE, 9, "bold");
  pdf.text("KEY METRICS", M, y - 4);

  const metrics = [
    { label: "Final Value", value: fmt(s.finalValue, sym), sub: `After ${params.years} years`, color: INDIGO },
    { label: "After-Tax Value", value: fmt(s.afterTax, sym), sub: `${params.taxRate}% tax rate`, color: EMERALD },
    { label: "Real Value", value: fmt(s.realValue, sym), sub: `Inflation adj. ${params.inflationRate}%`, color: [14, 116, 144] },
    { label: "Total Returns", value: fmt(s.totalReturns, sym), sub: `${s.totalReturnPercent}% ROI`, color: VIOLET },
    { label: "Net Annual Return", value: `${(s.annualizedReturn || 0).toFixed(1)}%`, sub: "Net of fees", color: AMBER },
  ];

  const cardW = (CW - 8) / 5;
  metrics.forEach((m, i) => {
    metricCard(M + i * (cardW + 2), y, cardW, m.label, m.value, m.sub, m.color);
  });
  y += 30;

  // Investment Parameters + Wealth Breakdown side by side
  y = sectionTitle("Investment Parameters & Wealth Breakdown", y);

  const col1W = CW * 0.48;
  const col2W = CW * 0.48;
  const col2X = M + col1W + CW * 0.04;

  // Parameters table
  card(M, y, col1W, 78, SLATE_MID);
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
    const rowY = y + 8 + i * 8.5;
    setFont(SLATE_LIGHT, 7);
    pdf.text(k, M + 6, rowY);
    setFont(WHITE, 7, "bold");
    pdf.text(v, M + col1W - 6, rowY, { align: "right" });
    if (i < paramRows.length - 1) {
      setFill([51, 65, 85]);
      pdf.rect(M + 4, rowY + 2, col1W - 8, 0.2, "F");
    }
  });

  // Wealth breakdown pie-like horizontal stacked bar
  card(col2X, y, col2W, 78, SLATE_MID);
  setFont(WHITE, 8, "bold");
  pdf.text("Wealth Breakdown", col2X + 6, y + 8);

  const total = (s.totalContributed || 0) + Math.max(0, s.totalReturns || 0) + (s.taxPaid || 0);
  const segments = [
    { label: "Contributions", value: s.totalContributed || 0, color: VIOLET },
    { label: "Investment Returns", value: Math.max(0, s.totalReturns || 0), color: INDIGO },
    { label: "Tax Paid", value: s.taxPaid || 0, color: ROSE },
  ];

  // Horizontal stacked bar
  const barY = y + 18;
  const barH = 14;
  const barTotalW = col2W - 16;
  let barX = col2X + 8;
  segments.forEach(seg => {
    const segW = total > 0 ? (seg.value / total) * barTotalW : 0;
    setFill(seg.color);
    pdf.rect(barX, barY, segW, barH, "F");
    barX += segW;
  });

  // Legend
  let legY = barY + barH + 8;
  segments.forEach(seg => {
    setFill(seg.color);
    pdf.rect(col2X + 8, legY - 3, 8, 4, "F");
    setFont(SLATE_LIGHT, 7);
    pdf.text(seg.label, col2X + 20, legY);
    setFont(WHITE, 7, "bold");
    pdf.text(fmt(seg.value, sym), col2X + col2W - 8, legY, { align: "right" });
    legY += 9;
  });

  y += 86;

  // Growth chart (line)
  y = sectionTitle("Portfolio Growth Over Time", y);
  card(M, y, CW, 72, SLATE_MID);

  const chartData = yearlyData.map(d => ({ year: d.year, value: d.nominalValue }));
  const realData = yearlyData.map(d => ({ year: d.year, value: d.realValue }));
  const contribData = yearlyData.map(d => ({ year: d.year, value: d.totalContributed }));

  lineChart(M + 12, y + 6, CW - 20, 55, [
    { data: contribData, color: VIOLET },
    { data: realData, color: EMERALD },
    { data: chartData, color: INDIGO },
  ], sym);

  // Legend
  const lgY = y + 64;
  [[VIOLET, "Contributions"], [EMERALD, "Real Value"], [INDIGO, "Portfolio Value"]].forEach(([color, label], i) => {
    const lx = M + 14 + i * 56;
    setFill(color);
    pdf.rect(lx, lgY, 10, 2, "F");
    setFont(SLATE_LIGHT, 6);
    pdf.text(label, lx + 13, lgY + 1.5);
  });

  y += 82;

  // Milestones
  y = sectionTitle("Wealth Milestones", y);
  const milestones = [0.25, 0.5, 0.75, 1].map(pct => {
    const idx = Math.max(0, Math.floor(pct * (yearlyData.length - 1)));
    const d = yearlyData[idx];
    return { year: d?.year, value: d?.nominalValue, real: d?.realValue };
  });
  const mW = (CW - 6) / 4;
  milestones.forEach((m, i) => {
    card(M + i * (mW + 2), y, mW, 22, SLATE_MID);
    setFill([99, 102, 241]);
    pdf.rect(M + i * (mW + 2), y, mW, 1.5, "F");
    setFont(SLATE_LIGHT, 6.5);
    pdf.text(`Year ${m.year}`, M + i * (mW + 2) + mW / 2, y + 7, { align: "center" });
    setFont(WHITE, 9, "bold");
    pdf.text(fmt(m.value, sym), M + i * (mW + 2) + mW / 2, y + 14, { align: "center" });
    setFont(SLATE_LIGHT, 6);
    pdf.text(`${fmt(m.real, sym)} real`, M + i * (mW + 2) + mW / 2, y + 20, { align: "center" });
  });

  y += 30;
  drawFooter();

  // ─── PAGE 2: Year-by-Year Table ───────────────────────────────────────────
  addPage();
  setFill(SLATE_DARK);
  pdf.rect(0, 0, PW, PH, "F");

  y = M + 8;
  y = sectionTitle("Year-by-Year Breakdown", y);

  // Table header
  const cols = [
    { label: "Year", w: 14, align: "center" },
    { label: "Portfolio Value", w: 36, align: "right" },
    { label: "Total Invested", w: 36, align: "right" },
    { label: "Returns", w: 30, align: "right" },
    { label: "Real Value", w: 34, align: "right" },
    { label: "After-Tax", w: 34, align: "right" },
    { label: "Tax Paid", w: 26, align: "right" },
  ];
  const totalColW = cols.reduce((a, c) => a + c.w, 0);
  const tableX = M + (CW - totalColW) / 2;

  setFill(INDIGO);
  pdf.rect(tableX, y, totalColW, 8, "F");
  let cx = tableX;
  cols.forEach(col => {
    setFont(WHITE, 6.5, "bold");
    pdf.text(col.label, cx + col.w / 2, y + 5.5, { align: "center" });
    cx += col.w;
  });
  y += 8;

  yearlyData.forEach((d, idx) => {
    if (y > PH - 30) {
      drawFooter();
      addPage();
      setFill(SLATE_DARK);
      pdf.rect(0, 0, PW, PH, "F");
      y = M + 10;
      // re-draw header
      setFill(INDIGO);
      pdf.rect(tableX, y, totalColW, 8, "F");
      let cx2 = tableX;
      cols.forEach(col => {
        setFont(WHITE, 6.5, "bold");
        pdf.text(col.label, cx2 + col.w / 2, y + 5.5, { align: "center" });
        cx2 += col.w;
      });
      y += 8;
    }

    const rowBg = idx % 2 === 0 ? SLATE_MID : [22, 32, 50];
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
      setFont(isGain && d.gains >= 0 ? EMERALD : WHITE, 6.5, ci === 0 ? "bold" : "normal");
      const textX = cell.align === "right" ? rx + col.w - 3 : rx + col.w / 2;
      pdf.text(cell.v, textX, y + 5, { align: cell.align });
      rx += col.w;
    });
    y += 7;
  });

  drawFooter();

  // ─── PAGE 3: Market Analysis & Tax Strategies ─────────────────────────────
  addPage();
  setFill(SLATE_DARK);
  pdf.rect(0, 0, PW, PH, "F");

  y = M + 8;
  y = sectionTitle("Market Analysis Insights", y);

  // Asset-specific market insights
  const marketInsights = getMarketInsights(instrument, params, s, sym);
  marketInsights.forEach(section => {
    if (y > PH - 50) { drawFooter(); addPage(); setFill(SLATE_DARK); pdf.rect(0, 0, PW, PH, "F"); y = M + 10; }

    card(M, y, CW, section.items.length * 9 + 14, SLATE_MID);
    setFill(section.color);
    pdf.rect(M, y, CW, 1.5, "F");
    setFont(WHITE, 8, "bold");
    pdf.text(section.title, M + 8, y + 8);
    let iy = y + 14;
    section.items.forEach(item => {
      setFill(section.color);
      pdf.circle(M + 10, iy - 1.5, 1.5, "F");
      setFont(WHITE, 7);
      const lines = pdf.splitTextToSize(item, CW - 24);
      pdf.text(lines, M + 16, iy);
      iy += lines.length * 5;
    });
    y += section.items.length * 9 + 18;
  });

  // Scenario comparison
  if (y < PH - 80) {
    y = sectionTitle("Scenario Analysis", y);
    const scenarios = [
      { label: "Conservative", rate: params.returnRate * 0.6, color: AMBER },
      { label: "Moderate", rate: params.returnRate, color: INDIGO },
      { label: "Aggressive", rate: params.returnRate * 1.5, color: EMERALD },
    ];
    const sW = (CW - 8) / 3;
    scenarios.forEach((sc, i) => {
      const finalVal = calcFinalValue(params, sc.rate);
      card(M + i * (sW + 4), y, sW, 30, SLATE_MID);
      setFill(sc.color);
      pdf.rect(M + i * (sW + 4), y, sW, 2, "F");
      setFont(WHITE, 8, "bold");
      pdf.text(sc.label, M + i * (sW + 4) + sW / 2, y + 10, { align: "center" });
      setFont(SLATE_LIGHT, 6.5);
      pdf.text(`${sc.rate.toFixed(1)}% return`, M + i * (sW + 4) + sW / 2, y + 17, { align: "center" });
      setFont(WHITE, 9, "bold");
      pdf.text(fmt(finalVal, sym), M + i * (sW + 4) + sW / 2, y + 26, { align: "center" });
    });
    y += 38;
  }

  // ─── Tax Strategies ───────────────────────────────────────────────────────
  if (y > PH - 80) { drawFooter(); addPage(); setFill(SLATE_DARK); pdf.rect(0, 0, PW, PH, "F"); y = M + 10; }

  y = sectionTitle("Tax Optimisation Strategies", y);

  const taxStrategies = getTaxStrategies(instrument, params, s, sym);
  taxStrategies.forEach(strategy => {
    if (y > PH - 50) { drawFooter(); addPage(); setFill(SLATE_DARK); pdf.rect(0, 0, PW, PH, "F"); y = M + 10; }

    const lines = pdf.splitTextToSize(strategy.detail, CW - 36);
    const boxH = lines.length * 5 + 20;
    card(M, y, CW, boxH, SLATE_MID);
    setFill(strategy.color);
    pdf.rect(M, y, 3, boxH, "F");

    setFont(WHITE, 8, "bold");
    pdf.text(strategy.title, M + 8, y + 8);
    setFont(SLATE_LIGHT, 7);
    pdf.text(lines, M + 8, y + 15);

    if (strategy.saving) {
      setFont(EMERALD, 7, "bold");
      pdf.text(`Potential saving: ${strategy.saving}`, M + CW - 8, y + 8, { align: "right" });
    }
    y += boxH + 6;
  });

  // ─── Disclaimer (last page) ───────────────────────────────────────────────
  if (y > PH - 40) { drawFooter(); addPage(); setFill(SLATE_DARK); pdf.rect(0, 0, PW, PH, "F"); y = M + 10; }

  card(M, y, CW, 28, [28, 26, 0]);
  setFill(AMBER);
  pdf.rect(M, y, CW, 1.5, "F");
  setFont(AMBER, 7, "bold");
  pdf.text("⚠  Disclaimer", M + 8, y + 8);
  setFont([253, 230, 138], 6.5);
  const disclaimer = "This report is for educational purposes only. Projections are estimates based on assumed rates and do not account for actual market volatility, inflation changes, or tax law changes. Past performance does not guarantee future results. Always seek advice from a qualified financial advisor before making investment decisions.";
  pdf.text(pdf.splitTextToSize(disclaimer, CW - 16), M + 8, y + 15);

  drawFooter();

  // Save
  pdf.save(`WealthLens-Report-${instrName}-${new Date().toISOString().split("T")[0]}.pdf`);
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
  const sections = [];

  const instrumentInsights = {
    stocks: {
      title: "Stock Market Dynamics",
      color: INDIGO,
      items: [
        `With a ${params.returnRate}% expected return, you're targeting ${params.returnRate > 10 ? "above" : "near"} the historical average of ~10% for global equities.`,
        "Market volatility is normal — stock markets have historically recovered from every downturn over long periods.",
        `Your ${params.years}-year horizon ${params.years >= 10 ? "significantly reduces" : "somewhat mitigates"} the impact of short-term market fluctuations.`,
        "Diversification across sectors and geographies can reduce unsystematic risk in your equity portfolio.",
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
        "Consider splitting between domestic and international ETFs to reduce home-country concentration risk.",
      ]
    },
    crypto: {
      title: "Cryptocurrency Market Dynamics",
      color: VIOLET,
      items: [
        "Cryptocurrency markets are highly volatile — returns can deviate significantly from projections in either direction.",
        `A ${params.returnRate}% return assumption for crypto is moderate; historical crypto returns have been extreme in both directions.`,
        "Regulatory risk remains significant — consider limiting crypto to a small percentage (5-15%) of your total portfolio.",
        "Cold storage and reputable exchanges are critical for security of crypto holdings.",
        "Consider dollar-cost averaging rather than lump-sum to manage volatility risk.",
      ]
    },
    bonds: {
      title: "Fixed Income Market Dynamics",
      color: [14, 116, 144],
      items: [
        `Bond yields are influenced by central bank rate decisions. Your ${params.returnRate}% return reflects current fixed income expectations.`,
        "Duration risk: longer-term bonds are more sensitive to interest rate changes.",
        "Investment-grade government bonds provide capital preservation, though with lower expected returns.",
        `At ${params.inflationRate}% inflation, your real return on bonds is approximately ${(params.returnRate - params.inflationRate).toFixed(1)}% — protect purchasing power.`,
      ]
    },
    gold: {
      title: "Gold Market Dynamics",
      color: AMBER,
      items: [
        "Gold historically acts as a hedge against inflation and currency devaluation — useful in diversified portfolios.",
        `Gold's long-term real return is approximately 1-2% above inflation. Your ${params.returnRate}% assumption may be optimistic for a gold-only strategy.`,
        "Gold generates no income (dividends/interest), so returns come purely from price appreciation.",
        "Consider gold as a 5-15% portfolio allocation alongside growth assets for risk management.",
      ]
    },
    property: {
      title: "Property Market Dynamics",
      color: EMERALD,
      items: [
        "Property provides both capital growth and rental yield income streams.",
        "Leverage through mortgages can amplify both gains and losses — manage debt levels carefully.",
        "Location, property type, and local market conditions have outsized impact on returns.",
        "Property is illiquid — factor in transaction costs (2-5%) when comparing to financial assets.",
      ]
    },
    mutual_funds: {
      title: "Managed Fund Dynamics",
      color: INDIGO,
      items: [
        `Active management fees can significantly impact net returns. Ensure your ${params.fees}% fee assumption accounts for all charges.`,
        "Compare fund performance against relevant benchmarks after fees before investing.",
        `With ${params.years} years, even a 0.5% reduction in annual fees could meaningfully improve final outcomes.`,
        "Diversified managed funds provide professional asset allocation and rebalancing.",
      ]
    },
    fixed_deposit: {
      title: "Fixed Deposit Dynamics",
      color: [14, 116, 144],
      items: [
        "Fixed deposits offer capital protection and guaranteed returns — ideal for low-risk investors.",
        `At ${params.inflationRate}% inflation, ensure your FD rate exceeds inflation to maintain purchasing power.`,
        "Consider laddering FDs across different term lengths to manage reinvestment risk.",
        "Government deposit guarantee schemes protect deposits up to specified limits.",
      ]
    },
  };

  sections.push(instrumentInsights[instrument] || instrumentInsights.stocks);

  sections.push({
    title: "Key Risks to Monitor",
    color: ROSE,
    items: [
      `Inflation Risk: At ${params.inflationRate}% inflation, your real return is ${(params.returnRate - params.inflationRate - params.fees).toFixed(1)}% — monitor inflation trends.`,
      `Sequence of Returns Risk: Poor returns early in your ${params.years}-year horizon can have outsized negative effects.`,
      "Concentration Risk: Avoid overweighting any single asset, sector, or geography.",
      `Fee Drag: Your ${params.fees}% annual fee reduces final value by approximately ${fmt(s.finalValue * params.fees / 100 * params.years, sym)} over the full period.`,
    ]
  });

  return sections;
}

function getTaxStrategies(instrument, params, s, sym) {
  const strategies = [];
  const taxSaving = Math.round(s.taxPaid * 0.2);

  strategies.push({
    title: "Tax-Deferred & Tax-Free Accounts",
    color: EMERALD,
    detail: `Maximise contributions to tax-advantaged accounts such as superannuation (Australia), 401k/IRA (USA), SIPP (UK), or equivalent. Deferring tax on ${fmt(s.totalReturns, sym)} in returns until retirement could significantly reduce your tax burden, as you may be in a lower tax bracket upon withdrawal.`,
    saving: `Up to ${fmt(taxSaving, sym)}`
  });

  strategies.push({
    title: "Capital Gains Tax Management",
    color: INDIGO,
    detail: `Your projected tax liability is ${fmt(s.taxPaid, sym)} at a ${params.taxRate}% rate. Holding investments for more than 12 months qualifies for the 50% CGT discount in Australia (and similar discounts in other jurisdictions), effectively reducing your CGT rate to ${(params.taxRate / 2).toFixed(1)}%. Staggering asset sales across tax years can also reduce annual taxable income.`,
    saving: `Up to ${fmt(s.taxPaid * 0.5, sym)} via CGT discount`
  });

  strategies.push({
    title: "Dividend & Income Management",
    color: VIOLET,
    detail: `Franked dividends (Australia) or qualified dividends (USA) receive preferential tax treatment. Structuring investments to maximise franked dividend income can reduce your effective tax rate. Consider holding income-generating assets in low-tax-rate entities or superannuation.`,
    saving: null
  });

  strategies.push({
    title: "Tax Loss Harvesting",
    color: AMBER,
    detail: `If some of your investments are at a loss, selling them to realise a capital loss can offset capital gains elsewhere in your portfolio. This strategy, known as tax-loss harvesting, can reduce your taxable gains by up to the amount of losses realised. Replace sold assets with similar (but not identical) investments to maintain portfolio exposure.`,
    saving: "Variable — up to full CGT offset"
  });

  strategies.push({
    title: "Spouse & Family Structures",
    color: [14, 116, 144],
    detail: `Splitting income-producing investments with a spouse in a lower tax bracket can reduce the household tax burden. Family trusts and company structures may also offer tax efficiency for high-net-worth investors — consult a tax professional to determine if these structures suit your situation.`,
    saving: null
  });

  if (instrument === "property") {
    strategies.push({
      title: "Negative Gearing & Depreciation",
      color: EMERALD,
      detail: `For investment properties, mortgage interest, maintenance, insurance, and depreciation (on building and fittings) are tax-deductible. Negative gearing allows property losses to offset other income, reducing your overall tax bill. A quantity surveyor's depreciation schedule can maximise deductible depreciation claims.`,
      saving: "Significant — consult a tax professional"
    });
  }

  return strategies;
}