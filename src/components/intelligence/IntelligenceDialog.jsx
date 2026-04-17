import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Info,
  Lock,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const MODEL_OPTIONS = {
  gemini: [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', pricing: "$0.07 / $0.25", description: "Standard high-speed 2026 intelligence." },
    { value: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro', pricing: "$1.20 / $4.50", description: "Deep reasoning for complex backtesting." }
  ],
  openai: [
    { value: 'gpt-5.3-instant', label: 'GPT-5.3 Instant', pricing: "$0.10 / $0.40", description: "Extremely low latency for live monitoring." },
    { value: 'gpt-5.4-pro', label: 'GPT-5.4 Pro', pricing: "$2.50 / $10.00", description: "Frontier GPT-5 architecture for elite analysis." }
  ],
  anthropic: [
    { value: 'claude-4.7-sonnet', label: 'Claude 4.7 Sonnet', pricing: "$0.30 / $1.20", description: "Balanced agentic performance for 2026." },
    { value: 'claude-4.7-opus', label: 'Claude 4.7 Opus', pricing: "$15.00 / $75.00", description: "Highest intelligence tier. Professional grade." }
  ]
};

const PRICING_DATA = {
  gemini: {
    accent: "text-[#C5A059]",
    glow: "shadow-[#C5A059]/20"
  },
  openai: {
    accent: "text-blue-400",
    glow: "shadow-blue-500/20"
  },
  anthropic: {
    accent: "text-orange-400",
    glow: "shadow-orange-500/20"
  }
};

export default function IntelligenceDialog({ open, onOpenChange }) {
  const [config, setConfig] = useState({ 
    provider: 'gemini', 
    models: { gemini: 'gemini-2.5-flash', openai: 'gpt-5.3-instant', anthropic: 'claude-4.7-sonnet' },
    keys: { gemini: '', openai: '', anthropic: '' },
    discovered: { gemini: [], openai: [], anthropic: [] },
    lastSynced: null
  });
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('wl_ai_config');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Migration: If they have the old format, migrate 'key' to the current provider
        if (parsed.key !== undefined && !parsed.keys) {
            parsed.keys = { gemini: '', openai: '', anthropic: '' };
            parsed.keys[parsed.provider || 'gemini'] = parsed.key;
            delete parsed.key;
        }
        setConfig(prev => ({ ...prev, ...parsed })); 
      } catch (e) { console.error(e); }
    }
  }, [open]);

  const handleSave = () => {
    localStorage.setItem('wl_ai_config', JSON.stringify(config));
    setIsSaved(true);
    
    // Broadcast update for other components to refresh
    window.dispatchEvent(new CustomEvent('wl-intelligence-updated'));
    
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const provider = config.provider;
      const key = config.keys[provider];
      const newlyDiscovered = await base44.intelligence.syncModels(provider, key);
      
      setConfig(prev => {
        const updated = { 
          ...prev, 
          discovered: { ...prev.discovered, [provider]: newlyDiscovered },
          lastSynced: new Date().toISOString()
        };
        // Auto-select first discovered model if current is not in the list (and not original default)
        return updated;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentInfo = PRICING_DATA[config.provider];
  
  // Combine Static options with Discovered ones
  const availableModels = [
    ...MODEL_OPTIONS[config.provider],
    ...(config.discovered?.[config.provider] || [])
  ];
  
  // Eliminate duplicates by value
  const uniqueModels = Array.from(new Map(availableModels.map(m => [m.value, m])).values());

  const currentModelRef = uniqueModels.find(m => m.value === config.models[config.provider]) || uniqueModels[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[850px] p-0 overflow-hidden border-none bg-[#0B111D] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row min-h-[520px] relative">
          
          {/* Subtle Institutional Background */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#C5A059]/10 blur-[90px]" />
          </div>

          {/* Left: Configuration Panel */}
          <div className="flex-1 p-8 flex flex-col relative z-10 border-r border-white/5">
            <DialogHeader className="mb-8 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C5A059] to-[#8E7341] rounded-xl flex items-center justify-center shadow-lg shadow-[#C5A059]/10">
                    <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-white uppercase leading-none">Intelligence Hub</DialogTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Protocol Secured</span>
                    </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ml-0.5 mb-2 block">Cognitive Provider</label>
                <Select 
                  value={config.provider} 
                  onValueChange={(val) => setConfig({ ...config, provider: val })}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 font-semibold text-white rounded-xl focus:ring-1 focus:ring-[#C5A059]/40 transition-all text-xs uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10 rounded-xl text-white">
                    <SelectItem value="gemini" className="font-semibold py-2.5">GOOGLE GEMINI</SelectItem>
                    <SelectItem value="openai" className="font-semibold py-2.5">OPENAI (GPT)</SelectItem>
                    <SelectItem value="anthropic" className="font-semibold py-2.5">ANTHROPIC (CLAUDE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Neural Model Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ml-0.5 mb-2 block">Neural Model</label>
                <Select 
                  value={config.models[config.provider]} 
                  onValueChange={(val) => setConfig({ 
                    ...config, 
                    models: { ...config.models, [config.provider]: val } 
                  })}
                >
                  <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 font-semibold text-white rounded-xl focus:ring-1 focus:ring-[#C5A059]/40 transition-all text-xs uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-white/10 rounded-xl text-white">
                    {uniqueModels.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="font-semibold py-2.5">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center justify-between px-1 mt-1.5 font-bold uppercase tracking-widest">
                   <p className="text-[8px] text-slate-600">
                     {config.lastSynced ? `Infrastructure Locked: ${new Date(config.lastSynced).toLocaleDateString()}` : "Discovery Required"}
                   </p>
                   <button 
                     onClick={handleSync}
                     disabled={isSyncing || !config.keys[config.provider]}
                     className="text-[8px] text-[#C5A059] hover:underline disabled:opacity-30 flex items-center gap-1"
                   >
                     {isSyncing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
                     Sync Infrastructure
                   </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ml-0.5 mb-2 block">Security Key</label>
                <div className="relative group">
                  <Input 
                    type={showKey ? "text" : "password"} 
                    placeholder={`Enter ${config.provider} key...`}
                    className="bg-white/5 border-white/10 h-11 pr-12 font-mono text-xs text-[#C5A059] rounded-xl focus:ring-1 focus:ring-[#C5A059]/40 transition-all placeholder:text-slate-700"
                    value={config.keys[config.provider] || ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        setConfig({ 
                          ...config, 
                          keys: { ...config.keys, [config.provider]: val }
                        });
                    }}
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#C5A059] transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 px-1 mt-2.5">
                   <ShieldCheck className="w-3 h-3 text-[#C5A059]/60" />
                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Encrypted Local Persistence</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              className={`w-full h-12 mt-8 rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all relative overflow-hidden ${
                isSaved ? 'bg-emerald-600' : 'bg-[#C5A059] hover:bg-[#B48F4A]'
              } text-white shadow-xl shadow-[#C5A059]/5`}
            >
              {isSaved ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> PROTOCOLS UPDATED</span>
              ) : (
                <span className="flex items-center gap-2">SYNCHRONIZE INTELLIGENCE <ArrowRight className="w-3.5 h-3.5" /></span>
              )}
            </Button>
          </div>

          {/* Right Panel: Glossy Specs */}
          <div className="w-full md:w-[300px] bg-slate-900/40 p-10 flex flex-col justify-center items-center relative backdrop-blur-xl border-l border-white/5">
            <div className="absolute inset-0 bg-gradient-to-b from-[#C5A059]/5 via-transparent to-transparent opacity-50" />
            
            <motion.div
              key={`${config.provider}-${config.models[config.provider]}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full relative z-10 space-y-8"
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 transition-all shadow-xl ${currentInfo.glow}`}>
                  <Zap className={`w-8 h-8 ${currentInfo.accent}`} />
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1 whitespace-nowrap">
                  {currentModelRef.label}
                </h3>
                <p className={`text-[8px] font-bold uppercase tracking-[0.3em] ${currentInfo.accent}`}>
                  High-Performance Neural
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 group transition-colors hover:border-white/10">
                   <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-2">Market Pricing</p>
                   <p className="text-lg font-bold text-white tracking-tight">{currentModelRef.pricing}</p>
                   <p className="text-[7px] text-slate-600 mt-1 uppercase font-bold tracking-widest">Per 1M Tokens (Institutional)</p>
                </div>

                <div className="p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/10">
                   <p className="text-[8px] font-bold text-[#C5A059] uppercase tracking-widest mb-2">Neural Strategy</p>
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                    "{currentModelRef.description}"
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
