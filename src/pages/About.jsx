import React from "react";
import { ArrowLeft, Briefcase } from "lucide-react";

export default function About() {
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
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">About WealthLens</h1>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            
            <p className="text-slate-600 leading-relaxed text-lg mb-8 font-medium">
              WealthLens was built with a simple mission: demystify long-term investing and provide professional-grade portfolio visualization tools to everyday investors.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              The financial industry often relies on complexity and opaque fee structures to retain clients. We believe that with the right data visualization, intuitive tooling, and transparent calculators, anyone can take control of their financial destiny and build sustainable wealth through the power of compounding interest.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Modern Technology, Local Privacy</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              WealthLens is a next-generation web application designed entirely around your privacy. Because our core calculator engine runs entirely in your local browser environment, your most sensitive financial goals remain strictly confidential. You don't have to sacrifice a beautiful, modern SaaS aesthetic to retain data sovereignty.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">The Team</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
               WealthLens is designed and maintained by a passionate team of developers and financial technologists who were frustrated by the slow, ad-heavy, and clunky calculators scattered across the internet. We wanted to build the tool we wished we had when we started our own investing journeys.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
