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

function HeroSankey() {
  return (
    <div className="w-full h-[650px] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-emerald-50/20 rounded-full blur-3xl -z-10" />
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={HERO_SANKEY_DATA}
          node={<CustomHeroNode />}
          link={<CustomHeroLink />}
          nodeWidth={8}
          nodePadding={40}
          margin={{ top: 20, bottom: 20, left: 10, right: 120 }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

export default function Home() {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();
  const [price, setPrice] = useState(10);
  const [priceLoading, setPriceLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


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
    // Determine if we are truly authenticated via Supabase session
    const isActuallyAuthenticated = isAuthenticated && !authLoading;

    if (!isActuallyAuthenticated) {
      // Unconditionally go to the login page (the screenshot you attached)
      window.location.href = "/Login?redirect_to=" + encodeURIComponent("/Dashboard");
      return;
    }
    
    // If robustly authenticated, proceed to Dashboard
    window.location.href = "/Dashboard";
  };

  const scrollToPricing = () => {
    const section = document.getElementById('pricing');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-softPeach relative">
      {/* Institutional Public Header */}
      <nav className="sticky top-0 z-50 bg-softPeach/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deepPurple rounded-lg flex items-center justify-center text-white font-medium text-lg shadow-lg">W</div>
            <span className="text-sm font-serif font-medium text-gray-900 tracking-tight italic">Wealth<span className="text-deepPurple">Lens</span></span>
          </div>
          <Button 
            onClick={handleLogin}
            variant="ghost" 
            className="text-gray-900 font-bold uppercase tracking-widest text-[10px] gap-2 hover:bg-deepPurple/10 group"
          >
            Terminal Login <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left space-y-10"
          >
            <h1 className="text-6xl sm:text-8xl font-serif font-black text-gray-900 leading-[1.1] mb-8">
              Master your
              <br />
              financial
              <br />
              <span className="text-deepPurple italic">future</span>
            </h1>
            
            <p className="text-2xl text-gray-600 max-w-xl leading-relaxed font-sans font-medium">
              WealthLens provides the clarity and intelligence you need to build lasting wealth. From detailed cashflow analysis to AI-driven investment strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
              <Button
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-deepPurple hover:opacity-90 text-white font-black px-12 py-5 rounded-full text-xl shadow-2xl hover:scale-105 transition-all">
                See Plans & Pricing
              </Button>
              <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Secure & Private</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <HeroSankey />
          </motion.div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 text-center">

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{feature.label}</h3>
              </motion.div>);
          })}
        </div>
      </section>

      <StatsBar />
      <HowItWorks />
      <AssetShowcase />

      <Testimonials />
      <ComparisonTable price={price} />
      <PricingSection price={price} />
      <FAQ />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-center text-white">

          <Zap className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-black mb-4">Ready to Master Your Investments?</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Join thousands of investors using WealthLens to make smarter financial decisions with AI-powered insights.
          </p>
          <Button
            onClick={handleLogin}
            className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-xl text-lg shadow-xl">
            Start Your Free Analysis
          </Button>
        </motion.div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl font-black bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">WealthLens</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Empowering investors with professional-grade analysis tools and AI-driven insights to build sustainable wealth.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/methodology" className="hover:text-indigo-400 transition-colors">Methodology</a></li>
                <li><a href="/assumptions" className="hover:text-indigo-400 transition-colors">Assumptions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="/helpcenter" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="/communityforum" className="hover:text-indigo-400 transition-colors">Community Forum</a></li>
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