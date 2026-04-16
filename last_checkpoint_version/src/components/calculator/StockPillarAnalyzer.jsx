import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  BarChart3, 
  Info,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PILLAR_DEFINITIONS = [
  { id: "pe", label: "P/E Ratio", desc: "Is the current P/E less than the 5-year average?", more: "Low P/E relative to history suggests value." },
  { id: "roic", label: "ROIC", desc: "Is the 5-year average ROIC greater than 9%?", more: "Return on Invested Capital measures management efficiency." },
  { id: "rev", label: "Revenue Growth", desc: "Has revenue increased over the last 5 years?", more: "Consistent top-line growth is a hallmark of a healthy business." },
  { id: "net_income", label: "Net Income Growth", desc: "Has net income increased over the last 5 years?", more: "Earnings must follow revenue for long-term success." },
  { id: "shares", label: "Shares Outstanding", desc: "Are shares outstanding decreasing (Buybacks)?", more: "Share buybacks increase your ownership percentage without you spending a dime." },
  { id: "fcf", label: "FCF Growth", desc: "Has Free Cash Flow increased over the last 5 years?", more: "Cash is king. FCF is what's left after all bills and reinvestment." },
  { id: "liabilities", label: "Liabilities Cover", desc: "Can 5 years of FCF pay off all long-term liabilities?", more: "Measures debt safety. We want companies that can kill their debt quickly." },
  { id: "price_fcf", label: "Price / FCF", desc: "Is current Price/FCF less than the 5-year average?", more: "FCF valuation relative to its own history." }
];

export default function StockPillarAnalyzer({ onOpenFairValue }) {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const performAnalysis = async (e) => {
    if (e) e.preventDefault();
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const { data: result } = await base44.functions.invoke('getStockPillarAnalysis', {
        symbol: ticker.toUpperCase()
      });
      
      console.log("Stock Analysis response:", result);
      setAnalysis(result);
    } catch (err) {
      console.error("Stock Analysis Error:", err);
      setError("Failed to fetch stock data. Please verify the ticker and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock Fundamental Analyzer</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Evaluate any stock using the elite <b>8-Pillar Process</b>. We scan 10 years of financial history to find the world's best companies.
        </p>

        <form onSubmit={performAnalysis} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Enter Ticker (e.g. AAPL, TSLA)" 
              className="pl-11 h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !ticker}
            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze Stock"}
          </Button>
        </form>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-center text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      {loading && !analysis && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Scanning Yahoo Finance & Macrotrends...</p>
          <p className="text-xs text-slate-400 mt-2">Checking 10 years of financial statements</p>
        </div>
      )}

      {/* Results Area */}
      <AnimatePresence mode="wait">
        {analysis && (
          <motion.div 
            key={analysis.stockName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-8"
          >
            {/* Stock Title Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-indigo-500 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg">
                    {ticker.toUpperCase()}
                  </Badge>
                  <h1 className="text-2xl font-black">{analysis.stockName}</h1>
                </div>
                <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Score</div>
                  <div className="text-4xl font-black text-indigo-400">
                    {analysis.overallScore}<span className="text-xl text-slate-600">/8</span>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-800" />
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Verdict</div>
                  <div className={`text-xl font-black ${analysis.overallScore >= 7 ? 'text-emerald-400' : analysis.overallScore >= 5 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {analysis.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* The 8 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PILLAR_DEFINITIONS.map((def) => {
                const data = analysis.pillars.find(p => p.id === def.id) || { passed: false, current: "N/A", target: "N/A", rationale: "" };
                return (
                  <motion.div 
                    key={def.id}
                    whileHover={{ y: -5 }}
                    className={`bg-white rounded-2xl border-2 p-5 flex flex-col justify-between transition-all ${data.passed ? 'border-emerald-100 shadow-emerald-50' : 'border-slate-100 shadow-slate-50'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                          {data.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-slate-300 hover:text-indigo-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px] p-3 text-xs leading-relaxed">
                              {def.more}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 mb-1">{def.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight mb-4">{def.desc}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Actual</div>
                          <div className={`text-xs font-black ${data.passed ? 'text-emerald-600' : 'text-rose-600'}`}>{data.current}</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Target</div>
                          <div className="text-xs font-black text-slate-700">{data.target}</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 italic leading-snug">
                        "{data.rationale}"
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA / Premium Push */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Want a Fair Value Price?</h3>
                  <p className="text-indigo-100 text-sm">Use our intrinsic value calculator to find your perfect buy price.</p>
                </div>
              </div>
              <Button 
                onClick={onOpenFairValue}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-black rounded-xl px-8 h-12 relative z-10"
              >
                Open Fair Value Calculator
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
