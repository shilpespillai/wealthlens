import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { useReport } from "@/lib/ReportContext";

export default function Navbar() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { exportFunction, isPremium: isPagePremium } = useReport();
  const location = useLocation();

  return (
    <header className="sticky top-6 z-50 px-6 w-full max-w-[1400px] mx-auto">
      <div className="bg-[#111827]/90 backdrop-blur-md border border-white/5 shadow-2xl rounded-[32px] px-8 py-3 flex items-center justify-between">
        {/* Left Side - Empty for symmetry */}
        <div className="w-1/4" />

        {/* Center - Branding */}
        <div className="flex-1 flex justify-center">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-xl font-serif font-medium text-[#C5A059] tracking-tight italic">Wealth<span className="text-[#E5C48B]">Lens</span></span>
          </Link>
        </div>
        
        {/* Right Side - Actions */}
        <div className="w-1/4 flex justify-end">
          <div className="flex items-center gap-4">
            {isAuthenticated && !authLoading && (
              <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => logout()}
                  className="text-gray-400 hover:text-[#E5C48B] transition-all hover:bg-white/5 px-4 h-9 rounded-xl gap-2 text-[10px] uppercase font-medium tracking-widest"
                  title="Sign Out"
                >
                <LogOut className="w-4 h-4 text-[#C5A059]" />
                <span className="hidden sm:inline">Terminal Exit</span>
              </Button>
            )}

            {!authLoading && !isAuthenticated && (
              <Link to="/Login">
                <Button className="bg-[#C5A059] hover:bg-[#E5C48B] text-[#111827] rounded-full h-9 px-6 text-[10px] font-medium uppercase tracking-widest transition-all">
                  Onboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
