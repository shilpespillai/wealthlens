import React, { useState } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { Loader2, ShieldCheck, TrendingUp, Zap, Lock, Sparkles, Globe, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(null);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // only for signup
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [honeypot, setHoneypot] = useState(""); // Bot protection (Honeypot)
  const [launchCode, setLaunchCode] = useState("");
  const { activateLaunchPass } = useAuth();

  const getRedirectUrl = () => {
    const params = new URLSearchParams(window.location.search);
    let redirectTo = params.get('redirect_to');
    
    // Safety: Never redirect to localhost if we are currently on production
    if (redirectTo && redirectTo.includes('localhost') && !window.location.origin.includes('localhost')) {
      redirectTo = '/';
    }

    const baseUrl = `${window.location.origin}/auth/callback`;
    return redirectTo ? `${baseUrl}?redirect_to=${encodeURIComponent(redirectTo)}` : baseUrl;
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsConnecting('google');
    setError(null);
    if (isSupabaseEnabled) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectUrl() },
      });
      if (error) { setError(error.message); setIsConnecting(null); }
    } else {
      setError("Production Auth Required: Google Login is only available when Supabase is configured.");
      setIsConnecting(null);
    }
  };

  // ── Email Sign In ──────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent fail for bots
    if (!email || !password) return;
    setIsConnecting('signin');
    setError(null);

    // Optional: Validate Launch Code if provided
    if (launchCode) {
      try {
        const config = await base44.user.loadData('wl_public_launch_config');
        if (config && config.code) {
          const isExpired = config.expiry && new Date(config.expiry) < new Date();
          if (isExpired) {
            setError("Launch Access Period has ended. Standard authentication required.");
            setIsConnecting(null);
            return;
          }
          if (launchCode.toUpperCase() === config.code.toUpperCase()) {
            activateLaunchPass();
          } else {
            setError("Invalid Launch Access Code. Please verify your credentials.");
            setIsConnecting(null);
            return;
          }
        }
      } catch (err) {
        console.error("Launch code validation error:", err);
      }
    }

    if (isSupabaseEnabled) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setIsConnecting(null); return; }
      const r = new URLSearchParams(window.location.search).get('redirect_to') || '/';
      window.location.replace(r.toLowerCase().includes('login') ? '/' : r);
    } else {
      setError("Production Auth Required: Sign In is only available when Supabase is configured.");
      setIsConnecting(null);
    }
  };

  // ── Email Sign Up ──────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent fail for bots
    if (!email || !password) return;
    setIsConnecting('signup');
    setError(null);

    // Optional: Validate Launch Code if provided
    if (launchCode) {
      try {
        const config = await base44.user.loadData('wl_public_launch_config');
        if (config && config.code) {
          const isExpired = config.expiry && new Date(config.expiry) < new Date();
          if (isExpired) {
            setError("Launch Access Period has ended. Standard activation required.");
            setIsConnecting(null);
            return;
          }
          if (launchCode.toUpperCase() === config.code.toUpperCase()) {
            activateLaunchPass();
          } else {
            setError("Invalid Launch Access Code. Please verify your credentials.");
            setIsConnecting(null);
            return;
          }
        }
      } catch (err) {
        console.error("Launch code validation error:", err);
      }
    }

    if (isSupabaseEnabled) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { 
          data: { full_name: name || email.split('@')[0] },
          emailRedirectTo: getRedirectUrl()
        }
      });
      if (error) { setError(error.message); setIsConnecting(null); return; }
      setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      setIsConnecting(null);
      setMode('signin');
    } else {
      setError("Production Auth Required: Sign Up is only available when Supabase is configured.");
      setIsConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 flex flex-col lg:flex-row overflow-hidden">
      {/* ── Left Institutional Branding Panel ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-white flex-col justify-center p-20 border-r border-slate-100">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] opacity-40" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="relative z-10 max-w-md">
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-105 transition-all">W</div>
            <span className="text-[12px] font-black text-slate-900 tracking-[0.4em] uppercase">WealthLens</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-md">
              <Sparkles className="w-3 h-3" />
              Institutional Access
            </div>
            
            <h1 className="text-5xl font-black tracking-tighter leading-[1.1] uppercase italic text-slate-900">
              Access the <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px #0f172a' }}>Financial Hub.</span>
            </h1>

            <p className="text-slate-500 text-base font-medium leading-relaxed max-w-sm">
              Enter the WealthLens ecosystem to coordinate your capital, optimize tax strategies, and visualize your financial horizon.
            </p>

            <div className="space-y-4 pt-8">
              {[
                { icon: <Globe className="w-4 h-4" />, text: "Global Asset Coordination" },
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Zero-Knowledge Data Vault" },
                { icon: <TrendingUp className="w-4 h-4" />, text: "AI-Powered Strategy Engine" },
              ].map(({ icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900">{icon}</div>
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-20 opacity-20">
           <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.5em]">System Version v4.2.0 • Elite</p>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-20 relative bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden flex flex-col items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">W</div>
          <span className="text-[10px] font-black text-slate-900 tracking-[0.4em] uppercase">WealthLens</span>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              {mode === 'signin' ? 'System Login' : 'Create Terminal'}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {mode === 'signin' ? 'Access your private financial shard.' : 'Initialize your institutional profile.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <BadgeCheck className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <BadgeCheck className="w-4 h-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              {/* Google Integration */}
              <button 
                onClick={handleGoogleLogin} 
                disabled={!!isConnecting}
                className="w-full flex items-center justify-center gap-4 h-14 rounded-2xl bg-white border border-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:border-slate-300 transition-all disabled:opacity-60"
              >
                {isConnecting === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isConnecting === 'google' ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Secure Credentials</span></div>
              </div>

              <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Michael Ross" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-xs font-bold"
                    />
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Identity</label>
                  <input 
                    type="email" 
                    placeholder="name@institutional.com" 
                    value={email} 
                    required 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Key</label>
                    <Link 
                      to="/ResetPassword" 
                      id="forgot-password-link" 
                      onClick={() => {
                        localStorage.removeItem('recovery_vault_v2');
                        sessionStorage.removeItem('recovery_vault');
                      }}
                      className="text-[7px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                    >
                      Forgot Key?
                    </Link>
                  </div>
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Launch Access Code (Optional)</label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="E.G. WEALTH2026" 
                    value={launchCode} 
                    onChange={e => setLaunchCode(e.target.value.toUpperCase())}
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all text-xs font-black tracking-widest"
                  />
                </div>

                <input type="text" name="id_check" className="hidden" tabIndex="-1" autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />

                <button 
                  type="submit" 
                  disabled={!!isConnecting}
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                >
                  {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === 'signin' ? 'Initialize Session' : 'Create Credentials'}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>

          <div className="text-center pt-4">
            <button 
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMsg(null); }}
              className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
            >
              {mode === 'signin' ? "Don't have a terminal? Create one" : "Already have a terminal? Sign in"}
            </button>
          </div>

          <div className="pt-10 flex flex-col items-center gap-4">
             <div className="flex gap-4">
                <ShieldCheck className="w-4 h-4 text-slate-200" />
                <Globe className="w-4 h-4 text-slate-200" />
                <Lock className="w-4 h-4 text-slate-200" />
             </div>
             <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em] text-center leading-loose">
               By initializing, you agree to our <a href="/terms" className="text-slate-900 hover:underline">Terms</a> & <a href="/privacy" className="text-slate-900 hover:underline">Privacy Protocol</a>. <br />
               © 2026 WealthLens Global Sharding.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
