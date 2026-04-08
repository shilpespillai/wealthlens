import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
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
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  const handleManualReset = async () => {
    await logout();
    onClose();
  };

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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              <p className="text-slate-400 text-sm">Loading profile intelligence...</p>
            </div>
          ) : user ? (
            <>
              {/* Account & Profile */}
              <AccountSection user={user} />

              {/* Admin Operations */}
              {user.email === "admin@wealthlens.com" && (
                <AdminSection user={user} />
              )}
            </>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white font-serif">Session Sync Mismatch</h3>
                <p className="text-slate-400 leading-relaxed font-sans text-sm px-4">
                  The app is authenticated, but we couldn't resolve your profile intelligence. Refreshing your session will fix this.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={handleManualReset}
                  className="w-full bg-deepPurple text-white hover:opacity-90 font-bold py-6 rounded-xl flex items-center justify-center gap-2 shadow-xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out & Refresh Session
                </Button>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
                  This will clear local cache and restore full access
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}