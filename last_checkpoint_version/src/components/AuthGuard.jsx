import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-purple-500/20 mb-8">
            <span className="text-white text-2xl font-black italic">W</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter text-center">Identity Required</h2>
          <p className="text-slate-500 text-sm font-semibold leading-relaxed text-center">
            Please sign in to access your financial command center and real-time ledger records.
          </p>
          <Button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white border-none py-7 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200"
          >
            Authenticate with Google
          </Button>
        </div>
      </div>
    );
  }

  return children;
}