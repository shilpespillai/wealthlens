import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Shield, DollarSign, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import PricingSection from "@/components/home/PricingSection";
import StatsBar from "@/components/home/StatsBar";
import HeroCalculator from "@/components/home/HeroCalculator";
import AssetShowcase from "@/components/home/AssetShowcase";
import ComparisonTable from "@/components/home/ComparisonTable";
import FAQ from "@/components/home/FAQ";
import SupportChat from "@/components/home/SupportChat";


const FEATURES = [
  { icon: TrendingUp, label: "Real-Time Analysis", color: "from-blue-500 to-cyan-500" },
  { icon: Brain, label: "AI-Powered Insights", color: "from-purple-500 to-pink-500" },
  { icon: DollarSign, label: "Multi-Asset Support", color: "from-emerald-500 to-green-500" },
  { icon: Shield, label: "Secure & Reliable", color: "from-orange-500 to-red-500" }
];

const SHOWCASE_ITEMS = [
  {
    title: "8-Pillar Stock Analyzer",
    description: "Deep dive into 10 years of financial history with a single click.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&h=500&fit=crop",
    tag: "NEW"
  },
  {
    title: "Fair Value Calculator",
    description: "Determine the intrinsic value and find your margin of safety.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop",
    tag: "NEW"
  },
  {
    title: "Suburb Investment Analyzer",
    description: "AI-powered property market insights & demand forecasting.",
    image: "/suburb_preview.png",
    tag: "Premium"
  },
  {
    title: "Equity Unlock Planner",
    description: "Leverage existing property to build wealth faster.",
    image: "/equity_preview.png",
    tag: "Advanced"
  },
  {
    title: "AI Investment Coach",
    description: "Get personalized, data-driven strategy guidance 24/7.",
    image: "/coach_preview.png",
    tag: "AI Powered"
  },
  {
    title: "Smart Budget Reports",
    description: "AI-driven expense analysis & visual spending trends.",
    image: "/reports_ai.png",
    tag: "New Premium"
  },
  {
    title: "Financial Velocity Radar",
    description: "Multi-layered area charts for forecasting wealth.",
    image: "/reports_trends.png",
    tag: "Premium"
  }
];

function ShowcaseGallery() {
  return (
    <section className="py-16 bg-white overflow-hidden relative border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Experience the <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Premium Edge</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A seamless look inside our most powerful investment analysis tools.
          </p>
        </div>
      </div>

      <div className="flex relative py-4">
        <motion.div
          animate={{ x: [0, "-33.3333%"] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-10 whitespace-nowrap px-4 w-max pr-10"
        >
          {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="inline-block w-[500px] sm:w-[800px] bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-xl transition-transform hover:scale-[1.01] duration-500"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 right-6 bg-indigo-600/90 backdrop-blur-md text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-wider">
                  {item.tag}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className="text-2xl font-black text-white">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />
    </section>
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
    if (isAuthenticated) {
      window.location.href = createPageUrl("Calculator");
      return;
    }
    
    try {
      if (base44.auth.redirectToLogin) {
        await base44.auth.redirectToLogin(createPageUrl("Calculator"));
      } else {
        window.location.href = `/Login?redirect_to=${encodeURIComponent(createPageUrl("Calculator"))}`;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>);
  }

  return (
    <div className="min-h-screen bg-white">

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">

          <div className="inline-block mb-6 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="text-sm font-bold text-indigo-700">📊 Investment Intelligence Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
            See Your Financial
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Future Clearly</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">WealthLens provides advanced investment analysis tools, real-time financial insights, and AI-driven portfolio guidance. Our free investment growth calculator helps investors estimate ETF portfolio performance and visualize long-term wealth growth.
          </p>
          
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all">

            <TrendingUp className="w-5 h-5 mr-2" />
            Get Started Now
          </Button>
        </motion.div>

        <div className="mb-10">
          <HeroCalculator onGetStarted={handleLogin} />
        </div>

        <ShowcaseGallery />

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

      <SupportChat />

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