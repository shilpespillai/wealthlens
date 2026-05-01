import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  EyeOff, 
  Cpu, 
  ArrowLeft,
  Key, 
  Zap,
  Network,
  CheckCircle2,
  FileText,
  ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: <Lock className="w-4 h-4 text-[#C5A059]" />,
    title: "BANK-GRADE ENCRYPTION",
    description: "Multi-layered AES-256 protocols securing data at rest and TLS 1.3 in-transit."
  },
  {
    icon: <EyeOff className="w-4 h-4 text-slate-400" />,
    title: "ZERO-KNOWLEDGE CORE",
    description: "Client-side financial parsing ensuring raw credentials never reach our infrastructure."
  },
  {
    icon: <Cpu className="w-4 h-4 text-[#C5A059]" />,
    title: "SILOED AI INFRASTRUCTURE",
    description: "Neural keys isolated locally with direct end-to-end encrypted provider handshakes."
  },
  {
    icon: <Network className="w-4 h-4 text-slate-400" />,
    title: "NEURAL BRIDGE TUNNEL",
    description: "Identity-linked encrypted tunnels for collision-resistant cloud synchronization."
  }
];

export default function PrivacyProtocol() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#C5A059]/10">
      
      {/* Structural Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/Dashboard" className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
               <ArrowLeft className="w-4 h-4 text-slate-400" />
            </Link>
            <div className="h-4 w-[1px] bg-slate-100" />
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
               <p className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em]">Privacy Protocol <span className="text-slate-300 mx-2 font-normal">/</span> <span className="text-slate-500">Institutional Edition</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Secure Terminal</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20 space-y-24">
        
        {/* Abstract Section */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.4em]">
             <FileText className="w-3.5 h-3.5" />
             Technical Abstract v1.4.2
           </div>
           <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-none max-w-2xl">
             Zero-Knowledge Systems <br />
             <span className="text-slate-400 font-medium">Data Sovereignty Audit.</span>
           </h2>
           <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
             WealthLens is architected as a local-first financial engine. This document outlines the technical safeguards used to ensure that institutional-grade privacy is not a feature, but a structural invariant of the platform.
           </p>
        </section>

        {/* Audit Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-sm">
           {securityFeatures.map((feature, idx) => (
             <div key={idx} className="bg-white p-10 space-y-4 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-[#C5A059]/30 transition-all">
                   {feature.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">{feature.title}</h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{feature.description}</p>
                </div>
             </div>
           ))}
        </section>

        {/* Neural Infrastructure Deep Dive */}
        <section className="bg-slate-50 rounded-2xl p-12 border border-slate-200 relative overflow-hidden">
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-md text-[8px] text-[#C5A059] font-bold uppercase tracking-[0.2em]">
                    Infrastructure Spec
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 leading-none">Neural Key Isolation</h3>
                 <p className="text-slate-500 text-xs leading-relaxed font-medium">
                   Our 'Direct-to-Neural' bridge establishes an encrypted handshake directly from the client browser to the AI provider. WealthLens infrastructure never intercepts, mirrors, or processes your security hub credentials.
                 </p>
                 <ul className="space-y-4 pt-2">
                    {[
                      { icon: <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />, text: "LOCAL-ONLY CREDENTIAL ENCLAve" },
                      { icon: <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />, text: "AUTOMATED TERMINAL FLUSH" },
                      { icon: <CheckCircle2 className="text-emerald-500 w-3.5 h-3.5" />, text: "AIR-GAP CALCULATION MODE" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600">
                         {item.icon}
                         <span className="text-[9px] font-bold uppercase tracking-widest">{item.text}</span>
                      </li>
                    ))}
                  </ul>
              </div>

              <div className="space-y-6">
                 <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                          <Key className="w-5 h-5 text-slate-400" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Encryption Layer</p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">RSA-4096 / GCM-256</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                          <Zap className="w-5 h-5 text-[#C5A059]" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Active Defense</p>
                          <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Real-time Anomaly Detection</p>
                       </div>
                    </div>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed font-medium uppercase italic tracking-tighter">
                       Security keys are siloed in persistent local memory. Clearing your browser cache will require a manual Neural Sync.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        {/* Compliance Footer */}
        <section className="pt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start gap-12">
           <div className="max-w-md space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Institutional Audit</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Qualified institutional partners can request our detailed security whitepaper and third-party penetration reports via our Compliance Office.
              </p>
           </div>
           <button className="h-11 px-8 bg-slate-900 text-white hover:bg-[#C5A059] rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
             Contact Compliance
           </button>
        </section>
      </main>

      <footer className="py-10 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <span>WealthLens Intelligence Protocol</span>
           <span>v1.4.2-α • ISO-27001 Ready</span>
        </div>
      </footer>
    </div>
  );
}
