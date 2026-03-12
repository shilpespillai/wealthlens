import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShieldCheck, Zap, Mail, Loader2 } from "lucide-react";

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSSOLogin = (provider) => {
    setIsConnecting(provider);
    
    // Simulate a brief SSO handshake delay
    setTimeout(() => {
        const mockUser = { 
            id: 'usr-1', 
            email: `demo_${provider.toLowerCase()}@wealthlens.demo`, 
            full_name: `WealthLens ${provider} User`,
            provider: provider 
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        
        // Redirect back home securely
        const params = new URLSearchParams(window.location.search);
        let redirectTo = params.get('redirect_to') || '/';
        if (redirectTo.toLowerCase().includes('login')) {
            redirectTo = '/';
        }
        window.location.replace(redirectTo);
    }, 1200);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    setIsConnecting('Email');

    setTimeout(() => {
        const mockUser = { 
            id: 'usr-custom', 
            email: email, 
            full_name: name,
            provider: 'Email' 
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        const params = new URLSearchParams(window.location.search);
        let redirectTo = params.get('redirect_to');
        // Never redirect back to /login — always go to home if no valid redirect
        let safeRedirect = redirectTo && !redirectTo.toLowerCase().includes('login') ? redirectTo : '/';
        window.location.replace(safeRedirect);
    }, 1200);
  };
  
  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const MicrosoftIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 23 23">
        <path fill="#f3f3f3" d="M0 0h11v11H0z" />
        <path fill="#f3f3f3" d="M12 0h11v11H12z" />
        <path fill="#f3f3f3" d="M0 12h11v11H0z" />
        <path fill="#f3f3f3" d="M12 12h11v11H12z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-110 duration-500">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {showEmailForm ? "Create Local Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-400">
            {showEmailForm ? "Enter your details to persist locally" : "Sign in to access your portfolio calculations"}
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 rounded-[32px] shadow-2xl">
          {!showEmailForm ? (
            <div className="space-y-4">
                <Button
                onClick={() => handleSSOLogin('Google')}
                disabled={!!isConnecting}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-6 rounded-2xl transition-all flex items-center justify-center border-none shadow-lg"
                >
                {isConnecting === 'Google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><GoogleIcon /> Sign in with Google</>}
                </Button>

                <Button
                onClick={() => handleSSOLogin('Microsoft')}
                disabled={!!isConnecting}
                className="w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white font-bold py-6 rounded-2xl transition-all flex items-center justify-center border border-slate-700 shadow-lg"
                >
                {isConnecting === 'Microsoft' ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MicrosoftIcon /> Sign in with Microsoft</>}
                </Button>

                <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#020617]/0 px-2 text-slate-500">Or continue with</span>
                </div>
                </div>

                <Button
                onClick={() => setShowEmailForm(true)}
                disabled={!!isConnecting}
                variant="outline"
                type="button"
                className="w-full bg-transparent border-slate-800 hover:bg-slate-800/50 text-slate-300 font-medium py-6 rounded-2xl transition-all flex items-center justify-center"
                >
                <Mail className="w-5 h-5 mr-3 text-slate-400" /> Email address
                </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-5">
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                   <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                   <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                   />
                </div>
                <div>
                   <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                   <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                   />
                </div>
                
                <div className="pt-2 flex flex-col gap-3">
                    <Button
                        type="submit"
                        disabled={!!isConnecting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center"
                    >
                        {isConnecting === 'Email' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In Locally"}
                    </Button>
                    <button 
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                        Go back
                    </button>
                </div>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-8 leading-relaxed">
            By signing in, you agree to our <a href="/terms" className="text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-slate-700">Terms</a> and <a href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-slate-700">Privacy Policy</a>.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                <span className="text-[11px] font-medium tracking-wide uppercase">Local Encryption</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500/70" />
                <span className="text-[11px] font-medium tracking-wide uppercase">Private Data</span>
            </div>
        </div>
      </div>
    </div>
  );
}
