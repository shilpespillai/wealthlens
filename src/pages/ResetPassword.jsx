import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, Lock, Key, ArrowLeft, BadgeCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  // Determine initial view based on URL
  const [view, setView] = useState(() => {
    const hasToken = 
      window.location.hash.includes('access_token=') || 
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      window.location.search.includes('access_token=');
    
    return hasToken ? 'update' : 'request';
  });

  useEffect(() => {
    // Secondary check for delayed hydration (some browsers/frameworks might delay hash populating)
    const checkAgain = () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const isRecovery = hash.includes('type=recovery') || hash.includes('access_token=') || search.includes('type=recovery');
      
      if (isRecovery && view !== 'update') {
        setView('update');
      }
    };

    const timer = setTimeout(checkAgain, 100);
    return () => clearTimeout(timer);
  }, [view]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsConnecting(true);
    setError(null);
    setSuccessMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/ResetPassword`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg("Recovery link sent! Please check your institutional email.");
    }
    setIsConnecting(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Security key must be at least 6 characters.");
      return;
    }
    setIsConnecting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg("Security key updated successfully. Redirecting to terminal...");
      setTimeout(() => navigate('/Login'), 2000);
    }
    setIsConnecting(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-40" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-50 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <Link to="/Login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Terminal</span>
        </Link>

        <div className="text-center lg:text-left space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            {view === 'request' ? 'Key Recovery' : 'Reset Security Key'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {view === 'request' ? 'Initialize institutional access restoration.' : 'Establish your new credentials.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
              <BadgeCheck className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}

          {view === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Registered Email</label>
                <input 
                  type="email" 
                  placeholder="name@institutional.com" 
                  value={email} 
                  required 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Request Recovery Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">New Security Key</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  required 
                  minLength={6}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-xs font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Establish New Key
              </button>
            </form>
          )}
        </motion.div>

        <div className="pt-10 flex flex-col items-center gap-4">
           <div className="flex gap-4">
              <ShieldCheck className="w-4 h-4 text-slate-200" />
              <Lock className="w-4 h-4 text-slate-200" />
           </div>
           <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] text-center leading-loose">
             © 2026 WealthLens Global Sharding. <br />
             Secure Institutional Recovery Protocol.
           </p>
        </div>
      </div>
    </div>
  );
}
