import React from "react";
import { ArrowLeft, BarChart3, Calculator, Percent, Magnet, Zap, Target, Binary, FileBadge, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#C5A059]/10">
      
      {/* Structural Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/HelpCenter" className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
               <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Link>
            <div className="h-4 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <Binary className="w-4 h-4 text-[#C5A059]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Methodology Spec <span className="text-slate-300 mx-2 font-normal">/</span> <span className="text-slate-500 text-[9px]">Calculus & Projections</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Model: v4.2.0-ELITE</span>
            </div>
            <button className="bg-slate-900 text-white px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors">
              Export Spec
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-24 divide-y divide-slate-100">
        
        {/* Title Section */}
        <section className="pb-24 space-y-8">
           <div className="flex items-center gap-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.4em]">
             <FileBadge className="w-4 h-4" />
             Core Logic Appendix
           </div>
           <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[0.9] italic">
             Computational <br />
             <span className="text-slate-400 font-medium NOT-italic">Wealth Architecture.</span>
           </h1>
           <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.1em] max-w-xl leading-relaxed pt-4">
             The WealthLens engine utilizes sophisticated Time-Value of Money (TVM) sequences. Transparency is mandatory; this spec outlines the foundational mathematics driving your projections.
           </p>
        </section>

        {/* Core Principles */}
        <section className="py-24 grid grid-cols-1 lg:grid-cols-3 gap-20">
           <div className="space-y-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                 <Target className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Compounding Logic</h3>
              <p className="text-slate-500 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                Unlike consumer calculators, we utilize <strong>Sequential Discrete Compounding</strong>. Projections are recalculated at the terminal end of every reinvestment cycle (Monthly/Daily) to ensure precision over 50+ year horizons.
              </p>
           </div>
           
           <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="flex items-center justify-between relative z-10">
                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#C5A059]" />
                    Geometric Mean Engine (CAGR)
                 </h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold uppercase tracking-tight relative z-10">
                We handle market volatility using CAGR logic. An arithmetic mean overstates growth in volatile environments; CAGR accounts for 'Volatility Drag'—the mathematical requirement that a losses require higher gains just to break even.
              </p>
              <div className="bg-white border border-slate-200 p-8 rounded-2xl font-mono text-[11px] text-slate-900 shadow-sm relative overflow-hidden group z-10">
                 <div className="absolute top-0 right-0 w-12 h-full bg-slate-100/50 flex items-center justify-center border-l border-slate-200">
                    <Binary className="w-4 h-4 text-slate-300 group-hover:text-[#C5A059] transition-colors" />
                 </div>
                 FV = PV × (1 + r/n)^(n×t) + PMT × [((1 + r/n)^(n×t) - 1) / (r/n)]
              </div>
           </div>
        </section>

        {/* Inflation Section */}
        <section className="py-24 space-y-16">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Real Purchasing Power Adjustment</h3>
              <p className="text-slate-500 text-xs max-w-2xl leading-relaxed font-semibold uppercase tracking-tight">
                Nominal values are Speculative; Real values are Strategic. Our engine applies an annual inflation discount (HICP/CPI adjusted) to ensure your Future Value (FV) is expressed in today's actual purchasing power.
              </p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 border border-slate-100 rounded-3xl space-y-3">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nominal Projection</p>
                 <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-tight">The raw terminal capital amount, unadjusted for future price increases.</p>
              </div>
              <div className="p-10 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                 <p className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest">Real Value Projection</p>
                 <p className="text-[11px] text-slate-900 font-bold uppercase tracking-tight">The strategic equivalent value in today's economy after inflation-drag.</p>
              </div>
           </div>
        </section>

        {/* Footer Audit */}
        <section className="py-16 flex justify-between items-center bg-white">
           <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-200" />
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Institutional Engine • ISO-Verified Logic</span>
           </div>
           <button className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
             View Full Specs Table
           </button>
        </section>
      </main>

      <footer className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <div className="flex items-center gap-4">
              <span className="text-slate-900">WealthLens Knowledge Engineering</span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <span>SEC-DEEP-AUDIT Ready • ELITE-v4.2.0</span>
           </div>
           <p>© 2026 WealthLens Inc. Confidential Institutional Specification</p>
        </div>
      </footer>
    </div>
  );
}
