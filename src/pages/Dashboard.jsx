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
  BarChart, Bar, CartesianGrid
} from "recharts";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { calculateInvestment } from "@/components/calculator/calculationEngine";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Bot, CheckCircle2, AlertCircle, Calendar, ChevronDown, Settings, BarChart3, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Standard formatting
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

// Mock data for initial empty states
const MOCK_ACCOUNTS = [
  { name: "Main Transaction", balance: 3547.45, type: "cash", change: 2.4 },
  { name: "Savings Vault", balance: 12400.00, type: "saving", change: 0.5 },
  { name: "Portfolio Index", balance: 45600.00, type: "investment", change: 7.2 },
  { name: "Credit Card", balance: -2345.54, type: "debt", change: -1.2 },
];

const MOCK_TRANSACTIONS = [
  { date: "APR 8", name: "The Fix Cafe", amount: -8.00, category: "Variable" },
  { date: "APR 7", name: "Salary Deposit", amount: 2400.00, category: "Income" },
  { date: "APR 7", name: "Movenpick", amount: -15.40, category: "Variable" },
  { date: "APR 6", name: "Rent Payment", amount: -1800.00, category: "Fixed" },
];

const MOCK_BILLS = [
  { name: "Rent / Mortgage", amount: 1800.00, dueDate: "Overdue", status: "overdue" },
  { name: "Electricity Utility", amount: 145.20, dueDate: "APR 12", status: "upcoming" },
  { name: "Council Rates", amount: 450.00, dueDate: "Paid", status: "paid" },
];

export function DashboardContent() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [params, setParams] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("Last Quarter");
  const [viewMode, setViewMode] = useState("spending"); // 'spending' or 'networth'
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

  const { historyData, stats } = useMemo(() => {
    let filtered = [...fullData];
    const now = new Date();
    const nowTime = now.getTime();
    
    // Determine cutoff window based on selectedPeriod
    let daysCutoff = -1;
    switch (selectedPeriod) {
       case "This Week": case "Last Week": case "Rolling Week": daysCutoff = 7; break;
       case "This Month": case "Last Month": case "Rolling Month": daysCutoff = 30; break;
       case "This Quarter": case "Last Quarter": case "Rolling Quarter": daysCutoff = 90; break;
       case "This Year": case "Last Year": case "Rolling Year": case "This Financial": case "Last Financial": daysCutoff = 365; break;
       default: daysCutoff = 180; break;
    }

    if (selectedPeriod.startsWith("Last ")) {
       // Look back to the previous window block
       filtered = fullData.filter(d => d.timestamp <= nowTime - daysCutoff * 86400000 && d.timestamp >= nowTime - daysCutoff * 86400000 * 2);
    } else if (selectedPeriod.startsWith("This ")) {
       // Look back a short bit, and project forward to complete the "current" window
       filtered = fullData.filter(d => d.timestamp >= nowTime - (daysCutoff * 86400000 * 0.2) && d.timestamp <= nowTime + (daysCutoff * 86400000 * 0.8));
    } else if (selectedPeriod.startsWith("Rolling ")) {
       // Exact backward lookup stopping exactly today
       filtered = fullData.filter(d => d.timestamp >= nowTime - daysCutoff * 86400000 && d.timestamp <= nowTime);
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
      stats: { 
        min: minVal, 
        max: maxVal, 
        change: pctChange,
        earningTotal,
        spendingTotal
      }
    };
  }, [fullData, selectedPeriod]);

  // Real data metrics derived from results and budgetData
  const currentPeriodMetrics = useMemo(() => {
    const parseCurrency = (str) => {
      if (!str || typeof str !== 'string') return 0;
      const cleaned = str.replace(/[^0-9.-]+/g, "");
      return parseFloat(cleaned) || 0;
    };

    // 1. Get Income from budgetData
    const budgetIncome = (Array.isArray(budgetData) ? budgetData : []).reduce((sum, item) => {
      if (item.type === "income") return sum + parseCurrency(item.amount);
      return sum;
    }, 0) || 0;

    // 2. Get Spending from budgetData
    const budgetSpending = (Array.isArray(budgetData) ? budgetData : []).reduce((sum, item) => {
      if (item.type === "item" || item.type === "group") {
        if (item.id === "income") return sum;
        return sum + parseCurrency(item.amount);
      }
      return sum;
    }, 0) || 0;

    // 3. Fallback to params if budgetData is empty
    const finalEarning = budgetIncome > 0 ? budgetIncome : (params?.monthlyContribution || 5000);
    const finalSpending = budgetSpending > 0 ? budgetSpending : 3500; // Mock fallback for reasonable diff

    return {
      earning: finalEarning || 0,
      spending: finalSpending || 0,
      difference: (finalEarning || 0) - (finalSpending || 0),
      savingsRate: (finalEarning > 0) ? (((finalEarning - finalSpending) / finalEarning) * 100) : 0
    };
  }, [params, budgetData]);

  useEffect(() => {
    async function initDashboard() {
      try {
        console.log("[Dashboard] Initializing Dashboard...");
        const user = await base44.auth.me();
        console.log("[Dashboard] Auth user fetched:", user?.email);
        
        if (user?.calc_params) {
          console.log("[Dashboard] Loading calc_params from Supabase...");
          const parsedParams = JSON.parse(user.calc_params);
          setParams(parsedParams);
          if (parsedParams.dashboard_layout) {
            setColumns(parsedParams.dashboard_layout);
          }
        } else {
          console.log("[Dashboard] No Supabase params found, trying local...");
          const localCalc = localStorage.getItem("wealthlens-calc-state");
          if (localCalc) {
            try {
              const parsed = JSON.parse(localCalc);
              if (parsed?.params) {
                console.log("[Dashboard] Found local params.");
                setParams(parsed.params);
              }
            } catch (e) { console.error("Malformed local calculator data", e); }
          }
        }

        const budgetKey = `wealthlens-budget-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
        console.log("[Dashboard] Loading budget data for:", budgetKey);
        const localBudget = localStorage.getItem(budgetKey);
        if (localBudget) {
          console.log("[Dashboard] Found local budget data.");
          setBudgetData(JSON.parse(localBudget));
        }

      } catch (err) {
        console.error("Dashboard initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initDashboard();
  }, []);

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
    // Ensure values are numbers and handle the projection mapping
    return (results.yearlyData || []).map((d, i) => ({
      year: d.year,
      value: Number(d.nominalValue || d.balance || 0) + (Math.random() * 2000 - 1000),
      isProjected: i > 0
    }));
  }, [results]);

  // Group transactions for the receipt-style view
  const groupedTransactions = useMemo(() => {
    const groups = {};
    MOCK_TRANSACTIONS.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, []);

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
        const accounts = [
          { name: "Investment Account", balance: params?.initialAmount || 0, type: "investment", change: 4.2 },
          { name: "Monthly Flow", balance: currentPeriodMetrics.difference, type: "cash", change: 1.5 },
          { name: "Liquid Assets", balance: (params?.initialAmount || 0) * 0.1, type: "saving", change: 0.2 },
        ];
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-textPrimary flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-accentPurpleDark" />
                  Your Accounts
                </h3>
                <Link to="/Portfolio" className="text-[9px] font-medium uppercase text-accentPurpleDark hover:opacity-70 border-b border-accentPurpleDark/20 pb-0.5">See more</Link>
              </div>

              <div className="space-y-6">
                {accounts.map((acc, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer transition-transform hover:translate-x-1">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${acc.type === 'debt' ? 'bg-negativeRed/5 text-negativeRed' : 'bg-positiveGreen/5 text-positiveGreen'}`}>
                        {acc.type === 'debt' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-textPrimary">{acc.name}</p>
                        <p className={`text-[9px] font-medium uppercase tracking-tight ${acc.change > 0 ? 'text-positiveGreen' : 'text-negativeRed'}`}>
                          {acc.change > 0 ? '+' : ''}{acc.change}% Period
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-medium tracking-tight ${acc.balance < 0 ? 'text-negativeRed' : 'text-positiveGreen'}`}>
                      {acc.balance < 0 ? `(${formatCurrency(Math.abs(acc.balance))})` : formatCurrency(acc.balance)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
                 <span className="text-[10px] font-medium uppercase text-textSecondary tracking-widest">Aggregate</span>
                 <span className="text-xl font-medium text-textPrimary tracking-tight">{formatCurrency(accounts.reduce((s, a) => s + a.balance, 0))}</span>
              </div>
            </div>
          </div>
        );
      case "networth_card":
        return (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center relative overflow-hidden transition-all hover:border-accentPurple/30">
             <div className="absolute top-0 right-0 w-20 h-20 bg-accentPurple/5 rounded-full -mr-10 -mt-10" />
             <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-textSecondary mb-2">Total Net Worth</p>
             <h2 className="text-4xl font-serif font-medium text-textPrimary mb-6">{formatCurrency(results?.summary?.finalValue || results?.summary?.totalTarget || 245000)}</h2>
             <Link to="/Calculator">
              <Button variant="outline" className="w-full border-accentPurple text-accentPurpleDark hover:bg-accentPurple/5 font-medium text-[10px] uppercase tracking-widest py-6 rounded-lg transition-all">
                Update Projection
              </Button>
             </Link>
          </div>
        );
      case "transactions":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-textPrimary flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-accentPurpleDark" />
                  Recent Transactions
                </h3>
                <Link to="/FamilyBudget" className="text-[9px] font-medium uppercase text-accentPurpleDark hover:opacity-70 border-b border-accentPurpleDark/20 pb-0.5">View statement</Link>
              </div>

              <div className="space-y-6">
                {Object.entries(groupedTransactions).map(([date, transactions], dateIdx) => {
                  const headerColors = [
                    { bg: 'bg-accentPurple/20', text: 'text-accentPurpleDark' },
                    { bg: 'bg-futureBlue/20', text: 'text-futureBlue' },
                    { bg: 'bg-primaryGreen/20', text: 'text-primaryGreen' }
                  ];
                  const color = headerColors[dateIdx % headerColors.length];
                  
                  return (
                    <div key={date} className="space-y-1">
                      <div className={`${color.bg} px-4 py-1.5 rounded-md`}>
                        <p className={`text-[10px] font-medium ${color.text} uppercase tracking-widest`}>{date}</p>
                      </div>
                      <div className="space-y-1">
                        {transactions.map((tx, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 hover:bg-wealthBackground rounded-lg transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                tx.category === 'Income' ? 'bg-positiveGreen' : 
                                tx.category === 'Fixed' ? 'bg-futureBlue' : 
                                'bg-accentPurpleDark'
                              }`} />
                              <p className="text-sm font-medium text-textPrimary leading-none">{tx.name}</p>
                            </div>
                            <p className={`text-sm font-medium tracking-tight ${tx.amount > 0 ? 'text-positiveGreen' : 'text-negativeRed'}`}>
                              {tx.amount < 0 ? `(${formatCurrency(Math.abs(tx.amount))})` : `${formatCurrency(tx.amount)}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-end space-y-3">
                 <div className="w-full flex justify-between items-center max-w-[200px]">
                    <p className="text-[9px] font-medium text-textSecondary uppercase tracking-widest leading-none">Total Income</p>
                    <p className="text-base font-medium text-positiveGreen tracking-tight">$2,400.00</p>
                 </div>
                 <div className="w-full flex justify-between items-center max-w-[200px]">
                    <p className="text-[9px] font-medium text-textSecondary uppercase tracking-widest leading-none">Total Expense</p>
                    <p className="text-base font-medium text-negativeRed tracking-tight">($2,093.00)</p>
                 </div>
                 <div className="w-full max-w-[200px] border-t border-gray-200 pt-3 flex justify-between items-center">
                    <p className="text-[9px] font-medium text-textSecondary uppercase tracking-widest leading-none">Sum Total</p>
                    <p className="text-xl font-medium text-textPrimary tracking-tight font-serif italic">$307.00</p>
                 </div>
              </div>

              <Button className="w-full mt-8 bg-wealthBackground hover:bg-gray-200 text-textPrimary border-none rounded-lg font-medium text-[10px] uppercase tracking-widest py-6 transition-all">
                Sync Statement Data
              </Button>
            </div>
          </div>
        );
      case "bills":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-textPrimary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accentPurpleDark" />
                  Bill Reminders
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="bg-negativeRed/10 px-4 py-1.5 rounded-md mb-2">
                    <p className="text-[9px] font-medium text-negativeRed uppercase tracking-widest leading-none">Overdue bills</p>
                  </div>
                  {MOCK_BILLS.filter(b => b.status === "overdue").map((b, i) => (
                    <div key={i} className="flex justify-between p-3 text-sm items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-negativeRed" />
                        <span className="font-medium text-textPrimary leading-none">{b.name}</span>
                      </div>
                      <span className="font-medium text-negativeRed tracking-tight">({formatCurrency(b.amount)})</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="bg-futureBlue/10 px-4 py-1.5 rounded-md mb-2">
                     <p className="text-[9px] font-medium text-futureBlue uppercase tracking-widest leading-none">Upcoming bills</p>
                  </div>
                  {MOCK_BILLS.filter(b => b.status === "upcoming").map((b, i) => (
                    <div key={i} className="flex justify-between p-3 text-sm items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-futureBlue" />
                        <span className="font-medium text-textPrimary leading-none">{b.name}</span>
                      </div>
                      <span className="font-medium text-textPrimary tracking-tight">({formatCurrency(b.amount)})</span>
                    </div>
                  ))}
                </div>

                 <div>
                  <div className="bg-positiveGreen/10 px-4 py-1.5 rounded-md mb-2">
                     <p className="text-[9px] font-medium text-positiveGreen uppercase tracking-widest leading-none">Paid bills</p>
                  </div>
                  <div className="opacity-50 space-y-1">
                    {MOCK_BILLS.filter(b => b.status === "paid").map((b, i) => (
                      <div key={i} className="flex justify-between p-3 text-sm items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-positiveGreen" />
                          <span className="font-medium text-textPrimary line-through leading-none">{b.name}</span>
                        </div>
                        <span className="font-medium text-textSecondary tracking-tight leading-none">{formatCurrency(b.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "budgets_short":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-textPrimary flex items-center gap-2">
                   <Target className="w-4 h-4 text-accentPurpleDark" />
                   Strategic Budgets
                </h3>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Salary and Wages", val: 1487, target: 5000, color: "bg-primaryGreen", status: "12 days to go" },
                  { label: "Rent / Fixed", val: 1800, target: 1800, color: "bg-futureBlue", status: "Paid" },
                ].map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-medium uppercase tracking-tight items-end">
                        <span className="text-textPrimary">{b.label}</span>
                        <span className="text-[8px] text-textSecondary tracking-[0.2em]">{b.status}</span>
                    </div>
                    <div className="w-full h-1 bg-wealthBackground rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (b.val/b.target)*100)}%` }}
                          transition={{ duration: 1, delay: i*0.1 }}
                          className={`h-full ${b.color}`} 
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-medium tracking-tight text-textSecondary">
                        <span>{formatCurrency(b.val)} / {formatCurrency(b.target)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overspent / Variance detection */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-negativeRed/10 px-4 py-2 rounded-md mb-4">
                   <p className="text-[10px] font-medium text-negativeRed uppercase tracking-widest leading-none">Overspent</p>
                </div>
                <div className="space-y-3">
                   {[
                     { name: "Pets", amount: 45.00 },
                     { name: "Automotive", amount: 120.80 },
                   ].map((v, i) => (
                     <div key={i} className="flex justify-between items-center p-3 text-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-negativeRed" />
                           <span className="font-medium text-textPrimary leading-none">{v.name}</span>
                        </div>
                        <span className="font-medium text-negativeRed tracking-tight">({formatCurrency(v.amount)})</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "velocity":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8 text-center">
               <p className="text-[10px] font-medium text-textSecondary uppercase tracking-[0.2em] mb-4">Saving Velocity</p>
               <div className="flex items-center justify-center mb-6">
                  <p className="text-4xl font-medium text-textPrimary tracking-tighter italic">42.5%</p>
               </div>
               <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center text-[9px] uppercase font-medium">
                   <span className="text-textSecondary italic capitalize">Total income</span>
                   <span className="text-positiveGreen font-medium">$1,487.90</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-medium">
                   <span className="text-textSecondary italic capitalize">Total expense</span>
                   <span className="text-negativeRed font-medium">($855.36)</span>
                </div>
              </div>
            </div>
          </div>
        );
      case "budgets_detailed":
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-accentPurple w-full" />
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-textPrimary flex items-center gap-2">
                   <Target className="w-4 h-4 text-accentPurpleDark" />
                   Strategic Budgets
                </h3>
                <Link to="/FamilyBudget" className="text-[9px] font-medium uppercase text-accentPurpleDark hover:opacity-70 border-b border-accentPurpleDark/20 pb-0.5">See more</Link>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Salary and Wages", val: 1487, target: 5000, color: "bg-primaryGreen", status: "12 days to go" },
                  { label: "Rent / Fixed", val: 1800, target: 1800, color: "bg-futureBlue", status: "Paid" },
                  { label: "Variable / Wants", val: 540, target: 1000, color: "bg-accentPurpleDark", status: "Within limits" },
                ].map((b, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-medium uppercase tracking-tight items-end">
                        <span className="text-textPrimary">{b.label}</span>
                        <span className="text-[8px] text-textSecondary tracking-[0.2em]">{b.status}</span>
                    </div>
                    <div className="w-full h-1 bg-wealthBackground rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (b.val/b.target)*100)}%` }}
                          transition={{ duration: 1, delay: i*0.1 }}
                          className={`h-full ${b.color}`} 
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-medium tracking-tight text-textSecondary">
                        <span>$0.00 earned</span>
                        <span>{formatCurrency(b.val)} / {formatCurrency(b.target)}</span>
                    </div>
                  </div>
                ))}
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
    <div className="min-h-screen bg-wealthBackground pb-20 font-sans">
      {/* Top Section: Net Worth Hero */}
      <section className="bg-white border-b border-gray-200 pt-10 shadow-sm mb-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C5A059]" />
        <div className="max-w-[1450px] mx-auto px-6 sm:px-10 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
            <div className="flex-1 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                {/* Earning Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-slate-200/50 group">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Revenue</p>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#00A381] tracking-tight">{formatCurrency(currentPeriodMetrics.earning)}</p>
                  <p className="text-[9px] text-slate-500 mt-2 font-medium">Inflows for current period</p>
                </div>

                {/* Spending Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Operational Burn</p>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#E56B6B] tracking-tight">{formatCurrency(currentPeriodMetrics.spending)}</p>
                  <p className="text-[9px] text-slate-500 mt-2 font-medium">Outflows & liabilities</p>
                </div>

                {/* Net Position Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Net Position</p>
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-[#7C3AED]">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold tracking-tight ${currentPeriodMetrics.difference >= 0 ? 'text-[#00A381]' : 'text-[#E56B6B]'}`}>
                    {currentPeriodMetrics.difference >= 0 ? '+' : ''}{formatCurrency(currentPeriodMetrics.difference)}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-2 font-medium">Cash flow surplus/deficit</p>
                </div>

                {/* Savings Velocity Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Savings Velocity</p>
                    <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-[#C5A059]">
                      <Target className="w-3 h-3" />
                    </div>
                  </div>
                   <p className="text-2xl font-bold text-[#C5A059] tracking-tight">{(currentPeriodMetrics?.savingsRate || 0).toFixed(2)}%</p>
                  <p className="text-[9px] text-slate-500 mt-2 font-medium">Capital retention efficiency</p>
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
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[9px] text-slate-500 font-medium">9 April 2026</p>
                  <Settings className="w-3 h-3 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
          
              <div className="w-full flex-1 flex flex-col mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            
            {/* Header row matched to requested visualization */}
            <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 gap-4">
              <p className="text-xs font-semibold text-slate-700">
                {historyData?.length > 0 
                  ? `${historyData[0]?.fullDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})} - ${historyData[historyData.length-1]?.fullDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}`
                  : 'Analyzing historical data...'}
              </p>
              
              <div className="flex items-center gap-12 text-center divide-x divide-slate-200">
                <div className="px-6 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Minimum value</p>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(stats.min)}</p>
                </div>
                <div className="px-6 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Maximum value</p>
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(stats.max)}</p>
                </div>
                <div className="px-6 text-center">
                  <p className="text-[10px] text-slate-500 mb-1">Overall % change</p>
                  <p className={`text-sm font-semibold ${stats.change >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                    {stats.change >= 0 ? '↑' : '↓'} {Math.abs(stats.change).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-[280px] p-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{top: 0, bottom: 0, left: 0, right: 0}}>
                  <defs>
                    <linearGradient id="splitFill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset={`${historyData.findIndex(d => d.isToday) !== -1 ? (historyData.findIndex(d => d.isToday) / Math.max(1, historyData.length - 1)) * 100 : (historyData[0]?.isFuture ? 0 : 100)}%`} stopColor="#41a890" stopOpacity={0.9}/>
                      <stop offset={`${historyData.findIndex(d => d.isToday) !== -1 ? (historyData.findIndex(d => d.isToday) / Math.max(1, historyData.length - 1)) * 100 : (historyData[0]?.isFuture ? 0 : 100)}%`} stopColor="#598b9e" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="splitStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset={`${historyData.findIndex(d => d.isToday) !== -1 ? (historyData.findIndex(d => d.isToday) / Math.max(1, historyData.length - 1)) * 100 : (historyData[0]?.isFuture ? 0 : 100)}%`} stopColor="#1f8971" stopOpacity={1}/>
                      <stop offset={`${historyData.findIndex(d => d.isToday) !== -1 ? (historyData.findIndex(d => d.isToday) / Math.max(1, historyData.length - 1)) * 100 : (historyData[0]?.isFuture ? 0 : 100)}%`} stopColor="#346a82" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Provide internal spacing for YAxis with domain explicitly mapped. */}
                  <YAxis domain={['auto', 'auto']} hide />
                  {historyData.find(d => d.isToday) && (
                    <ReferenceLine 
                      x={historyData.find(d => d.isToday)?.name} 
                      stroke="#1E293B" 
                      strokeWidth={1}
                      label={{ position: 'top', value: `Today, ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}`, fill: '#475569', fontSize: 10, fontWeight: 500 }}
                    />
                  )}
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    minTickGap={30}
                    dy={-10} // Bring labels inside chart slightly based on screenshot
                  />
                  <Tooltip 
                    cursor={{ stroke: '#475569', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Area 
                    type="linear" 
                    dataKey="balance" 
                    stroke="url(#splitStroke)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#splitFill)" 
                  />
                </AreaChart>
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
