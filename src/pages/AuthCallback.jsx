import React, { useEffect } from "react";
import { supabase, isSupabaseEnabled } from "@/lib/supabaseClient";
import { TrendingUp, Loader2 } from "lucide-react";

/**
 * AuthCallback - handles the OAuth redirect from providers (Google, Facebook, etc.)
 * Supabase exchanges the code for a session automatically.
 * We just wait for the session to be set, then redirect home.
 */
export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseEnabled) {
        window.location.replace('/');
        return;
      }

      // Supabase automatically parses the URL hash/code and sets the session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // Store user info in localStorage too for compatibility with existing auth checks
        const user = session.user;
        localStorage.setItem('mockUser', JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
          provider: user.app_metadata?.provider || 'oauth',
          avatar: user.user_metadata?.avatar_url,
        }));
      }

      // Redirect to intended page or home
      const params = new URLSearchParams(window.location.search);
      let redirectTo = params.get('redirect_to') || '/';
      if (redirectTo.toLowerCase().includes('login') || redirectTo.toLowerCase().includes('callback')) {
        redirectTo = '/';
      }
      window.location.replace(redirectTo);
    };

    // Small delay to allow Supabase to process the URL hash
    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black text-gray-900">WealthLens</span>
        </div>
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Signing you in...</p>
        <p className="text-gray-400 text-sm mt-1">You'll be redirected in a moment</p>
      </div>
    </div>
  );
}
