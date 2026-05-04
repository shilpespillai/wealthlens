import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, MessageCircle, ShieldCheck, Heart, Send, Sparkles, User, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const INITIAL_TESTIMONIALS = [
  {
    id: "sarah",
    name: "Sarah M.",
    role: "First-time investor",
    avatar: "SM",
    avatarColor: "from-pink-500 to-rose-500",
    quote: "I had no idea where to start with investing. WealthLens showed me exactly how $500/month could grow into $400K over 20 years. I finally started my ETF portfolio last month.",
    stars: 5,
    reply: "Welcome to the world of compound interest, Sarah! We're thrilled that WealthLens could help visualize that long-term horizon for you. That first ETF purchase is a massive milestone—congrats on taking control of your future!",
    date: "May 2026"
  },
  {
    id: "benjamin",
    name: "Benjamin S.",
    role: "Portfolio Manager",
    avatar: "BS",
    avatarColor: "from-amber-600 to-yellow-500",
    quote: "The new Rule Engine is a masterclass in financial UX. Being able to define custom 'Contains' and 'Not Equals' logic for my high-volume accounts has automated 90% of my ledger maintenance. It's surgical precision for personal finance.",
    stars: 5,
    reply: "Coming from a pro, that means a lot, Benjamin. We spent a long time refining that logic to ensure 'surgical precision.' Glad it's saving you so much manual effort!",
    date: "April 2026"
  },
  {
    id: "alex",
    name: "Alex C.",
    role: "Privacy advocate",
    avatar: "AC",
    avatarColor: "from-slate-700 to-slate-900",
    quote: "The local encryption is what sold me. My financial data stays on my machine, encrypted. Finally, a tool that respects my privacy without sacrificing features.",
    stars: 5,
    reply: "We agree, Alex. Your data is your property. We'll never build a back door into your private vault. Privacy is a feature, not an afterthought.",
    date: "March 2026"
  }
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newName || !newQuote) return;
    
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newEntry = {
        id: Date.now().toString(),
        name: newName,
        role: newRole || "Verified Investor",
        avatar: newName.charAt(0).toUpperCase(),
        avatarColor: "from-indigo-600 to-violet-600",
        quote: newQuote,
        stars: 5,
        reply: "Thank you for sharing your experience with the community! Our team has received your testimony and we're honored to be part of your financial journey.",
        date: "Just Now",
        isNew: true
      };
      
      setTestimonials([newEntry, ...testimonials]);
      setNewName("");
      setNewRole("");
      setNewQuote("");
      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* Institutional Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-50 rounded-full blur-[120px] opacity-50" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xl group-hover:scale-105 transition-all">W</div>
            <span className="text-[11px] font-black text-slate-900 tracking-[0.3em] uppercase">WealthLens</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
              <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Wall of Love</span>
            </div>
            <Link to="/Login">
              <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-xl border-slate-200 hover:bg-black hover:text-white transition-all">
                Join System
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Left Column: Heading & Form */}
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-md"
              >
                <Sparkles className="w-3 h-3" />
                Investor Feedback
              </motion.div>
              <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
                Trusted by <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Global Leaders.</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md border-l-2 border-indigo-600/20 pl-6">
                Institutional-grade analytics meet private-sector privacy. Join the community of investors building their legacy with WealthLens.
              </p>
            </div>

            {/* Submission Form Section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-all duration-700" />
              
              <h3 className="text-xl font-black mb-8 uppercase tracking-tight flex items-center gap-3">
                <Send className="w-5 h-5 text-indigo-400" />
                Share Your Story
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Michael R."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Investment Focus</label>
                    <input 
                      type="text" 
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. ETF Specialist"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Experience</label>
                  <textarea 
                    required
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    rows={4}
                    placeholder="How has WealthLens changed your financial perspective?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                <Button 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-white text-slate-900 hover:bg-indigo-500 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all shadow-xl shadow-black/20"
                >
                  {isSubmitting ? "Processing Transaction..." : "Transmit Testimony"}
                </Button>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center"
                    >
                      Testimony successfully broadcast to the Wall of Love.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>

          {/* Right Column: Wall of Love Feed */}
          <div className="lg:col-span-7">
            <div className="space-y-8">
              <AnimatePresence mode="popLayout">
                {testimonials.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: t.isNew ? 0 : idx * 0.1 }}
                    className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 relative overflow-hidden"
                  >
                    {t.isNew && (
                      <div className="absolute top-6 right-8 bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">
                        New Transmission
                      </div>
                    )}
                    
                    <div className="space-y-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xl font-black shadow-lg`}>
                            {t.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                              {t.name}
                              <BadgeCheck className="w-3.5 h-3.5 text-indigo-500" />
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role}</p>
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.date}</div>
                      </div>

                      <p className="text-xl text-slate-700 leading-relaxed font-medium italic">
                        "{t.quote}"
                      </p>

                      <div className="flex gap-1">
                        {Array.from({ length: t.stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                        ))}
                      </div>

                      {/* Professional Reply Block */}
                      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4 relative group/reply">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-indigo-600" />
                             <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em]">WealthLens Protocol Response</span>
                          </div>
                          <MessageCircle className="w-4 h-4 text-slate-200 group-hover/reply:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed tracking-tight">
                          {t.reply}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-20 text-center space-y-8 opacity-50">
               <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto" />
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                 Zero-Knowledge Testimonials Hub • Elite v4.2.0
               </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 bg-white border-t border-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <p>© 2026 WealthLens Inc. Confidential Institutional Specification</p>
           <div className="flex gap-8">
              <Link to="/privacypolicy" className="hover:text-slate-900 transition-colors">Privacy Infrastructure</Link>
              <Link to="/termsofuse" className="hover:text-slate-900 transition-colors">Compliance</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
