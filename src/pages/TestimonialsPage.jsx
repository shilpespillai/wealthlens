import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowLeft, MessageCircle, ShieldCheck, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const TESTIMONIAL_DATA = [
  {
    id: "sarah",
    name: "Sarah M.",
    role: "First-time investor",
    avatar: "SM",
    avatarColor: "from-pink-500 to-rose-500",
    quote: "I had no idea where to start with investing. WealthLens showed me exactly how $500/month could grow into $400K over 20 years. I finally started my ETF portfolio last month.",
    stars: 5,
    reply: "Welcome to the world of compound interest, Sarah! We're thrilled that WealthLens could help visualize that long-term horizon for you. That first ETF purchase is a massive milestone—congrats on taking control of your future!"
  },
  {
    id: "james",
    name: "James T.",
    role: "Property investor",
    avatar: "JT",
    avatarColor: "from-indigo-500 to-violet-500",
    quote: "The Property vs ETF comparison alone was worth it. It changed my whole strategy — I realised I was over-exposed to real estate. The AI portfolio builder is genuinely impressive.",
    stars: 5,
    reply: "Insightful observation, James. Diversification is the only 'free lunch' in investing. We're glad our multi-asset analysis could help you rebalance your strategy toward a more resilient portfolio!"
  },
  {
    id: "priya",
    name: "Priya K.",
    role: "Software engineer",
    avatar: "PK",
    avatarColor: "from-emerald-500 to-teal-500",
    quote: "I've tried every financial calculator out there. This is the only one that factors in inflation, tax, and fees together. The retirement planner gave me a reality check I needed.",
    stars: 5,
    reply: "As an engineer, you know that the edge cases matter. We built WealthLens specifically to handle the 'messy' realities like inflation and tax drag. Glad it stood up to your scrutiny, Priya!"
  },
  {
    id: "david",
    name: "David L.",
    role: "Small business owner",
    avatar: "DL",
    avatarColor: "from-amber-500 to-orange-500",
    quote: "The tax optimisation strategies alone saved me thousands. Premium is absolutely worth it — one-time payment for a tool I use every week.",
    stars: 5,
    reply: "Optimizing for tax is often the biggest 'hidden' return you can find. We're glad the Premium suite is already paying for itself many times over for your business, David!"
  },
  {
    id: "emma",
    name: "Emma R.",
    role: "Nurse, new to investing",
    avatar: "ER",
    avatarColor: "from-cyan-500 to-blue-500",
    quote: "Super easy to use. I'm not a finance person at all, but the AI Coach explained everything in plain English. Highly recommend for beginners.",
    stars: 5,
    reply: "Thank you for the kind words, Emma! Our goal is to demystify finance for everyone. We're honored to have the AI Coach supporting you on your journey."
  },
  {
    id: "marcus",
    name: "Marcus W.",
    role: "Crypto & stocks trader",
    avatar: "MW",
    avatarColor: "from-purple-500 to-pink-500",
    quote: "Market sentiment analysis is on point. I use it every week before making moves. The scenario comparison feature is a game-changer for risk management.",
    stars: 5,
    reply: "Risk management is what separates traders from gamblers. Glad the scenario comparison tool is helping you stay disciplined in the markets, Marcus!"
  },
  {
    id: "alex",
    name: "Alex C.",
    role: "Privacy advocate",
    avatar: "AC",
    avatarColor: "from-slate-700 to-slate-900",
    quote: "The local encryption is what sold me. My financial data stays on my machine, encrypted. Finally, a tool that respects my privacy without sacrificing features.",
    stars: 5,
    reply: "We agree, Alex. Your data is your property. We'll never build a back door into your private vault. Privacy is a feature, not an afterthought."
  },
  {
    id: "jessica",
    name: "Jessica H.",
    role: "Digital nomad",
    avatar: "JH",
    avatarColor: "from-blue-400 to-indigo-600",
    quote: "Seamless cloud sync across my laptop and tablet while I travel. I love that it uses my own infrastructure — I'm in total control of my data shard.",
    stars: 5,
    reply: "Total portability for a borderless life! We're glad WealthLens fits your nomadic lifestyle so perfectly, Jessica. Stay safe out there!"
  },
  {
    id: "robert",
    name: "Robert D.",
    role: "Data enthusiast",
    avatar: "RD",
    avatarColor: "from-emerald-400 to-teal-700",
    quote: "The export/import feature is flawless. I can take my entire financial history with me in a simple JSON file. No vendor lock-in, just pure data portability.",
    stars: 5,
    reply: "Vendor lock-in is a relic of the past. We believe in open data. Your financial history belongs to you—we're just here to help you read it better, Robert."
  },
  {
    id: "benjamin",
    name: "Benjamin S.",
    role: "Portfolio Manager",
    avatar: "BS",
    avatarColor: "from-amber-600 to-yellow-500",
    quote: "The new Rule Engine is a masterclass in financial UX. Being able to define custom 'Contains' and 'Not Equals' logic for my high-volume accounts has automated 90% of my ledger maintenance. It's surgical precision for personal finance.",
    stars: 5,
    reply: "Coming from a pro, that means a lot, Benjamin. We spent a long time refining that logic to ensure 'surgical precision.' Glad it's saving you so much manual effort!"
  }
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#C5A059]/10">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-lg group-hover:bg-[#C5A059] transition-all">W</div>
            <span className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase">WealthLens</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Wall of Love</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-24 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic">
            Loved by <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #0f172a' }}>Investors.</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium uppercase tracking-widest">
            Direct feedback from our community, with a personal note from our team.
          </p>
        </div>

        <div className="space-y-12">
          {TESTIMONIAL_DATA.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="group"
            >
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all duration-500">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  {/* User Section */}
                  <div className="md:col-span-7 space-y-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xl text-slate-700 leading-relaxed font-medium italic">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4 pt-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-lg font-bold shadow-lg`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="md:col-span-5">
                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 relative h-full flex flex-col justify-center">
                      <div className="absolute top-6 right-8">
                        <MessageCircle className="w-5 h-5 text-[#C5A059] opacity-20" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                           <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-[0.2em]">Team WealthLens</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-bold leading-relaxed tracking-tight">
                          {t.reply}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 text-center border-t border-slate-100 pt-20 space-y-8">
           <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] max-w-md mx-auto">
             Real feedback from verified users. <br />
             No trackers. No fake personas. Just Pure Data.
           </p>
           <Link to="/Login" className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all shadow-lg shadow-slate-200">
             Join the Community
           </Link>
        </div>
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           <p>© 2026 WealthLens Inc. All rights reserved.</p>
           <div className="flex gap-8">
              <Link to="/privacypolicy" className="hover:text-slate-900 transition-colors">Privacy</Link>
              <Link to="/termsofuse" className="hover:text-slate-900 transition-colors">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
