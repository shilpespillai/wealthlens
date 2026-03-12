import React from "react";
import { ArrowLeft, LifeBuoy, Search, FileText, Video, MessageCircle } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculator
        </a>
        
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 mb-8 text-center text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10 w-full max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black mb-4">How can we help you today?</h1>
            <p className="text-indigo-100 mb-8 text-lg">Search our knowledge base for answers to common questions about calculators, modeling, and best practices.</p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="e.g. How is inflation calculated?" className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-2xl py-4 pl-12 pr-4 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/20 transition-all font-medium text-lg" />
            </div>
          </div>
          <LifeBuoy className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 rotate-12" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 justify-center rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer text-center group">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 mx-auto rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Getting Started Guide</h3>
                <p className="text-sm text-slate-500">Learn the basics of using the calculator tools for the first time.</p>
            </div>
            
            <div className="bg-white p-6 justify-center rounded-2xl border border-slate-200 shadow-sm hover:border-violet-300 hover:shadow-md transition-all cursor-pointer text-center group">
                <div className="w-12 h-12 bg-violet-50 text-violet-600 mx-auto rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Video className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Video Tutorials</h3>
                <p className="text-sm text-slate-500">Watch walkthroughs on advanced portfolio configurations.</p>
            </div>
            
            <div className="bg-white p-6 justify-center rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer text-center group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 mx-auto rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">FAQ Compilation</h3>
                <p className="text-sm text-slate-500">Quick answers to the most common questions people ask.</p>
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Articles</h2>
            <div className="space-y-4">
                <a href="#" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-indigo-600 mb-1 leading-tight">Why is the calculator outputting "NaN" or Error?</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">Ensure that you haven't typed text symbols like '$' in the input fields intended for pure numbers.</p>
                </a>
                <a href="#" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-indigo-600 mb-1 leading-tight">How do I interpret the "Purchasing Power" column?</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">The nominal balance defines the raw dollar amount, while purchasing power adjusts it backwards based on your projected inflation rate.</p>
                </a>
                <a href="#" className="block p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <h4 className="font-bold text-indigo-600 mb-1 leading-tight">Can I export my specific scenario to share?</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">Currently, the tool operates entirely locally in your browser. Screenshot sharing is the best way to disseminate results.</p>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}
