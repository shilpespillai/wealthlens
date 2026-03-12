import React, { useState, useEffect } from "react";
import { Shield, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function AdminSection({ user }) {
  const [price, setPrice] = useState("10");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = user?.email === "admin@wealthlens.com";

  useEffect(() => {
    async function fetchPrice() {
      const currentPrice = await base44.app.getPrice();
      setPrice(String(currentPrice));
    }
    if (isAdmin) {
      fetchPrice();
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  const handleUpdatePrice = async () => {
    if (!price || isNaN(price)) {
      setMessage("Please enter a valid number");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await base44.app.updatePrice(parseInt(price, 10));
      setMessage("Price updated successfully! Refreshing pages will show the new price.");
      // Trigger a small delay before clearing message
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error updating price");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-400">
        <Shield className="w-5 h-5" />
        Admin Operations
      </h3>

      <div className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider font-semibold">Premium One-Time Price (USD)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:border-amber-500 outline-none transition-all"
                  placeholder="10"
                />
              </div>
              <Button
                onClick={handleUpdatePrice}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Update</>}
              </Button>
            </div>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.includes("Error") ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {message}
            </motion.div>
          )}

          <p className="text-xs text-slate-500 italic">
            * This setting updates the "Dynamic Pricing" value throughout the application. 
            Real Stripe payments will reflect this amount in the Checkout session.
          </p>
        </div>
      </div>
    </div>
  );
}
