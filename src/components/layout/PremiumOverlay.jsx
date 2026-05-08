import React, { useState, useEffect } from "react";
import { Sparkles, Lock, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PREMIUM_FEATURES = [
  "Institutional Intelligence Reports — full suite access",
  "AI Portfolio Builder — personalized asset allocation",
  "Retirement Planner — full retirement projection",
  "AI Investment Coach — personalized advice",
  "Tax Optimization Strategies",
  "Historical Trends & Forecasting",
  "PDF Export reports",
  "Unlimited saved calculations",
];

export default function PremiumOverlay({ featureName = "Intelligence Report" }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const { syncProStatus } = useAuth();
  const [price, setPrice] = useState(10);

  useEffect(() => {
    async function loadPrice() {
      try {
        const p = await base44.app.getPrice();
        setPrice(p);
      } catch (err) {
        console.error("Failed to load price:", err);
      }
    }
    loadPrice();
  }, []);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert("Checkout works only from the published app. Please open this app in a new tab to complete your purchase.");
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error("User not authenticated");

      // Try environment variable first (Vercel/Local .env)
      let publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      // Fallback to backend function if env var is missing
      if (!publishableKey) {
        const keyResponse = await base44.functions.invoke("getStripeKey");
        publishableKey = keyResponse.data?.publishableKey;
      }
      
      if (!publishableKey) throw new Error("Stripe publishable key not available");

      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error("Failed to load Stripe");
      
      const response = await base44.functions.invoke("stripeCheckout", {
        priceId: "price_1T7w6sJkmG8taKBQqIH4PxqD",
        email: user.email,
        amount: price,
        successUrl: window.location.origin + "/Dashboard?payment=success",
        cancelUrl: window.location.href,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
        return;
      }
      
      if (response.data?.sessionId) {
        await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden animate-in fade-in duration-700">
        {/* Institutional Backdrop */}
        <div className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-[24px]" />
        
        {/* Dynamic Orbs for depth */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Main Command Terminal */}
        <div className="relative w-full max-w-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-[48px] p-12 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-50" />
          
          <div className="relative z-10">
            {/* Master Keyhole Icon */}
            <div className="mb-10 inline-flex">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#C5A059] to-[#E5C48B] flex items-center justify-center shadow-[0_20px_50px_-10px_rgba(197,160,89,0.3)] animate-bounce-slow">
                <Lock className="w-10 h-10 text-slate-900 stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Institutional Access</span>
                </div>
              </div>

              <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] max-w-md mx-auto">
                Unlock the Elite <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{featureName}.</span>
              </h2>

              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                Gain institutional-grade financial intelligence, automated forecasting, and professional-tier reporting engines.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full max-w-xs h-16 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-2xl transition-all active:scale-[0.98] group-hover:shadow-indigo-500/20"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>{`Activate Pro — $${price}`} <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>

              <div>
                <button
                  onClick={() => setCompareOpen(true)}
                  className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] hover:text-[#C5A059] transition-colors py-2 px-4"
                >
                  Explore Pro Architecture
                </button>
              </div>

              <div className="pt-4">
                 <button
                   onClick={async () => {
                     setSyncing(true);
                     const success = await syncProStatus();
                     if (success) {
                        toast.success("Identity Verified", { description: "Pro Status activated. Refreshing terminal..." });
                     } else {
                        toast.error("Sync Failed", { description: "No active payment found for this email yet. Please try again in 30s." });
                     }
                     setSyncing(false);
                   }}
                   disabled={syncing}
                   className="text-[9px] font-black text-[#C5A059]/60 hover:text-[#C5A059] uppercase tracking-[0.2em] transition-all flex items-center gap-2 mx-auto"
                 >
                   {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                   Already Paid? Synchronize Status
                 </button>
              </div>
            </div>
          </div>

          {/* Technical Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(#fff 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
        </div>
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="bg-white border-none text-slate-900 max-w-lg rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden">
          <div className="relative">
            {/* Header section with gradient background */}
            <div className="bg-gradient-to-br from-slate-900 to-[#1e293b] p-10 pb-16 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -ml-24 -mb-24" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#C5A059] flex items-center justify-center shadow-lg shadow-[#C5A059]/20">
                    <Sparkles className="w-6 h-6 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight leading-none mb-1">WealthLens Pro</h3>
                    <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">Institutional Grade Suite</p>
                  </div>
                </div>
                <h2 className="text-4xl font-black tracking-tighter leading-[0.9] mb-4">Elite Financial <br />Architecture.</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">Unlock every analytical engine and automated intelligence report in the platform.</p>
              </div>
            </div>

            {/* Feature list section */}
            <div className="bg-white px-10 -mt-8 relative z-20 rounded-t-[40px] pt-10 pb-12">
              <div className="grid grid-cols-1 gap-3 mb-10">
                {PREMIUM_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors duration-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{f}</span>
                  </div>
                ))}
              </div>

              {/* Pricing & CTA */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lifetime Access</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">${price}</span>
                      <span className="text-xs font-bold text-slate-400">USD</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Limited Offer</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">One-time payment</p>
                  </div>
                </div>

                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-[1.5rem] text-xs uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</>
                  ) : (
                    "Activate Full Access"
                  )}
                </Button>
                
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Secured by Stripe • No monthly subscriptions</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
