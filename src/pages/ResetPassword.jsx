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
  const [view, setView] = useState(() => {
    const url = window.location.href.toLowerCase();
    const hasUrlToken = url.includes('access_token=') || url.includes('type=recovery') || url.includes('code=');
    
    // If we have a token in the URL, trust it.
    if (hasUrlToken) return 'update';

    // If we DON'T have a token in the URL, check the vault
    const vault = (localStorage.getItem('recovery_vault_v2') || "").toLowerCase();
    const hasVaultToken = vault.includes('access_token=') || vault.includes('type=recovery') || vault.includes('code=');
    
    // If even the vault is empty, it's a fresh request
    return hasVaultToken ? 'update' : 'request';
  });

  useEffect(() => {
    // High-Priority Handshake Detection
    const runHandshake = async () => {
      const url = window.location.href;
      const vault = localStorage.getItem('recovery_vault_v2') || "";
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      
      // Combine all possible sources of truth
      const combinedSource = url + hash + search + vault;
      
      // Detect code
      const urlParams = new URLSearchParams(search || hash.replace('#', '?') || vault.replace('#', '?'));
      const code = urlParams.get('code');
      const isRecovery = combinedSource.includes('type=recovery') || combinedSource.includes('access_token=') || !!code;

      if (isRecovery) {
        console.log("[ResetPassword] Recovery signal detected. Mode: Update.");
        setView('update');
        
        // Save to vault if it's in the URL
        if (hash || search) {
            localStorage.setItem('recovery_vault_v2', hash + search);
        }

        if (code) {
          console.log("[ResetPassword] Exchanging PKCE code...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.warn("[ResetPassword] PKCE Exchange failed (expected for some redirects):", error.message);
            
            // CHECKPOINT: Even if exchange fails, maybe we have a session anyway?
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              console.log("[ResetPassword] Found existing session. Proceeding to Update.");
              setView('update');
              return;
            }

            if (error.message.includes('code verifier not found')) {
                // If we are already in update mode, don't show the error yet, 
                // just let them try the update
                console.log("[ResetPassword] Verifier missing, but form is visible. Letting user proceed.");
            } else {
                setError("The security link is invalid or has already been used.");
                return;
            }
          }
        }
        
        // Success! We can clear the vault now
        localStorage.removeItem('recovery_vault_v2');
        setView('update');
      }
    };

    runHandshake();
  }, []);

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

      <div className="w-full max-w-md space-y-12 relative z-10">
        <Link 
          to="/Login" 
          onClick={() => localStorage.removeItem('recovery_vault_v2')}
          className="inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors group mb-6"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[12px] font-black uppercase tracking-widest">Back to Terminal</span>
        </Link>

        <div className="text-center lg:text-left space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase italic">
            {view === 'request' ? 'Key Recovery' : 'Reset Security Key'}
          </h2>
          <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest">
            {view === 'request' ? 'Initialize institutional access restoration.' : 'Establish your new credentials.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {error && view === 'request' && (
            <div className="p-5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-bold uppercase tracking-widest flex items-center gap-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] font-bold uppercase tracking-widest flex items-center gap-4">
              <BadgeCheck className="w-5 h-5 shrink-0" />
              {successMsg}
            </div>
          )}

          {view === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Registered Email</label>
                <input 
                  type="email" 
                  placeholder="name@institutional.com" 
                  value={email} 
                  required 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                Request Recovery Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">New Security Key</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  required 
                  minLength={6}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={isConnecting}
                className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-4 shadow-xl shadow-slate-200"
              >
                {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Establish New Key
              </button>
            </form>
          )}
        </motion.div>

        <div className="pt-16 flex flex-col items-center gap-6">
           <div className="flex gap-6">
              <ShieldCheck className="w-5 h-5 text-slate-200" />
              <Lock className="w-5 h-5 text-slate-200" />
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center leading-loose">
             © 2026 WealthLens Global Sharding. <br />
             Secure Institutional Recovery Protocol.
           </p>
        </div>
      </div>
    </div>
  );
}
