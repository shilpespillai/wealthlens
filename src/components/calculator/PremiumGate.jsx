import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, Crown, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { base44 } from "@/api/base44Client";

const PREMIUM_FEATURES = [
  "AI Portfolio Builder — personalized asset allocation",
  "Retirement Planner — full retirement projection",
  "AI Investment Coach — personalized advice",
  "Tax Optimization Strategies",
  "Market Sentiment Analysis",
  "PDF Export reports",
  "Unlimited saved calculations",
  "All asset classes & currencies",
];

export default function PremiumGate({ children, featureName, isPremium }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dev mode: unlock all premium features
  const isDev = process.env.NODE_ENV === "development";
  if (isPremium || isDev) return children;

  const handleUpgrade = async () => {
    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert("Checkout works only from the published app. Please open this app in a new tab to complete your purchase.");
      return;
    }

    setLoading(true);
    try {
      // Get authenticated user
      const user = await base44.auth.me();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch publishable key from backend
      const keyResponse = await base44.functions.invoke("getStripeKey");
      const publishableKey = keyResponse.data.publishableKey;
      
      if (!publishableKey) {
        throw new Error("Stripe publishable key not available");
      }

      const stripe = await loadStripe(publishableKey);
      
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      const response = await base44.functions.invoke("stripeCheckout", {
        priceId: "price_1T7w6sJkmG8taKBQqIH4PxqD",
        email: user.email,
        successUrl: window.location.href + "?upgraded=true",
        cancelUrl: window.location.href,
      });

      const { sessionId } = response.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error("Stripe error:", error);
        alert("Checkout failed: " + error.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout: " + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Blurred preview with lock overlay */}
      <div className="relative rounded-3xl overflow-hidden">
        <div className="pointer-events-none select-none blur-sm opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-sm rounded-3xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center px-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
            <p className="text-sm text-slate-300 mb-6 max-w-xs">
              <strong className="text-amber-400">{featureName}</strong> is available in Premium for a one-time <strong className="text-white">$29</strong> purchase.
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-amber-500/30"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
      <DialogHeader>
      <DialogTitle className="flex items-center gap-3 text-xl">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
        <Crown className="w-5 h-5 text-white" />
      </div>
      Premium — One-Time $29
      </DialogTitle>
      </DialogHeader>

          <div className="space-y-6 pt-2">
            <p className="text-slate-300 text-sm">Unlock the full power of the Investment Calculator with all AI-powered tools.</p>

            <div className="space-y-2.5">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-200">{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black text-white">$29<span className="text-base font-normal text-slate-400"> one-time</span></div>
              <div className="text-xs text-slate-400 mt-1">Lifetime access • All features</div>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-4 rounded-xl text-base"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Crown className="w-4 h-4 mr-2" /> Unlock Premium — $29</>}
            </Button>

            <p className="text-center text-xs text-slate-500">Secured by Stripe. No subscriptions.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}