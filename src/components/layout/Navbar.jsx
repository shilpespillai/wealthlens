import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import GlobalSearch from "./GlobalSearch";

export default function Navbar({ onSettingsClick }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center text-white font-semibold text-lg transition-transform hover:scale-105">W</div>
            <span className="text-lg font-semibold text-slate-900 tracking-tight">Wealth<span className="text-blue-800">Lens</span></span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {isAuthenticated && (
              <>
                <Link to="/Calculator" className="text-slate-500 hover:text-blue-800 transition-colors">Calculator</Link>
                <Link to="/Portfolio" className="text-slate-500 hover:text-blue-800 transition-colors">Portfolio</Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {onSettingsClick && (
            <Button 
                variant="ghost" 
                size="icon"
                onClick={onSettingsClick}
                className="text-slate-400 hover:text-slate-900"
              >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          {isAuthenticated ? (
            <Link to="/">
              <Button variant="ghost" className="hidden sm:inline-flex text-sm font-semibold text-slate-400 hover:text-slate-900">Sign out</Button>
            </Link>
          ) : (
            <>
              <Link to="/Login">
                <Button className="bg-blue-800 hover:bg-blue-900 text-white rounded-md px-6 text-sm font-semibold shadow-sm transition-all hover:translate-y-[-1px]">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
