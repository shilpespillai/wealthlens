import React from "react";
import { ArrowLeft, Book, Info, Shield, Layers, Scale, Globe, FileBadge, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function Assumptions() {
  const assumptions = [
    {
      title: "INFLATION DYNAMICS",
      value: "2.5% Target",
      description: "Aggregated long-term target based on historical CAGR across major consumer price indices. Adjusted annually.",
      icon: <Globe className="w-4 h-4 text-[#C5A059]" />
    },
    {
      title: "MARKET VOLATILITY",
      value: "Standard Deviation (Sigma 1)",
      description: "Base growth rates assume a balanced portfolio volatility of 8-12% annually, reflected in the CAGR drag modeling.",
      icon: <Activity className="w-4 h-4 text-[#C5A059]" />
    },
    {
      title: "TAX RESIDENCY",
      value: "Global Baseline",
      description: "Default modeling utilizes a standardized 15% long-term realization tax on aggregate capital gains unless overridden.",
      icon: <Shield className="w-4 h-4 text-[#C5A059]" />
    },
    {
      title: "DRAWDOWN SEQUENCE",
      value: "Last-In, First-Out (LIFO)",
      description: "Retirement and scenario modeling assumes a LIFO drawdown logic for secondary capital pools unless specified.",
      icon: <Layers className="w-4 h-4 text-[#C5A059]" />
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#C5A059]/10">
      
      {/* Structural Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/HelpCenter" className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
               <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Link>
            <div className="h-4 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <Scale className="w-4 h-4 text-[#C5A059]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Projection Assumptions <span className="text-slate-300 mx-2 font-normal">/</span> <span className="text-slate-500 text-[9px]">v4.2.0-ELITE</span></p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 divide-y divide-slate-100">
        
        {/* Title Section */}
        <section className="pb-20 space-y-8">
           <div className="flex items-center gap-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.4em]">
             <FileBadge className="w-4 h-4" />
             Variable Silo
           </div>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
             Model <br />
             <span className="text-slate-400 font-medium">Standard Variables.</span>
           </h1>
           <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
             Every projection makes necessary assumptions about the future. By default, WealthLens uses institutional-grade baseline variables derived from historical market performance.
           </p>
        </section>

        {/* Assumptions Grid */}
        <section className="py-20">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {assumptions.map((item, idx) => (
                <div key={idx} className="bg-white p-12 space-y-6 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center justify-between">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                         {item.icon}
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">BASELINE SETTING</span>
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.title}</h3>
                      <p className="text-[#C5A059] text-xs font-bold uppercase tracking-tight">{item.value}</p>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tight italic">{item.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Heuristic Context */}
        <section className="py-20 grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
           <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                 <Info className="w-4 h-4 text-[#C5A059]" />
                 Model Constraints
              </h3>
              <p className="text-slate-500 text-[10px] leading-relaxed font-medium uppercase tracking-tight">
                Users should understand that past performance is not indicative of future results; these assumptions are for heuristic planning only.
              </p>
           </div>
           
           <div className="lg:col-span-2 p-10 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Heuristic Deviation Warning</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight mb-8">
                If your customized return rates or inflation targets deviate significantly from our institutional baseline (e.g. >30% variance), the WealthLens Engine will trigger a "Mathematical Stress Awareness" warning on your dashboard to help prevent over-optimistic modeling.
              </p>
              <div className="flex gap-4">
                 <div className="h-10 px-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Baseline: 6.0% Net
                 </div>
                 <div className="h-10 px-6 bg-[#C5A059] rounded-lg flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-widest shadow-xl shadow-[#C5A059]/20">
                    Custom Threshold
                 </div>
              </div>
           </div>
        </section>

      </main>

      <footer className="py-10 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <span>WealthLens Intelligence Strategy</span>
           <span>v4.2.0-ELITE • Strategic-v2.1</span>
        </div>
      </footer>
    </div>
  );
}
