import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import GlobalSearch from "./GlobalSearch";

export default function Navbar({ onSettingsClick }) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-softPeach/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-deepPurple rounded-xl flex items-center justify-center text-white font-black text-xl transition-transform hover:rotate-12">W</div>
            <span className="text-xl font-serif font-black text-gray-900 tracking-tight italic">Wealth<span className="text-deepPurple">Lens</span></span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
            {isAuthenticated && !authLoading && (
              <>
                <Link to="/Calculator" className="text-gray-500 hover:text-deepPurple transition-all">Calculator</Link>
                <Link to="/Portfolio" className="text-gray-500 hover:text-deepPurple transition-all">Portfolio</Link>
                <Link to="/FamilyBudget" className="text-deepPurple font-black">Family Budget</Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && !authLoading && onSettingsClick && (
            <Button 
                variant="ghost" 
                size="icon"
                onClick={onSettingsClick}
                className="text-gray-400 hover:text-deepPurple transition-colors"
              >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          {!authLoading && !isAuthenticated && (
            <Link to="/Login">
              <Button className="bg-deepPurple hover:opacity-90 text-white rounded-full px-8 text-sm font-bold shadow-md transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
