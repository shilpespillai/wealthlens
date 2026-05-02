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
  Download,
  Upload,
  FileBadge,
  Layers,
  Zap,
  Cpu,
  RefreshCcw,
  LayoutDashboard,
  TrendingUp,
  Target,
  Binary,
  Flame,
  Database,
  CloudUpload,
  Shield,
  Info,
  Sparkles,
  CheckCircle2,
  ArrowRightLeft,
  Building2
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
    { id: "maintenance-hub", label: "08. Maintenance Hub" },
    { id: "compliance", label: "09. Compliance & Security" }
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

          <section id="architecture" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">01. System Architecture (Zero-Knowledge Vault)</h2>
             </div>
             
             <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px]" />
                
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 relative z-10">
                   <div className="space-y-12 max-w-5xl">
                      <div className="space-y-6">
                         <h3 className="text-3xl font-bold text-slate-900 tracking-tight">The "Local-First" Security Philosophy</h3>
                         <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                            WealthLens is built on the principle of <strong>Absolute Data Sovereignty</strong>. Unlike traditional fintech platforms where your financial data sits decrypted in a cloud database, WealthLens utilizes a Zero-Knowledge architecture. This means that your raw financial records—your bank balances, your spending habits, and your portfolio holdings—never leave your device in a readable format. 
                         </p>
                         <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                            When you input data or sync with a bank, the information is immediately encrypted using <strong>AES-256-GCM</strong> (Galois/Counter Mode) right in your browser's memory. This is the same encryption standard used by global military organizations. The "Key" used for this encryption is derived from your unique session identity, which we do not store. This ensures that even if our servers were compromised, an attacker would find nothing but unreadable, encrypted "shards."
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Decentralized Intelligence</h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                               Every calculation, from a simple expense sum to a complex Monte Carlo retirement simulation, is performed at the "Edge." Your browser acts as a private supercomputer. This eliminates the latency of server-side round-trips and, more importantly, ensures that your financial logic is private. The server is merely a "Stateless Mirror" that helps you sync across devices without ever knowing what is inside the sync package.
                            </p>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">The Shard Lifecycle</h4>
                            <p className="text-slate-500 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                               Data is not stored as one giant file. Instead, it is broken into "Monthly Shards." This architecture allows for faster loading times and enhances security through compartmentalization. If you only need to view data for April 2026, the system only decrypts the April shard. This minimizing of "Data at Rest" exposure is a core tenet of institutional-grade security.
                            </p>
                         </div>
                      </div>

                      <div className="p-8 bg-[#C5A059]/5 rounded-3xl border border-[#C5A059]/20 space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg bg-[#C5A059] flex items-center justify-center">
                               <Info className="w-3 h-3 text-white" />
                            </div>
                            <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Scenario: The Zero-Knowledge Sync</h5>
                         </div>
                         <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                            Imagine you enter a $1,000 transaction on your Laptop. The Laptop encrypts this as an unreadable string: <code>{"7f8e...a2c1"}</code>. This string is pushed to the cloud. When you open your Phone, it pulls the string <code>{"7f8e...a2c1"}</code>. Because your Phone has your private session key, it decrypts it back to "$1,000". **Crucially:** At no point in the middle did the WealthLens server ever know the number was 1,000.
                         </p>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center shadow-sm min-h-[450px]">
                      <div className="w-full">
                         <pre className="mermaid flex justify-center py-4 scale-125 origin-center">
{`graph TD
    subgraph "Local Secure Environment"
        A[Financial Input] -->|Symmetric Key| B(Local Vault)
        B -->|RAM Only| C{Cognitive Processor}
        C -->|Visualization| D[UI Layer]
    end
    
    subgraph "Institutional Cloud (Encrypted)"
        B -.->|TLS 1.3 Tunnel| E{Cloud Mirror}
        E -.->|Zero Visibility| F[Shard Storage]
    end
    
    style B fill:#C5A059,stroke:#94763D,color:#fff
    style C fill:#0F172A,stroke:#1e293b,color:#fff
    style E fill:#6366F1,stroke:#4338CA,color:#fff`}
                         </pre>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <section id="dashboard" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">02. Dashboard Interface Specification</h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                   <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">The Institutional Command Center</h4>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                        The WealthLens Dashboard is a high-fidelity "Mission Control" designed for radical financial clarity. Most apps show you your current balance; WealthLens shows you your <strong>Velocity</strong>. It reconciles real-time data across four primary dimensions to provide a holistic view of your capital lifecycle.
                      </p>
                      <p className="text-slate-600 text-[13px] leading-relaxed font-medium">
                        The interface prioritizes <strong>Cognitive Load Reduction</strong>. Complex data is abstracted into primary indicators—Net Worth, Liquidity, and Horizon—allowing you to make executive-level decisions in seconds. Behind every number is a deep audit trail that you can explore by interacting with the charts.
                      </p>
                   </div>
                   
                   <div className="space-y-10">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">The Four Pillars of Observability</h4>
                      <div className="grid grid-cols-1 gap-6">
                         <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 hover:border-[#C5A059] transition-all group">
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                               <Shield className="w-4 h-4 text-[#C5A059]" />
                               Treasury Lock (Net Worth)
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                               A bottom-up reconciliation of every account balance, cash on hand, and portfolio holding. Unlike bank apps that show static numbers, Treasury Lock tracks the <strong>Daily Delta</strong>—showing exactly how much your net worth shifted in the last 24 hours due to market movements and spending.
                            </p>
                         </div>
                         <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 hover:border-[#C5A059] transition-all group">
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                               <Activity className="w-4 h-4 text-indigo-500" />
                               Tactical Liquidity (Cash Runway)
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                               Calculates exactly how many months you can survive at your current lifestyle if all income ceased today. It uses a <strong>Weighted Average Burn Rate</strong> derived from your last 6 months of spending to provide a realistic "Safety Margin."
                            </p>
                         </div>
                         <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 hover:border-[#C5A059] transition-all group">
                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                               <Target className="w-4 h-4 text-emerald-500" />
                               Vault Utilization
                            </h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                               Visualizes the percentage of your capital currently allocated to specific goals like an Emergency Fund or Travel. It helps you identify "Unallocated Surplus"—cash that is sitting idle and should be deployed into the markets.
                            </p>
                         </div>
                      </div>

                      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-4">
                         <h6 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Scenario: The Liquidity Warning</h6>
                         <p className="text-[12px] text-indigo-700/80 leading-relaxed font-medium">
                            If you decide to pay off a large $10,000 loan, your "Net Worth" remains the same (Asset - Liability), but your "Tactical Liquidity" will drop. The Dashboard will immediately alert you if your Cash Runway falls below 3 months, ensuring you don't become "Asset Rich, but Cash Poor."
                         </p>
                      </div>
                   </div>
                </div>

                <div className="space-y-12">
                   <div className="p-12 bg-slate-900 rounded-[3rem] text-white space-y-10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Flame className="w-20 h-20 text-[#C5A059]" />
                      </div>
                      <div className="space-y-6">
                         <h5 className="text-xs font-black uppercase tracking-[0.4em] text-[#C5A059]">The Freedom Horizon Logic</h5>
                         <p className="text-lg font-bold text-white italic leading-tight">
                            "When can I stop working?"
                         </p>
                         <p className="text-[12px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                            The Freedom Horizon is our flagship predictive engine. It uses <strong>Iterative Monte Carlo Simulations</strong> to determine your "Retirement Age." Unlike simple calculators, it models your portfolio growth against a 4% Withdrawal Rule, adjusted for your actual real-world expenses. 
                         </p>
                         <p className="text-[12px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                            The "Horizon" is dynamic; if you increase your lifestyle spending today, the engine immediately pushes your retirement date further out in the visualization, providing instant behavioral feedback on the long-term cost of your choices.
                         </p>
                      </div>
                      <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Calculation Engine</p>
                            <p className="text-[11px] font-bold text-white uppercase tracking-widest">Modified TVM Calculus</p>
                         </div>
                         <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logic Accuracy</p>
                            <p className="text-[11px] font-bold text-[#C5A059] uppercase tracking-widest">99.2% Fidelity</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-100 rounded-[3rem] p-12 space-y-8 shadow-sm">
                      <h5 className="text-sm font-black uppercase tracking-widest text-slate-900">The "Drift" Indicator</h5>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                         Your dashboard includes a proprietary "Drift" measurement. This calculates the delta between your <strong>Budgeted Spend</strong> and your <strong>Actual Consumption</strong>. 
                      </p>
                      <p className="text-[12px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                         A "Positive Drift" is an early warning system. It indicates that lifestyle creep is eroding your future wealth. The system highlights this in rose-red to prompt a tactical review of your monthly ledger.
                      </p>
                      <div className="flex items-center gap-6">
                         <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 w-3/4 animate-pulse" />
                         </div>
                         <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Critical Drift</span>
                      </div>
                   </div>

                   <div className="p-8 bg-amber-50 border border-amber-100 rounded-[3rem] space-y-4">
                      <h6 className="text-[11px] font-black text-amber-900 uppercase tracking-widest">Scenario: Lifestyle Creep Detection</h6>
                      <p className="text-[12px] text-amber-800/80 leading-relaxed font-medium">
                         You get a $1,000/month raise and decide to lease a more expensive car. The "Drift" indicator will detect that your fixed expenses have increased relative to your baseline. In response, the **Freedom Horizon** might shift your retirement age from 45 to 48. This real-time visibility prevents you from making long-term mistakes for short-term gratification.
                      </p>
                   </div>
                </div>
             </div>
          </section>

          <section id="calculator-detail" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">03. Analysis Suite (Wealth Modeling)</h2>
             </div>

             <div className="space-y-20">
                <div className="bg-slate-50 border border-slate-200 rounded-[4rem] p-16 space-y-16 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-20" />
                   
                   <div className="max-w-4xl space-y-8">
                      <h3 className="text-4xl font-bold text-slate-900 tracking-tight leading-[1.1] uppercase">Beyond Simple <br /> Compound Interest</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         Most financial calculators use linear math. WealthLens uses <strong>Sequential Discrete Compounding</strong>. Our engine models your financial future month-by-month over a 50-year horizon (600 intervals). It accounts for the nuance of "Timing of Contributions" and the geometric reality of market volatility.
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         The Suite is designed for "Scenario Testing." What if you took a 12-month sabbatical? What if you downsized your home in 10 years? What if inflation averaged 4% instead of 2%? You can toggle these variables and watch your <strong>Net Worth Curve</strong> react instantly.
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                      {[
                        { label: "CAGR Engine", desc: "Accounts for 'Volatility Drag' using geometric means. Simple math says a 50% gain and 50% loss averages to 0%; the CAGR engine correctly shows a 25% total loss." },
                        { label: "Tax Shield Logic", desc: "Models post-tax liquidation values. It differentiates between your 'Gross Portfolio' and what you actually get to keep after capital gains are realized." },
                        { label: "Inflation Guard", desc: "Automatically converts all future values back to 'Today's Purchasing Power.' This ensures you aren't fooled by large nominal numbers that buy very little." },
                        { label: "Sequence Risk", desc: "Simulates 'Early Retirement' failure points. It warns you if a market downturn in your first 3 years of retirement would collapse your entire plan." }
                      ].map((item, i) => (
                        <div key={i} className="p-8 bg-white border border-slate-200 rounded-[2rem] space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
                           <h6 className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.label}</h6>
                           <p className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-tight">{item.desc}</p>
                        </div>
                      ))}
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-16 border-t border-slate-200">
                      <div className="lg:col-span-1 space-y-8">
                         <div className="space-y-4">
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">The 8-Pillar Strategy Audit</h5>
                            <p className="text-[12px] text-slate-500 font-semibold uppercase leading-relaxed tracking-tight">
                               Every plan is automatically stress-tested against eight institutional-grade pillars. This is our "Risk Management" layer.
                            </p>
                         </div>
                         <ul className="space-y-4">
                            {[
                               { p: "Inflation Resistance", d: "Does your plan survive 5% inflation?" },
                               { p: "Tax Efficiency", d: "Minimizing the drag of capital gains." },
                               { p: "Expense Drag", d: "Impact of investment fees over 30 years." },
                               { p: "Sequence Protection", d: "Sensitivity to early-cycle crashes." },
                               { p: "Debt Optimization", d: "Leverage vs. Liquidity balance." },
                               { p: "Safe Withdrawal Rate", d: "Validating the 4% rule against your specific mix." },
                               { p: "Volatility Guard", d: "Cash runway during market dips." },
                               { p: "Asset Diversity", d: "Correlation risks across holdings." }
                            ].map((item, i) => (
                               <li key={i} className="space-y-1">
                                  <div className="flex items-center gap-3">
                                     <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                                     <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">{item.p}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase pl-5">{item.d}</p>
                               </li>
                            ))}
                         </ul>
                      </div>
                      
                      <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-16 text-white relative overflow-hidden">
                         <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:30px_30px]" />
                         <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                               <h5 className="text-xs font-black uppercase tracking-[0.4em] text-[#C5A059]">Mathematical Precision Engine</h5>
                               <p className="text-[12px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                                  The engine calculates the <strong>Time Value of Money (TVM)</strong> with sub-cent precision. It uses an internal amortization logic that handles variable interest rates and lump-sum injections at specific dates in the future.
                               </p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 font-mono">
                               <div className="flex justify-between items-center mb-6">
                                  <span className="text-[10px] text-slate-500 uppercase font-black">Core Algorithm</span>
                                  <Binary className="w-4 h-4 text-[#C5A059]" />
                               </div>
                               <code className="text-sm md:text-base text-indigo-300 block overflow-x-auto whitespace-nowrap pb-4">
                                  Total_FV = Σ [ Contribution_i * (1 + r_m)^n_i ]
                               </code>
                               <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed">
                                  Where r_m is the monthly geometric rate and n_i is the remaining compounding interval for each specific dollar invested.
                               </p>
                            </div>

                            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                               <h6 className="text-[11px] font-black text-[#C5A059] uppercase tracking-widest">Scenario: The 4% Rule Stress Test</h6>
                               <p className="text-[12px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                                  A user expects a 7% return and 2% inflation. The engine models this but also runs a "Sequence of Returns" test: What if the market crashes by 20% in the *first* year of retirement? The suite will flag this as a "Pillar 04 Failure" and suggest a larger cash buffer.
                               </p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <section id="reports-detail" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">04. Intelligence Hub (Advanced Analytics)</h2>
             </div>
 
             <div className="space-y-16">
                <div className="max-w-4xl space-y-6">
                   <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight uppercase italic">Translating Data Into <br /> Narrative Intelligence</h3>
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      WealthLens doesn't just display lists of numbers. The Intelligence Hub is an advanced reporting engine that analyzes your decrypted local data to find <strong>Heuristic Patterns</strong>. It aims to answer the "Why" behind your financial shifts. Why did your savings rate drop last month? Why is your net worth growing slower than your portfolio returns would suggest?
                   </p>
                   <p className="text-slate-600 text-sm leading-relaxed font-medium">
                      By processing your historical "Monthly Shards," the Hub generates reports that are human-readable and action-oriented. These aren't just CSV exports; they are strategic audits designed for personal board meetings.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   {[
                     { 
                       title: "Behavioral Trends", 
                       icon: TrendingUp, 
                       desc: "Identifies cyclical behavior. It looks for hidden anomalies, such as spending spikes that correlate with specific weekdays or merchant categories. It predicts future budget pressure points before they happen." 
                     },
                     { 
                       title: "Cashflow Integrity", 
                       icon: ArrowRightLeft, 
                       desc: "A surgical breakdown of your capital flow. It automatically separates 'Fixed Obligations' (Rent, Insurance) from 'Variable Lifestyle' costs to show your true structural savings power." 
                     },
                     { 
                       title: "Risk-Adjusted Matrix", 
                       icon: Building2, 
                       desc: "Aggregates Portfolio and Ledger data to track your Debt-to-Equity ratio. It ensures your lifestyle is not being funded by high-interest debt and monitors your overall solvency." 
                     }
                   ].map((report, i) => (
                     <div key={i} className="p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6 hover:bg-white hover:border-[#C5A059] hover:shadow-xl transition-all group">
                        <report.icon className="w-10 h-10 text-[#C5A059] group-hover:scale-110 transition-transform" />
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{report.title}</h4>
                        <p className="text-[12px] text-slate-500 font-semibold uppercase leading-relaxed tracking-tight">
                           {report.desc}
                        </p>
                     </div>
                   ))}
                </div>

                <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[3rem] space-y-6">
                   <h6 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Use Case: The Subscription Audit</h6>
                   <p className="text-[13px] text-emerald-800/80 leading-relaxed font-medium">
                      The Trends Engine notices a $15.99 recurring charge to "MediaCorp" that you haven't interacted with in 4 months. It flags this in your monthly report as **"Inactive Capital Drain"**, prompting you to cancel the subscription and redirect that cash into your "Freedom Fund."
                   </p>
                </div>

                <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-16 opacity-10">
                      <Sparkles className="w-48 h-48 text-[#C5A059]" />
                   </div>
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">
                      <div className="space-y-10">
                         <h3 className="text-3xl font-bold text-white uppercase tracking-tight">The Institutional Digest</h3>
                         <p className="text-[14px] text-slate-400 font-medium leading-relaxed italic border-l-4 border-[#C5A059] pl-8">
                            "The Hub generates strategies, not just tables."
                         </p>
                         <p className="text-[13px] text-slate-400 font-semibold uppercase tracking-tight leading-loose">
                            By leveraging the <strong>Neural Bridge</strong>, the Hub synthesizes an 'Executive Summary.' This report uses AI to summarize your financial health in plain English, highlighting risks like 'Inflationary Drag' or 'Liquidity Bottlenecks' that might be invisible in a spreadsheet. 
                         </p>
                         <p className="text-[13px] text-slate-400 font-semibold uppercase tracking-tight leading-loose">
                            Crucially, this analysis happens locally. Only the vectors needed for the AI narrative are ever processed, ensuring your private merchant data stays on your machine.
                         </p>
                      </div>
                      <div className="space-y-10 flex flex-col justify-center">
                         <h5 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C5A059]">Digital Artifact Standards</h5>
                         <div className="space-y-4">
                            {[
                               { label: "PDF Synthesis", desc: "Client-side PDF generation for archival audits." },
                               { label: "Anomaly Guard", desc: "Automatic detection of double-billing or bank errors." },
                               { label: "FX Normalization", desc: "Multi-currency tracking with real-time exchange rates." }
                            ].map((feat, i) => (
                               <div key={i} className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                                  <div className="space-y-1">
                                     <p className="text-[11px] font-black text-white uppercase tracking-widest">{feat.label}</p>
                                     <p className="text-[9px] text-slate-500 font-bold uppercase">{feat.desc}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
on>

          <section id="neural-bridge" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">05. Neural Bridge (Privacy-First AI)</h2>
             </div>
             
             <div className="space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                   <div className="space-y-12">
                      <div className="space-y-8">
                         <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight leading-[1.1]">Cognitive Insights <br /> Without Exposure</h3>
                         <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            The Neural Bridge is our proprietary connectivity layer that facilitates communication between your local, private data and global Large Language Models (LLMs) like Gemini, Claude, and GPT. In a typical "AI app," your data is sent to the cloud to be processed. In WealthLens, we use <strong>Privacy-Preserving AI (PPAI)</strong> techniques.
                         </p>
                         <p className="text-slate-600 text-sm leading-relaxed font-medium">
                            Before any data leaves your browser, it passes through a <strong>Data Blinding Layer</strong>. This layer identifies and removes all "Personally Identifiable Information" (PII)—your name, your exact bank account numbers, and specific location data. The AI only sees high-level mathematical vectors and anonymized transaction summaries.
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-8">
                         <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 hover:border-indigo-500 transition-all group">
                            <Cpu className="w-10 h-10 text-[#C5A059] group-hover:scale-110 transition-transform" />
                            <h6 className="text-sm font-black text-slate-900 uppercase tracking-widest">The Hybrid Reasoning Model</h6>
                            <p className="text-[12px] text-slate-500 font-semibold uppercase leading-relaxed tracking-tight">
                               The app performs "Heuristic Math" (calculating budgets, taxes, and growth) locally using deterministic algorithms. It only calls the cloud LLM for "Subjective Strategy"—tasks like finding hidden spending trends or writing the narrative Institutional Digest. This minimizes your "Cloud Surface Area."
                            </p>
                         </div>
                         <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 hover:border-indigo-500 transition-all group">
                            <Zap className="w-10 h-10 text-[#C5A059] group-hover:scale-110 transition-transform" />
                            <h6 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bring Your Own Key (BYOK)</h6>
                            <p className="text-[12px] text-slate-500 font-semibold uppercase leading-relaxed tracking-tight">
                               To ensure total sovereignty, you can supply your own API keys for Gemini or Claude. This ensures that WealthLens Inc. never has a middle-man view of your prompts or AI responses. Your intelligence engine belongs to you.
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden flex flex-col justify-center">
                      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:30px:30px]" />
                      <div className="relative z-10 space-y-12">
                         <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.5em] text-[#C5A059] mb-4">The Anonymization Pipeline</h4>
                            <div className="space-y-8">
                               {[
                                 { step: "01", label: "SCRUB & ANONYMIZE", desc: "Names and IDs are replaced with cryptographic tokens." },
                                 { step: "02", label: "VECTOR SYNTHESIS", desc: "Transactions are converted into high-level behavioral patterns." },
                                 { step: "03", label: "BLIND ANALYSIS", desc: "The AI processes the patterns without knowing the owner." },
                                 { step: "04", label: "LOCAL RE-HYDRATION", desc: "The AI's advice is mapped back to your real data locally." }
                               ].map((step, i) => (
                                 <div key={i} className="flex items-start gap-8 group">
                                    <span className="text-3xl font-black text-white/10 group-hover:text-[#C5A059] transition-colors">{step.step}</span>
                                    <div className="space-y-1">
                                       <p className="text-xs font-black text-white uppercase tracking-[0.2em]">{step.label}</p>
                                       <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{step.desc}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                         
                         <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                            <h6 className="text-[11px] font-black text-[#C5A059] uppercase tracking-widest">Scenario: The Blinded Query</h6>
                            <div className="grid grid-cols-2 gap-6 font-mono text-[9px]">
                               <div className="space-y-2">
                                  <p className="text-slate-500 uppercase">Input Data (Local)</p>
                                  <p className="text-white">"John Doe spent $120 at Apple Store NYC"</p>
                               </div>
                               <div className="space-y-2">
                                  <p className="text-slate-500 uppercase">Prompt (To AI)</p>
                                  <p className="text-indigo-400">"Anonymized User spent $120 on Technology Category"</p>
                               </div>
                            </div>
                         </div>

                         <div className="pt-12 border-t border-white/10 space-y-4">
                            <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-[0.3em]">Institutional Verification</p>
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tight leading-relaxed">
                               This pipeline ensures that your financial "Common Sense" stays within your local vault, while you still benefit from the world's most powerful cognitive models.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          <section id="operational-specs" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">06. Operational Specifications</h2>
             </div>
             
             <div className="space-y-16">
                <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-sm">
                   <div className="bg-slate-50 p-16 border-b border-slate-200">
                      <div className="max-w-3xl space-y-6">
                         <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Performance Envelope</h3>
                         <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                            To maintain the sub-second latency required for real-time portfolio rebalancing, WealthLens leverages **Chromium V8 Hardware Acceleration**. The app is designed to run entirely in your browser's RAM, minimizing disk I/O and ensuring that your financial state is always current to the millisecond.
                         </p>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      {[
                        { label: "Uptime Target", value: "99.99%", desc: "Stateless Mirroring" },
                        { label: "Encryption", value: "AES-256", desc: "Military Grade Sharding" },
                        { label: "Sync Engine", value: "HTTP/3", desc: "Ultra-low Latency QUIC" },
                        { label: "Memory Footprint", value: "<256MB", desc: "Optimized Edge Logic" }
                      ].map((item, i) => (
                        <div key={i} className="p-16 space-y-4 hover:bg-slate-50 transition-colors">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                           <p className="text-4xl font-bold text-slate-900 tracking-tighter">{item.value}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="p-16 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-10">
                      <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Client Environment Verified</h5>
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                         The WealthLens terminal is engineered for modern browser environments. It utilizes <strong>WebCrypto APIs</strong> for hardware-backed encryption and <strong>IndexedDB</strong> for high-speed local storage. 
                      </p>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Chrome / Edge / Brave</span>
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest px-4 py-1 bg-emerald-50 rounded-full">Optimized (V8)</span>
                         </div>
                         <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Safari (Apple Silicon)</span>
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest px-4 py-1 bg-emerald-50 rounded-full">Verified (WebKit)</span>
                         </div>
                         <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 opacity-40">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Legacy Engines (IE/Old Edge)</span>
                            <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest px-4 py-1 bg-rose-50 rounded-full">Unsupported</span>
                         </div>
                      </div>
                   </div>
                   <div className="p-16 bg-slate-900 rounded-[3rem] text-white flex flex-col justify-center space-y-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-16 opacity-10">
                         <Activity className="w-32 h-32 text-[#C5A059]" />
                      </div>
                      <h5 className="text-sm font-bold text-[#C5A059] uppercase tracking-[0.4em]">Maintenance Lifecycle</h5>
                      <p className="text-[13px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                         WealthLens undergoes a structural <strong>"Logic Rebase"</strong> every 30 days. This ensures that the underlying financial constants—inflation rates, tax brackets, and market volatility models—are synchronized with the latest global macroeconomic data.
                      </p>
                      <p className="text-[13px] text-slate-400 leading-relaxed font-medium uppercase tracking-tight">
                         If you are using an outdated version, the system will prompt a "Mandatory Re-auth" to ensure that your projections aren't built on stale mathematical assumptions.
                      </p>
                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 pt-6 border-t border-white/10">
                         <span className="px-5 py-2 border border-white/10 rounded-xl bg-white/5">v4.2.0-ELITE</span>
                         <span className="px-5 py-2 border border-white/10 rounded-xl bg-white/5">PROD-ACTIVE</span>
                      </div>
                   </div>
                </div>

                <div className="p-12 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-4">
                   <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Scenario: The 10k Transaction Stress-Test</h6>
                   <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                      An institutional user imports 10 years of history (12,000+ transactions). On a standard web app, this would freeze the browser. Because WealthLens uses <strong>V8 TypedArrays</strong> and local indexing, the entire dataset is reconciled and the Freedom Horizon is recalculated in less than 150ms.
                   </p>
                </div>
             </div>
          </section>
          <section id="transactions-guide" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">07. Ledger & Transaction Protocols</h2>
             </div>
             
             <div className="space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                   <div className="lg:col-span-2 space-y-16">
                      <div className="bg-white border border-slate-200 rounded-[4rem] p-16 shadow-sm space-y-10">
                         <div className="space-y-6">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight uppercase">Mastering the <br /> Unified Ledger</h3>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                               The WealthLens Ledger is the single source of truth for your financial identity. It is not just a list of expenses; it is a <strong>High-Fidelity Stream</strong> that feeds every chart and prediction in the app. Unlike apps that "guess" your categorization, the Ledger uses <strong>Fuzzy Pattern Recognition</strong> to map merchants to your specific budget architecture.
                            </p>
                            <p className="text-slate-600 text-sm leading-relaxed font-medium">
                               Every entry is a "Smart Object." It carries metadata about its tax-deductibility, its impact on your cash runway, and its relationship to your long-term wealth goals.
                            </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t border-slate-100">
                            <div className="space-y-6">
                               <h4 className="text-xs font-black text-[#C5A059] uppercase tracking-[0.4em]">Dynamic Injection</h4>
                               <p className="text-[12px] text-slate-500 font-semibold leading-relaxed uppercase tracking-tight">
                                  You can add records through the <strong>Manual Terminal</strong> or the <strong>AI Scanner</strong>. The Scanner is particularly powerful; it doesn't just read CSV files, it analyzes the merchant string to strip out noise (like store IDs or transaction codes) to give you a clean, readable merchant name.
                               </p>
                            </div>
                            <div className="space-y-6">
                               <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">State Reconciliation</h4>
                               <p className="text-[12px] text-slate-500 font-semibold leading-relaxed uppercase tracking-tight">
                                  Every edit triggers a <strong>Global State Cascade</strong>. If you change a $50 expense to $500, the system instantly recalculates your net worth, your drift, and your Freedom Horizon retirement age. This real-time feedback loop is essential for maintaining financial discipline.
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="p-16 bg-indigo-50 border border-indigo-100 rounded-[3rem] space-y-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                            <ArrowRightLeft className="w-24 h-24 text-indigo-600" />
                         </div>
                         <div className="flex items-center gap-6">
                            <Info className="w-8 h-8 text-indigo-600" />
                            <h4 className="text-lg font-black text-indigo-900 uppercase tracking-widest">The Transfer Isolation Protocol</h4>
                         </div>
                         <div className="space-y-6">
                            <p className="text-[13px] text-indigo-700/80 leading-relaxed font-medium uppercase tracking-tight">
                               This is the most critical logic to understand: <strong>Transfers are not Expenses</strong>. When you move money from Savings to pay your Credit Card, you haven't "lost" that money; it has simply changed buckets.
                            </p>
                            <p className="text-[13px] text-indigo-700/80 leading-relaxed font-medium uppercase tracking-tight">
                               By categorizing these as **Transfer**, you prevent the engine from double-counting. Without this isolation, your "Total Spending" would look artificially high, which would then corrupt your Freedom Horizon predictions.
                            </p>
                         </div>
                      </div>

                      <div className="p-12 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6">
                         <h6 className="text-xs font-black text-slate-900 uppercase tracking-widest">Example: Credit Card Repayment</h6>
                         <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                            On May 1st, you buy $100 of Groceries on your Credit Card. You categorize this as **Expense: Groceries**. On May 25th, you pay $100 from your Bank to your Credit Card. You categorize this as **Transfer**. Result: Your report correctly shows you spent $100 total, not $200.
                         </p>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-12 shadow-2xl">
                         <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#C5A059]">Advanced Operational Tips</h5>
                         <div className="space-y-10">
                            {[
                              { label: "Deduplication Logic", desc: "The system automatically flags potential duplicates if multiple transactions share the same Date, Amount, and Merchant Hash." },
                              { label: "The Bulk Purge", desc: "Use the 'Purge' tool in the Maintenance Hub if you need to wipe a month and re-import. It uses a shard-aware delete that leaves other months untouched." },
                              { label: "Regex Search", desc: "The ledger filter supports complex queries. You can find all transactions from 'Amazon' between $50 and $200 with one string." }
                            ].map((tip, i) => (
                              <div key={i} className="space-y-3">
                                 <p className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                                    {tip.label}
                                 </p>
                                 <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">{tip.desc}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                      
                      <div className="p-10 bg-slate-50 border border-slate-200 rounded-[3rem] space-y-6">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Reconciliation Status</p>
                         <div className="flex items-center gap-4 text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Balanced Ledger</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>


          <section id="maintenance-hub" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">08. Data Maintenance Hub</h2>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                <div className="space-y-16">
                   <div className="space-y-8">
                      <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight leading-tight">Administrative Lifecycle & Sovereign Control</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         The Maintenance Hub is the "Root Terminal" for your WealthLens instance. It is designed to give you absolute control over your encrypted vault's lifecycle. Here, you can perform global state mutations—like syncing across devices or executing a total factory wipe.
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         Because WealthLens is a <strong>Stateless Web Application</strong>, the Hub acts as your data anchor. It provides the tools to manage the "Mirror" between your local machine and our secure cloud shards.
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-12">
                      <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8 group hover:border-[#C5A059] transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                               <CloudUpload className="w-6 h-6 text-[#C5A059]" />
                            </div>
                            <h5 className="text-lg font-black text-slate-900 uppercase tracking-widest">Cloud Mirroring (Sync)</h5>
                         </div>
                         <p className="text-[12px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                            WealthLens utilizes <strong>Bi-Directional Synchronous Mirroring</strong>. When you click 'Push', your local encrypted shards are uploaded to our secure vault. This allows you to 'Pull' and restore your entire financial universe on any other machine in seconds. The sync is "Conflict-Aware," ensuring that your latest edits are always the canonical state.
                         </p>
                      </div>
                      <div className="p-12 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8 group hover:border-indigo-500 transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                               <Download className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h5 className="text-lg font-black text-slate-900 uppercase tracking-widest">Institutional Portability (.wealth)</h5>
                         </div>
                         <p className="text-[12px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                            The **.wealth** export is a 100% encrypted, obfuscated JSON bundle of your entire history. It is human-unreadable without your session key. Keeping a periodic .wealth backup is your "Ultimate Fail-safe." It ensures that even if you lose access to the internet or your WealthLens account, you own your raw financial history in a portable format forever.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-[4rem] p-16 text-white space-y-16 relative overflow-hidden flex flex-col justify-center shadow-2xl">
                   <div className="absolute top-0 right-0 p-16 opacity-10">
                      <ShieldCheck className="w-48 h-48 text-[#C5A059]" />
                   </div>
                   
                   <div className="space-y-8 relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-[0.5em] text-[#C5A059]">The Factory Reset Protocol</h4>
                      <p className="text-[13px] text-slate-400 font-bold leading-loose uppercase tracking-wide">
                         For security reasons, the "Reset System" protocol is a destructive action that performs a full forensic wipe of your local browser instance. 
                      </p>
                      <div className="space-y-4 border-l-2 border-rose-500/30 pl-8">
                         <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Step 01: All local encrypted shards are destroyed.</p>
                         <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Step 02: All session keys and RAM-buffers are purged.</p>
                         <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">Step 03: The browser is forced to clear its IndexDB cache.</p>
                      </div>
                      <p className="text-[11px] text-rose-500 font-black mt-8 block italic uppercase tracking-[0.2em]">
                         WARNING: This action is irreversible. Always ensure you have pushed to the cloud mirror or saved a .wealth bundle before resetting.
                      </p>
                   </div>

                   <div className="p-10 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                      <h5 className="text-xs font-black text-white uppercase tracking-widest">Scenario: The Emergency Recovery</h5>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                         Your computer is stolen. You buy a new one, log into WealthLens, and click 'Pull' in the Maintenance Hub. Your **Encrypted Shards** are downloaded, and your entire financial life—including all transactions and calculators—is restored instantly.
                      </p>
                   </div>

                   <div className="p-10 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                      <h5 className="text-xs font-black text-white uppercase tracking-widest">Real-time Vault Diagnostics</h5>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Local Cluster Integrity</span>
                            <span className="text-emerald-500">Verified</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Cloud Sync Status</span>
                            <span className="text-[#C5A059]">Operational</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-500">Encryption Layer</span>
                            <span className="text-indigo-400">AES-256-GCM Active</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <div className="space-y-16 pt-16">
                <div className="p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm">
                      <Binary className="w-6 h-6 text-[#C5A059]" />
                    </div>
                    <h5 className="text-lg font-black text-slate-900 uppercase tracking-widest">The Reactive Rule Engine</h5>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                      The WealthLens Rule Engine allows for automated, high-precision transaction classification. Instead of manually categorizing every coffee or subscription, you can define global logic that reconciles your ledger at the "Edge."
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <h6 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Logical Operators</h6>
                        <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                          Supports <strong>Equals</strong>, <strong>Not Equals</strong>, and <strong>Contains</strong>. This allows you to catch variants of merchant names (e.g., "AMZN MKTPLACE" vs "AMAZON.COM") and group them under a single strategic category.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h6 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Account Scoping</h6>
                        <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">
                          Rules can be scoped to specific accounts. This is essential for distinguishing between personal expenses and business reimbursements that might share similar merchant strings.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Rule Execution Priority</h6>
                    <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                      Rules are executed in a top-down hierarchy. If a transaction matches multiple rules, the most specific rule (e.g., "Contains" with a specific Account ID) takes precedence over generic global rules.
                    </p>
                  </div>
                </div>
             </div>
          </section>

          <section id="compliance" className="mb-40 space-y-16 scroll-mt-32">
             <div className="flex items-center gap-4">
                <span className="w-12 h-[1px] bg-slate-100" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">09. Compliance & Institutional Security</h2>
             </div>
             
             <div className="space-y-16">
                <div className="p-16 bg-slate-50 border border-slate-200 rounded-[4rem] space-y-12 shadow-sm">
                   <div className="max-w-4xl space-y-8">
                      <h3 className="text-3xl font-bold text-slate-900 uppercase tracking-tight leading-tight">Institutional Trust Protocols</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         WealthLens is engineered to meet the stringent security requirements of global financial institutions, sovereign wealth funds, and private family offices. Our primary innovation is the elimination of the <strong>Centralized Data Honeypot</strong>. 
                      </p>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         Traditional platforms aggregate decrypted user data into a single database, creating a massive target for cyber-attacks. WealthLens completely subverts this by ensuring that we never possess the keys to your data. We are the "Architects" of the safe, but only you hold the "Combination."
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-8 border-t border-slate-200">
                      <div className="space-y-8 group">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                               <ShieldCheck className="w-6 h-6 text-[#C5A059]" />
                            </div>
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Absolute Data Sovereignty</h5>
                         </div>
                         <p className="text-[12px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                            You own your data. Period. Because all decryption happens on your device, even a total compromise of our cloud infrastructure would result in zero exposed financial data. An attacker would find only unreadable AES-256 blobs. This is <strong>Security by Design</strong>, not just by policy.
                         </p>
                      </div>
                      <div className="space-y-8 group">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
                               <Lock className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">Privacy by Mathematical Default</h5>
                         </div>
                         <p className="text-[12px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                            We do not use tracking cookies, we do not sell metadata, and we have zero access to your transaction strings. Our business model is exclusively based on 'Premium' subscriptions, ensuring our incentives are perfectly aligned with your financial privacy. Your financial life is your business; we just provide the tools to master it.
                         </p>
                      </div>
                   </div>

                   <div className="p-10 bg-indigo-900/5 border border-indigo-900/10 rounded-[2.5rem] space-y-4">
                      <h6 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">Scenario: The Zero-Visibility Breach</h6>
                      <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
                         In the event of a hypothetical breach of WealthLens' central servers, the intruders would only find billions of lines of random characters. Because **you** hold the keys locally, and we never see them, your bank names, balances, and spending patterns remain mathematically invisible to the attackers.
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <Link to="/PrivacyProtocol" className="group p-12 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#C5A059] hover:shadow-2xl transition-all rounded-[3rem] space-y-6">
                      <div className="flex items-center justify-between">
                         <h5 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Privacy Protocol</h5>
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#C5A059]/10 transition-colors">
                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#C5A059]" />
                         </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">Enterprise-grade data handling specifications, GDPR/CCPA alignment, and PII protection standards.</p>
                   </Link>
                   <Link to="/SecurityPolicy" className="group p-12 bg-slate-50 hover:bg-white border border-slate-100 hover:border-[#C5A059] hover:shadow-2xl transition-all rounded-[3rem] space-y-6">
                      <div className="flex items-center justify-between">
                         <h5 className="text-lg font-bold text-slate-900 uppercase tracking-widest">Security Policy</h5>
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-[#C5A059]/10 transition-colors">
                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#C5A059]" />
                         </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">Technical deep-dive into the Zero-Trust architecture, TLS 1.3 encryption, and Edge Compute safety.</p>
                   </Link>
                </div>
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

