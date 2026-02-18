import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Key, TrendingUp, Building2, Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getCurrencySymbol } from "./CurrencySelector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function EquityUnlockPlanner({ currency }) {
  const sym = getCurrencySymbol(currency);

  // Existing property
  const [currentValue, setCurrentValue] = useState(800000);
  const [loanBalance, setLoanBalance] = useState(400000);
  const [bankLVR, setBankLVR] = useState(80);

  // Property #2 parameters
  const [property2Price, setProperty2Price] = useState(600000);
  const [property2Growth, setProperty2Growth] = useState(6);
  const [property2Rent, setProperty2Rent] = useState(550);
  const [mortgageRate, setMortgageRate] = useState(6);
  const [years, setYears] = useState(15);

  // Calculations
  const analysis = useMemo(() => {
    // Existing property equity
    const currentEquity = currentValue - loanBalance;
    const maxBorrowingCapacity = currentValue * (bankLVR / 100);
    const usableEquity = maxBorrowingCapacity - loanBalance;
    
    // Can they buy property 2?
    const requiredDeposit = property2Price * 0.2; // 20% deposit
    const canBuy = usableEquity >= requiredDeposit;
    
    // Property 2 loan details
    const property2Loan = property2Price - Math.min(usableEquity, requiredDeposit);
    const monthlyRate = mortgageRate / 100 / 12;
    const numPayments = 30 * 12;
    const monthlyRepayment = property2Loan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualRent = property2Rent * 52;
    const monthlyCashflow = (annualRent / 12) - monthlyRepayment;

    // Wealth projection
    const yearlyData = [];
    
    for (let year = 0; year <= years; year++) {
      const prop1Value = currentValue * Math.pow(1 + 0.06, year);
      const prop1Equity = prop1Value - loanBalance;
      
      let prop2Value = 0;
      let prop2Balance = property2Loan;
      let prop2Equity = 0;
      
      if (canBuy && year > 0) {
        prop2Value = property2Price * Math.pow(1 + property2Growth / 100, year);
        
        // Pay down property 2 loan
        for (let m = 0; m < 12; m++) {
          const interest = prop2Balance * monthlyRate;
          const principal = monthlyRepayment - interest;
          prop2Balance = Math.max(0, prop2Balance - principal);
        }
        
        prop2Equity = prop2Value - prop2Balance;
      } else if (canBuy && year === 0) {
        prop2Value = property2Price;
        prop2Equity = property2Price - property2Loan;
      }
      
      const totalEquity = prop1Equity + prop2Equity;
      const totalValue = prop1Value + prop2Value;
      
      yearlyData.push({
        year,
        property1Equity: Math.round(prop1Equity),
        property2Equity: Math.round(prop2Equity),
        totalEquity: Math.round(totalEquity),
        totalValue: Math.round(totalValue)
      });
    }
    
    const finalWithout = yearlyData[years].property1Equity;
    const finalWith = yearlyData[years].totalEquity;
    const wealthGain = finalWith - finalWithout;
    
    return {
      currentEquity,
      usableEquity,
      maxBorrowingCapacity,
      canBuy,
      requiredDeposit,
      property2Loan,
      monthlyRepayment,
      monthlyCashflow,
      yearlyData,
      finalWithout,
      finalWith,
      wealthGain
    };
  }, [currentValue, loanBalance, bankLVR, property2Price, property2Growth, property2Rent, mortgageRate, years]);

  const fmt = (num) => `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
          <Key className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Equity Unlock Planner</h3>
          <p className="text-xs text-slate-400">Leverage existing property to build wealth faster</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Existing Property */}
        <div className="bg-slate-700/30 rounded-2xl p-5 border border-white/10">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Your Existing Property
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Current Value</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-slate-700/30 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Loan Balance</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                <Input
                  type="number"
                  value={loanBalance}
                  onChange={(e) => setLoanBalance(parseFloat(e.target.value) || 0)}
                  className="pl-8 bg-slate-700/30 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-xs text-slate-300">Bank LVR Limit</Label>
                <span className="text-sm font-bold text-white">{bankLVR}%</span>
              </div>
              <Slider value={[bankLVR]} onValueChange={([v]) => setBankLVR(v)} min={60} max={90} step={5} />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mt-4">
              <p className="text-xs text-slate-400 mb-2">Your Equity</p>
              <p className="text-2xl font-black text-emerald-400">{fmt(analysis.currentEquity)}</p>
            </div>
          </div>
        </div>

        {/* Usable Equity */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-400/20">
          <h4 className="text-sm font-bold text-amber-300 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Available Equity Power
          </h4>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Max Borrowing Capacity</p>
              <p className="text-xl font-bold text-white">{fmt(analysis.maxBorrowingCapacity)}</p>
              <p className="text-xs text-slate-500 mt-1">({bankLVR}% of {fmt(currentValue)})</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-5 border border-emerald-400/30">
              <p className="text-xs text-emerald-300 mb-2">💰 Usable Equity</p>
              <p className="text-3xl font-black text-white">{fmt(analysis.usableEquity)}</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                You can access <strong className="text-emerald-400">{fmt(analysis.usableEquity)}</strong> to invest in another property
              </p>
            </div>

            {analysis.canBuy ? (
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400/20">
                <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  ✓ You can buy Property #2!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Required deposit: {fmt(analysis.requiredDeposit)}
                </p>
              </div>
            ) : (
              <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-400/20">
                <p className="text-sm font-bold text-rose-400">
                  ✗ Insufficient equity
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Need {fmt(analysis.requiredDeposit - analysis.usableEquity)} more
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property #2 Simulation */}
      {analysis.canBuy && (
        <>
          <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-400/20 mb-8">
            <h4 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Property #2 - Investment Simulation
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Purchase Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={property2Price}
                    onChange={(e) => setProperty2Price(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-slate-300">Weekly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{sym}</span>
                  <Input
                    type="number"
                    value={property2Rent}
                    onChange={(e) => setProperty2Rent(parseFloat(e.target.value) || 0)}
                    className="pl-8 bg-slate-700/30 border-white/10 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Growth Rate</Label>
                  <span className="text-xs font-bold text-emerald-400">{property2Growth}%</span>
                </div>
                <Slider value={[property2Growth]} onValueChange={([v]) => setProperty2Growth(v)} min={0} max={15} step={0.5} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-xs text-slate-300">Mortgage Rate</Label>
                  <span className="text-xs font-bold text-white">{mortgageRate}%</span>
                </div>
                <Slider value={[mortgageRate]} onValueChange={([v]) => setMortgageRate(v)} min={2} max={12} step={0.1} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Loan Amount</p>
                <p className="text-lg font-bold text-white">{fmt(analysis.property2Loan)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Monthly Repayment</p>
                <p className="text-lg font-bold text-white">{fmt(analysis.monthlyRepayment)}</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Cashflow</p>
                <p className={`text-lg font-bold ${analysis.monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysis.monthlyCashflow >= 0 ? '+' : ''}{fmt(analysis.monthlyCashflow)}
                </p>
              </div>
            </div>
          </div>

          {/* Wealth Strategy Modeling */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Wealth Strategy Model</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400">Timeline:</Label>
                  <span className="text-sm font-bold text-white">{years} years</span>
                </div>
                <Slider value={[years]} onValueChange={([v]) => setYears(v)} min={5} max={30} step={1} className="w-32" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 mb-1">Without Property #2</p>
                <p className="text-xl font-bold text-white">{fmt(analysis.finalWithout)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl p-4 border border-emerald-400/20">
                <p className="text-xs text-emerald-300 mb-1">With Property #2</p>
                <p className="text-xl font-bold text-white">{fmt(analysis.finalWith)}</p>
              </div>
              <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl p-4 border border-violet-400/20">
                <p className="text-xs text-violet-300 mb-1">Wealth Gain</p>
                <p className="text-xl font-bold text-emerald-400">+{fmt(analysis.wealthGain)}</p>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-2xl p-6 border border-white/5">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analysis.yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#94a3b8"
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    tickFormatter={(val) => `${sym}${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => fmt(value)}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="property1Equity" stroke="#94a3b8" strokeWidth={2} name="Property #1 Equity" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="totalEquity" stroke="#10b981" strokeWidth={3} name="Total Equity (Both Properties)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-400/20">
              <p className="text-xs text-amber-300 font-bold mb-2">💡 Strategy Insight</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                By leveraging your existing property equity, you can build an additional <strong className="text-emerald-400">{fmt(analysis.wealthGain)}</strong> in wealth over {years} years. 
                This is the power of property leverage - your equity works for you to create more wealth.
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}