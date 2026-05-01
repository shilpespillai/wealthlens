import React from "react";
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>
        
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-16 text-white">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-indigo-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-indigo-400/30">
                <Shield className="w-8 h-8 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Privacy Policy</h1>
                <p className="text-slate-400 mt-2 font-medium">Last updated: March 16, 2026</p>
              </div>
            </div>
            <p className="text-slate-300 text-lg max-w-3xl leading-relaxed">
              At WealthLens, we take your financial privacy as seriously as you do. This policy outlines how we handle your data and our commitment to professional-grade security.
            </p>
          </div>

          <div className="p-8 sm:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed">
                <section id="introduction">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Database className="w-6 h-6 text-indigo-600" />
                    1. Information Collection and Use
                  </h2>
                  <p>
                    WealthLens operates under a "Privacy by Design" philosophy. We categorize the information we handle into two distinct groups:
                  </p>
                  <h3 className="text-lg font-bold mt-6 mb-3">A. User-Provided Account Information</h3>
                  <p>
                    When you create an account or subscribe to our premium services, we collect basic identification data such as your name and email address. This is used solely for account management, subscription verification, and communicating essential service updates.
                  </p>
                  <h3 className="text-lg font-bold mt-6 mb-3">B. Local Financial Data</h3>
                  <p>
                    <strong>We do not store your financial data on our servers.</strong> Financial figures, portfolio allocations, and budget entries are processed dynamically within your local environment. While we provide AI-driven analysis through secure APIs, the underlying raw data remains ephemeral or stored within your browser's secure local storage.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="security">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-indigo-600" />
                    2. Data Security Measures
                  </h2>
                  <p>
                    We employ industry-standard encryption protocols (AES-256) for all data in transit. Our infrastructure is hosted on secure, SOC 2 compliant cloud providers. For local data, we utilize browser-native encryption features where available to ensure that your financial snapshots remain private to your device.
                  </p>
                  <p>
                    Users are responsible for maintaining the security of their own devices and account credentials. We recommend using multi-factor authentication (MFA) for the identity providers (Google/Email) used to access WealthLens.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="sharing">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    3. Information Sharing
                  </h2>
                  <p>
                    WealthLens does not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners and trusted affiliates for the purposes outlined above.
                  </p>
                </section>

                <hr className="my-12 border-slate-100" />

                <section id="cookies">
                  <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    4. Cookies and Web Analytics
                  </h2>
                  <p>
                    We use cookies to enhance your experience, gather general visitor information, and track visits to our website. These "performance cookies" help us understand which features are most valuable to our users. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies via your browser settings.
                  </p>
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-slate-900 font-black mb-4 flex items-center gap-2">
                       Questions?
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                      Our privacy team is here to help if you have concerns about your data.
                    </p>
                    <a 
                      href="/contact" 
                      className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      Contact Support
                    </a>
                  </div>

                  <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
                    <h4 className="text-indigo-900 font-bold mb-2 text-sm uppercase tracking-wider">Quick Links</h4>
                    <ul className="space-y-3">
                      <li><a href="/termsofuse" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">Terms of Use</a></li>
                      <li><a href="/securitypolicy" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">Security Policy</a></li>
                      <li><a href="/disclaimer" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline">Legal Disclaimer</a></li>
                    </ul>
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
