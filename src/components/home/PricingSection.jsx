import React from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const FREE_FEATURES = [
  "Investment growth calculator",
  "5+ asset classes (stocks, ETFs, crypto, bonds)",
  "20+ currencies supported",
  "Scenario comparison (3 outcomes)",
  "Year-by-year breakdown table",
  "Growth chart visualisation",
  "Portfolio overview dashboard",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "AI Investment Coach (personalised advice)",
  "AI Portfolio Builder",
  "Retirement Planner",
  "Market Sentiment Analysis",
  "Tax Optimisation Strategies",
  "Property Analyser & Property vs ETF",
  "Equity Unlock Planner",
  "Save calculations & export PDF",
  "Lifetime access — one-time payment",
];

export default function PricingSection({ onGetStarted }) {
  const LIVE_PRICE_ID = "price_1T7w6sJkmG8taKBQqIH4PxqD";

  const handleGetStarted = async () => {
    try {
      await base44.auth.redirectToLogin(createPageUrl("Calculator"));
    } catch {}
  };

  const handleUpgrade = async () => {
    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert("Checkout works only from the published app. Please open this app in a new tab to complete your purchase.");
      return;
    }

    try {
      // Get logged-in user's email to ensure subscription is tied to their account
      let email;
      try {
        const user = await base44.auth.me();
        email = user?.email;
      } catch {}

      // If not logged in, redirect to login first then come back
      if (!email) {
        await base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const response = await base44.functions.invoke('stripeCheckout', {
        priceId: LIVE_PRICE_ID,
        email: email.trim(),
        successUrl: window.location.origin + createPageUrl("Calculator"),
        cancelUrl: window.location.origin + createPageUrl("Home")
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        alert("Checkout session creation failed. Please try again.");
      }
    } catch (err) {
      alert(`Checkout failed: ${err.message || 'Please try again.'}`);
    }
  };

  return (
    <section className="bg-white py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Simple, Honest Pricing</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Start free. Upgrade once. Keep it forever.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-gray-200 p-8 flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-lg font-black text-gray-900 mb-1">Free</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-4xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 text-sm mb-1">forever</span>
              </div>
              <p className="text-sm text-gray-500">Perfect for getting started with investment planning.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleGetStarted}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Get Started Free
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border-2 border-indigo-500 p-8 flex flex-col relative bg-gradient-to-br from-indigo-50/60 to-violet-50/60 shadow-lg shadow-indigo-100"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-black text-gray-900 mb-1">Premium</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-gray-900">$29</span>
                <span className="text-gray-400 text-sm mb-1">one-time</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mb-3">✓ Lifetime access — pay once, own forever</p>
              <p className="text-sm text-gray-500">For serious investors who want the full toolkit.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold shadow-lg shadow-indigo-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              Unlock Premium Now
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">Secure payment via Stripe · Instant access</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}