import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import AccountSection from "./settings/AccountSection";
import AdminSection from "./settings/AdminSection";

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
          {/* Account & Profile */}
          {user && <AccountSection user={user} />}

          {/* Admin Operations */}
          {user && user.email === "admin@wealthlens.com" && (
            <AdminSection user={user} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}