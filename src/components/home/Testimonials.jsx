import React from "react";
import { motion } from "framer-motion";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
  {
    name: "Alex C.",
    role: "Privacy advocate",
    avatar: "AC",
    avatarColor: "from-slate-700 to-slate-900",
    quote:
      "The local encryption is what sold me. My financial data stays on my machine, encrypted. Finally, a tool that respects my privacy without sacrificing features.",
    stars: 5,
  },
  {
    name: "Jessica H.",
    role: "Digital nomad",
    avatar: "JH",
    avatarColor: "from-blue-400 to-indigo-600",
    quote:
      "Seamless cloud sync across my laptop and tablet while I travel. I love that it uses my own infrastructure — I'm in total control of my data shard.",
    stars: 5,
  },
  {
    name: "Robert D.",
    role: "Data enthusiast",
    avatar: "RD",
    avatarColor: "from-emerald-400 to-teal-700",
    quote:
      "The export/import feature is flawless. I can take my entire financial history with me in a simple JSON file. No vendor lock-in, just pure data portability.",
    stars: 5,
  },
  {
    name: "Benjamin S.",
    role: "Portfolio Manager",
    avatar: "BS",
    avatarColor: "from-amber-600 to-yellow-500",
    quote:
      "The new Rule Engine is a masterclass in financial UX. Being able to define custom 'Contains' and 'Not Equals' logic for my high-volume accounts has automated 90% of my ledger maintenance. It's surgical precision for personal finance.",
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
    <section className="bg-gray-50 py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight">Loved by Investors</h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto font-medium">
            From first-time investors to seasoned traders — here's why thousands trust WealthLens with their financial horizon.
          </p>
        </motion.div>

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {TESTIMONIALS.map((t, idx) => (
                <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <a href="/testimonials" className="block h-full group">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 group-hover:border-[#C5A059]/30 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 h-full flex flex-col group">
                      <StarRating count={t.stars} />
                      <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-8 italic">"{t.quote}"</p>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{t.name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <CarouselPrevious className="hidden md:flex -left-6 w-12 h-12 rounded-2xl bg-white border-gray-100 shadow-xl hover:bg-gray-900 hover:text-white transition-all duration-300" />
            <CarouselNext className="hidden md:flex -right-6 w-12 h-12 rounded-2xl bg-white border-gray-100 shadow-xl hover:bg-gray-900 hover:text-white transition-all duration-300" />
          </Carousel>
        </div>

        <div className="mt-12 flex justify-center gap-2 md:hidden">
            <div className="w-2 h-2 rounded-full bg-gray-900" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
            <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
      </div>
    </section>
  );
}