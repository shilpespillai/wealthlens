import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

/**
 * AuthGuard - Component-level protection for non-public pages.
 * Instead of aggressive redirection loops, this shows a high-fidelity
 * "Identity Required" state if the user session is missing or expired.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifying Security Protocol...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md w-full space-y-8 p-12 bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-200 mb-10">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Terminal Locked</h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Your security session has expired or is invalid. Please re-authenticate to access your financial command center.
            </p>
          </div>
          
          <div className="pt-6">
            <Button 
              onClick={() => navigateToLogin()}
              className="w-full bg-slate-900 hover:bg-black text-white py-8 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
              Sign In to Resume
            </Button>
            <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Secured by WealthLens Identity Protocol
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}