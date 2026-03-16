import React from "react";
import { ArrowLeft, BarChart3, Calculator, LineChart, Percent, Magnet, Zap } from "lucide-react";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-700 to-indigo-600 p-8 sm:p-16 text-white">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Our Methodology</h1>
                <p className="text-indigo-100 mt-2 font-medium">The Mathematics of Wealth Creation</p>
              </div>
            </div>
            <p className="text-indigo-50 text-xl max-w-3xl leading-relaxed">
              Transparency is our core value. We believe every investor should understand the technical engine driving their financial projections.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="basics">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black">01</span>
                    Core Compounding Principles
                  </h2>
                  <p>
                    WealthLens utilizes a sophisticated time-value of money (TVM) engine. Unlike basic calculators that assume annual compounding, our system handles <strong>continuous sequential compounding</strong> for various frequencies (Daily, Weekly, Monthly, Annually).
                  </p>
                  <p className="bg-slate-50 p-6 rounded-2xl border border-slate-200 font-mono text-sm my-6">
                    PV: Present Value of initial capital<br/>
                    PMT: Payment (contribution) amount per period<br/>
                    r: Annual nominal interest rate<br/>
                    n: Compounding frequency per year<br/>
                    t: Total number of years
                  </p>
                </section>

                <section id="inflation" className="mt-16">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black">02</span>
                    Inflation & Real Purchasing Power
                  </h2>
                  <p>
                    A million dollars today is not the same as a million dollars in 30 years. Our methodology applies an annual inflation discount to the nominal future value (FV) to provide a "Real Value" figure in today's purchasing power.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">Nominal Projection</h4>
                      <p className="text-sm text-indigo-700">The raw dollar amount you will have in the future, unadjusted for price increases.</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                      <h4 className="font-bold text-emerald-900 mb-2">Real Projection</h4>
                      <p className="text-sm text-emerald-700">The equivalent value of your future capital in today's economy (Purchasing Power).</p>
                    </div>
                  </div>
                </section>

                <section id="drag" className="mt-16">
                  <h2 className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-black">03</span>
                    Accounting for "Drag" (Fees & Taxes)
                  </h2>
                  <p>
                    Many calculators ignore the two biggest wealth killers: management fees and taxes. WealthLens applies these as dynamic "drags" on the growth rate.
                  </p>
                  <ul className="space-y-4 my-6">
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Percent className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-slate-600"><strong>Management Expense Ratio (MER):</strong> Subtracted directly from the expected gross annual return rate.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Magnet className="w-3 h-3" />
                      </div>
                      <p className="text-sm text-slate-600"><strong>Capital Gains Tax:</strong> Modeled as a lump-sum realization based on the total gain at the end of the investment horizon.</p>
                    </li>
                  </ul>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white">
                    <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                    <h3 className="text-xl font-bold mb-4">AI Sentiment Layer</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">
                      Our methodology includes a heuristic analysis layer that flags scenarios where "The Drag" (Fees/Inflation) exceeds the "The Drive" (Return Rate), helping users identify mathematically unsustainable plans.
                    </p>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/5 p-3 rounded-xl">
                      Logic: Heuristic Growth Engine v4.2
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-bold text-slate-900">Variables Table</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Compounding</span>
                        <span className="font-medium text-slate-900">Discrete/Continuous</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Contribution</span>
                        <span className="font-medium text-slate-900">Start of Period</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Tax Basis</span>
                        <span className="font-medium text-slate-900">FIFO (Variable)</span>
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
