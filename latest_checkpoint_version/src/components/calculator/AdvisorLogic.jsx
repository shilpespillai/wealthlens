import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, TrendingUp, MessageSquare, CheckCircle, Loader, Terminal, Users, Sparkles, ChevronRight, Check, X } from "lucide-react";
// Note: Changed Lucide check for clarity if needed, but CheckCircle is fine. Using Check for the success state.
import { Check as CheckIcon } from "lucide-react";

const AGENTS = [
  { id: "analyst", name: "Market Analyst", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "auditor", name: "Risk Auditor", icon: Shield, color: "text-red-500", bg: "bg-red-50" },
  { id: "lead", name: "Head Advisor", icon: Brain, color: "text-indigo-600", bg: "bg-indigo-50" }
];

const MESSAGES = [
  { agent: "analyst", text: "Scanning global indices... S&P 500 is showing a 0.24% gap up. Volumes are 12% above 30-day average." },
  { agent: "analyst", text: "Trend confirmation: Bulls are defending the 50-day EMA. RSI is currently at 62—room for growth." },
  { agent: "auditor", text: "Wait. VIX has spiked 4% in the last hour. Macro sentiment is shifting due to the upcoming CPI data." },
  { agent: "auditor", text: "Detected over-leveraged positions in the tech sector. Risk level has moved from Moderate to High." },
  { agent: "analyst", text: "Acknowledged. Reducing bullish weighting by 15%. Focus shifting to defensive materials (BHP/RIO)." },
  { agent: "lead", text: "Excellent collaboration. Synthesizing data: The outlook remains positive but requires a protective stop-loss." },
  { agent: "lead", text: "AdvisorLogic Recommendation: Maintain 60/40 Equity split with a hedge in gold. Review complete." }
];

export default function AdvisorLogic({ symbol = "Global", onApply }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const logEndRef = useRef(null);

  const handleApply = () => {
    if (isApplied) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsApplied(true);
    setConfirming(false);
    if (onApply) onApply();
    console.log(`[AdvisorLogic] Strategy applied for ${symbol}`);
  };

  useEffect(() => {
    if (step < MESSAGES.length) {
      const timer = setTimeout(() => setStep(s => s + 1), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [step]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  return (
    <div className="bg-white rounded-[32px] border border-gray-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-indigo-100" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">AdvisorLogic™</h3>
            <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest">Multi-Agent Orchestration Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <div className={`w-2 h-2 rounded-full ${isDone ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{isDone ? "Sync Complete" : "Agents Collaborating"}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Agents */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-gray-100 p-4 space-y-4">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-4">Active Committee</p>
           {AGENTS.map((agent) => {
             const isActive = MESSAGES[step-1]?.agent === agent.id;
             return (
               <div 
                 key={agent.id} 
                 className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive ? "bg-white shadow-md shadow-indigo-100 ring-1 ring-indigo-100" : "opacity-60"}`}
               >
                 <div className={`p-2 rounded-xl ${agent.bg} ${agent.color}`}>
                   <agent.icon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-bold text-gray-900">{agent.name}</p>
                   <p className="text-[10px] text-gray-500 font-medium">Agent Active</p>
                 </div>
                 {isActive && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />}
               </div>
             );
           })}
        </div>

        {/* Dynamic Log Area */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
           <div className="p-6 space-y-4 font-mono text-sm">
              <AnimatePresence initial={false}>
                {MESSAGES.slice(0, step).map((msg, i) => {
                  const agent = AGENTS.find(a => a.id === msg.agent);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 items-start"
                    >
                      <div className={`p-1.5 rounded-lg ${agent.bg} ${agent.color} mt-1`}>
                        <agent.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{agent.name} {i === step - 1 && !isDone && "(typing...)"}</p>
                        <p className="text-gray-900 leading-relaxed font-sans">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={logEndRef} />
           </div>

           {/* Final Summary Verdict Block (Now non-absolute flows at end) */}
           <AnimatePresence>
             {isDone && (
               <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-6 pt-0"
               >
                 <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <CheckCircle className="w-5 h-5 text-indigo-100" />
                      </div>
                      <h4 className="text-lg font-bold">Integrated Verdict for {symbol}</h4>
                    </div>
                    <p className="text-sm font-medium text-indigo-50 leading-relaxed mb-6">
                       The AdvisorLogic committee has reached a consensus. Given the mixed technicals and macro volatility, we recommend a **Defensive Multi-Asset Strategy**. Maintain benchmark exposure but increase cash reserves to 15% for upcoming opportunities.
                    </p>
                    
                    <div className="flex items-center gap-3">
                       {confirming ? (
                         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 w-full animate-in fade-in zoom-in-95">
                           <p className="text-xs font-bold text-indigo-100 mb-2 sm:mb-0">Apply defensive strategy parameters?</p>
                           <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={handleApply}
                                className="flex-1 sm:flex-none px-4 py-2 bg-white text-indigo-600 font-bold rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all"
                              >
                                Yes, Apply
                              </button>
                              <button 
                                onClick={() => setConfirming(false)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-indigo-500/50 text-white font-bold rounded-lg text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/20"
                              >
                                Cancel
                              </button>
                           </div>
                         </div>
                       ) : (
                         <button 
                           onClick={handleApply}
                           className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${isApplied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white text-indigo-600 hover:bg-white/90 shadow-white/20"}`}
                         >
                           {isApplied ? (
                             <><CheckIcon className="w-4 h-4" /> Strategy Applied</>
                           ) : (
                             "Apply Portfolio Strategy"
                           )}
                         </button>
                       )}
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
