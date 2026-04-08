import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import SettingsDialog from "@/components/SettingsDialog";

export default function Layout({ children }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
      
      <Navbar onSettingsClick={() => setSettingsOpen(true)} />
      <SettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}