import jsPDF from "jspdf";
import { format } from "date-fns";

const INDIGO    = [30, 41, 59]; // SLATE_800 style for header
const GOLD      = [197, 160, 89];
const EMERALD   = [16, 185, 129];
const ROSE      = [239, 68, 68];
const SLATE_900 = [15, 23, 42];
const SLATE_500 = [100, 116, 139];
const SLATE_200 = [226, 232, 240];
const SLATE_50  = [248, 250, 252];
const WHITE     = [255, 255, 255];

const fmt = (n) => {
  return "$" + (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export async function generateIncomeExpensePdf({ date, incomes, expenses, incomeTotal, expenseTotal, reportData }) {
  const pdf = new jsPDF("p", "mm", "a4");
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();
  const M = 16;
  const CW = PW - M * 2;

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const setFill   = (rgb) => pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  const setStroke = (rgb) => pdf.setDrawColor(rgb[0], rgb[1], rgb[2]);
  const setFont   = (color, size, style = "normal") => {
    pdf.setTextColor(color[0], color[1], color[2]);
    pdf.setFontSize(size);
    pdf.setFont("helvetica", style);
  };

  const drawFooter = () => {
    setStroke(SLATE_200);
    pdf.setLineWidth(0.3);
    pdf.line(M, PH - 12, PW - M, PH - 12);
    setFont(SLATE_500, 7);
    pdf.text("WealthLens Wealth Management  ·  Confidential Report", M, PH - 6);
    pdf.text(`Generated on ${format(new Date(), "dd MMM yyyy")}`, PW - M, PH - 6, { align: "right" });
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

  const metricCard = (x, y, w, label, value, color) => {
    const h = 24;
    roundedRect(x, y, w, h, 4, WHITE, SLATE_200);
    setFill(color);
    pdf.roundedRect(x, y, w, 1.5, 1, 1, "F");
    setFont(SLATE_500, 6, "bold");
    pdf.text(label.toUpperCase(), x + 5, y + 8);
    setFont(SLATE_900, 9, "bold");
    pdf.text(value, x + 5, y + 16);
    return h;
  };

  // ─── PAGE 1 ─────────────────────────────────────────────────────────────────
  setFill(SLATE_50);
  pdf.rect(0, 0, PW, PH, "F");
  drawFooter();

  // Header Banner
  roundedRect(M, M, CW, 45, 6, INDIGO);
  setFill(GOLD);
  pdf.triangle(PW - M - 50, M, PW - M, M, PW - M, M + 45, "F");

  setFont(WHITE, 8, "bold");
  pdf.text("WEALTHLENS FINANCIAL INTELLIGENCE", M + 8, M + 10);
  setFont(GOLD, 16, "bold");
  pdf.text("Income & Expense Report", M + 8, M + 24);
  setFont(SLATE_500, 8);
  pdf.text(`${format(date, "MMMM yyyy")} Performance  •  Consolidated View`, M + 8, M + 34);

  // Totals in Header
  setFont(GOLD, 7);
  pdf.text("MONTHLY SURPLUS", PW - M - 8, M + 14, { align: "right" });
  setFont(WHITE, 16, "bold");
  pdf.text(fmt(incomeTotal - expenseTotal), PW - M - 8, M + 28, { align: "right" });

  let y = M + 55;

  // Metric Cards
  const cards = [
    { label: "Total Income", value: fmt(incomeTotal), color: EMERALD },
    { label: "Total Spent",  value: fmt(expenseTotal), color: ROSE },
    { label: "Net Surplus",  value: fmt(incomeTotal - expenseTotal), color: GOLD },
    { label: "Savings Velocity", value: `${(( (incomeTotal - expenseTotal) / incomeTotal ) * 100).toFixed(1)}%`, color: [99, 102, 241] }
  ];
  const cardW = (CW - 6) / 4;
  cards.forEach((c, i) => metricCard(M + i * (cardW + 2), y, cardW, c.label, c.value, c.color));

  y += 35;

  // Table Setup
  setFont(SLATE_900, 10, "bold");
  pdf.text("Detailed Cash Flow Breakdown", M, y);
  setFill(GOLD);
  pdf.rect(M, y + 2, CW, 0.6, "F");
  y += 10;

  const cols = [
    { label: "Category", w: 70, align: "left" },
    { label: "Budgeted", w: 35, align: "right" },
    { label: "Actual", w: 35, align: "right" },
    { label: "Variance", w: 35, align: "right" }
  ];
  const tableX = M;

  // Table Header
  roundedRect(tableX, y, CW, 8, 2, INDIGO);
  let tx = tableX + 5;
  cols.forEach(col => {
    setFont(WHITE, 7, "bold");
    const pos = col.align === "right" ? tx + col.w - 5 : tx;
    pdf.text(col.label, pos, y + 5.5, { align: col.align });
    tx += col.w;
  });
  y += 10;

  const drawRow = (item, isSub = false) => {
    if (y > PH - 25) {
      drawFooter();
      pdf.addPage();
      setFill(SLATE_50);
      pdf.rect(0, 0, PW, PH, "F");
      drawFooter();
      y = M + 10;
    }

    const rowH = 7;
    setFill(WHITE);
    pdf.rect(tableX, y - 5, CW, rowH, "F");
    
    setStroke(SLATE_200);
    pdf.setLineWidth(0.1);
    pdf.line(tableX, y + 2, tableX + CW, y + 2);

    let cx = tableX + 5;
    const diff = Math.abs(item.budgeted) - Math.abs(item.actual);

    // Category
    setFont(item.isGroup ? SLATE_900 : SLATE_500, 7, item.isGroup ? "bold" : "normal");
    pdf.text((isSub ? "  " : "") + item.category.toUpperCase(), cx + (isSub ? 5 : 0), y);
    cx += cols[0].w;

    // Budgeted
    setFont(SLATE_500, 7);
    pdf.text(fmt(Math.abs(item.budgeted)), cx + cols[1].w - 5, y, { align: "right" });
    cx += cols[1].w;

    // Actual
    setFont(SLATE_900, 7, "bold");
    pdf.text(fmt(item.actual), cx + cols[2].w - 5, y, { align: "right" });
    cx += cols[2].w;

    // Variance
    setFont(diff >= 0 ? EMERALD : ROSE, 7, "bold");
    pdf.text(fmt(diff), cx + cols[3].w - 5, y, { align: "right" });

    y += rowH;
    if (item.isGroup && item.children) {
      item.children.forEach(child => drawRow(child, true));
    }
  };

  // Section: Income
  setFont(EMERALD, 8, "bold");
  pdf.text("SOURCE OF INCOME", M, y);
  y += 5;
  reportData.incomes.forEach(i => drawRow(i));

  y += 8;

  // Section: Expenses
  setFont(ROSE, 8, "bold");
  pdf.text("OPERATIONAL EXPENSES", M, y);
  y += 5;
  reportData.expenses.forEach(e => drawRow(e));

  y += 15;

  // End Summary Box
  roundedRect(M, y, CW, 15, 3, [241, 245, 249], SLATE_200);
  setFont(SLATE_900, 8, "bold");
  pdf.text("TOTAL MONTHLY SURPLUS", M + 6, y + 9);
  setFont(EMERALD, 10, "bold");
  pdf.text(fmt(incomeTotal - expenseTotal), PW - M - 6, y + 9, { align: "right" });

  const filename = `WealthLens_Income_Expense_${format(date, "MMM_yyyy")}.pdf`;
  const arrayBuffer = pdf.output("arraybuffer");
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'PDF Document', accept: {'application/pdf': ['.pdf']} }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch (err) {
    console.warn("showSaveFilePicker failed or was cancelled by user:", err);
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 1000);
}
