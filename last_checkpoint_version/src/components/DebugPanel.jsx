import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Shield, Database, Activity, RefreshCcw, AlertTriangle } from 'lucide-react';

/**
 * DebugPanel - An institutional diagnostic overlay.
 * Only visible if localStorage.getItem('wl_debug') === 'true'.
 */
export default function DebugPanel() {
  const { user, isAuthenticated, isLoadingAuth, authError } = useAuth();
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [latency, setLatency] = useState(0);
  const [isVisible, setIsVisible] = useState(localStorage.getItem('wl_debug') === 'true');

  useEffect(() => {
    if (!isVisible) return;

    const checkHealth = async () => {
      const start = Date.now();
      try {
        await base44.db.getTable('user_accounts');
        setLatency(Date.now() - start);
        setDbStatus('Operational');
      } catch (err) {
        setDbStatus('Error');
        console.error("[Debug] Health Check Failed:", err);
      }
    };

    const interval = setInterval(checkHealth, 3000);
    checkHealth();
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-6 font-mono animate-in slide-in-from-bottom-10 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Terminal Diagnostics
        </h4>
        <button onClick={() => setIsVisible(false)} className="text-slate-500 hover:text-white transition-colors">
          <RefreshCcw className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Auth Block */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield className="w-2.5 h-2.5" /> Identity Protocol
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-300">State:</span>
            <span className={`text-[10px] font-black ${isAuthenticated ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isLoadingAuth ? 'Initializing...' : (isAuthenticated ? 'AUTHENTICATED' : 'LOCKED')}
            </span>
          </div>
          {user && <p className="text-[9px] text-slate-500 mt-1 truncate">{user.email}</p>}
        </div>

        {/* Database Block */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Database className="w-2.5 h-2.5" /> Data Layer
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-300">Vault:</span>
            <span className={`text-[10px] font-black ${dbStatus === 'Operational' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {dbStatus}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-300">Latency:</span>
            <span className="text-[10px] font-black text-indigo-400">{latency}ms</span>
          </div>
        </div>

        {authError && (
          <div className="bg-rose-500/10 rounded-2xl p-4 border border-rose-500/20">
             <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
               <AlertTriangle className="w-2.5 h-2.5" /> Active Protocol Error
             </p>
             <p className="text-[9px] text-rose-300 leading-relaxed">{authError.message}</p>
          </div>
        )}

        <div className="pt-2">
          <button 
            onClick={() => window.location.reload(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Hard Reset Engine
          </button>
        </div>
      </div>
    </div>
  );
}
