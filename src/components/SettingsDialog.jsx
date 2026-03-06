import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import AccountSection from "./settings/AccountSection";
import DataPrivacySection from "./settings/DataPrivacySection";
import AppSettingsSection from "./settings/AppSettingsSection";
import DocumentationSection from "./settings/DocumentationSection";
import SupportSection from "./settings/SupportSection";

const EXTERNAL_LINKS = [
  {
    label: "Privacy Policy",
    url: "https://wealthlens.com/privacy",
    icon: "🔒",
  },
  {
    label: "Terms of Service",
    url: "https://wealthlens.com/terms",
    icon: "⚖️",
  },
];

export default function SettingsDialog({ isOpen, onClose }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Settings className="w-6 h-6 text-indigo-400" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-10 pt-4">
          {/* Documentation */}
          <DocumentationSection />

          {/* Account & Profile */}
          {user && <AccountSection user={user} />}

          {/* Support */}
          {user && <SupportSection userEmail={user.email} />}

          {/* Data & Privacy */}
          <DataPrivacySection />

          {/* App Settings */}
          <AppSettingsSection />

          {/* External Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-300">
              Legal
            </h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {EXTERNAL_LINKS.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-white/20 hover:bg-slate-700/50 transition-all"
                >
                  <span className="text-xl">{link.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{link.label}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* App Info */}
          <div className="bg-slate-800/30 rounded-xl border border-white/10 p-4 border-t pt-8">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">WealthLens</strong> — Professional investment analysis and portfolio planning tools. 
              All data is processed securely and in compliance with international data protection standards.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Version 1.0.0 • © 2026 WealthLens
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}