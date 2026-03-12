import React from "react";
import { ArrowLeft, Lock } from "lucide-react";

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculator
        </a>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Protocol</h1>
              <p className="text-slate-500 mt-1">How we protect your financial data</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed text-lg mb-8 font-medium">
              At WealthLens, we believe the most secure data is the data we never collect. Our architecture is designed to minimize risk by pushing compute and storage to the client edge.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Client-Side Architecture</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              WealthLens operates almost entirely in your browser. When you input your net worth, salary, or investment targets, that data is loaded into your browser's Random Access Memory (RAM). The calculations are executed via JavaScript locally. We do not transmit these highly sensitive inputs to an external database.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Data Persistence</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              When you opt to "Save" a calculation, it is serialized and stored in your browser's Local Storage sandbox. This provides a robust layer of security against network interception, as the data never travels over the wire. However, this means if your physical device is compromised by malware, your local storage could theoretically be accessed.
            </p>
            
            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Encryption in Transit</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              For any external API calls made by the application (such as fetching live market prices), we mandate the use of Transport Layer Security (TLS 1.3) to establish an encrypted tunnel. This prevents "man-in-the-middle" attacks from intercepting the generic market data flowing to your client.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Vulnerability Reporting</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We take security seriously. If you believe you have found a security vulnerability in the open-source architecture or hosted distribution of WealthLens, please contact us immediately at <a href="mailto:security@wealthlens.com" className="text-indigo-600 font-bold hover:underline">security@wealthlens.com</a>. We will investigate all actionable reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
