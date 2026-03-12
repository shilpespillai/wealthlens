import React, { useState } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { Loader2, Mail, ShieldCheck, TrendingUp, Zap, Lock } from "lucide-react";

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const getRedirectUrl = () => `${window.location.origin}/auth/callback`;

  const handleOAuthLogin = async (provider) => {
    setIsConnecting(provider);
    setError(null);
    if (isSupabaseEnabled) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase(),
        options: { redirectTo: getRedirectUrl() },
      });
      if (error) { setError(error.message); setIsConnecting(null); }
    } else {
      setTimeout(() => {
        const mockUser = { id: 'usr-dev', email: `dev_${provider}@wealthlens.local`, full_name: `Dev ${provider} User`, provider };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        const params = new URLSearchParams(window.location.search);
        let r = params.get('redirect_to') || '/';
        if (r.toLowerCase().includes('login')) r = '/';
        window.location.replace(r);
      }, 1000);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsConnecting('Email');
    setError(null);
    if (isSupabaseEnabled) {
      const fn = name ? supabase.auth.signUp({ email, password, options: { data: { full_name: name } } }) : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) { setError(error.message); setIsConnecting(null); return; }
      const params = new URLSearchParams(window.location.search);
      let r = params.get('redirect_to') || '/';
      if (r.toLowerCase().includes('login')) r = '/';
      window.location.replace(r);
    } else {
      setTimeout(() => {
        localStorage.setItem('mockUser', JSON.stringify({ id: 'usr-custom', email, full_name: name || email.split('@')[0], provider: 'Email' }));
        const params = new URLSearchParams(window.location.search);
        let r = params.get('redirect_to') || '/';
        if (r.toLowerCase().includes('login')) r = '/';
        window.location.replace(r);
      }, 1000);
    }
  };

  // ── Provider configs ───────────────────────────────────────────────────────
  const providers = [
    {
      id: 'google', label: 'Continue with Google',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      cls: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col items-center justify-center p-12">
        {/* Decorative blobs */}
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
            Analyze properties, optimize portfolios, and make smarter investment decisions — all in one place.
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

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900">WealthLens</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7 text-center lg:text-left">
            <h2 className="text-2xl font-black text-gray-900 mb-1">Sign in to your account</h2>
            <p className="text-gray-500 text-sm">Welcome back! Choose your sign-in method.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm text-center">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <div className="space-y-3">
              {providers.map(({ id, label, icon, cls }) => (
                <button
                  key={id} onClick={() => handleOAuthLogin(id)}
                  disabled={!!isConnecting}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${cls}`}
                >
                  {isConnecting === id ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
                  {isConnecting === id ? 'Redirecting...' : label}
                </button>
              ))}

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-gradient-to-br from-slate-50 to-indigo-50/40 px-3 text-xs text-gray-400">or continue with email</span></div>
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 font-semibold text-sm transition-all bg-white shadow-sm"
              >
                <Mail className="w-4 h-4" /> Email & Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input type="email" placeholder="you@example.com" value={email} required
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                <input type="password" placeholder="••••••••" value={password} required
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full name <span className="text-gray-300">(new users only)</span></label>
                <input type="text" placeholder="Jane Smith (leave blank to sign in)"
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition-all"
                />
              </div>
              <button type="submit" disabled={!!isConnecting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-indigo-200 mt-1"
              >
                {isConnecting === 'Email' && <Loader2 className="w-4 h-4 animate-spin" />}
                <Lock className="w-4 h-4" />
                {name ? 'Create Account' : 'Sign In'}
              </button>
              <button type="button" onClick={() => setShowEmailForm(false)} className="w-full text-center text-indigo-400 hover:text-indigo-600 text-xs font-medium transition-colors mt-1">
                ← All sign-in options
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-6">
            By signing in you agree to our{' '}
            <a href="/terms" className="text-indigo-500 hover:text-indigo-700 underline">Terms</a> &{' '}
            <a href="/privacy" className="text-indigo-500 hover:text-indigo-700 underline">Privacy Policy</a>
          </p>
          {!isSupabaseEnabled && (
            <p className="text-center text-amber-500 text-xs mt-2 bg-amber-50 rounded-lg p-2 border border-amber-100">
              ⚠️ Dev mode — set VITE_SUPABASE_URL to enable real OAuth
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
