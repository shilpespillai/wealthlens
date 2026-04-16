import React from "react";
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  EyeOff, 
  Key, 
  RefreshCcw, 
  ArrowLeft,
  ChevronRight,
  Database,
  FileCheck,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const securityFeatures = [
  {
    icon: <Lock className="w-6 h-6 text-indigo-500" />,
    title: "Bank-Grade Encryption",
    description: "All sensitive data is encrypted using AES-256 at rest and TLS 1.3 in transit, exceeding industry standards for personal financial software."
  },
  {
    icon: <EyeOff className="w-6 h-6 text-teal-500" />,
    title: "Zero-Knowledge Architecture",
    description: "WealthLens performs all financial calculations locally on your device. We never see your raw transaction data or bank credentials."
  },
  {
    icon: <Database className="w-6 h-6 text-amber-500" />,
    title: "Local-First Storage",
    description: "Your financial ledger is stored in a secure, encrypted local database on your device, with optional high-security sync through Base44."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-indigo-500" />,
    title: "Immutable Sync Protocol",
    description: "Our sync protocol uses differential privacy and collision-resistant hashing to ensure your data remains consistent without compromising identity."
  }
];

export default function PrivacyProtocol() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      {/* Premium Header */}
      <div className="w-full px-6 pt-4 pb-2 bg-white sticky top-0 z-50">
        <div className="bg-[#1E293B] rounded-3xl shadow-xl overflow-hidden border border-slate-700/30">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="p-2 hover:bg-slate-700 rounded-xl transition-colors">
                 <ArrowLeft className="w-5 h-5 text-slate-400" />
              </a>
              <div className="h-6 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                 <h1 className="text-xl font-medium text-white tracking-tight">Privacy Protocol <span className="text-slate-500 font-normal px-2">›</span> <span className="text-[#C5A059]">Security Standards</span></h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">System Secure</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-12 pt-16 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
           <p className="text-[10px] font-medium text-[#C5A059] uppercase tracking-[0.5em]">Institutional Standard</p>
           <h2 className="text-5xl font-medium text-slate-900 tracking-tighter leading-tight max-w-3xl mx-auto">
             Your financial data belongs to you. <br />
             <span className="text-slate-400">Not the cloud.</span>
           </h2>
           <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-normal">
             WealthLens was built with a privacy-first foundation. We utilize distributed architecture and local processing to ensure your data never leaves your control.
           </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
           {securityFeatures.map((feature, idx) => (
             <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[32px] p-10 space-y-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                   {feature.icon}
                </div>
                <h3 className="text-xl font-medium text-slate-900 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
             </div>
           ))}
        </div>

        {/* Technical Deep Dive Section */}
        <div className="bg-[#1E293B] rounded-[48px] p-16 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-[10px] text-indigo-300 font-medium uppercase tracking-[0.2em]">
                    Data Lifecycle
                 </div>
                 <h3 className="text-4xl font-medium tracking-tight">Zero-Knowledge Financial Analysis</h3>
                 <p className="text-slate-400 text-lg leading-relaxed">
                   Unlike traditional FinTech platforms, WealthLens doesn't pull your data to central servers for analysis. Instead, we bring the analysis models to your device.
                 </p>
                 <ul className="space-y-6 pt-4">
                    {[
                      { icon: <CheckCircle2 className="text-teal-400" />, text: "No internal staff can access your financial entries." },
                      { icon: <CheckCircle2 className="text-teal-400" />, text: "Automated encryption key management on device." },
                      { icon: <CheckCircle2 className="text-teal-400" />, text: "Anonymized aggregation for market benchmarking." }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-slate-300">
                         {item.icon}
                         <span className="text-sm font-medium">{item.text}</span>
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[32px] p-10 flex flex-col justify-center gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                       <Key className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h4 className="text-lg font-medium text-white">Encryption Layer</h4>
                       <p className="text-xs text-slate-400">RSA-2048 / AES-256-GCM</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                       <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h4 className="text-lg font-medium text-white">Data Residency</h4>
                       <p className="text-xs text-slate-400">Local Disk / SOC 2 Secure Vault</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#C5A059] rounded-xl flex items-center justify-center shadow-lg shadow-[#C5A059]/50">
                       <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                       <h4 className="text-lg font-medium text-white">Regulatory Compliance</h4>
                       <p className="text-xs text-slate-400">GDPR / APPs / SOC 2 Ready</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom CTA / Contact */}
        <div className="text-center py-16 border-t border-slate-100 space-y-8">
           <h4 className="text-2xl font-medium text-slate-900 tracking-tight">Need a full technical audit?</h4>
           <p className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
             Institutional partners can request our full security whitepaper and independent audit reports by contacting our privacy compliance office.
           </p>
           <Button className="h-14 px-10 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 uppercase text-[10px] font-bold tracking-widest transition-all hover:scale-105 active:scale-95">
             Contact Compliance Office
           </Button>
        </div>
      </div>
    </div>
  );
}
