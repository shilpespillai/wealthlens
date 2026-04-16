import React from "react";
import { ArrowLeft, Lock, ShieldCheck, Cpu, HardDrive, Terminal } from "lucide-react";

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-16 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Security Protocol</h1>
                <p className="text-slate-400 mt-2 font-medium">Protecting Your Financial Interests</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
              At WealthLens, we believe the most secure data is the data we never collect. Our entire architecture is built to minimize risk through decentralization.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="philosophy">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    1. Security Philosophy
                  </h2>
                  <p>
                    Rather than building an massive central database that represents a high-value target for attackers, WealthLens pushes compute and storage to the <strong>Client Edge</strong>. This means your sensitive financial data—net worth, salary, and specific holdings—remains within your browser and on your hardware.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="infrastructure">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-indigo-600" />
                    2. Local Compute & Isolation
                  </h2>
                  <p>
                    WealthLens utilizes modern browser sandboxing to execute all financial algorithms locally. When you run a simulation:
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>Computations occur in your device's RAM.</li>
                    <li>No financial figures are logged to our servers.</li>
                    <li>The connection to our support backend is strictly for authentication and non-financial communication.</li>
                  </ul>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="storage">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <HardDrive className="w-6 h-6 text-indigo-600" />
                    3. Data Persistence (Local Storage)
                  </h2>
                  <p>
                    If you choose to persist your data for future use, WealthLens serializes your models and stores them in <strong>HTML5 Local Storage</strong>. This storage is encrypted at rest by most modern operating systems (FileVault, BitLocker) ensuring that even if your session is intercepted, the underlying raw data remains private.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                    <Terminal className="w-8 h-8 text-slate-900 mb-4" />
                    <h4 className="text-xl font-bold mb-4">Vulnerability Disclosure</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      We support responsible disclosure. If you believe you have found a vulnerability, please contact our security team.
                    </p>
                    <a 
                      href="/contact" 
                      className="block w-full bg-slate-900 text-white text-center py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all font-mono text-sm"
                    >
                      report-vulnerability →
                    </a>
                  </div>

                  <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                    <h4 className="font-black text-indigo-900 mb-4 text-xs uppercase tracking-widest underline decoration-indigo-300 decoration-2 underline-offset-4">Encryption Standards</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-indigo-800">TLS 1.3 (Transport)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-indigo-800">AES-256 (Persistence)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-indigo-800">Zero-Trust Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
