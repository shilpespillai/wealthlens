import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Settings } from "lucide-react";
import SettingsDialog from "@/components/SettingsDialog";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      
      {children}
    </div>
  );
}