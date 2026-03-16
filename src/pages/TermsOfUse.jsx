import React from "react";
import { ArrowLeft, BookOpen, Scale, Gavel, UserCheck, ShieldAlert } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 sm:p-16 text-white text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Terms of Use</h1>
                <p className="text-indigo-200 mt-2 font-medium">Agreement for WealthLens Services</p>
              </div>
            </div>
            <p className="text-indigo-100 text-lg max-w-3xl leading-relaxed">
              By using WealthLens, you agree to these professional standards. Please read carefully to understand your rights and responsibilities.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="agreement">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Scale className="w-6 h-6 text-indigo-600" />
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and WealthLens ("we," "us," or "our"), concerning your access to and use of our platform. By accessing the Service, you signify that you have read, understood, and agree to be bound by all of these Terms of Use.
                  </p>
                  <p>
                    If you do not agree with all of these terms, then you are expressly prohibited from using the Service and you must discontinue use immediately.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="conduct">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-indigo-600" />
                    2. User Conduct and Eligibility
                  </h2>
                  <p>
                    The Service is intended for users who are at least 18 years old. As a user, you agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide accurate, current, and complete information during account registration.</li>
                    <li>Maintain the security of your password and identification.</li>
                    <li>Accept all risks of unauthorized access to your account data.</li>
                    <li>Refrain from any automated use of the system, such as using scripts to send comments or messages.</li>
                  </ul>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="disclaimer">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Gavel className="w-6 h-6 text-indigo-600" />
                    3. No Financial Advice
                  </h2>
                  <p>
                    <strong>IMPORTANT:</strong> WealthLens is a financial analysis and educational platform. We provide software tools for estimation and visualizing wealth trajectories based on your inputs.
                  </p>
                  <p>
                    The outputs of our calculators, AI insights, and projections do not constitute professional financial, legal, or tax advice. You should always consult with a qualified professional before making significant financial decisions. Past performance is not indicative of future results.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="limitations">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-indigo-600" />
                    4. Limitations of Liability
                  </h2>
                  <p>
                    In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Service, even if we have been advised of the possibility of such damages.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                    <h3 className="text-slate-900 font-black mb-4">Agreement Details</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Version</span>
                        <span className="font-bold text-slate-900">2.0.1</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Effective Date</span>
                        <span className="font-bold text-slate-900">Mar 16, 2026</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Jurisdiction</span>
                        <span className="font-bold text-slate-900">Global</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                    <h4 className="text-indigo-900 font-bold mb-4 text-xs uppercase tracking-wider underline decoration-2 underline-offset-4">Resources</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed mb-6">
                      For specific questions regarding user data or partnership agreements, please reach out to our legal department.
                    </p>
                    <a 
                      href="mailto:aihealthtec@gmail.com" 
                      className="text-indigo-600 text-sm font-black hover:text-indigo-800 transition-colors"
                    >
                      aihealthtec@gmail.com →
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
