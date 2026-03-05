import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Zap, Shield, BarChart3, DollarSign, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const NEWS_ITEMS = [
  {
    id: 1,
    title: "S&P 500 Hits Record High on Tech Rally",
    category: "Markets",
    timestamp: "2 hours ago",
    sentiment: "bullish",
    summary: "Major tech stocks surge on AI enthusiasm and strong earnings reports, pushing the broader market to all-time highs.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop"
  },
  {
    id: 2,
    title: "Fed Signals Continued Rate Stability",
    category: "Economy",
    timestamp: "4 hours ago",
    sentiment: "neutral",
    summary: "Federal Reserve maintains interest rates, suggesting economic resilience and controlled inflation trajectory.",
    image: "https://images.unsplash.com/photo-1553729784-e91953dec042?w=400&h=250&fit=crop"
  },
  {
    id: 3,
    title: "Bitcoin Breaks Above $95K Milestone",
    category: "Crypto",
    timestamp: "6 hours ago",
    sentiment: "bullish",
    summary: "Digital asset reaches new milestone amid institutional adoption and favorable macroeconomic conditions.",
    image: "https://images.unsplash.com/photo-1518594934405-e27d1e575f57?w=400&h=250&fit=crop"
  },
  {
    id: 4,
    title: "Real Estate Markets Show Mixed Signals",
    category: "Real Estate",
    timestamp: "8 hours ago",
    sentiment: "neutral",
    summary: "Property markets vary by region with some areas showing strong demand while others face inventory challenges.",
    image: "https://images.unsplash.com/photo-1577720643272-265f434a89f6?w=400&h=250&fit=crop"
  },
  {
    id: 5,
    title: "Green Energy Stocks Surge 12% This Week",
    category: "Sectors",
    timestamp: "10 hours ago",
    sentiment: "bullish",
    summary: "Renewable energy companies gain momentum on government incentives and accelerating climate commitments.",
    image: "https://images.unsplash.com/photo-1509391366360-2e938d440220?w=400&h=250&fit=crop"
  },
  {
    id: 6,
    title: "Corporate Earnings Beat Expectations",
    category: "Earnings",
    timestamp: "12 hours ago",
    sentiment: "bullish",
    summary: "Q1 earnings season reveals strong corporate performance with majority of companies exceeding analyst forecasts.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop"
  },
];

const FEATURES = [
  { icon: TrendingUp, label: "Real-Time Analysis", color: "from-blue-500 to-cyan-500" },
  { icon: Brain, label: "AI-Powered Insights", color: "from-purple-500 to-pink-500" },
  { icon: DollarSign, label: "Multi-Asset Support", color: "from-emerald-500 to-green-500" },
  { icon: Shield, label: "Secure & Reliable", color: "from-orange-500 to-red-500" },
];

function NewsCard({ item }) {
  const isBullish = item.sentiment === "bullish";
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
    >
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
          {isBullish ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400">
              <DollarSign className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">{item.summary}</p>
        
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">{item.timestamp}</div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698eb477e1773680473fe637/f6715e80c_generated_image.png" 
              alt="WealthLens" 
              className="w-10 h-10 rounded-lg shadow-md"
            />
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">WealthLens</span>
          </div>
          
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="text-sm font-bold text-indigo-700">📊 Investment Intelligence Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
            See Your Financial
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Future Clearly</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional-grade investment analysis tools. Real-time market insights. AI-powered guidance. All in one platform.
          </p>
          
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Get Started Now
          </Button>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{feature.label}</h3>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* News Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Market Insights</h2>
            </div>
            <p className="text-gray-600 text-lg">Stay informed with the latest investment news and market analysis</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEWS_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <NewsCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white"
        >
          <Zap className="w-12 h-12 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-black mb-6">Ready to Master Your Investments?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of investors using WealthLens to make smarter financial decisions with AI-powered insights.
          </p>
          <Button
            onClick={handleLogin}
            className="bg-white text-indigo-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-xl text-lg shadow-xl"
          >
            Start Your Free Analysis
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm">
          <p>© 2026 WealthLens. Professional investment analysis for everyone. Sign in to get started.</p>
        </div>
      </footer>
    </div>
  );
}