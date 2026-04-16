import React from "react";
import { ArrowLeft, LifeBuoy, Search, FileText, Video, MessageCircle, ExternalLink, HelpCircle } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-[2.5rem] p-8 sm:p-20 mb-12 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">How can we help you?</h1>
            <p className="text-indigo-100 mb-10 text-xl leading-relaxed">Search our knowledge base for professional-grade answers to your financial modeling and platform questions.</p>
            
            <div className="relative group max-w-2xl mx-auto">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search topics: inflation, compounding, security..." 
                className="relative w-full bg-white text-slate-900 placeholder-slate-400 rounded-[1.25rem] py-5 pl-16 pr-6 shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-lg border-none"
              />
            </div>
          </div>
          <LifeBuoy className="absolute -right-16 -bottom-16 w-96 h-96 text-white/5 rotate-12" />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: FileText, title: "Quick Start Guide", color: "indigo", text: "Master the essentials of wealth trajectory modeling in under 5 minutes." },
              { icon: Video, title: "Training Videos", color: "violet", text: "Visual walkthroughs of advanced family budgeting and portfolio features." },
              { icon: MessageCircle, title: "Common Solutions", color: "blue", text: "Searchable database of frequently asked questions and technical fixes." }
            ].map((cat, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all cursor-pointer group text-center flex flex-col items-center">
                  <div className={`w-16 h-16 bg-${cat.color}-50 text-${cat.color}-600 rounded-2xl flex items-center justify-center mb-6 border border-${cat.color}-100 group-hover:bg-${cat.color}-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-3`}>
                      <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{cat.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{cat.text}</p>
              </div>
            ))}
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-indigo-600" />
                    Essential Articles
                  </h2>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {[
                      { q: "Interpreting Real vs. Nominal Purchasing Power", a: "Learn how the inflation discount applies to your future wealth goals." },
                      { q: "Connecting External Financial Data", a: "A guide on using our Bank Sync (Plaid), CSV, and PDF smart import features safely." },
                      { q: "Account Security & Private Mode", a: "Everything you need to know about how WealthLens keeps your data local and secure." },
                      { q: "Customizing Tax & Fee Drags", a: "How to configure specific management ratios for more accurate projections." }
                    ].map((item, i) => (
                      <a href="#" key={i} className="group py-6 block hover:pl-2 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors text-lg">{item.q}</h4>
                            <p className="text-slate-500 font-medium">{item.a}</p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 mt-1" />
                        </div>
                      </a>
                    ))}
                </div>
              </div>

              {/* Comprehensive FAQ Section */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm overflow-hidden mt-8">
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <LifeBuoy className="w-6 h-6 text-indigo-600" />
                  Professional Planning FAQ
                </h2>
                <div className="space-y-6">
                  {[
                    { 
                      q: "Why is my projection different from my bank's forecast?", 
                      a: "Bank tools often use 'Arithmetic Mean' and ignore management expense ratios (MER) or realistic inflation. WealthLens uses CAGR and adds 'Real' purchasing power adjustments, resulting in a more conservative but mathematically grounded outcome." 
                    },
                    { 
                      q: "How should I estimate my expected return rate?", 
                      a: "Conservative planners often use 4-5% (inflation-adjusted), while moderate-growth portfolios might target 7-8%. We recommend researching historical asset class returns and always accounting for your specific portfolio and volatility tolerance." 
                    },
                    { 
                      q: "What is the 'Geometric Mean' and why does it matter?", 
                      a: "Returns are non-linear. A 50% drop requires a 100% gain just to break even. Geometric compounding (CAGR) captures this volatility drag, whereas simple annual averages tend to overstate performance in volatile scenarios." 
                    },
                    { 
                      q: "Does the model account for 100% dividend reinvestment?", 
                      a: "Yes, our default logic assumes the DRIP (Dividend Reinvestment Plan) model where all distributions are automatically cycled back into principal. However, you should manually adjust your 'DRAG' settings if you plan to withdraw dividends for income." 
                    },
                    { 
                      q: "Is connecting my bank account secure?", 
                      a: "Yes. WealthLens uses Plaid, a world-class financial link, to securely connect to your bank. We never see or store your login credentials, and the integration is strictly read-only for transaction syncing." 
                    }
                  ].map((faq, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-3">{faq.q}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-8">
               <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative shadow-2xl shadow-indigo-200/50">
                  <h3 className="text-2xl font-black mb-6">Direct Support</h3>
                  <p className="text-slate-400 leading-relaxed font-medium mb-10">
                    Can't find what you're looking for? Our executive support team is available for premium inquiries.
                  </p>
                  <a 
                    href="/contact" 
                    className="block w-full bg-indigo-600 text-white text-center py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/50"
                  >
                    Contact Support
                  </a>
                  <p className="text-center text-xs text-slate-600 mt-6 font-bold uppercase tracking-widest">Typical response: 12-24 hours</p>
               </div>

               <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                  <h4 className="font-black text-indigo-900 mb-4 text-xs uppercase tracking-widest">Platform Status</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-indigo-800">All Systems Operational</span>
                  </div>
                  <p className="text-xs text-indigo-600">Last checked: 1 minute ago</p>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
