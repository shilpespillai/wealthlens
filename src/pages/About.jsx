import React from "react";
import { ArrowLeft, Briefcase, Target, Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <Briefcase className="w-6 h-6 text-indigo-300" />
                </div>
                <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Our Story</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
                Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-300">Investor Experience</span>
              </h1>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                WealthLens was built with a simple mission: demystify deep financial analysis and provide professional-grade visualization tools to every individual investor.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div className="space-y-12">
                <section>
                  <h2 className="text-3xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Target className="w-8 h-8 text-indigo-600" />
                    Our Core Mission
                  </h2>
                  <p className="text-slate-600 leading-relaxed text-lg mb-6">
                    The traditional financial industry often relies on complexity and opaque architectures to retain control. We believe that with the right data visualization and intuitive tooling, anyone can take control of their financial destiny and build sustainable wealth through the power of compounding.
                  </p>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Our platform is designed to bridge the gap between "Saving" and "Investing" by showing users the long-term trajectory of every financial decision they make today.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-pink-500" />
                    Investor-First Philosophy
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    We aren't brokers. We aren't advisors. We are technologists who believe in absolute transparency. WealthLens doesn't push products; we provide the lens through which you can evaluate your own strategy objectively.
                  </p>
                </section>
              </div>

              <div className="space-y-10">
                <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-200">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Privacy by Default</h3>
                  <p className="text-slate-600 leading-relaxed">
                    WealthLens is a next-generation web application designed entirely around your data sovereignty. Because our core engine runs dynamically in your local environment, your most sensitive financial goals remain yours alone. 
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-[2rem] p-10 border border-indigo-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-20">
                     <Sparkles className="w-16 h-16 text-indigo-600" />
                   </div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-4">The WealthLens Edge</h3>
                  <ul className="space-y-4">
                    {[
                      "Real-time market volatility modeling",
                      "Inflation-adjusted purchasing power logic",
                      "AI-driven portfolio coaching heuristics",
                      "Zero-data-aggregation architecture"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-indigo-700 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-20 pt-20 border-t border-slate-100 text-center">
               <h2 className="text-2xl font-black text-slate-900 mb-4">Join the Movement</h2>
               <p className="text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                 We're just getting started. Every day we add new features and insights to help you navigate the complex world of personal finance.
               </p>
               <a 
                 href="/contact" 
                 className="inline-flex bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
               >
                 Get in Touch
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
