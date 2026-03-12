import React from "react";
import { ArrowLeft, BarChart3, Calculator, LineChart } from "lucide-react";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculator
        </a>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Our Methodology</h1>
              <p className="text-slate-500 mt-1">How our projections work</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            
            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              WealthLens uses standard actuarial and financial formulas to project the potential future value of your investments. We strive to provide the most transparent and accurate picture of compounding interest possible, while clearly stating the mathematical assumptions behind our models.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <Calculator className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2">Compound Interest Formula</h3>
                    <p className="text-sm text-slate-600">
                      We utilize the continuous compound interest formula: <code className="bg-white px-2 py-1 rounded border text-indigo-600 text-xs font-mono">FV = P * (1 + r/n)^(n*t)</code> where contributions are calculated and added sequentially at the specified intervals.
                    </p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <LineChart className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2">Real Purchasing Power</h3>
                    <p className="text-sm text-slate-600">
                      Our inflation adjustment calculations discount the nominal future value back to present-day dollars using the user-provided inflation rate compounding annually.
                    </p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Calculation Frequency</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Unlike simplistic calculators that assume all contributions occur at the end of the year, our engine compounds and adds contributions based on the specific selected frequency (Daily, Weekly, Monthly, or Annually). This provides a more accurate reflection of modern dollar-cost averaging strategies.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Tax & Fee Drag</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Both management fees and estimated taxes drag the portfolio down dynamically in our projections. Management fees (TERs) reduce the gross return rate proportionally. Capital gains taxes are estimated as a lump-sum realization at the end of the specified timeframe for taxable accounts.
            </p>
            
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">AI Sentiment & Coaching</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Our AI investment coaching engine synthesizes the numerical inputs provided in your scenario. The AI is designed to look for common pitfalls (like fees outstripping compounding gains) and provide structured, human-readable advice on how to tweak the parameters. It is not an active financial advisor analyzing real-time portfolio holdings.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
