import React from "react";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 mt-1">Last updated: March 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              WealthLens ("we", "our", or "us") operates strictly as a local-first financial estimation tool. We do not transmit your entered financial figures (such as salary, net worth, portfolio allocations, or specific investment targets) to any external servers. All data entered into the calculator is processed dynamically within your local browser environment. The AI-generated coaching and market sentiment data is mocked locally.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Cookies and Local Storage</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We utilize browser Local Storage to save your "Theme" preferences, your "Mock Auth" state, and any "Saved Calculations" you explicitly choose to persist between sessions. This data never leaves your device and can be cleared at any time by clearing your browser site data or using the "Clear Cache" button in the application settings.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              WealthLens uses standard web infrastructure and analytics to monitor application performance and stability. Because we removed the Base44 backend dependency, we do not currently share any personally identifiable information (PII) or financial data with any third-party analytics providers.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We implement industry-standard security measures to protect the integrity of our front-end application. However, because your financial data is stored locally on your device, the security of that data ultimately depends on the physical and digital security of the device you are using to access WealthLens.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at privacy@wealthlens.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
