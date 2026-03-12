import React from "react";
import { ArrowLeft, Book } from "lucide-react";

export default function CookiePolicy() {
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
              <Book className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cookie Policy</h1>
              <p className="text-slate-500 mt-1">Last updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">What Are Cookies?</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How We Use Local Storage</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Rather than using traditional server-sent cookies, WealthLens heavily utilizes HTML5 Local Storage. This approach ensures that your data never leaves your device and is not transmitted back to a server. We use local storage for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-2">
              <li><strong>UI Preferences:</strong> To remember your chosen theme (dark/light) or expanded/collapsed sidebar configurations.</li>
              <li><strong>Session Mocking:</strong> To store your generic user profile mock data so that your session persists across browser tabs.</li>
              <li><strong>Saved Calculations:</strong> To allow you to persist customized portfolio plans locally on your machine without needing a database.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Analytics & Third-Party Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              Currently, WealthLens operates as a local-first application and does not embed any third-party tracking cookies (such as Google Analytics or Meta Pixels) that track your browsing behavior across other sites.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Managing Your Preferences</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              You have the right to decide whether to accept or reject cookies and local storage. You can exercise your preferences by modifying your web browser controls. If you choose to clear your site data, please be aware that any saved "Calculations" or profile preferences will be permanently wiped, as they do not exist on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
