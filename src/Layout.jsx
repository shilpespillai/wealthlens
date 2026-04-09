import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/AuthContext";
import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const isPublicPage = ['/login', '/auth/callback', '/about', '/methodology', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/assumptions', '/cookie-policy', '/security-policy', '/'].includes(path);
  const showSidebar = user && !isPublicPage;

  useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("wealthlens-theme");
    if (savedTheme) {
      try {
        const colors = JSON.parse(savedTheme);
        document.documentElement.style.setProperty("--accent-color", colors.accent);
      } catch {
        // Fallback to default if stored theme is invalid
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] flex overflow-hidden">
      <style>{`
        :root {
          --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
        }
        body {
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #0F172A;
        }
      `}</style>
      
      {/* Institutional Sidebar */}
      {showSidebar && <Sidebar />}
      
      {/* Main Workspace Frame */}
      <div className={`flex-1 ${showSidebar ? 'p-4' : 'p-0'} h-screen flex flex-col gap-4 min-w-0`}>
        {/* The Horizon Mainframe - Master Rounded Panel */}
        <div className={`flex-1 ${showSidebar ? 'bg-white border border-slate-200 rounded-[32px] shadow-2xl' : 'bg-transparent border-none rounded-none'} overflow-hidden flex flex-col relative`}>
          
          <main className={`flex-1 overflow-y-auto ${showSidebar ? 'px-8 pb-12 pt-10' : 'p-0'}`}>
            <div className={`${showSidebar ? 'max-w-[1400px]' : 'max-w-full'} mx-auto`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}