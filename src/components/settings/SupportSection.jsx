import React from "react";
import { motion } from "framer-motion";
import { Mail, HelpCircle, Users } from "lucide-react";

export default function SupportSection() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
        <Mail className="w-5 h-5 text-indigo-500" />
        Direct Support
      </h3>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-600 mb-6 leading-relaxed text-sm font-medium">
            For technical issues, account inquiries, or feature requests, please contact our executive support team directly via email. We typically respond within 12-24 hours.
          </p>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-200 group">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
              <Mail className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Support Email</p>
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=aihealthtec@gmail.com&su=WealthLens Support Request" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-black text-slate-900 hover:text-indigo-600 transition-colors break-all"
              >
                aihealthtec@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-center gap-3">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">Self-Service Docs Coming Soon</span>
        </div>

        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          WealthLens · Professional Portfolio Intelligence
        </p>
      </motion.div>
    </div>
  );
}