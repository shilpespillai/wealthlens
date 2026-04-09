import React, { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { TrendingUp, Loader2, CheckCircle, XCircle } from "lucide-react";

/**
 * AuthCallback - handles the OAuth redirect from Google (via Supabase PKCE flow).
 * With PKCE, Supabase returns a `code` query param. We must exchange it for a
 * session before the user is considered signed in.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isSupabaseEnabled) {
      window.location.replace('/');
      return;
    }

    const handleCallback = async () => {
      try {
        // ── Check URL for PKCE code (query param) ────────────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const urlError = urlParams.get('error_description') || urlParams.get('error');

        if (urlError) {
          setErrorMsg(decodeURIComponent(urlError.replace(/\+/g, ' ')));
          setStatus('error');
          return;
        }

        if (code) {
          console.log('[AuthCallback] PKCE code detected, exchanging...');
          // PKCE flow — exchange the code for a real session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('[AuthCallback] exchangeCodeForSession error:', error);
            setErrorMsg(error.message);
            setStatus('error');
            return;
          }
          if (data?.session?.user) {
            console.log('[AuthCallback] PKCE success, user:', data.session.user.email);
            onSuccess(data.session.user);
            return;
          }
        }

        // ── Implicit flow fallback (hash fragment) ────────────────────────────
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const hashError = hashParams.get('error_description') || hashParams.get('error');

        if (hashError) {
          setErrorMsg(decodeURIComponent(hashError.replace(/\+/g, ' ')));
          setStatus('error');
          return;
        }

        if (accessToken) {
          console.log('[AuthCallback] Implicit flow access_token detected');
          // Let Supabase pick up the hash session automatically
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            onSuccess(session.user);
            return;
          }
        }

        // ── Final fallback: poll getSession once more ─────────────────────────
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('[AuthCallback] Fallback session found');
          onSuccess(session.user);
          return;
        }

        // Keep searching for 12s (handled by timeout)
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setErrorMsg(err.message || 'Unexpected error during sign-in.');
        setStatus('error');
      }
    };

    const onSuccess = (user) => {
      // Clear any manual logout kill-switch if it exists
      localStorage.removeItem('_manual_logout');

      localStorage.setItem('mockUser', JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        provider: user.app_metadata?.provider || 'google',
        avatar: user.user_metadata?.avatar_url,
      }));

      setStatus('success');

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        let redirectTo = params.get('redirect_to') || '/Dashboard';
        if (!redirectTo || redirectTo.toLowerCase().includes('login') || redirectTo.toLowerCase().includes('callback')) {
          redirectTo = '/Dashboard';
        }
        window.location.href = window.location.origin + redirectTo;
      }, 800);
    };

    handleCallback();

    // Timeout fallback — if nothing fires after 12s, show error
    const timeout = setTimeout(() => {
      setStatus(s => {
        if (s === 'loading') {
          setErrorMsg('Sign-in timed out. Please try again.');
          return 'error';
        }
        return s;
      });
    }, 12000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900">WealthLens</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg">Signing you in...</p>
            <p className="text-gray-400 text-sm mt-1">Verifying your Google account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg">Signed in successfully!</p>
            <p className="text-gray-400 text-sm mt-1">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
            <p className="text-gray-700 font-semibold text-lg">Sign-in failed</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">{errorMsg}</p>
            <a href="/login" className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
