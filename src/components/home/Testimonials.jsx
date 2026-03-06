import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "First-time investor",
    avatar: "SM",
    avatarColor: "from-pink-500 to-rose-500",
    quote:
      "I had no idea where to start with investing. WealthLens showed me exactly how $500/month could grow into $400K over 20 years. I finally started my ETF portfolio last month.",
    stars: 5,
  },
  {
    name: "James T.",
    role: "Property investor",
    avatar: "JT",
    avatarColor: "from-indigo-500 to-violet-500",
    quote:
      "The Property vs ETF comparison alone was worth it. It changed my whole strategy — I realised I was over-exposed to real estate. The AI portfolio builder is genuinely impressive.",
    stars: 5,
  },
  {
    name: "Priya K.",
    role: "Software engineer",
    avatar: "PK",
    avatarColor: "from-emerald-500 to-teal-500",
    quote:
      "I've tried every financial calculator out there. This is the only one that factors in inflation, tax, and fees together. The retirement planner gave me a reality check I needed.",
    stars: 5,
  },
  {
    name: "David L.",
    role: "Small business owner",
    avatar: "DL",
    avatarColor: "from-amber-500 to-orange-500",
    quote:
      "The tax optimisation strategies alone saved me thousands. Premium is absolutely worth it — one-time payment for a tool I use every week.",
    stars: 5,
  },
  {
    name: "Emma R.",
    role: "Nurse, new to investing",
    avatar: "ER",
    avatarColor: "from-cyan-500 to-blue-500",
    quote:
      "Super easy to use. I'm not a finance person at all, but the AI Coach explained everything in plain English. Highly recommend for beginners.",
    stars: 5,
  },
  {
    name: "Marcus W.",
    role: "Crypto & stocks trader",
    avatar: "MW",
    avatarColor: "from-purple-500 to-pink-500",
    quote:
      "Market sentiment analysis is on point. I use it every week before making moves. The scenario comparison feature is a game-changer for risk management.",
    stars: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Loved by Investors</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            From first-time investors to seasoned traders — here's what people are saying.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
            >
              <StarRating count={t.stars} />
              <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}