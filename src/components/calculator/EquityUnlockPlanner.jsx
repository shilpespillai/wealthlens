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

  // Existing property
  const [currentValue, setCurrentValue] = useState(800000);
  const [loanBalance, setLoanBalance] = useState(400000);
  const [bankLVR, setBankLVR] = useState(80);

  // Multiple properties
  const [properties, setProperties] = useState([
    { id: 1, price: 600000, growth: 6, rent: 550, mortgageRate: 6 },
    { id: 2, price: 500000, growth: 6, rent: 450, mortgageRate: 6 }
  ]);
  const [years, setYears] = useState(15);

  const addProperty = () => {
    const newId = Math.max(...properties.map(p => p.id), 0) + 1;
    setProperties([...properties, { 
      id: newId, 
      price: 500000, 
      growth: 6, 
      rent: 400, 
      mortgageRate: 6 
    }]);
  };

  const removeProperty = (id) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const updateProperty = (id, field, value) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Calculations
  const analysis = useMemo(() => {
    // Existing property equity
    const currentEquity = currentValue - loanBalance;
    const maxBorrowingCapacity = currentValue * (bankLVR / 100);
    const usableEquity = maxBorrowingCapacity - loanBalance;
    
    // Calculate each property's loan and cashflow
    const propertyAnalyses = properties.map(prop => {
      const requiredDeposit = prop.price * 0.2;
      const canBuy = usableEquity >= requiredDeposit;
      const propertyLoan = prop.price - Math.min(usableEquity, requiredDeposit);
      const monthlyRate = prop.mortgageRate / 100 / 12;
      const numPayments = 30 * 12;
      const monthlyRepayment = propertyLoan * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      const annualRent = prop.rent * 52;
      const monthlyCashflow = (annualRent / 12) - monthlyRepayment;

      return {
        ...prop,
        requiredDeposit,
        canBuy,
        propertyLoan,
        monthlyRepayment,
        monthlyCashflow
      };
    });

    // Wealth projection
    const yearlyData = [];
    
    for (let year = 0; year <= years; year++) {
      const prop1Value = currentValue * Math.pow(1 + 0.06, year);
      const prop1Equity = prop1Value - loanBalance;
      
      let totalOtherEquity = 0;
      
      propertyAnalyses.forEach(prop => {
        if (prop.canBuy && year > 0) {
          let propValue = prop.price * Math.pow(1 + prop.growth / 100, year);
          let propBalance = prop.propertyLoan;
          
          for (let m = 0; m < 12; m++) {
            const monthlyRate = prop.mortgageRate / 100 / 12;
            const interest = propBalance * monthlyRate;
            const principal = prop.monthlyRepayment - interest;
            propBalance = Math.max(0, propBalance - principal);
          }
          
          totalOtherEquity += propValue - propBalance;
        } else if (prop.canBuy && year === 0) {
          totalOtherEquity += prop.price - prop.propertyLoan;
        }
      });
      
      const totalEquity = prop1Equity + totalOtherEquity;
      const totalValue = prop1Value + propertyAnalyses.reduce((sum, p) => {
        if (p.canBuy) {
          return sum + (p.price * Math.pow(1 + p.growth / 100, year));
        }
        return sum;
      }, 0);
      
      yearlyData.push({
        year,
        property1Equity: Math.round(prop1Equity),
        totalOtherEquity: Math.round(totalOtherEquity),
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
      propertyAnalyses,
      yearlyData,
      finalWithout,
      finalWith,
      wealthGain
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
              <p className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wider">💰 Usable Equity</p>
              <p className="text-3xl font-black text-emerald-600 tracking-tight">{fmt(analysis.usableEquity)}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You can access <strong className="text-emerald-600">{fmt(analysis.usableEquity)}</strong> to invest in additional properties
              </p>
            </div>

            {analysis.propertyAnalyses.some(p => p.canBuy) ? (
              <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                <p className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  ✓ You can buy additional properties!
                </p>
                <p className="text-xs text-emerald-400/70 mt-1">
                  {analysis.propertyAnalyses.filter(p => p.canBuy).length} property(ies) are viable
                </p>
              </div>
            ) : (
              <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
                <p className="text-sm font-bold text-rose-300">
                  ✗ Insufficient equity
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Growth Rate</Label>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{prop.growth}%</span>
                </div>
                <Slider value={[prop.growth]} onValueChange={([v]) => updateProperty(prop.id, 'growth', v)} min={0} max={15} step={0.5} className="py-2" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mortgage Rate</Label>
                  <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">{prop.mortgageRate}%</span>
                </div>
                <Slider value={[prop.mortgageRate]} onValueChange={([v]) => updateProperty(prop.id, 'mortgageRate', v)} min={2} max={12} step={0.1} className="py-2" />
              </div>
            </div>

            {analysis.propertyAnalyses.find(p => p.id === prop.id) && (
              <div className="grid md:grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Loan Amount</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).propertyLoan)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Monthly Repayment</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyRepayment)}</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-600 mb-1">Cashflow</p>
                  <p className={`text-lg font-bold ${analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow >= 0 ? '+' : ''}{fmt(analysis.propertyAnalyses.find(p => p.id === prop.id).monthlyCashflow)}
                  </p>
                </div>
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
          <p className="text-sm text-amber-600 font-bold mb-2 flex items-center gap-2 tracking-wide">
            <Zap className="w-5 h-5" /> Strategy Insight
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            By leveraging your existing property equity, you can build an additional <strong className="text-emerald-600 font-bold">{fmt(analysis.wealthGain)}</strong> in wealth over {years} years across {properties.length} investment propert{properties.length > 1 ? 'ies' : 'y'}. 
            This is the power of property leverage — your equity works harder to compound your total net worth.
          </p>
        </div>
      </div>
    </motion.div>
  );
}