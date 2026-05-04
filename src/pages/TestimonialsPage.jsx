import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft, MessageCircle, ShieldCheck, Heart, Send, Sparkles, User, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const INITIAL_TESTIMONIALS = [
  {
    id: "sarah-m",
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
    id: "james-t",
    name: "James T.",
    role: "Property investor",
    avatar: "JT",
    avatarColor: "from-indigo-500 to-violet-500",
    quote: "The Property vs ETF comparison alone was worth it. It changed my whole strategy — I realised I was over-exposed to real estate. The AI portfolio builder is genuinely impressive.",
    stars: 5,
    reply: "Insightful observation, James. Diversification is the only 'free lunch' in investing. We're glad our multi-asset analysis could help you rebalance your strategy toward a more resilient portfolio!",
    date: "May 2026"
  },
  {
    id: "priya-k",
    name: "Priya K.",
    role: "Software engineer",
    avatar: "PK",
    avatarColor: "from-emerald-500 to-teal-500",
    quote: "I've tried every financial calculator out there. This is the only one that factors in inflation, tax, and fees together. The retirement planner gave me a reality check I needed.",
    stars: 5,
    reply: "As an engineer, you know that the edge cases matter. We built WealthLens specifically to handle the 'messy' realities like inflation and tax drag. Glad it stood up to your scrutiny, Priya!",
    date: "May 2026"
  },
  {
    id: "david-l",
    name: "David L.",
    role: "Small business owner",
    avatar: "DL",
    avatarColor: "from-amber-500 to-orange-500",
    quote: "The tax optimisation strategies alone saved me thousands. Premium is absolutely worth it — one-time payment for a tool I use every week.",
    stars: 5,
    reply: "Optimizing for tax is often the biggest 'hidden' return you can find. We're glad the Premium suite is already paying for itself many times over for your business, David!",
    date: "April 2026"
  },
  {
    id: "emma-r",
    name: "Emma R.",
    role: "Nurse, new to investing",
    avatar: "ER",
    avatarColor: "from-cyan-500 to-blue-500",
    quote: "Super easy to use. I'm not a finance person at all, but the AI Coach explained everything in plain English. Highly recommend for beginners.",
    stars: 5,
    reply: "Thank you for the kind words, Emma! Our goal is to demystify finance for everyone. We're honored to have the AI Coach supporting you on your journey.",
    date: "April 2026"
  },
  {
    id: "marcus-w",
    name: "Marcus W.",
    role: "Crypto & stocks trader",
    avatar: "MW",
    avatarColor: "from-purple-500 to-pink-500",
    quote: "Market sentiment analysis is on point. I use it every week before making moves. The scenario comparison feature is a game-changer for risk management.",
    stars: 5,
    reply: "Risk management is what separates traders from gamblers. Glad the scenario comparison tool is helping you stay disciplined in the markets, Marcus!",
    date: "April 2026"
  },
  {
    id: "alex-c",
    name: "Alex C.",
    role: "Privacy advocate",
    avatar: "AC",
    avatarColor: "from-slate-700 to-slate-900",
    quote: "The local encryption is what sold me. My financial data stays on my machine, encrypted. Finally, a tool that respects my privacy without sacrificing features.",
    stars: 5,
    reply: "We agree, Alex. Your data is your property. We'll never build a back door into your private vault. Privacy is a feature, not an afterthought.",
    date: "March 2026"
  },
  {
    id: "jessica-h",
    name: "Jessica H.",
    role: "Digital nomad",
    avatar: "JH",
    avatarColor: "from-blue-400 to-indigo-600",
    quote: "Seamless cloud sync across my laptop and tablet while I travel. I love that it uses my own infrastructure — I'm in total control of my data shard.",
    stars: 5,
    reply: "Total portability for a borderless life! We're glad WealthLens fits your nomadic lifestyle so perfectly, Jessica. Stay safe out there!",
    date: "March 2026"
  },
  {
    id: "robert-d",
    name: "Robert D.",
    role: "Data enthusiast",
    avatar: "RD",
    avatarColor: "from-emerald-400 to-teal-700",
    quote: "The export/import feature is flawless. I can take my entire financial history with me in a simple JSON file. No vendor lock-in, just pure data portability.",
    stars: 5,
    reply: "Vendor lock-in is a relic of the past. We believe in open data. Your financial history belongs to you—we're just here to help you read it better, Robert.",
    date: "February 2026"
  },
  {
    id: "benjamin-s",
    name: "Benjamin S.",
    role: "Portfolio Manager",
    avatar: "BS",
    avatarColor: "from-amber-600 to-yellow-500",
    quote: "The new Rule Engine is a masterclass in financial UX. Being able to define custom 'Contains' and 'Not Equals' logic for my high-volume accounts has automated 90% of my ledger maintenance. It's surgical precision for personal finance.",
    stars: 5,
    reply: "Coming from a pro, that means a lot, Benjamin. We spent a long time refining that logic to ensure 'surgical precision.' Glad it's saving you so much manual effort!",
    date: "January 2026"
  }
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Scroll to hash on load
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-indigo-500", "ring-offset-8");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-indigo-500", "ring-offset-8");
          }, 3000);
        }
      }, 500);
    }
  }, []);

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

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.3em] rounded-md mx-auto"
          >
            <Sparkles className="w-3 h-3" />
            Investor Wall of Love
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight uppercase italic">
            Trusted by the <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px #0f172a' }}>Global Community.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Submission Form Section - Compact Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
              
              <h3 className="text-xs font-black mb-6 uppercase tracking-tight flex items-center gap-3">
                <Send className="w-4 h-4 text-indigo-400" />
                Add Your Voice
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Michael R."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Your Story</label>
                  <textarea 
                    required
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    rows={3}
                    placeholder="Short summary..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <Button 
                  disabled={isSubmitting}
                  className="w-full h-10 bg-white text-slate-900 hover:bg-indigo-500 hover:text-white font-black uppercase tracking-[0.2em] text-[8px] rounded-lg transition-all"
                >
                  {isSubmitting ? "Transmitting..." : "Broadcast"}
                </Button>
              </form>
            </div>
          </div>

          {/* Wall of Love Feed - Compact Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {testimonials.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    id={t.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: t.isNew ? 0 : idx * 0.05 }}
                    className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-black shadow-md`}>
                            {t.avatar}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-1">
                              {t.name}
                              <BadgeCheck className="w-3 h-3 text-indigo-500" />
                            </p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.role}</p>
                          </div>
                        </div>
                        <div className="text-[8px] font-black text-slate-200 uppercase tracking-widest">{t.date}</div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                        "{t.quote}"
                      </p>

                      {/* Professional Reply Block - Condensed */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                           <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em]">Team WealthLens</span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold leading-snug tracking-tight">
                          {t.reply}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-16 text-center opacity-30">
               <ShieldCheck className="w-6 h-6 text-slate-200 mx-auto mb-2" />
               <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.4em]">
                 Zero-Knowledge Hub • Elite v4.2.0
               </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-white border-t border-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest">
           <p>© 2026 WealthLens Inc.</p>
           <div className="flex gap-6">
              <Link to="/privacypolicy" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link to="/termsofuse" className="hover:text-slate-900 transition-colors">Compliance</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
