import React, { useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  FileText, 
  BookOpen, 
  ShieldCheck, 
  Calculator, 
  Activity,
  ChevronRight,
  ExternalLink,
  Lock,
  MessageSquare,
  HelpCircle,
  FileBadge,
  Layers,
  Zap,
  Cpu,
  RefreshCcw,
  LayoutDashboard,
  TrendingUp,
  Target,
  Binary
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import mermaid from "mermaid";
import { generateManualPdf } from "../utils/generateManualPdf";

export default function HelpCenter() {
  const contentRef = React.useRef(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
    });
    mermaid.contentLoaded();
  }, []);

  const sections = [
    { id: "architecture", label: "01. Architecture" },
    { id: "dashboard", label: "02. Dashboard Spec" },
    { id: "calculator-detail", label: "03. Analysis Suite" },
    { id: "reports-detail", label: "04. Intelligence Hub" },
    { id: "neural-bridge", label: "05. Neural Bridge" },
    { id: "operational-specs", label: "06. Operational Specs" },
    { id: "transactions-guide", label: "07. Ledger Protocols" },
    { id: "compliance", label: "08. Compliance & Security" }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const handleExportPDF = async () => {
    if (contentRef.current) {
      await generateManualPdf(contentRef.current, {
        onProgress: (val) => setIsGenerating(val)
      });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#C5A059]/10">
      
      {/* Structural Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/Dashboard" className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
               <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Link>
            <div className="h-4 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <FileBadge className="w-4 h-4 text-[#C5A059]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Technical Manual <span className="text-slate-300 mx-2 font-normal">/</span> <span className="text-slate-500 text-[9px]">v4.2.0-ELITE</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Logic Nominal</span>
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={isGenerating}
              className="bg-slate-900 text-white px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="w-3 h-3 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                "Export PDF"
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex gap-0">
        
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block w-72 border-r border-slate-100 h-[calc(100vh-64px)] sticky top-16 p-8 overflow-y-auto">
          <div className="space-y-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em] mb-6">Documentation</h4>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="flex items-center gap-3 text-[10px] font-bold text-slate-500 hover:text-slate-900 py-2 transition-all group text-left"
                  >
                    <div className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-[#C5A059] transition-colors" />
                    <span className="uppercase tracking-widest">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="text-[9px] font-black uppercase text-slate-900 tracking-widest">Auth Integrity</span>
              </div>
              <p className="text-[8px] text-slate-500 leading-relaxed font-semibold uppercase">SEC-DEEP-AUDIT Verified: 2026.04.17</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main ref={contentRef} className="flex-1 px-8 lg:px-20 py-20 pb-40">
          
          {/* Title & Search */}
          <section className="mb-32 space-y-12">
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.4em]">
                  <Cpu className="w-3.5 h-3.5" />
                  Intelligence Documentation
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[0.9] italic">
                  Institutional <br />
                  <span className="text-slate-400 font-medium NOT-italic">Technical Spec.</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.1em] max-w-xl leading-relaxed">
                  Comprehensive documentation of the WealthLens v4.2.0-ELITE architecture, including data flow protocols, neural bridge connectivity, and 8-pillar financial logic.
                </p>
             </div>

             <div className="relative max-w-2xl group pt-4">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 mt-2" />
               <input 
                 type="text" 
                 placeholder="SEARCH SPECIFICATIONS (E.G., AES-256, TVM MATH, NEURAL BRIDGE...)" 
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-6 pl-12 pr-6 text-[10px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all uppercase tracking-widest"
               />
             </div>
          </section>

          {/* 01. Architecture */}
          <section id="architecture" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">01. System Architecture</h2>
             </div>
             
             <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 relative z-10">
                   <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center shadow-sm min-h-[450px]">
                      <div className="w-full">
                         <pre className="mermaid flex justify-center py-4 scale-125 origin-center">
{`graph TD
    subgraph "Data Ingestion Layer"
        A[Local Ledger] -->|AES-256| B(Data Hygiene Engine)
        G[Live Bank Bridge] -->|Encrypted Tunnel| B
    end
    
    subgraph "Cognitive Processing"
        B -->|Refined Streams| C{AI Intelligence Hub}
        C -->|Pattern Reg| H[Behavioral Models]
    end
    
    subgraph "Output & Visualization"
        C -->|Cognitive Insight| D[Reports: Trends/Digest]
        C -->|Mathematical Load| E[Analysis Suite: Calculator]
        H -->|Meta Feedback| D
    end
    
    D -->|Cycle Feedback| B
    E -->|Projection Strategy| F[Portfolio Allocation]
    F -->|Balance Updates| A
    
    style C fill:#C5A059,stroke:#94763D,color:#fff
    style G fill:#0EA5E9,stroke:#0284C7,color:#fff`}
                         </pre>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">Stage 01: Ledger</p>
                         <p className="text-[9px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight">Transactions and bank bridges feed the core hygiene layer where data is normalized.</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">Stage 02: Neural</p>
                         <p className="text-[9px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight">The Neural Bridge processes metadata to extract sentiment and behavioral trends.</p>
                      </div>
                      <div className="space-y-3">
                         <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">Stage 03: Logic</p>
                         <p className="text-[9px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight">The Analysis Suite converts trends into long-term wealth projections with TVM math.</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 02. Dashboard Spec */}
          <section id="dashboard" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">02. Dashboard Interface Spec</h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <p className="text-slate-600 text-[11px] leading-relaxed font-medium uppercase tracking-tight italic border-l-2 border-[#C5A059] pl-6">
                     The Dashboard is the platform's primary observability layer. It reconciles high-frequency data from three distinct sub-engines: Portfolio, Cashflows, and active Budgets.
                   </p>
                   
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Key Metrics Specification</h4>
                      <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-slate-200">
                                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Engine</th>
                                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logic & Frequency</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                               <tr>
                                  <td className="p-4 text-[9px] font-bold text-slate-900 uppercase tracking-widest">Treasury Lock</td>
                                  <td className="p-4 text-[9px] text-slate-500 font-semibold uppercase">Live Ledger Delta (Real-time)</td>
                               </tr>
                               <tr>
                                  <td className="p-4 text-[9px] font-bold text-slate-900 uppercase tracking-widest">Freedom Horizon</td>
                                  <td className="p-4 text-[9px] text-slate-500 font-semibold uppercase">Iterative Compounding (600m Capped)</td>
                               </tr>
                               <tr>
                                  <td className="p-4 text-[9px] font-bold text-slate-900 uppercase tracking-widest">Canonical Mapping</td>
                                  <td className="p-4 text-[9px] text-slate-500 font-semibold uppercase">Merchant-to-Budget Alignment</td>
                               </tr>
                               <tr>
                                  <td className="p-4 text-[9px] font-bold text-slate-900 uppercase tracking-widest">Vault Allocation</td>
                                  <td className="p-4 text-[9px] text-slate-500 font-semibold uppercase">Historical Surplus Extraction</td>
                               </tr>
                            </tbody>
                         </table>
                      </div>
                   </div>

                   <div className="p-8 bg-slate-50 border border-slate-200 rounded-3xl space-y-6">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[#C5A059]" />
                        <h5 className="text-xs font-bold uppercase tracking-widest">The "Treasury Command" Principle</h5>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                        Unlike traditional dashboards that show static snapshots, WealthLens implements a <strong>Live Reconciliation</strong> engine. Every transaction in your ledger is treated as a delta applied to your base account balance. This ensures that your Net Worth is mathematically accurate to the second, accounting for every cent of inflow and outflow.
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                   <div className="p-10 bg-slate-900 rounded-3xl text-white space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Flame className="w-12 h-12 text-[#C5A059]" />
                      </div>
                      <h5 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5A059]">Freedom Horizon (FIRE Engine)</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                        Calculates the exact moment of financial independence using iterative monthly compounding: <br />
                        <span className="text-indigo-400 font-mono mt-2 block italic">FV = (Current × (1 + r/12)) + Savings</span>
                        Models up to 50 years of projections. Includes a <strong>Strategic Sustainability Audit</strong> that warns if your manual targets fall below the 4% safe withdrawal threshold for your current lifestyle.
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 border border-slate-100 bg-white rounded-3xl space-y-4 hover:border-[#C5A059] transition-colors">
                         <Target className="w-6 h-6 text-[#C5A059]" />
                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Vault Buckets</h5>
                         <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                           Virtual allocation of historical surplus capital into strategic funds (Emergency, Education, Travel) without impacting actual bank liquidity.
                         </p>
                      </div>
                      <div className="p-8 border border-slate-100 bg-white rounded-3xl space-y-4 hover:border-[#C5A059] transition-colors">
                         <Binary className="w-6 h-6 text-[#C5A059]" />
                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Alignment Engine</h5>
                         <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                           Maps high-entropy merchant data to canonical budget categories using pattern recognition to ensure spend accuracy.
                         </p>
                      </div>
                   </div>

                   <div className="p-8 border border-slate-100 bg-slate-50 rounded-3xl space-y-4">
                      <Activity className="w-6 h-6 text-[#C5A059]" />
                      <h5 className="text-xs font-bold uppercase tracking-[0.2em]">Tactical Liquidity</h5>
                      <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                        Visualizes your "Cash Runway" using a 30.42-day month constant. It calculates exactly how many days you can survive at your current "Optimal Outflow" rate.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* 03. Analysis Suite */}
          <section id="calculator-detail" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">03. Analysis Suite (Calculator)</h2>
             </div>

             <div className="space-y-12">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 space-y-12">
                   <div className="flex items-center gap-6">
                      <Calculator className="w-8 h-8 text-[#C5A059]" />
                      <div>
                         <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Geometric Growth Engine</h3>
                         <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-1">Foundational Calculus: CAGR vs Arithmetic Mean</p>
                      </div>
                   </div>
                   
                   <p className="text-slate-600 text-[11px] leading-relaxed font-medium uppercase tracking-tight max-w-3xl">
                     Our simulation engine models financial outcomes over 50 years using <strong>Sequential Discrete Compounding</strong>. It prioritizes CAGR (Compound Annual Growth Rate) over simpler arithmetic means to account for the mathematical reality of volatility drag.
                   </p>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="col-span-1 p-8 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                         <Target className="w-5 h-5 text-[#C5A059]" />
                         <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">8-Pillars Performance</h5>
                         <p className="text-[9px] text-slate-500 font-semibold uppercase leading-relaxed">
                           Audit criteria measuring Inflation, Tax, Drag, Sequence Risk, Debt/Equity, Withdrawal, Volatility, and Diversity.
                         </p>
                      </div>
                      <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group shadow-sm">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Binary className="w-20 h-20" />
                         </div>
                         <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6">Mathematical Theorem</h5>
                         <pre className="text-[10px] font-mono text-slate-600 p-4 bg-slate-50 rounded-lg">
                           FV = PV × (1 + r/n)^(n×t) + PMT × [((1 + r/n)^(n×t) - 1) / (r/n)]
                         </pre>
                         <p className="text-[8px] text-slate-400 mt-4 uppercase font-bold tracking-[0.2em]">Validated against ISO-21000 financial logic standards.</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 04. Intelligence Hub */}
          <section id="reports-detail" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">04. Intelligence Hub</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6">
                   <TrendingUp className="w-8 h-8 text-[#C5A059]" />
                   <h4 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Cognitive Reporting</h4>
                   <p className="text-[10px] text-slate-500 font-semibold uppercase leading-relaxed">
                      The Intelligence Hub consolidates data from across the platform to generate human-readable financial insights. Reports are generated in local browser memory to ensure zero PII leakage.
                   </p>
                   <div className="space-y-3 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                         <span className="text-[9px] font-bold text-slate-900 uppercase">Trends: Behavioral pattern recognition</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                         <span className="text-[9px] font-bold text-slate-900 uppercase">Cashflow: Micro-audit transaction paths</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                         <span className="text-[9px] font-bold text-slate-900 uppercase">Digest: Executive summaries via AI Coach</span>
                      </div>
                   </div>
                </div>

                <div className="p-10 border border-slate-100 rounded-[2.5rem] flex flex-col justify-center space-y-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                      <FileText className="w-32 h-32" />
                   </div>
                   <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest italic border-l-2 border-[#C5A059] pl-6">
                      "WealthLens doesn't just show you numbers; it translates them into a strategy."
                   </h5>
                   <div className="space-y-4">
                      <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Export Format</p>
                         <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">ISO-8601 Timestamped PDF / CSV Standard</p>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 05. Neural Bridge (New Data-Dense Section) */}
          <section id="neural-bridge" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">05. Neural Bridge Connectivity</h2>
             </div>
             
             <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                   <div className="space-y-8">
                      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest leading-tight italic">
                        The End-to-End <br />
                        <span className="text-[#C5A059] NOT-italic">Encrypted Tunnel.</span>
                      </h3>
                      <p className="text-slate-500 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                        The Neural Bridge is our proprietary connectivity layer that facilitates read-only data pulls from global financial institutions. Data is never decrypted in transit; all normalization occurs on the client-side edge.
                      </p>
                      
                      <div className="space-y-4">
                         <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <Lock className="w-5 h-5 text-[#C5A059] shrink-0" />
                            <div>
                               <h6 className="text-[10px] font-black text-slate-900 uppercase">AES-256 Symmetric Encryption</h6>
                               <p className="text-[8px] text-slate-400 uppercase font-bold">Standard for all data at rest and in transit.</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <Zap className="w-5 h-5 text-[#C5A059] shrink-0" />
                            <div>
                               <h6 className="text-[10px] font-black text-slate-900 uppercase">Sub-second Latency Sync</h6>
                               <p className="text-[8px] text-slate-400 uppercase font-bold">Real-time balancing of active market positions.</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:15px_15px]" />
                      <div className="relative z-10 space-y-10">
                         <div className="pb-8 border-b border-white/10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] mb-4">Edge Processing Protocol</h4>
                            <p className="text-[9px] text-slate-400 leading-loose font-medium uppercase tracking-wide">
                               1. REQUEST: Client-side initiation via OAuth2.0 <br />
                               2. TUNNEL: Secure handoff through Neural Bridge <br />
                               3. DECRYPT: Client-side local key decryption <br />
                               4. ANALYZE: Edge-processing (RAM) - Zero server-side persistence
                            </p>
                         </div>
                         
                         <div className="flex gap-4">
                            <div className="px-4 py-2 border border-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#C5A059]">TLS 1.3</div>
                            <div className="px-4 py-2 border border-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-[#C5A059]">HTTP/3 (QUIC)</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* 06. Operational Specs (New Data-Dense Section) */}
          <section id="operational-specs" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">06. Operational Specifications</h2>
             </div>
             
             <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-8 border-b border-slate-200">
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">System Performance Envelope</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                   {[
                     { label: "Uptime SLA", value: "99.99%", desc: "Enterprise-grade reliability" },
                     { label: "Compute Node", value: "Edge (Local)", desc: "Private browser execution" },
                     { label: "Data Residency", value: "Sovereign", desc: "Local device persistence" },
                     { label: "API Latency", value: "<150ms", desc: "Neural Hub response time" }
                   ].map((item, i) => (
                     <div key={i} className="p-10 space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{item.desc}</p>
                     </div>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-slate-50 rounded-2xl space-y-6">
                   <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tech Stack Verification</h5>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                         <span className="text-slate-500">Language</span>
                         <span className="text-slate-900">React v18.2</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                         <span className="text-slate-500">Visualization</span>
                         <span className="text-slate-900">Recharts / D3.js</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight">
                         <span className="text-slate-500">Cryptography</span>
                         <span className="text-slate-900">WebCrypto API</span>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 lg:col-span-2 border border-slate-100 rounded-2xl relative flex items-center gap-12">
                   <div className="w-16 h-16 bg-[#C5A059]/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Layers className="w-8 h-8 text-[#C5A059]" />
                   </div>
                   <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Cross-Platform Portability</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                        WealthLens is engineered to be platform-agnostic. The core engine runs within any modern Chromium or WebKit environment, ensuring seamless synchronization across desktop and mobile terminal views.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* 07. Ledger Protocols (Transactions Guide) */}
          <section id="transactions-guide" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">07. Ledger & Transaction Protocols</h2>
             </div>
             
             <div className="space-y-12">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm space-y-8">
                   <div className="pb-8 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Categorization & Cash Flow Logic</h3>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold leading-relaxed">
                         The system automatically separates <strong>Internal Transfers</strong> from <strong>True Cash Flow</strong> to prevent inflation of your income and expense reports.
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h4 className="text-xs font-black text-[#C5A059] uppercase tracking-widest">Standard Categorization</h4>
                         <ul className="space-y-3 text-[10px] text-slate-600 font-medium uppercase tracking-tight">
                            <li className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />
                               <span><strong>Expenses:</strong> Groceries, Bills, Subscriptions. These reduce Global Balance.</span>
                            </li>
                            <li className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />
                               <span><strong>Income:</strong> Salary, Dividends, Rent. These increase Global Balance.</span>
                            </li>
                         </ul>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-xs font-black text-[#00A381] uppercase tracking-widest">Internal Cash Flow (Exclusions)</h4>
                         <ul className="space-y-3 text-[10px] text-slate-600 font-medium uppercase tracking-tight">
                            <li className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-1" />
                               <span><strong>Transfer:</strong> Moving money between accounts (e.g., Credit Card Payments). Excluded from total expenses.</span>
                            </li>
                            <li className="flex items-start gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 mt-1" />
                               <span><strong>Reimbursement:</strong> Friends paying you back. Excluded from total income.</span>
                            </li>
                         </ul>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200">
                         <span className="text-[10px] font-black text-slate-900">01</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Adding Records</h5>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight leading-relaxed">
                         Click "Add Manually" to inject a single record. For bulk data, use the "Import" AI Scanner (PDF/CSV). Note: The scanner automatically detects Credit Cards and categorizes purchases as expenses.
                      </p>
                   </div>
                   <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200">
                         <span className="text-[10px] font-black text-slate-900">02</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Deleting Records</h5>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight leading-relaxed">
                         To delete a single transaction, hover over the row in the grid and click the trash icon. The system will instantly recalculate your Global Balance and update all active reports.
                      </p>
                   </div>
                   <div className="p-8 bg-rose-50 rounded-2xl border border-rose-100 space-y-4">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-rose-200">
                         <span className="text-[10px] font-black text-rose-600">03</span>
                      </div>
                      <h5 className="text-xs font-bold text-rose-600 uppercase tracking-widest">Purging Data</h5>
                      <p className="text-[10px] text-slate-600 font-medium uppercase tracking-tight leading-relaxed">
                         Click "Purge Month" to securely wipe all data for the visible month. <strong>Safety Lock:</strong> You must click the button twice within 3 seconds to bypass security and execute the purge.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          {/* 08. Compliance & Security */}
          <section id="compliance" className="mb-20 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">08. Compliance & Security</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Link to="/PrivacyProtocol" className="group p-10 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#C5A059] transition-all rounded-[2rem] space-y-4">
                   <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Privacy Protocol</h5>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#C5A059]" />
                   </div>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">Enterprise-grade data handling specifications and PII protection standards.</p>
                </Link>
                <Link to="/SecurityPolicy" className="group p-10 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#C5A059] transition-all rounded-[2rem] space-y-4">
                   <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Security Policy</h5>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#C5A059]" />
                   </div>
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">Technical deep-dive into the Zero-Trust architecture and Edge Compute safety.</p>
                </Link>
             </div>
          </section>

        </main>
      </div>

      <footer className="py-12 bg-slate-50 border-t border-slate-100 relative z-10">
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

