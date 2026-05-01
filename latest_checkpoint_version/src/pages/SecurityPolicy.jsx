import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck, Terminal } from "lucide-react";

export default function SecurityPolicy() {
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
               <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Security Protocol <span className="text-slate-300 mx-2 font-normal">/</span> <span className="text-slate-500 text-[9px]">Zero-Trust Architecture</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Model: v4.2.0-ELITE</span>
            </div>
            <button className="bg-slate-900 text-white px-4 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors">
              Security Audit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-20">
          
          {/* Hero Banner */}
          <section className="space-y-12">
            <div className="flex items-center gap-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.4em]">
              <Lock className="w-4 h-4" />
              Information Safety Spec
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[0.9] italic">
              Platform <br />
              <span className="text-slate-400 font-medium NOT-italic">Security Protocol.</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.1em] max-w-2xl leading-relaxed pt-4">
              WealthLens operates on a Zero-Trust, Edge-Compute architecture. Our entire security philosophy is centered around the principle that the most secure data is the data we never collect.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start pt-12 border-t border-slate-100">
            <div className="lg:col-span-2 space-y-24">
              
              <section id="philosophy" className="space-y-8">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-slate-200" />
                    01. Security Philosophy
                 </h2>
                 <p className="text-slate-600 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                    Rather than building an massive central database that represents a high-value target for attackers, WealthLens pushes compute and storage to the <strong>Client Edge</strong>. This means your sensitive financial data—net worth, salary, and specific holdings—remains within your browser and on your hardware.
                 </p>
              </section>

              <section id="compute" className="space-y-8">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-slate-200" />
                    02. Local Compute & Isolation
                 </h2>
                 <p className="text-slate-600 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                    WealthLens utilizes modern browser sandboxing to execute all financial algorithms locally. When you run a simulation, computations occur in your device's RAM. No financial figures are logged to our servers, and the tunnel to our backend is strictly for authentication.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                       <h6 className="text-[9px] font-black text-slate-900 uppercase mb-2">Non-Persistent Memory</h6>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">Financial data is cleared from RAM upon session termination.</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                       <h6 className="text-[9px] font-black text-slate-900 uppercase mb-2">Encrypted Tunneling</h6>
                       <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">AES-256 symmetric encryption for all bank API requests.</p>
                    </div>
                 </div>
              </section>

              <section id="storage" className="space-y-8">
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4">
                    <span className="w-8 h-[1px] bg-slate-200" />
                    03. Data Persistence
                 </h2>
                 <p className="text-slate-600 text-[11px] leading-relaxed font-semibold uppercase tracking-tight">
                    WealthLens serializes your models and stores them in <strong>HTML5 Local Storage</strong>. This storage is encrypted at rest by your operating system enabling high-security financial modeling without cloud-side liability.
                 </p>
              </section>

            </div>

            <aside className="lg:col-span-1 space-y-12 bg-slate-50 border border-slate-200 rounded-[2rem] p-10">
               <div className="space-y-6 pt-4">
                  <Terminal className="w-8 h-8 text-[#C5A059]" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Encryption Standards</h4>
                  <div className="space-y-4">
                     {[
                       { label: "Transport", value: "TLS 1.3" },
                       { label: "Persistence", value: "AES-256" },
                       { label: "Key Exchange", value: "ECDHE" },
                       { label: "Hashing", value: "SHA-256" }
                     ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                          <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{item.value}</span>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-6 pt-8">
                  <h4 className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.2em] mb-4 underline decoration-[#C5A059]/30 underline-offset-4 decoration-2">Security Audit Status</h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase italic">
                    All core financial engines undergo quarterly external penetration testing. Current Status: <span className="text-emerald-500 NOT-italic">PASS [v4.2.0-ELITE]</span>
                  </p>
                  <button className="w-full bg-slate-900 text-white h-12 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all">
                    Request Audit Log
                  </button>
               </div>
            </aside>
          </div>
        </div>
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
