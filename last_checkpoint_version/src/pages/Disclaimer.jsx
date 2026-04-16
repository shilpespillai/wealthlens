import React from "react";
import { ArrowLeft, AlertTriangle, ShieldCheck, Info, Gavel, Scale } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-8 sm:p-16 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Legal Disclaimer</h1>
                <p className="text-amber-100 mt-2 font-medium">Important Risk and Disclosure Information</p>
              </div>
            </div>
            <p className="text-amber-50 text-lg max-w-3xl leading-relaxed">
              Investing involves significant risk. WealthLens provides tools for analysis, not guaranteed outcomes. Please read this disclosure carefully.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="critical-risk">
                  <div className="bg-amber-50 border-2 border-amber-200 p-8 rounded-[2rem] mb-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <AlertTriangle className="w-24 h-24 text-amber-900" />
                    </div>
                    <h2 className="text-xl font-black text-amber-900 mt-0 mb-4 flex items-center gap-2">
                       Primary Risk Disclosure
                    </h2>
                    <p className="text-amber-800 m-0 font-medium leading-relaxed">
                      All investments carry risk. The value of investments and the income from them can fall as well as rise and you may not get back the amount originally invested. Past performance is not a reliable indicator of future results.
                    </p>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    1. Not Financial Advice
                  </h2>
                  <p>
                    WealthLens is a financial technology platform and not a registered investment advisor. All content, tools, and AI-generated insights provided through our Service are for <strong>informational and educational purposes only</strong>. We do not provide personalized financial, legal, tax, or investment advice.
                  </p>
                  <p>
                    Before making any financial decisions, you should consult with a certified financial planner, tax advisor, or legal professional who can take your specific circumstances into account.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="projections">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-600" />
                    2. Projection Accuracy
                  </h2>
                  <p>
                    Our calculators use mathematical models to estimate future outcomes based on the inputs you provide. These projections are hypothetical, do not reflect actual investment results, and are not guarantees of future results. Market conditions are volatile and complex; no software can perfectly predict long-term wealth growth.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="third-party">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-indigo-600" />
                    3. No Liability for Decisions
                  </h2>
                  <p>
                    WealthLens Inc. and its affiliates, employees, and data providers shall not be liable for any investment decisions made or actions taken in reliance upon the information provided through the Service. You are solely responsible for evaluating the merits and risks associated with the use of our tools.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                    <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-slate-400" />
                      Legal Framework
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">
                      This disclaimer is subject to our Terms of Use and is part of the legal agreement between you and WealthLens.
                    </p>
                    <a href="/termsofuse" className="text-indigo-600 text-sm font-bold hover:underline">View Terms of Use →</a>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h4 className="text-slate-900 font-bold mb-4 text-sm uppercase tracking-wider">Need Clarification?</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      For questions regarding our financial disclosures or regulatory status, please contact our compliance team.
                    </p>
                    <a 
                       href="/contact" 
                       className="text-indigo-600 text-sm font-black hover:text-indigo-800 transition-colors"
                     >
                       Contact Compliance Team →
                     </a>
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
