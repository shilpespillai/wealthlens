import React, { useState } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { Loader2, Mail, ShieldCheck, TrendingUp, Zap, Lock } from "lucide-react";

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(null);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // only for signup
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
      // Dev fallback
      setTimeout(() => {
        localStorage.setItem('mockUser', JSON.stringify({
          id: 'usr-dev', email: 'dev@wealthlens.local', full_name: 'Dev User', provider: 'google'
        }));
        const r = new URLSearchParams(window.location.search).get('redirect_to') || '/';
        window.location.replace(r.toLowerCase().includes('login') ? '/' : r);
      }, 1000);
    }
  };

  // ── Email Sign In ──────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsConnecting('signin');
    setError(null);
    if (isSupabaseEnabled) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setIsConnecting(null); return; }
      const r = new URLSearchParams(window.location.search).get('redirect_to') || '/';
      window.location.replace(r.toLowerCase().includes('login') ? '/' : r);
    } else {
      setTimeout(() => {
        localStorage.setItem('mockUser', JSON.stringify({ id: 'usr-email', email, full_name: email.split('@')[0], provider: 'email' }));
        const r = new URLSearchParams(window.location.search).get('redirect_to') || '/';
        window.location.replace(r.toLowerCase().includes('login') ? '/' : r);
      }, 1000);
    }
  };

  // ── Email Sign Up ──────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsConnecting('signup');
    setError(null);
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
      setTimeout(() => {
        localStorage.setItem('mockUser', JSON.stringify({ id: 'usr-new', email, full_name: name || email.split('@')[0], provider: 'email' }));
        window.location.replace('/');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col items-center justify-center p-12">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]" />
        <div className="relative z-10 text-white max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight">WealthLens</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Build wealth with <span className="text-yellow-300">AI-powered</span> insights
          </h1>
          <p className="text-white/75 text-base leading-relaxed mb-10">
            Analyze properties, optimize portfolios, and make smarter investment decisions.
          </p>
          <div className="space-y-4">
            {[
              { icon: <Zap className="w-4 h-4" />, text: "Real-time suburb & global market analysis" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Bank-grade security & data privacy" },
              { icon: <TrendingUp className="w-4 h-4" />, text: "AI-driven portfolio recommendations" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">{icon}</div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900">WealthLens</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-500 text-sm">
              {mode === 'signin' ? 'Sign in to access your dashboard.' : 'Start your investment journey today.'}
            </p>
          </div>

          {/* Error / Success */}
          {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">{error}</div>}
          {successMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{successMsg}</div>}

          {/* Google */}
          <button onClick={handleGoogleLogin} disabled={!!isConnecting}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm shadow-sm transition-all disabled:opacity-60 mb-4"
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

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-gradient-to-br from-slate-50 to-indigo-50/40 px-3 text-xs text-gray-400">or</span></div>
          </div>

          {/* Email Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3">
              <input type="email" placeholder="Email address" value={email} required onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
              <input type="password" placeholder="Password" value={password} required onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
              <button type="submit" disabled={!!isConnecting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
              >
                {isConnecting === 'signin' && <Loader2 className="w-4 h-4 animate-spin" />}
                <Lock className="w-4 h-4" /> Sign In
              </button>
            </form>
          )}

          {/* Email Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <input type="text" placeholder="Full name (optional)" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
              <input type="email" placeholder="Email address" value={email} required onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
              <input type="password" placeholder="Password (min 6 characters)" value={password} required minLength={6} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm"
              />
              <button type="submit" disabled={!!isConnecting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
              >
                {isConnecting === 'signup' && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}

          {/* Toggle Sign In / Create Account */}
          <div className="mt-5 text-center text-sm">
            {mode === 'signin' ? (
              <p className="text-gray-500">
                Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                  Create account
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-4">
            By continuing you agree to our <a href="/terms" className="text-indigo-500 hover:underline">Terms</a> & <a href="/privacy" className="text-indigo-500 hover:underline">Privacy Policy</a>
          </p>
          {!isSupabaseEnabled && (
            <p className="text-center text-amber-600 text-xs mt-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
              ⚠️ Dev mode — add VITE_SUPABASE_URL to Vercel for real Google login
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
