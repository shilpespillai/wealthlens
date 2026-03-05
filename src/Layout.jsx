import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut } from "lucide-react";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        :root {
          --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
        }
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      
      {user && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-4 bg-white rounded-lg shadow-md px-4 py-3">
          <span className="text-sm text-slate-700">{user.email}</span>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}
      
      {children}
    </div>
  );
}