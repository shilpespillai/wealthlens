import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  Target,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid, ComposedChart, Legend, Line
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { calculateInvestment } from "@/components/calculator/calculationEngine";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  GripVertical, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ChevronDown, 
  Settings, 
  BarChart3, 
  Sparkles 
} from "lucide-react";
import { CategoryIcon } from "@/utils/iconMap";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { subDays, startOfWeek, endOfWeek, eachWeekOfInterval, eachDayOfInterval, eachMonthOfInterval, format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { calculatePortfolioHoldings, getPortfolioMetrics } from "@/api/portfolioEngine";
import { cn } from "@/lib/utils";


// Institutional Flattening Engine
const flattenBudgets = (items) => {
  let flat = [];
  if (!Array.isArray(items)) return flat;
  items.forEach(item => {
    flat.push(item);
    if (item.children && item.children.length > 0) {
      flat = [...flat, ...flattenBudgets(item.children)];
    }
  });
  return flat;
};

// Unified dashboard handles live data exclusively.
export function DashboardContent() {
  const { 
    parseCurrency, 
    formatAmount, 
    formatCurrencyShort, 
    getProductionLedger,
    normalizeTransactionData 
  } = useFinancialParser();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [params, setParams] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("spending");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  
  // Live Data States
  const [liveData, setLiveData] = useState({
    accounts: [],
    transactions: [],
    currentMonthTransactions: [],
    portfolio: [],
    budgets: [],
    currentMonthBudgets: []
  });

  const ASSET_THEMES = {
    'Cash & Savings': { color: '#6366f1', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
    'Stocks / ETFs': { color: '#14b8a6', bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-600' },
    'Property': { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
    'Crypto': { color: '#8b5cf6', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600' },
    'Liabilities': { color: '#f43f5e', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' },
    'Other': { color: '#64748b', bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-600' }
  };

  const [columns, setColumns] = useState({
    col1: ["accounts", "networth_card"],
    col2: ["transactions"],
    col3: ["bills"],
    col4: ["budgets_short", "velocity", "budgets_detailed"]
  });

  const results = useMemo(() => {
    if (!params) return null;
    return calculateInvestment(params);
  }, [params]);

  const fullData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Use real params for base projection
    const baseAmount = Number(params?.initialAmount) || 4473.01;
    const contribution = Number(params?.monthlyContribution) || 1500;
    
    // Use results summary if available for the 10-year view
    const yearlyProjection = results?.yearlyData || [];
    
    let currentBalance = baseAmount;
    if (isNaN(currentBalance)) currentBalance = 0;
    
    // Generate 365 days of "Real" simulated history and future
    for (let i = -180; i <= 365; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const isPast = i < 0;
      
      let earning = 0;
      let spending = 0;
      
      // Simulate monthly cycle for graph granularity
      if (d.getDate() === 1 || d.getDate() === 15) {
        earning = contribution / 2;
        currentBalance += earning;
      } else {
        // Distribute spending
        spending = (contribution * 0.7) / 28; 
        currentBalance -= spending;
      }

      // Add small random noise for "Authentic" look
      currentBalance += (Math.random() * 20 - 10);
      
      data.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d,
        timestamp: d.getTime(),
        earning: isPast ? earning : 0,
        spending: isPast ? spending : 0,
        balance: currentBalance,
        isFuture: i > 0,
        isToday: i === 0
      });
    }
    
    return data;
  }, [params, results]);

  const { historyData, stats, periodInfo } = useMemo(() => {
    let filtered = [...fullData];
    const now = new Date();
    const nowTime = now.getTime();
    
    // Focus Month Logic: Derived from the selected period to drive Budget Sync
    let focusMonthKey = format(now, 'yyyy-MM');
    if (selectedPeriod === "Last Month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      focusMonthKey = format(lastMonth, 'yyyy-MM');
    }
    
    let daysCutoff = -1;
    switch (selectedPeriod) {
       case "This Week": case "Last Week": case "Rolling Week": daysCutoff = 7; break;
       case "This Month": case "Last Month": case "Rolling Month": daysCutoff = 30; break;
       case "This Quarter": case "Last Quarter": case "Rolling Quarter": daysCutoff = 90; break;
       case "This Year": case "Last Year": case "Rolling Year": case "This Financial": case "Last Financial": daysCutoff = 365; break;
       default: daysCutoff = 180; break;
    }

    let startDate = nowTime - daysCutoff * 86400000;
    let endDate = nowTime;

    if (selectedPeriod.startsWith("Last ")) {
       startDate = nowTime - daysCutoff * 86400000 * 2;
       endDate = nowTime - daysCutoff * 86400000;
       filtered = fullData.filter(d => d.timestamp <= endDate && d.timestamp >= startDate);
    } else if (selectedPeriod.startsWith("This ")) {
       startDate = nowTime - (daysCutoff * 86400000 * 0.2);
       endDate = nowTime + (daysCutoff * 86400000 * 0.8);
       filtered = fullData.filter(d => d.timestamp >= startDate && d.timestamp <= endDate);
    } else if (selectedPeriod.startsWith("Rolling ")) {
       filtered = fullData.filter(d => d.timestamp >= startDate && d.timestamp <= endDate);
    } else {
       filtered = (fullData || []).filter(d => d.timestamp >= nowTime - 180 * 86400000 && d.timestamp <= nowTime + 180 * 86400000);
    }

    if (filtered.length < 2) {
       filtered = (fullData || []).filter(d => d.timestamp >= nowTime - 30 * 86400000 && d.timestamp <= nowTime);
    }

    let minVal = filtered[0]?.balance || 0;
    let maxVal = filtered[0]?.balance || 0;
    let earningTotal = 0;
    let spendingTotal = 0;

    filtered.forEach(d => {
       if (d.balance < minVal) minVal = d.balance;
       if (d.balance > maxVal) maxVal = d.balance;
       if (!d.isFuture) {
           earningTotal += d.earning;
           spendingTotal += d.spending;
       }
    });

    const startVal = filtered[0]?.balance || 0;
    const endVal = filtered[filtered.length - 1]?.balance || 0;
    const pctChange = startVal !== 0 ? ((endVal - startVal) / startVal) * 100 : 0;

    return { 
      historyData: filtered, 
      stats: { min: minVal, max: maxVal, change: pctChange, earningTotal, spendingTotal },
      periodInfo: { startDate, endDate, daysCutoff, focusMonthKey }
    };
  }, [fullData, selectedPeriod]);

  // Dynamic Period-Based Accounts (Balances as of periodInfo.endDate)
  // Treasury-Locked Accounts (Always stuck to LATEST truth)
  const periodAccounts = useMemo(() => {
    return (liveData.accounts || []).map(acc => ({ ...acc }));
  }, [liveData.accounts]);

  // Summarized Treasury Allocation — Portfolio by asset class + Cash (Always stuck to LATEST truth)
  const treasuryAllocation = useMemo(() => {
    const ASSET_LABELS = {
      property: 'Property',
      stocks: 'Stocks / ETFs',
      crypto: 'Crypto',
      bonds: 'Bonds',
      mutual_funds: 'Managed Funds',
      commodities: 'Commodities',
    };

    const groups = {};

    // 1. Cash bucket (Latest Truth)
    const cashTotal = periodAccounts
      .filter(acc => (Number(acc.base_balance || 0)) > 0)
      .reduce((sum, acc) => sum + (Number(acc.base_balance || 0)), 0);
    if (cashTotal > 0) groups['Cash & Savings'] = cashTotal;

    // 2. Liabilities & Debt (Latest Truth)
    const debtTotal = periodAccounts
      .filter(acc => (Number(acc.base_balance || 0)) < 0)
      .reduce((sum, acc) => sum + (Number(acc.base_balance || 0)), 0);
    if (debtTotal < 0) groups['Liabilities'] = debtTotal;

    // 3. Portfolio assets — Fixed to TODAY'S snapshot for Treasury stability
    const latestHoldings = calculatePortfolioHoldings(liveData.portfolio || [], new Date());

    latestHoldings.forEach(p => {
      const label = ASSET_LABELS[p.asset_class] || (p.asset_class ? p.asset_class.charAt(0).toUpperCase() + p.asset_class.slice(1) : 'Other');
      const val = Number(p.current_value || 0);
      if (val > 0) groups[label] = (groups[label] || 0) + val;
    });

    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [periodAccounts, liveData.portfolio]);

  // Summarized Ledger Trend
  const ledgerTrend = useMemo(() => {
    const txs = liveData.transactions || [];
    const filtered = txs.filter(t => {
      const d = new Date(t.date).getTime();
      return d >= periodInfo.startDate && d <= periodInfo.endDate;
    });

    const daily = {};
    filtered.forEach(t => {
      const dLabel = format(new Date(t.date), 'MMM dd');
      if (!daily[dLabel]) daily[dLabel] = { name: dLabel, income: 0, expense: 0 };
      const amt = Math.abs(Number(t.amount || 0));
      if (t.type === 'income') daily[dLabel].income += amt;
      else daily[dLabel].expense += amt;
    });

    return Object.values(daily).sort((a, b) => new Date(a.name) - new Date(b.name));
  }, [liveData.transactions, periodInfo, parseCurrency]);

  // 3. Live-Normalized Budget Data (Converged with Transactions Ledger)
  const normalizedMonthData = useMemo(() => {
    // Reconstruct a budget row object for normalizeTransactionData
    const budgetRow = { 
      month: periodInfo.focusMonthKey,
      payload: {
        // We need to re-structure the flattened budgets back into incomes/expenses if they were partitioned
        incomes: (liveData.currentMonthBudgets || []).filter(b => b.type === 'income'),
        expenses: (liveData.currentMonthBudgets || []).filter(b => b.type !== 'income')
      }
    };
    
    const focusDate = new Date(periodInfo.focusMonthKey + '-01');
    return normalizeTransactionData(budgetRow, focusDate, liveData.currentMonthTransactions || []);
  }, [liveData.currentMonthBudgets, liveData.currentMonthTransactions, periodInfo.focusMonthKey, normalizeTransactionData]);

  // Consumption Target summary ALWAYS anchored to the CURRENT MONTH'S PRE-CALCULATED STATE
  const budgetSummary = useMemo(() => {
    // 1. Filter for valid expense budgets from the CURRENT MONTH collection
    const expenseBudgets = normalizedMonthData.expenses || [];

    const categories = expenseBudgets.map(b => {
      const catName = b.category || b.name;
      
      // Precision extraction from the aligned schema (Live Aggregated)
      const spentValue = Number(b.amount || 0);
      const targetValue = Number(b.monthly_target || 0);
      
      return { 
        name: catName, 
        value: Math.abs(spentValue), 
        total: Math.abs(targetValue) 
      };
    });

    const totalAllocated = categories.reduce((sum, c) => sum + c.total, 0);
    const totalSpent = categories.reduce((sum, c) => sum + c.value, 0);
    const remaining  = Math.max(0, totalAllocated - totalSpent);

    return {
      totalAllocated,
      totalSpent,
      remaining,
      breakdown: [...categories, { name: 'Remaining', value: remaining, isRemaining: true }]
    };
  }, [normalizedMonthData]);

  // --- HOLISTIC LOGIC ---
  const { chartData, holisticMetrics } = useMemo(() => {
    // 1. Determine Dynamic Interval based on periodInfo
    const start = new Date(periodInfo.startDate);
    const end = new Date(periodInfo.endDate);
    const diffDays = periodInfo.daysCutoff;

    let intervals;
    let formatStr = 'MMM dd';
    if (diffDays <= 14) {
      intervals = eachDayOfInterval({ start, end });
      formatStr = 'MMM dd';
    } else if (diffDays <= 120) {
      intervals = eachWeekOfInterval({ start, end });
      formatStr = 'MMM dd';
    } else {
      intervals = eachMonthOfInterval({ start, end });
      formatStr = 'MMM yyyy';
    }
    
    // 2. Map Transactions into Intervals
    const transactions = liveData.transactions || [];
    const accounts = liveData.accounts || [];
    const portfolio = liveData.portfolio || [];
    const budgets = liveData.budgets || [];

    const buckets = intervals.map((intStart, idx) => {
      let intEnd;
      if (diffDays <= 14) intEnd = intStart; 
      else if (diffDays <= 120) intEnd = endOfWeek(intStart);
      else intEnd = endOfMonth(intStart);

      const periodTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= intStart && d <= intEnd;
      });

      const actualSpent = periodTx.reduce((sum, t) => {
        const amt = Math.abs(Number(t.amount || 0));
        return t.type === 'expense' ? sum + amt : sum;
      }, 0);

      const actualEarned = periodTx.reduce((sum, t) => {
        const amt = Math.abs(Number(t.amount || 0));
        return t.type === 'income' ? sum + amt : sum;
      }, 0);

      // Scale Budgets into Bucket Interval: 
      // If we're looking at a Month or more, we want the FULL Monthly target.
      // 4.333 is for Weekly views (diffDays <= 31 is roughly one month).
      const divisor = diffDays <= 7 ? 4.333 : (diffDays <= 31 ? 1 : (diffDays / 30));
      
      const totalMonthlyBudget = budgets
        .filter(b => b.type !== 'income' && !(b.children && b.children.length > 0)) // Only leaf nodes
        .reduce((sum, b) => {
          const val = Number(b.monthly_target || (typeof b.amount === 'string' ? b.amount.replace(/[^0-9.-]/g, '') : 0));
          return sum + val;
        }, 0);
      const bucketBudgetTarget = totalMonthlyBudget / divisor;

      const totalMonthlyIncomeTarget = budgets
        .filter(b => b.type === 'income')
        .reduce((sum, b) => {
          const val = Number(b.monthly_target || (typeof b.amount === 'string' ? b.amount.replace(/[^0-9.-]/g, '') : 0));
          return sum + val;
        }, 0);
      const bucketIncomeTarget = totalMonthlyIncomeTarget / divisor;

      return {
        name: format(intStart, formatStr),
        intStart,
        actualSpent,
        actualEarned,
        budgetSpent: bucketBudgetTarget,
        budgetEarned: bucketIncomeTarget,
        variance: bucketBudgetTarget - actualSpent,
        health: actualSpent > bucketBudgetTarget ? 'over' : 'under'
      };
    });

    // 3. Holistic Health Calculations (Institutional AR Anchor)
    // We use the LATEST data for the Treasury Hub, not historical snapshots.
    const latestAccounts = liveData.accounts || [];
    
    const totalLiquidOnly = latestAccounts
      .filter(a => Number(a.base_balance || 0) > 0)
      .reduce((sum, a) => sum + Number(a.base_balance || 0), 0);
    
    // Total Invested (Latest Snapshot)
    const latestPortfolio = calculatePortfolioHoldings(liveData.portfolio || [], new Date());
    const totalInvested = latestPortfolio.reduce((sum, p) => sum + (Number(p.current_value) || 0), 0);
      
    const netWorth = latestAccounts.reduce((sum, a) => sum + (Number(a.base_balance || a.balance || 0)), 0) + totalInvested;

    const avgMonthlySpend = budgets.reduce((sum, b) => b.type !== 'income' ? sum + Number(b.monthly_target || 0) : sum, 0) || 5000;
    const cashRunway = avgMonthlySpend > 0 ? totalLiquidOnly / avgMonthlySpend : 0;

    // Income & Spend scoped to the SELECTED PERIOD (not hardcoded 30 days)
    const periodStart = new Date(periodInfo.startDate);
    const periodEnd   = new Date(periodInfo.endDate);
    const periodTxAll = (liveData.transactions || []).filter(t => {
      const d = new Date(t.date);
      return d >= periodStart && d <= periodEnd;
    });

    // Spend & Income logic: Use budgetSummary totals if viewing the Current Month horizon
    const isCurrentMonthHorizon = selectedPeriod === 'This Month';
    
    // 4. Scoping for Treasury Metrics (Anchor to Today's Month via Normalized Store)
    const incomeCurrent = (normalizedMonthData.incomes || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
    const spendCurrent  = budgetSummary.totalSpent;
    
    const savingsRate  = incomeCurrent > 0 ? ((incomeCurrent - spendCurrent) / incomeCurrent) * 100 : 0;

    let score = 50;
    score += Math.min(25, (savingsRate > 0 ? (savingsRate / 40) * 25 : 0));
    score += Math.min(25, (cashRunway / 6) * 25);

    return {
      chartData: buckets,
      holisticMetrics: {
        totalLiquid: totalLiquidOnly,
        totalInvested,
        netWorth,
        cashRunway,
        wealthScore: Math.round(score),
        income30: incomeCurrent,
        spend30: spendCurrent,
        burnRate: spendCurrent
      }
    };
  }, [liveData.accounts, liveData.transactions, liveData.currentMonthBudgets, budgetSummary, periodInfo, parseCurrency]);

  const currentPeriodMetrics = useMemo(() => {
    return {
      earning: holisticMetrics.income30,
      spending: holisticMetrics.spend30,
      difference: holisticMetrics.income30 - holisticMetrics.spend30,
      savingsRate: holisticMetrics.income30 > 0 ? ((holisticMetrics.income30 - holisticMetrics.spend30) / holisticMetrics.income30) * 100 : 0
    };
  }, [holisticMetrics]);

  // Utility: Unified Budget Parser
  const extractBudgetData = (payload) => {
    if (!payload) return [];
    if (payload.visualData) return flattenBudgets(payload.visualData);
    if (payload.incomes || payload.expenses) {
      return [...(payload.incomes || []), ...(payload.expenses || [])];
    }
    return [];
  };

  // Effect 1: Static Profile Initialization (Mount Only)
  useEffect(() => {
    async function initProfile() {
      try {
        console.log("[Dashboard] Initializing Static Profile...");
        const user = await base44.auth.me();
        
        const dbAccounts = await base44.db.getTable('user_accounts');
        const dbPortfolio = await base44.db.getTable('portfolio_holdings');
        const dbBudgets = await base44.db.getTable('budgets');

        if (user?.calc_params) {
          const parsedParams = JSON.parse(user.calc_params);
          setParams(parsedParams);
          if (parsedParams.dashboard_layout) {
            setColumns(parsedParams.dashboard_layout);
          }
        }

        const currentMonthFocus = format(new Date(), 'yyyy-MM');
        const currentMonthRow = dbBudgets?.find(b => b.month === currentMonthFocus) || 
                                [...dbBudgets].sort((a, b) => b.month.localeCompare(a.month))[0];
        
        const currentMonthTx = await getProductionLedger({ month: currentMonthFocus });

        setLiveData(prev => ({
          ...prev,
          accounts: dbAccounts || [],
          portfolio: dbPortfolio || [],
          currentMonthTransactions: currentMonthTx || [],
          currentMonthBudgets: extractBudgetData(currentMonthRow?.payload)
        }));
      } catch (err) {
        console.error("Profile initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initProfile();
  }, []);

  // Effect 2: Dynamic Horizon Synchronization
  useEffect(() => {
    async function syncHorizon() {
      if (isLoading) return; // Wait for profile
      try {
        console.log("[Dashboard] Syncing Horizon Data...", periodInfo.startDate, periodInfo.endDate);
        
        const horizonTx = await getProductionLedger({ 
          startDate: periodInfo.startDate, 
          endDate: periodInfo.endDate 
        }); 

        const dbBudgets = await base44.db.getTable('budgets');
        const horizonRow = dbBudgets?.find(b => b.month === periodInfo.focusMonthKey) || 
                           [...dbBudgets].sort((a, b) => b.month.localeCompare(a.month))[0];

        setLiveData(prev => ({
          ...prev,
          transactions: horizonTx || [],
          budgets: extractBudgetData(horizonRow?.payload)
        }));
      } catch (err) {
        console.error("Horizon synchronization error:", err);
      }
    }
    syncHorizon();
  }, [periodInfo.startDate, periodInfo.endDate, periodInfo.focusMonthKey]);

  const saveLayout = async (newColumns) => {
    try {
      const user = await base44.auth.me();
      if (user) {
        const currentParams = user.calc_params ? JSON.parse(user.calc_params) : {};
        await base44.auth.updateMe({
          calc_params: JSON.stringify({ ...currentParams, dashboard_layout: newColumns })
        });
      }
    } catch (err) {
      console.error("Failed to save layout:", err);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newPanelIds = Array.from(start);
      newPanelIds.splice(source.index, 1);
      newPanelIds.splice(destination.index, 0, result.draggableId);

      const newColumns = { ...columns, [source.droppableId]: newPanelIds };
      setColumns(newColumns);
      saveLayout(newColumns);
      return;
    }

    // Moving from one column to another
    const startPanelIds = Array.from(start);
    startPanelIds.splice(source.index, 1);
    const newStart = startPanelIds;

    const finishPanelIds = Array.from(finish);
    finishPanelIds.splice(destination.index, 0, result.draggableId);
    const newFinish = finishPanelIds;

    const newColumns = {
      ...columns,
      [source.droppableId]: newStart,
      [destination.droppableId]: newFinish,
    };
    setColumns(newColumns);
    saveLayout(newColumns);
  };


  const netWorthData = useMemo(() => {
    if (!results || !results.yearlyData) return [];
    return (results.yearlyData || []).map((d, i) => ({
      year: d.year,
      value: Number(d.nominalValue || d.balance || 0),
      isProjected: i > 0
    }));
  }, [results]);

  // Group transactions for the receipt-style view
  const groupedTransactions = useMemo(() => {
    const groups = {};
    liveData.transactions.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [liveData.transactions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-wealthBackground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-futureBlue"></div>
      </div>
    );
  }

  const renderPanel = (panelId) => {
    switch (panelId) {
      case "accounts":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-purple-600 w-full" />
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                  <Wallet className="w-3.5 h-3.5 text-purple-600" />
                  Your Treasury
                </h3>
                <Link to="/Portfolio" className="text-[8px] font-black uppercase text-purple-500 hover:text-purple-400 transition-colors tracking-widest">Manage Assets</Link>
              </div>

              <div className="h-[220px] w-full mb-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={treasuryAllocation}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {treasuryAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ASSET_THEMES[entry.name]?.color || ASSET_THEMES['Other'].color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const theme = ASSET_THEMES[payload[0].name] || ASSET_THEMES['Other'];
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
                              <p className={cn("text-xs font-black", theme.text.replace('text-', 'text-[#'))}>{formatAmount(payload[0].value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Strategic Net Worth</p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrencyShort(holisticMetrics.netWorth)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {treasuryAllocation.slice(0, 6).map((acc, i) => {
                  const theme = ASSET_THEMES[acc.name] || ASSET_THEMES['Other'];
                  return (
                    <div key={i} className={cn(
                      "flex flex-col p-2 rounded-xl border transition-all hover:scale-[1.02] active:scale-95 cursor-pointer",
                      theme.bg, theme.border
                    )}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.color }} />
                        <span className={cn("text-[7px] font-black uppercase tracking-tighter truncate", theme.text)}>
                          {acc.name}
                        </span>
                      </div>
                      <span className={cn("text-[10px] font-black", theme.text)}>
                        {formatAmount(acc.value)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Calculation</span>
                <span className="text-lg font-black text-slate-900 tracking-tighter">{formatCurrencyShort(holisticMetrics.netWorth)}</span>
              </div>
            </div>
          </div>
        );
      case "networth_card":
        const projectionValue = results?.finalAmount || 1200000;
        const years = params?.years || 10;
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-all duration-700" />
             <div className="flex items-center justify-center gap-2 mb-4">
               <Sparkles className="w-3 h-3 text-indigo-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Wealth Projection ({years}Y)</p>
             </div>
             <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter group-hover:scale-105 transition-transform duration-500">{formatCurrencyShort(projectionValue)}</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-8">
               Est. at {params?.expectedReturn || 7}% annual return
             </p>
             <Link to="/Calculator">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest py-7 rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                Adjust Model Parameters
              </Button>
             </Link>
          </div>
        );
      case "transactions":
        const recentTxs = [...(liveData?.transactions || [])]
           .sort((a, b) => new Date(b.date || b.actualDate) - new Date(a.date || a.actualDate))
           .slice(0, 5);

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-purple-600 w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-600" />
                  Live Ledger
                </h3>
                <Link to="/FamilyBudget" className="text-[8px] font-black uppercase text-purple-500 hover:text-purple-400 transition-colors tracking-widest">Explore Activity</Link>
              </div>

              <div className="space-y-4 mb-8 h-[280px] overflow-hidden">
                 {recentTxs.length > 0 ? recentTxs.map((tx, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm", tx.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-200 text-slate-800")}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5 text-rose-500" />}
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-800 leading-tight">{tx.merchant || tx.category}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">{tx.category} • {format(new Date(tx.date || tx.actualDate), "MMM dd")}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className={cn("text-xs font-black tracking-tighter", tx.type === 'income' ? "text-teal-600" : "text-rose-600")}>
                            {tx.type === 'income' ? '+' : "-"}{formatAmount(Math.abs(Number(tx.amount || 0)))}
                         </p>
                         {tx.spend_type && (
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{tx.spend_type}</p>
                         )}
                      </div>
                   </div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                      <Receipt className="w-8 h-8 text-slate-200 mb-2" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No recent ledger data</p>
                   </div>
                 )}
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                <div>
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Gross Inflow</p>
                  <p className="text-xs font-black text-emerald-400">{formatAmount(ledgerTrend.reduce((s, d) => s + d.income, 0))}</p>
                </div>
                <div className="w-px h-6 bg-slate-800" />
                <div className="text-right">
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Gross Outflow</p>
                  <p className="text-xs font-black text-rose-400">{formatAmount(ledgerTrend.reduce((s, d) => s + d.expense, 0))}</p>
                </div>
              </div>
              
            </div>
          </div>
        );
      case "bills":
        const upcomingBills = liveData.budgets
          .filter(b => (b.type === 'fixed' || b.spend_type === 'fixed') && Number(b.monthly_target || 0) > 0)
          .map(b => ({
            name: b.category || b.name,
            amount: Number(b.monthly_target || 0),
            status: "upcoming"
          }));

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Liabilities & Bills
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {upcomingBills.length > 0 ? (
                  <div>
                    <div className="bg-amber-50/50 px-3 py-1 rounded-lg border border-amber-100/50 mb-4 inline-block">
                       <p className="text-[7px] font-black text-amber-700 uppercase tracking-[0.2em] leading-none">Strategic Obligations</p>
                    </div>
                    <div className="space-y-0.5">
                      {upcomingBills.map((b, i) => (
                        <div key={i} className="flex justify-between p-2.5 text-[11px] items-center hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full shrink-0 bg-amber-400 shadow-sm shadow-amber-400/50" />
                            <span className="font-bold text-slate-700 leading-none">{b.name}</span>
                          </div>
                          <span className="font-black text-rose-600 tracking-tighter">{formatAmount(b.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center opacity-40">
                    <Zap className="w-10 h-10 mb-4 text-slate-300 stroke-[1]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">No upcoming fixed<br/>obligations detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case "budgets_short":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-purple-600 w-full" />
            <div className="p-8">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                     <Target className="w-4 h-4 text-purple-600" />
                     Category Targets
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
                </div>

              <div className="h-[240px] w-full mb-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetSummary.breakdown}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {budgetSummary.breakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isRemaining ? '#0f172a' : [
                            '#8b5cf6', // Violet
                            '#10b981', // Emerald
                            '#f59e0b', // Amber
                            '#3b82f6', // Blue
                            '#ec4899', // Pink
                            '#06b6d4'  // Cyan
                          ][index % 6]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].name}</p>
                              <p className="text-sm font-black text-white">{formatAmount(payload[0].value)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilized</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">
                    {budgetSummary.totalAllocated > 0 ? ((budgetSummary.totalSpent / budgetSummary.totalAllocated) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Total Budgeted</span>
                  <span className="text-slate-900">{formatAmount(budgetSummary.totalAllocated)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Actually Spent</span>
                  <span className="text-rose-500">{formatAmount(budgetSummary.totalSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "velocity":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-emerald-500 w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Savings Velocity
                </h3>
              </div>
              
              <div className="h-[180px] w-full relative mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, bottom: 0 }}>
                    <Pie
                      data={[
                        { name: 'Velocity', value: Math.max(0, currentPeriodMetrics.savingsRate) },
                        { name: 'Empty', value: Math.max(0, 100 - currentPeriodMetrics.savingsRate) }
                      ]}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                      cx="50%"
                      cy="100%"
                    >
                      <Cell fill={currentPeriodMetrics.savingsRate > 30 ? '#10B981' : currentPeriodMetrics.savingsRate > 15 ? '#F59E0B' : '#EF4444'} />
                      <Cell fill="#f8fafc" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
                  <p className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">
                    {currentPeriodMetrics.savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{currentPeriodMetrics.savingsRate > 30 ? 'Elite Performance' : currentPeriodMetrics.savingsRate > 15 ? 'Competitive' : 'Developing'}</p>
                </div>
              </div>
               <div className="space-y-4 pt-8 border-t border-slate-50">
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                   <span className="text-slate-400">Total Inflow</span>
                   <span className="text-emerald-600 font-black">{formatAmount(holisticMetrics.income30)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest">
                   <span className="text-slate-400">Total Outflow</span>
                   <span className="text-red-500 font-black">({formatAmount(holisticMetrics.spend30)})</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "budgets_detailed":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-purple-600 w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-800 flex items-center gap-2">
                     <Target className="w-4 h-4 text-purple-600" />
                     Consumption Targets
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')}</p>
                </div>
                <Link to="/SetBudget" className="text-[9px] font-black uppercase text-purple-600 hover:opacity-70 border-b border-purple-600/20 pb-0.5">Budget Planner</Link>
              </div>

              <div className="space-y-6">
                {budgetSummary.breakdown.filter(b => !b.isRemaining).slice(0, 5).map((b, i) => {
                  const perc = b.total > 0 ? Math.min(100, (b.value / b.total) * 100) : 0;

                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-tight items-end">
                          <div className="flex items-center gap-2">
                             <CategoryIcon 
                               iconId={b.iconId || b.icon_id} 
                               category={b.name} 
                               className="w-3.5 h-3.5" 
                             />
                             <span className="text-slate-800">{b.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase">{perc > 100 ? 'Budget Exceeded' : 'On Track'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${perc}%` }}
                            transition={{ duration: 1, delay: i*0.1 }}
                            className={`h-full ${perc > 100 ? 'bg-rose-500' : 'bg-purple-600'}`} 
                          />
                      </div>
                      <div className="flex justify-between text-[10px] font-black tracking-tight text-slate-500">
                          <span>{b.total > 0 ? perc.toFixed(0) : "0"}% used</span>
                          <span>{formatAmount(b.value)} / {formatAmount(b.total)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated && !isLoadingAuth && !isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* Top Section: Net Worth Hero */}
      <section className="bg-white border-b border-slate-200 pt-10 shadow-sm mb-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
        <div className="max-w-[1550px] mx-auto px-6 sm:px-10 pb-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black tracking-widest text-indigo-600 border border-indigo-500/20 uppercase">Treasury Command</span>
                </div>
                <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                  {formatCurrencyShort(holisticMetrics.netWorth)}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-slate-500 text-sm font-semibold tracking-tight">Real-Time Strategic Assets</p>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-md text-emerald-600 border border-emerald-500/20">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-black tracking-tight uppercase">+ {currentPeriodMetrics.savingsRate.toFixed(1)}% Saving Velocity</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-12 sm:gap-20">
                <div className="space-y-1 group cursor-help">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Wealth Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{holisticMetrics.wealthScore}</span>
                    <span className="text-xs font-black text-indigo-500">/ 100</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${holisticMetrics.wealthScore}%` }} />
                  </div>
                </div>
                
                <div className="space-y-1 group cursor-help">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-emerald-600 transition-colors">Cash Runway</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{holisticMetrics.cashRunway.toFixed(1)}</span>
                    <span className="text-xs font-black text-emerald-600 uppercase">Months</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, (holisticMetrics.cashRunway / 12) * 100)}%` }} />
                  </div>
                </div>

                <div className="space-y-1 group cursor-help">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-amber-600 transition-colors">30D burn</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{formatCurrencyShort(holisticMetrics.spend30)}</span>
                    <span className="text-xs font-black text-amber-500 uppercase">Used</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (holisticMetrics.spend30 / Math.max(1, holisticMetrics.income30)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-6 h-full justify-between pb-2">
              <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl shadow-slate-200 min-w-[200px]">
                <p className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Selected Time Horizon</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center justify-between w-full group py-1 border-b border-white/10 hover:border-white/30 transition-all">
                      <span className="text-sm font-bold text-white tracking-tight">{selectedPeriod}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0 border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="end">
                    <div className="grid grid-cols-3 bg-white">
                      {[
                        { title: "NOW", items: ["This Week", "This Month", "This Quarter", "This Year", "This Financial", "Custom Range"] },
                        { title: "PAST", items: ["Last Week", "Last Month", "Last Quarter", "Last Year", "Last Financial"] },
                        { title: "ROLL BACK", items: ["Rolling Week", "Rolling Month", "Rolling Quarter", "Rolling Year"] }
                      ].map((section, idx) => (
                        <div key={idx} className={`p-4 ${idx < 2 ? 'border-r border-slate-100' : ''}`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{section.title}</p>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <button 
                                key={item} 
                                onClick={() => setSelectedPeriod(item)}
                                className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedPeriod === item ? 'bg-[#00A381] text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="mt-3 flex items-center justify-end">
                  <Settings className="w-4 h-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          
              <div className="w-full flex-1 flex flex-col mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Spending Performance: {selectedPeriod}</p>
              </div>
              
              <div className="flex items-center gap-12 text-center">
                <div className="px-6 text-center border-r border-slate-200 last:border-0">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Total Earned</p>
                  <p className="text-sm font-black text-teal-600">{formatAmount(holisticMetrics.income30)}</p>
                </div>
                <div className="px-6 text-center border-r border-slate-200 last:border-0">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Total Spent</p>
                  <p className="text-sm font-black text-red-600">{formatAmount(holisticMetrics.spend30)}</p>
                </div>
                <div className="px-6 text-center border-r border-slate-200 last:border-0">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Net Cashflow</p>
                  <p className={`text-sm font-black ${(holisticMetrics.income30 - holisticMetrics.spend30) >= 0 ? 'text-teal-600' : 'text-red-600'}`}>
                    {formatAmount(holisticMetrics.income30 - holisticMetrics.spend30)}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-[280px] p-6 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{top: 10, right: 10, left: 10, bottom: 0}}>
                  <defs>
                    <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/5 p-4 rounded-xl shadow-2xl min-w-[200px]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Period: {label}</p>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400">Actual Spending</span>
                                <span className="text-sm font-black text-red-500">{formatAmount(data.actualSpent)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400">Budget Target</span>
                                <span className="text-sm font-black text-emerald-400">{formatAmount(data.budgetSpent)}</span>
                              </div>
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400">Net Variance</span>
                                <span className={`text-sm font-black ${data.variance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {data.variance >= 0 ? '+' : ''}{formatAmount(data.variance)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    content={({ payload }) => (
                      <div className="flex gap-4 justify-end mb-4">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                  <Bar 
                    dataKey="actualEarned" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    barSize={12}
                    name="Gross Income"
                  />
                  <Bar 
                    dataKey="actualSpent" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                    barSize={12}
                    name="Actual Expenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budgetSpent" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Budget Target"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1550px] mx-auto px-6 sm:px-10">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(columns).map(([colId, panelIds]) => (
              <Droppable key={colId} droppableId={colId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-8 min-h-[100px]"
                  >
                    {panelIds.map((panelId, index) => (
                      <Draggable key={panelId} draggableId={panelId} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative group transition-all ${snapshot.isDragging ? 'z-50' : ''}`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="absolute top-4 right-4 z-10 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-slate-100 rounded-md"
                            >
                              <GripVertical className="w-4 h-4 text-slate-400" />
                            </div>
                            {renderPanel(panelId)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
