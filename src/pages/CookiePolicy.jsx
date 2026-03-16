import React from "react";
import { ArrowLeft, Cookie, Info, ShieldCheck, Trash2 } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 sm:p-16 text-white">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <Cookie className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Cookie Policy</h1>
                <p className="text-slate-400 mt-2 font-medium">Last updated: March 16, 2026</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
              Transparency is essential. We use basic web storage technologies to ensure your local financial tools function seamlessly without ever compromising your privacy.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="what-are-cookies">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-600" />
                    1. Understanding Local Web Storage
                  </h2>
                  <p>
                    Cookies are small text files that are stored on your device to help websites remember your preferences. WealthLens prioritizes <strong>HTML5 Local Storage</strong> over traditional server-sent cookies. This means your data stays on your machine and is never sent to our backend for tracking purposes.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="usage">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                    2. Specific Use Cases
                  </h2>
                  <p>
                    We only use local storage for essential and functional purposes that directly improve your user experience:
                  </p>
                  <ul className="space-y-4 my-8">
                    <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-900 block mb-1">UI Preferences</strong>
                        <span className="text-sm">Maintains your theme selection (Dark/Light mode) and sidebar state across sessions.</span>
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-900 block mb-1">Local Financial Snapshots</strong>
                        <span className="text-sm">Allows you to save your portfolio scenarios locally so you can return to your calculations later.</span>
                      </div>
                    </li>
                    <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-900 block mb-1">Session Management</strong>
                        <span className="text-sm">Maintains your local "demo" authentication status so the application remains interactive.</span>
                      </div>
                    </li>
                  </ul>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="control">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Trash2 className="w-6 h-6 text-indigo-600" />
                    3. Managing Your Data
                  </h2>
                  <p>
                    Because we do not store your data, you have absolute control over it. You can clear all cached calculations and preferences at any time through your browser's "Clear Site Data" feature or via the "Reset Application" button found in our Settings menu.
                  </p>
                  <p className="text-sm italic text-slate-500 bg-amber-50 p-4 rounded-xl border border-amber-100 mt-6">
                    <strong>Note:</strong> Clearing your storage will permanently delete any locally saved calculations. WealthLens cannot recover this data for you as we never had access to it.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                       Quick Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Zero Tracking Cookies</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">Local Storage Only</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">100% User Control</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                    <h4 className="text-indigo-900 font-black mb-4 text-xs uppercase tracking-widest">Questions?</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed mb-6">
                      If you're unsure about how we use web storage, our technical team is happy to explain further.
                    </p>
                    <a 
                      href="mailto:aihealthtec@gmail.com" 
                      className="text-indigo-600 text-sm font-black hover:text-indigo-800 transition-colors"
                    >
                      Email Support →
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
