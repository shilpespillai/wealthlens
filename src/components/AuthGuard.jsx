import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await base44.auth.me();
        setIsAuthenticated(!!user);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to WealthLens</h1>
          <p className="text-slate-300 mb-8">Sign in or create an account to get started with your investment calculations.</p>
          <Button
            onClick={() => base44.auth.redirectToLogin()}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-3 px-8 rounded-xl text-lg"
          >
            Sign In / Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return children;
}