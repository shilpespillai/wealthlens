import React, { useEffect, useState } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { TrendingUp, Loader2, CheckCircle, XCircle } from "lucide-react";

/**
 * AuthCallback - handles the OAuth redirect from Google (via Supabase).
 * Supabase automatically processes the URL hash tokens and fires onAuthStateChange.
 * We listen for SIGNED_IN, store the user in localStorage, then redirect home.
 */
export default function AuthCallback() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isSupabaseEnabled) {
      window.location.replace('/');
      return;
    }

    // Listen for auth state change — this fires as soon as Supabase
    // processes the access_token / code from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;

        // Store user in localStorage so the existing mockUser auth system picks it up
        localStorage.setItem('mockUser', JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          provider: user.app_metadata?.provider || 'google',
          avatar: user.user_metadata?.avatar_url,
        }));

        setStatus('success');

        // Short delay to show success, then redirect
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          let redirectTo = params.get('redirect_to') || '/';
          if (!redirectTo || redirectTo.toLowerCase().includes('login') || redirectTo.toLowerCase().includes('callback')) {
            redirectTo = '/';
          }
          window.location.replace(redirectTo);
        }, 800);

      } else if (event === 'SIGNED_OUT' || (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED')) {
        // Handle error states
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = urlParams.get('error_description') || urlParams.get('error') || hashParams.get('error_description') || hashParams.get('error');
        if (error) {
          setErrorMsg(decodeURIComponent(error.replace(/\+/g, ' ')));
          setStatus('error');
        }
      }
    });

    // Also try getSession as a fallback (handles cases where SIGNED_IN already fired)
    const trySession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
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
          let redirectTo = params.get('redirect_to') || '/';
          if (!redirectTo || redirectTo.toLowerCase().includes('login') || redirectTo.toLowerCase().includes('callback')) {
            redirectTo = '/';
          }
          window.location.replace(redirectTo);
        }, 800);
      } else if (error) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error_description') || urlParams.get('error');
        setErrorMsg(urlError ? decodeURIComponent(urlError) : error.message);
        setStatus('error');
      }
    };

    trySession();

    // Timeout fallback — if nothing fires after 10s, show error
    const timeout = setTimeout(() => {
      setStatus(s => {
        if (s === 'loading') {
          setErrorMsg('Sign-in timed out. Please try again.');
          return 'error';
        }
        return s;
      });
    }, 10000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timeout);
    };
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
