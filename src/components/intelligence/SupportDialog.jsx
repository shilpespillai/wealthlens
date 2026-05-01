import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  ShieldCheck,
  SendHorizontal,
  Zap,
  MessageSquare,
  HeadphonesIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/AuthContext";
import PremiumOverlay from "../layout/PremiumOverlay";

export default function SupportDialog({ open, onOpenChange, userEmail }) {
  const { isPaidUser } = useAuth();
  const [formData, setFormData] = useState({
    subject: "WealthLens Support Request",
    message: ""
  });
  const [isSent, setIsSent] = useState(false);

  const handleSendEmail = () => {
    const supportEmail = "aihealthtech@gmail.com";
    const body = formData.message.trim();

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    
    setIsSent(true);
    setTimeout(() => {
        setIsSent(false);
        onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden border-none bg-[#0B111D] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] min-h-[400px]">
        {!isPaidUser && <PremiumOverlay featureName="Direct Engineering Support" />}
        
        <div className="relative p-8 flex flex-col">
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 blur-[60px] pointer-events-none" />
            
            <DialogHeader className="mb-8 text-left relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#8E7341] rounded-xl flex items-center justify-center shadow-lg shadow-[#C5A059]/10">
                        <HeadphonesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-white uppercase leading-none">Direct Support</DialogTitle>
                        <div className="flex items-center gap-1.5 mt-1">
                           <div className="w-1 h-1 rounded-full bg-emerald-500" />
                           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Engineering Response: Active</span>
                        </div>
                    </div>
                </div>
                <DialogDescription className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Connect directly with the WealthLens engineering team for institutional assistance.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ml-0.5 block">Ticket Subject</label>
                <Input 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-white/5 border-white/10 h-11 font-semibold text-white rounded-xl focus:ring-1 focus:ring-[#C5A059]/40 transition-all text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ml-0.5 block">Describe Issue</label>
                <Textarea 
                  placeholder="Tell us what's on your mind..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="bg-white/5 border-white/10 min-h-[140px] font-medium text-white rounded-xl p-4 focus:ring-1 focus:ring-[#C5A059]/40 transition-all text-xs placeholder:text-slate-700 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 px-1">
                 <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]/60" />
                 <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Encrypted Handover Protocol</p>
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={!formData.message}
                className={`w-full h-12 rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all relative overflow-hidden ${
                    isSent ? 'bg-emerald-600' : 'bg-[#C5A059] text-white hover:bg-[#B48F4A]'
                } shadow-xl shadow-[#C5A059]/5 mt-2`}
              >
                {isSent ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> DISPATCHING DRAFT...</span>
                ) : (
                    <span className="flex items-center gap-2">LAUNCH TICKET <SendHorizontal className="w-3.5 h-3.5" /></span>
                )}
              </Button>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 text-center relative z-10">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                    aihealthtech@gmail.com <br/> Infrastructure support
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
