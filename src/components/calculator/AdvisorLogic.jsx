import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Shield, TrendingUp, MessageSquare, CheckCircle, Loader, Terminal, Users, Sparkles, ChevronRight } from "lucide-react";

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

export default function AdvisorLogic({ symbol = "Global" }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const logEndRef = useRef(null);

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
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
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
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
           <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
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
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{agent.name} {i === step - 1 && "(typing...)"}</p>
                        <p className="text-gray-900 leading-relaxed font-sans">{msg.text}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={logEndRef} />
           </div>

           {/* Final Summary Verdict Overlay */}
           <AnimatePresence>
             {isDone && (
               <motion.div 
                 initial={{ opacity: 0, y: 100 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-20"
               >
                 <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <CheckCircle className="w-5 h-5 text-indigo-100" />
                      </div>
                      <h4 className="text-lg font-bold">Integrated Verdict for {symbol}</h4>
                    </div>
                    <p className="text-sm font-medium text-indigo-50 leading-relaxed mb-6">
                       The AdvisorLogic committee has reached a consensus. Given the mixed technicals and macro volatility, we recommend a **Defensive Multi-Asset Strategy**. Maintain benchmark exposure but increase cash reserves to 15% for upcoming opportunities.
                    </p>
                    <div className="flex items-center gap-4">
                       <button className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-xs hover:bg-white/90 transition-all uppercase tracking-widest">Applying strategy...</button>
                       <button className="text-xs font-bold text-indigo-200 hover:text-white transition-colors flex items-center gap-2">View Detailed Logic Logs <ChevronRight className="w-4 h-4" /></button>
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
