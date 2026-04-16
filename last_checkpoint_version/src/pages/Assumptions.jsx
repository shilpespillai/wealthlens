import React from "react";
import { ArrowLeft, AlignLeft, Info, RefreshCw, Layers, ZapOff } from "lucide-react";

export default function Assumptions() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-16 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <AlignLeft className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Assumptions & Limitations</h1>
                <p className="text-slate-400 mt-2 font-medium">The Framework Behind the Projections</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
              Every financial model is only as good as its underlying assumptions. We believe in total transparency regarding the linear nature and mathematical boundaries of our engine.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="volatility">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                    1. Linear vs. Stochastic Returns
                  </h2>
                  <p className="mb-4">
                    WealthLens assumes a <strong>constant annual rate of return</strong>. In real-world financial markets, returns are stochastic and volatile. A static 8% projection over 30 years will yield a significantly different result than real market performance, even if the geometric mean is 8%.
                  </p>
                  <p className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-600 mb-4">
                    <strong>The "Average" Trap:</strong> If the market drops 20% in Year 1 and gains 20% in Year 2, your average return is technically 0%, but your actual capital is down 4%. Our engine models linear geometric growth, which does not capture these specific sequence-dependent path effects.
                  </p>
                  <p>
                    This modeling does not account for <strong>Sequence of Returns Risk</strong>, which can drastically impact retirees. A major downturn in the first 5 years of retirement can deplete a portfolio much faster than the same downturn occurring in the final 5 years, even if the "average" return over the whole period is identical.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="taxes">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Layers className="w-6 h-6 text-indigo-600" />
                    2. Tax Complexity & Policy Volatility
                  </h2>
                  <p>
                    Our tax engine is a simplified heuristic model designed for "Broad-Stroke" planning. It applies a flat capital gains tax realization at the end of the specified investment horizon. In reality:
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-3 text-slate-600">
                    <li><strong>Progressive Brackets:</strong> Current tax systems are progressive; our tool does not adjust for your specific total income bracket in the future.</li>
                    <li><strong>Policy Shifts:</strong> Tax legislation is highly volatile. Projections over 20-30 years are based on current laws, which are guaranteed to change through various government administrations.</li>
                    <li><strong>Structure Nuance:</strong> It does not distinguish between specific vehicle benefits (e.g., Roth vs. Traditional 401ks, or Superannuation tax-free thresholds) unless manually adjusted via the growth rate.</li>
                    <li><strong>Global Variability:</strong> Specific regional, state (e.g., California vs. Texas), or municipal tax variations are not modeled.</li>
                  </ul>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="reinvestment">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-600" />
                    3. Dividend Reinvestment (DRIP)
                  </h2>
                  <p>
                    All projections assume that 100% of dividends and interest distributions are immediately reinvested into the principal without any transaction costs or immediate tax drag. While this maximizes the compounding effect in the model, real-world slippage and cash drag may reduce actual results.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-amber-50 rounded-3xl p-8 border border-amber-200">
                    <ZapOff className="w-8 h-8 text-amber-600 mb-4" />
                    <h4 className="text-xl font-bold text-amber-900 mb-4">Critical Limitation</h4>
                    <p className="text-sm text-amber-800 leading-relaxed mb-6">
                      This tool is not a financial advisor. It cannot predict market crashes, geopolitical events, or individual asset failures. Projections should be used as a "best-guess" directional guide, not a factual promise.
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h4 className="text-slate-900 font-bold mb-4 text-xs uppercase tracking-wider">Baseline Parameters</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Inflation Logic</span>
                        <span className="font-bold text-slate-900 text-right">Flat Annual Discount</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Fee Logic</span>
                        <span className="font-bold text-slate-900 text-right">Daily Yield Drag</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Compounding</span>
                        <span className="font-bold text-slate-900 text-right">Discrete Intervals</span>
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
