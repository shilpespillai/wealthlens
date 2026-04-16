import React from "react";
import { ArrowLeft, Mail, MessageCircle, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 mb-10 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </a>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Info Side */}
            <div className="bg-indigo-700 p-8 sm:p-16 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black mb-8 tracking-tight">Direct Access to Wealth Intelligence</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-100 mb-1">Email Us</h4>
                      <p className="text-white/80 font-medium">aihealthtec@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-100 mb-1">Community Forum</h4>
                      <p className="text-white/80 font-medium">Join 5,000+ investors in our closed community.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-100 mb-1">Location</h4>
                      <p className="text-white/80 font-medium">Remote-First · Global Reach</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-white/10">
                <p className="text-indigo-200 text-sm font-medium leading-relaxed">
                  WealthLens provides advanced financial modeling. For security purposes, we do not host automated contact forms. Direct email is the safest way to connect with our compliance and support teams.
                </p>
              </div>
            </div>

            {/* Visual Side / Static Contact */}
            <div className="p-8 sm:p-16 bg-white flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Get in Touch</h1>
                <p className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed mb-10">
                  Have questions about WealthLens or your investment strategy? Our team is directly reachable for professional inquiries.
                </p>

                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 group hover:bg-indigo-600 transition-all duration-500 cursor-default">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:bg-indigo-500 transition-colors">
                      <Mail className="w-8 h-8 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xs font-bold text-indigo-900/50 uppercase tracking-widest mb-1 group-hover:text-white/70">Support & Partnerships</h3>
                      <a href="mailto:aihealthtec@gmail.com" className="text-2xl font-black text-indigo-700 group-hover:text-white transition-colors break-all">
                        aihealthtec@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 font-black">Manual Contact Only</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      To ensure maximum privacy and security, we have removed all automated contact forms. Please copy the email address above and send your message directly from your personal or professional email account.
                    </p>
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
