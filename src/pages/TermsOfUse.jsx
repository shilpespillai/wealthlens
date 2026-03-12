import React from "react";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function TermsOfUse() {
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
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Use</h1>
              <p className="text-slate-500 mt-1">Last updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 font-medium italic mb-8">
              Please read these Terms of Use carefully before using the WealthLens platform.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              By accessing and using WealthLens ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Use License</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Permission is granted to temporarily use the materials on WealthLens's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-2">
              <li>Modify or copy the materials structure and codebase for commercial templates;</li>
              <li>Use the materials for any commercial purpose, or for any public display;</li>
              <li>Attempt to decompile or reverse engineer any software contained on WealthLens's website;</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Not Financial Advice</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              All content provided on WealthLens is for informational and educational purposes only. We are not registered financial advisors, brokers, or tax professionals. The calculations, AI insights, and strategies presented are estimates based on user input and simulated algorithms. You should consult with a certified financial planner or tax expert before making any investment decisions.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Limitations</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              In no event shall WealthLens or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WealthLens's website, even if WealthLens or a WealthLens authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            
             <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Revisions and Errata</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              The materials appearing on WealthLens's website could include technical, typographical, or photographic errors. WealthLens does not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
