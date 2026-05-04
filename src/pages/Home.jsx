import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Shield, DollarSign, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  LineChart, Sankey
} from "recharts";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import PricingSection from "@/components/home/PricingSection";
import StatsBar from "@/components/home/StatsBar";
import AssetShowcase from "@/components/home/AssetShowcase";
import ComparisonTable from "@/components/home/ComparisonTable";
import FAQ from "@/components/home/FAQ";
import heroSankey from "@/assets/hero-sankey.png";

const Navbar = () => {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  
  const handleLogin = async () => {
    const isActuallyAuthenticated = isAuthenticated && !authLoading;
    if (!isActuallyAuthenticated) {
      window.location.href = "/Login?redirect_to=" + encodeURIComponent("/Dashboard");
      return;
    }
    window.location.href = "/Dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-lg">W</div>
          <span className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase">WealthLens</span>
        </div>
        <Button 
          onClick={handleLogin}
          variant="ghost" 
          className="text-gray-900 font-black uppercase tracking-[0.2em] text-[10px] gap-2 hover:bg-black hover:text-white transition-colors"
        >
          Terminal Login <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </nav>
  );
};


const FEATURES = [
  { icon: TrendingUp, label: "Real-Time Analysis", color: "from-blue-500 to-cyan-500" },
  { icon: Brain, label: "AI-Powered Insights", color: "from-purple-500 to-pink-500" },
  { icon: DollarSign, label: "Multi-Asset Support", color: "from-emerald-500 to-green-500" },
  { icon: Shield, label: "Secure & Reliable", color: "from-orange-500 to-red-500" }
];

const HERO_SANKEY_DATA = {
  nodes: [
    // Tier 1: Income Sources
    { name: "Salary A", color: "#22d3ee" },
    { name: "Salary B", color: "#22d3ee" },
    { name: "Side Income", color: "#22d3ee" },
    { name: "Dividends", color: "#22d3ee" },
    // Tier 2: Aggregated
    { name: "Gross Income", color: "#8b5cf6" },
    // Tier 3: Strategy Buckets
    { name: "Monthly Surplus", color: "#a78bfa" },
    { name: "Fixed Needs", color: "#fbbf24" },
    { name: "Variable Wants", color: "#f43f5e" },
    { name: "Wealth Growth", color: "#10b981" },
    // Tier 4: Details
    { name: "Rent/Mortgage", color: "#fbbf24" },
    { name: "Utilities", color: "#f59e0b" },
    { name: "Groceries", color: "#f43f5e" },
    { name: "Entertainment", color: "#f43f5e" },
    { name: "Index Funds", color: "#10b981" },
    { name: "Emergency Fund", color: "#10b981" },
    { name: "Internet", color: "#f43f5e" },
  ],
  links: [
    { source: 0, target: 4, value: 5000 },
    { source: 1, target: 4, value: 2000 },
    { source: 2, target: 4, value: 2240 },
    { source: 3, target: 4, value: 2340 },
    { source: 4, target: 5, value: 8374 },
    { source: 4, target: 6, value: 1700 },
    { source: 4, target: 7, value: 1005 },
    { source: 4, target: 8, value: 500 },
    { source: 6, target: 9, value: 1500 },
    { source: 6, target: 10, value: 200 },
    { source: 7, target: 11, value: 600 },
    { source: 7, target: 12, value: 300 },
    { source: 7, target: 15, value: 105 },
    { source: 8, target: 13, value: 200 },
    { source: 8, target: 14, value: 300 },
  ],
};

const CustomHeroNode = (props) => {
  const { x, y, width, height, index, payload, containerWidth } = props;
  const isOut = x + width > containerWidth / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color}
        rx={2}
      />
      <text
        x={isOut ? x - 10 : x + width + 10}
        y={y + height / 2}
        textAnchor={isOut ? "end" : "start"}
        verticalAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill="#1e293b"
        className="font-sans uppercase tracking-tight"
      >
        {payload.name}
      </text>
    </g>
  );
};

const CustomHeroLink = (props) => {
  const { sourceX, sourceY, targetX, targetY, linkWidth, payload } = props;
  const color = payload?.source?.color || "#cbd5e1";
  
  if (isNaN(sourceX) || isNaN(targetX) || isNaN(sourceY) || isNaN(targetY)) return null;

  const cpX = (sourceX + targetX) / 2;
  const d = `M${sourceX},${sourceY} 
             C${cpX},${sourceY} 
             ${cpX},${targetY} 
             ${targetX},${targetY}`;
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={Math.max(1, linkWidth)}
      strokeOpacity={0.4}
      className="transition-all duration-500 hover:stroke-opacity-70"
    />
  );
};

function SignatureSankey() {
  return (
    <div className="relative w-full h-[800px] flex items-center justify-center select-none overflow-visible">
      {/* 1. The High-Fidelity Static Asset */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 flex items-center justify-center"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Edge Blending Mask */}
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-white via-transparent to-white" />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />
          
          <img 
            src={heroSankey} 
            alt="WealthLens Dashboard" 
            className="w-full h-full object-contain mix-blend-multiply opacity-95 transition-opacity duration-1000"
            style={{ 
              maskImage: 'radial-gradient(circle, black 70%, transparent 98%)',
              WebkitMaskImage: 'radial-gradient(circle, black 70%, transparent 98%)'
            }}
          />
        </div>
      </motion.div>

      {/* 2. Transparent Interaction & Particle Layer */}
      <svg viewBox="0 0 1000 700" className="absolute inset-0 w-full h-full overflow-visible z-10 pointer-events-none">
        <defs>
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* --- Invisible Paths (Aligned with liquid flows) --- */}
        <path id="p1" d="M 150 150 Q 300 150, 420 320" fill="none" stroke="transparent" />
        <path id="p2" d="M 150 550 Q 300 550, 420 420" fill="none" stroke="transparent" />
        <path id="p3" d="M 436 320 Q 550 150, 850 150" fill="none" stroke="transparent" />
        <path id="p4" d="M 436 420 Q 550 600, 850 600" fill="none" stroke="transparent" />

        {/* --- LIVE MOTION PARTICLES --- */}
        <g filter="url(#particleGlow)">
          <circle r="4" fill="#fff" opacity="0.9">
            <animateMotion dur="2.8s" repeatCount="indefinite" rotate="auto">
              <mpath href="#p1"/>
            </animateMotion>
          </circle>
          <circle r="3" fill="#fff" opacity="0.6">
            <animateMotion dur="3.5s" repeatCount="indefinite" begin="1.2s" rotate="auto">
              <mpath href="#p2"/>
            </animateMotion>
          </circle>
          <circle r="3" fill="#fff" opacity="0.8">
            <animateMotion dur="4.2s" repeatCount="indefinite" rotate="auto">
              <mpath href="#p3"/>
            </animateMotion>
          </circle>
        </g>
      </svg>
    </div>
  );
}

function HeroSankey() {
  return <SignatureSankey />;
}

export default function Home() {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [price, setPrice] = useState(10);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    async function loadPrice() {
      try {
        const p = await base44.app.getPrice();
        setPrice(p);
      } catch (error) {
        console.error("Failed to fetch price:", error);
      } finally {
        setPriceLoading(false);
      }
    }
    loadPrice();
  }, []);

  const handleLogin = async () => {
    const isActuallyAuthenticated = isAuthenticated && !authLoading;

    if (!isActuallyAuthenticated) {
      window.location.href = "/Login?redirect_to=" + encodeURIComponent("/Dashboard");
      return;
    }
    window.location.href = "/Dashboard";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      {/* Institutional Public Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-lg">W</div>
            <span className="text-sm font-black text-gray-900 tracking-[0.2em] uppercase">WealthLens</span>
          </div>
          <Button 
            onClick={handleLogin}
            variant="ghost" 
            className="text-gray-900 font-black uppercase tracking-[0.2em] text-[10px] gap-2 hover:bg-black hover:text-white transition-colors"
          >
            Terminal Login <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </nav>

      {/* Hero Section: Liquid Architectural Edition */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[900px]">
        <div className="absolute inset-0 z-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute inset-0 z-0 opacity-[0.05]" 
             style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '128px 128px' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Column: Industrial Typography */}
            <div className="w-full lg:w-1/2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                System Core: Liquid
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.85] tracking-tighter uppercase mb-10">
                Everything in <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px black' }}>one smart</span> <br />
                dashboard
              </h1>
              
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-lg border-l-4 border-black/10 pl-8">
                Budgeting, Portfolio Tracking, and Family Finance — all in a single, private command center powered by your own AI.
              </p>
              
              <div className="flex flex-wrap items-center gap-8">
                <Button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} size="lg" className="bg-black hover:bg-slate-800 text-white px-12 h-16 text-sm font-black uppercase tracking-[0.2em] rounded-none shadow-[10px_10px_0_rgba(0,0,0,0.1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  See Plans & Pricing
                </Button>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Secure & Private Protocol <br />
                  <span className="text-black">Institutional Precision</span>
                </div>
              </div>
            </div>

            {/* Right Column: Liquid Asset */}
            <div className="w-full lg:w-1/2 relative h-[800px] flex items-center justify-center">
              <SignatureSankey />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-black/5 hover:border-black/20 transition-all text-center shadow-sm">

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-black text-black text-sm uppercase tracking-widest">{feature.label}</h3>
              </motion.div>);
          })}
        </div>
      </section>

      <StatsBar />

      {/* ═══════════════════════════════════════════════════
          OWN YOUR FINANCIAL INTELLIGENCE — Hero Statement
          ═══════════════════════════════════════════════════ */}
      <section className="bg-softPeach py-24 sm:py-32 relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 bg-deepPurple/10 border border-deepPurple/20 text-deepPurple text-xs font-black uppercase tracking-[0.25em] px-5 py-2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-deepPurple animate-pulse" />
              A New Kind of Finance App
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-serif font-black text-gray-900 text-center leading-[1.1] mb-6"
          >
            Buy once.
            <br />
            <span className="text-deepPurple italic">
              Own it forever.
            </span>
          </motion.h2>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-500 text-center max-w-3xl mx-auto leading-relaxed mb-16"
          >
            No monthly fees. No subscriptions. No data harvesting.
            WealthLens is a <strong className="text-gray-900 font-bold">one-time purchase</strong> that
            runs on <strong className="text-gray-900 font-bold">your own infrastructure</strong> —
            powered by your own API keys.
          </motion.p>

          {/* 3-pillar grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: "💰",
                title: "Budgeting Made Simple",
                body: "Track income, bills, subscriptions, groceries and spending habits with institutional-grade precision.",
                accent: "from-emerald-50 to-white",
                border: "border-emerald-200",
                tag: "Cashflow Mastery",
                tagColor: "text-emerald-600",
              },
              {
                icon: "📈",
                title: "Portfolio Tracking",
                body: "Monitor stocks, ETFs, crypto, property and total net worth in a single unified command center.",
                accent: "from-blue-50 to-white",
                border: "border-blue-200",
                tag: "Wealth Monitoring",
                tagColor: "text-blue-600",
              },
              {
                icon: "👨‍👩‍👧‍👦",
                title: "Family Finance Mode",
                body: "Manage shared expenses, household goals and family budgets without the friction.",
                accent: "from-amber-50 to-white",
                border: "border-amber-200",
                tag: "Household Sync",
                tagColor: "text-amber-600",
              },
              {
                icon: "📊",
                title: "Powerful Reports",
                body: "See monthly trends, spending leaks, growth charts and forecasts powered by live ledger data.",
                accent: "from-indigo-50 to-white",
                border: "border-indigo-200",
                tag: "Data Intelligence",
                tagColor: "text-indigo-600",
              },
              {
                icon: "🤖",
                title: "AI Insights",
                body: "Connect your own OpenAI or Google API key for advanced financial analysis and automated coaching.",
                accent: "from-purple-50 to-white",
                border: "border-purple-200",
                tag: "Cognitive Finance",
                tagColor: "text-purple-600",
              },
              {
                icon: "🔒",
                title: "Private & In Control",
                body: "Your data never leaves your infrastructure. You own the keys, you own the data, you own the future.",
                accent: "from-slate-50 to-white",
                border: "border-slate-200",
                tag: "Privacy Protocol",
                tagColor: "text-slate-600",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={`bg-gradient-to-b ${card.accent} border ${card.border} rounded-3xl p-8 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="text-4xl">{card.icon}</div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${card.tagColor}`}>{card.tag}</span>
                <h3 className="text-2xl font-black text-gray-900">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{card.body}</p>
              </motion.div>
            ))}
          </div>

          {/* Horizontal divider statement */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-6 justify-center"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest whitespace-nowrap text-center">
              The finance app that belongs to <span className="text-gray-900">you</span>, not a VC firm
            </p>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300" />
          </motion.div>
        </div>
      </section>

      <HowItWorks />
      <AssetShowcase />

      <Testimonials />
      <ComparisonTable price={price} />
      <PricingSection price={price} />
      <FAQ />



      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">WealthLens</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                Empowering investors with professional-grade analysis tools and AI-driven insights to build sustainable wealth.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/privacypolicy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/termsofuse" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="/disclaimer" className="hover:text-indigo-400 transition-colors">Financial Disclaimer</a></li>
                <li><a href="/cookiepolicy" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
                <li><a href="/securitypolicy" className="hover:text-indigo-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 WealthLens Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
             <span>Made with <span className="text-indigo-500">♥</span> for global investors</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);
}