import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Key, TrendingUp, Building2, Zap, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { getCurrencySymbol } from "./CurrencySelector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function EquityUnlockPlanner({ currency }) {
  const sym = getCurrencySymbol(currency);

  // Existing property state
  const [currentValue, setCurrentValue] = useState(800000);
  const [loanBalance, setLoanBalance] = useState(400000);
  const [bankLVR, setBankLVR] = useState(80);

  // LMI calculation based on industry standards
  const calculateLMI = (loanAmount, lvr) => {
    if (lvr <= 80) return 0;
    if (lvr <= 85) return loanAmount * 0.012;
    if (lvr <= 90) return loanAmount * 0.024;
    return loanAmount * 0.04; // 90%+ LVR
  };

  // Multiple properties
  const [properties, setProperties] = useState([
    { id: 1, price: 600000, growth: 6, rent: 550, mortgageRate: 6, depositPct: 20 },
    { id: 2, price: 500000, growth: 6, rent: 450, mortgageRate: 6, depositPct: 20 }
  ]);
  const [years, setYears] = useState(15);

  const addProperty = () => {
    const newId = Math.max(...properties.map(p => p.id), 0) + 1;
    setProperties([...properties, { 
      id: newId, 
      price: 500000, 
      growth: 6, 
      rent: 400, 
      mortgageRate: 6,
      depositPct: 20
    }]);
  };

  const removeProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const updateProperty = (id, field, value) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Year-by-year recursive simulation
  const analysis = useMemo(() => {
    const currentEquity = currentValue - loanBalance;
    const maxBorrowingAtStart = currentValue * (bankLVR / 100);
    const usableEquityAtStart = maxBorrowingAtStart - loanBalance;

    let pendingProperties = properties.map(p => ({ ...p }));
    const yearlyData = [];
    let activeInvestments = [];

    // Track final values for the summary
    let finalP1Usable = usableEquityAtStart;

    for (let year = 0; year <= years; year++) {
      // 1. Appreciate existing property
      const p1Value = currentValue * Math.pow(1.06, year);
      const p1Equity = p1Value - loanBalance;
      const p1Usable = (p1Value * (bankLVR / 100)) - loanBalance;
      
      if (year === 0) finalP1Usable = p1Usable; // Ensure we have a valid baseline

      // 2. Portfolio Health Check
      let currentYearOtherEquity = 0;
      let currentYearTotalValue = p1Value;
      let currentYearUsableFromOthers = 0;

      activeInvestments.forEach(inv => {
        // Appreciate
        const yearsOwned = year - inv.yearAcquired;
        inv.currentValue = inv.originalPrice * Math.pow(1 + inv.growth / 100, yearsOwned);
        
        // Principal reduction (simplified annual if year > 0)
        if (year > inv.yearAcquired) {
          const monthlyRate = inv.mortgageRate / 100 / 12;
          const monthlyRepayment = inv.monthlyRepayment;
          for (let m = 0; m < 12; m++) {
            const interest = inv.currentLoanBalance * monthlyRate;
            const principal = monthlyRepayment - interest;
            inv.currentLoanBalance = Math.max(0, inv.currentLoanBalance - principal);
          }
        }

        currentYearOtherEquity += (inv.currentValue - inv.currentLoanBalance);
        currentYearTotalValue += inv.currentValue;
        
        // Usable equity from this investment (80% LVR standard for investments)
        const usableFromInv = (inv.currentValue * 0.8) - inv.currentLoanBalance;
        currentYearUsableFromOthers += Math.max(0, usableFromInv);
      });

      // Total Cumulative Usable Equity available this year
      const totalUsableEquityThisYear = p1Usable + currentYearUsableFromOthers;

      // 3. Acquisition Logic: Can we buy next property?
      while (pendingProperties.length > 0) {
        const nextProp = pendingProperties[0];
        const lvr = 100 - nextProp.depositPct;
        const depositAmount = nextProp.price * (nextProp.depositPct / 100);
        const baseLoan = nextProp.price - depositAmount;
        const lmi = calculateLMI(baseLoan, lvr);
        const totalFundsRequired = depositAmount + lmi;
        
        // Only buy if we have enough usable equity left AFTER prior buys
        const equitySpentSoFar = activeInvestments.reduce((sum, inv) => sum + inv.equityUsed, 0);
        const usableEquityRemaining = totalUsableEquityThisYear - equitySpentSoFar;

        if (usableEquityRemaining >= totalFundsRequired) {
          // BUY!
          const monthlyRate = nextProp.mortgageRate / 100 / 12;
          const numPayments = 30 * 12;
          const totalLoan = baseLoan + lmi;
          const monthlyRepayment = totalLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
          
          activeInvestments.push({
            ...nextProp,
            yearAcquired: year,
            originalPrice: nextProp.price,
            currentValue: nextProp.price,
            currentLoanBalance: totalLoan,
            totalLoan: totalLoan,
            lmi,
            equityUsed: totalFundsRequired,
            monthlyRepayment,
            monthlyCashflow: (nextProp.rent * 52 / 12) - monthlyRepayment
          });
          pendingProperties.shift();
        } else {
          break; // Stop acquisition for this year
        }
      }

      yearlyData.push({
        year,
        property1Equity: Math.round(p1Equity),
        totalOtherEquity: Math.round(currentYearOtherEquity),
        totalEquity: Math.round(p1Equity + currentYearOtherEquity),
        totalValue: Math.round(currentYearTotalValue)
      });
    }

    const finalWithout = yearlyData[years].property1Equity;
    const finalWith = yearlyData[years].totalEquity;
    const wealthGain = finalWith - finalWithout;

    return {
      currentEquity,
      usableEquity: usableEquityAtStart,
      maxBorrowingCapacity: maxBorrowingAtStart,
      propertyAnalyses: activeInvestments,
      yearlyData,
      finalWithout,
      finalWith,
      wealthGain,
      pendingProperties
    };
  }, [currentValue, loanBalance, bankLVR, properties, years]);

  const fmt = (num) => `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl p-5"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold font-heading text-slate-900 tracking-tight">Equity Unlock Planner</h3>
          <p className="text-sm text-slate-500">Leverage existing property to build wealth faster</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        {/* Existing Property */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-indigo-500" />
            Your Existing Property
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">{sym}</span>
                <Input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-white border-slate-200 text-slate-900 text-base font-medium h-10 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-700">Loan Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={loanBalance}
                  onChange={(e) => setLoanBalance(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-slate-50 border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-700">Bank LVR Limit</Label>
                <span className="text-sm font-bold text-slate-900">{bankLVR}%</span>
              </div>
              <Slider value={[bankLVR]} onValueChange={([v]) => setBankLVR(v)} min={60} max={90} step={5} />
            </div>

            <div className="bg-slate-100 rounded-xl p-4 mt-4">
              <p className="text-xs text-slate-600 mb-2">Your Equity</p>
              <p className="text-2xl font-black text-emerald-600">{fmt(analysis.currentEquity)}</p>
            </div>
          </div>
        </div>

        {/* Usable Equity */}
        <div className="bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <h4 className="text-sm font-bold text-indigo-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-indigo-500" />
            Available Equity Power
          </h4>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Max Borrowing Capacity</p>
              <p className="text-xl font-bold text-slate-900">{fmt(analysis.maxBorrowingCapacity)}</p>
              <p className="text-xs text-slate-400 mt-1">({bankLVR}% of {fmt(currentValue)})</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
              <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wider">💰 Current Portfolio Usable Equity</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tight">{fmt(analysis.usableEquity)}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Total borrowing power available across your entire portfolio today.
              </p>
            </div>

            {analysis.propertyAnalyses.length > 0 ? (
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                  ✓ {analysis.propertyAnalyses.length} Properties Acquired
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Using {fmt(analysis.propertyAnalyses.reduce((sum, p) => sum + p.equityUsed, 0))} of unlocked equity.
                </p>
              </div>
            ) : (
              <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
                <p className="text-sm font-bold text-rose-600 text-center">
                  Awaiting growth to fund first deposit
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multiple Properties Inputs */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest pl-2">Investment Properties</h4>
          <Button 
            onClick={addProperty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm rounded-xl transition-all"
            size="sm"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Button>
        </div>

        {properties.map((prop, idx) => (
          <div key={prop.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm transition-all hover:border-indigo-300">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-bold text-indigo-700 flex items-center gap-2 tracking-wide">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Property #{idx + 1}
              </h5>
              {properties.length > 1 && (
                <Button 
                  onClick={() => removeProperty(prop.id)}
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50 p-1 h-8 w-8"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{sym}</span>
                  <Input
                    type="number"
                    value={prop.price}
                    onChange={(e) => updateProperty(prop.id, 'price', parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-white border-slate-200 text-slate-900 text-base h-10 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{sym}</span>
                  <Input
                    type="number"
                    value={prop.rent}
                    onChange={(e) => updateProperty(prop.id, 'rent', parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-white border-slate-200 text-slate-900 text-base h-10 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deposit (%)</Label>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-md ${prop.depositPct < 20 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {prop.depositPct}%
                  </span>
                </div>
                <Slider value={[prop.depositPct]} onValueChange={([v]) => updateProperty(prop.id, 'depositPct', v)} min={5} max={40} step={1} className="py-2" />
                {prop.depositPct < 20 && (
                  <p className="text-[10px] text-amber-600 font-medium italic">* LMI will be applicable below 20%</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Annual Growth</Label>
                  <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{prop.growth}%</span>
                </div>
                <Slider value={[prop.growth]} onValueChange={([v]) => updateProperty(prop.id, 'growth', v)} min={0} max={15} step={0.5} className="py-2" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mortgage Rate</Label>
                  <span className="text-sm font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">{prop.mortgageRate}%</span>
                </div>
                <Slider value={[prop.mortgageRate]} onValueChange={([v]) => updateProperty(prop.id, 'mortgageRate', v)} min={2} max={12} step={0.1} className="py-2" />
              </div>
            </div>

            {analysis.propertyAnalyses.find(p => p.id === prop.id) ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
                <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-bold mb-1 uppercase tracking-tight">Status</p>
                  <p className="text-base font-black text-indigo-700">Year {analysis.propertyAnalyses.find(p => p.id === prop.id).yearAcquired}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Total Loan (incl LMI)</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).totalLoan)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                  <p className="text-xs text-amber-600 font-bold mb-1 uppercase tracking-tight">LMI Cost</p>
                  <p className="text-lg font-bold text-amber-700">{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).lmi)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Monthly Mortgage</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyRepayment)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Monthly Cashflow</p>
                  <p className={`text-lg font-bold ${analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow >= 0 ? '+' : ''}{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-slate-100/50 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-xs text-slate-500 font-medium italic">Awaiting further equity growth to acquire this property...</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wealth Strategy Modeling */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest pl-2">Wealth Strategy Model</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-500">Timeline:</Label>
              <span className="text-sm font-bold text-indigo-600">{years} years</span>
            </div>
            <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={5} max={30} step={1} className="w-32" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Without Additional Properties</p>
            <p className="text-xl font-bold text-slate-900">{fmt(analysis.finalWithout)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
            <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wider">With Additional Properties</p>
            <p className="text-xl font-bold text-emerald-900">{fmt(analysis.finalWith)}</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 shadow-sm">
            <p className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wider">Wealth Gain</p>
            <p className="text-xl font-black text-indigo-600">+{fmt(analysis.wealthGain)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analysis.yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b"
                tickFormatter={(val) => `${sym}${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                itemStyle={{ color: '#475569' }}
                formatter={(value) => fmt(value)}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="property1Equity" stroke="#94a3b8" strokeWidth={2} name="Property #1 Equity" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="totalEquity" stroke="#6366f1" strokeWidth={3} name="Total Equity (All Properties)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
          <p className="text-sm text-amber-600 font-bold mb-2 flex items-center gap-2 tracking-wide text-uppercase">
            <Zap className="w-5 h-5" /> Acquisition Strategy Insight
          </p>
          <div className="text-sm text-slate-700 leading-relaxed space-y-2">
            <p>
              By leveraging your portfolio's growing equity, you can build an additional <strong className="text-emerald-600 font-bold">{fmt(analysis.wealthGain)}</strong> in net worth over {years} years.
            </p>
            {analysis.propertyAnalyses.length > 0 && (
              <p className="p-2 bg-white/50 rounded-lg border border-amber-100">
                🚀 Acquisition Roadmap: {analysis.propertyAnalyses.map((p, i) => `Property #${i+1} in Year ${p.yearAcquired}`).join(' → ')}.
              </p>
            )}
            <p className="text-xs italic text-slate-500">
              * This model assumes recursive leverage: as your first home and early investments grow, their combined equity is used to fund the deposits for subsequent properties in your queue.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}