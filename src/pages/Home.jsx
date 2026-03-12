import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Globe, Zap, Shield, BarChart3, DollarSign, Brain, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import PricingSection from "@/components/home/PricingSection";
import StatsBar from "@/components/home/StatsBar";
import HeroCalculator from "@/components/home/HeroCalculator";
import AssetShowcase from "@/components/home/AssetShowcase";
import ComparisonTable from "@/components/home/ComparisonTable";
import FAQ from "@/components/home/FAQ";
import SupportChat from "@/components/home/SupportChat";

const NEWS_IMAGES = [
"https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop", // stock market screen
"https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=250&fit=crop", // trading charts
"https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=250&fit=crop", // crypto coins
"https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=250&fit=crop", // real estate buildings
"https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=250&fit=crop", // dollar bills/money
"https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop" // financial graphs
];

const FEATURES = [
{ icon: TrendingUp, label: "Real-Time Analysis", color: "from-blue-500 to-cyan-500" },
{ icon: Brain, label: "AI-Powered Insights", color: "from-purple-500 to-pink-500" },
{ icon: DollarSign, label: "Multi-Asset Support", color: "from-emerald-500 to-green-500" },
{ icon: Shield, label: "Secure & Reliable", color: "from-orange-500 to-red-500" }];


function LiveMarketTicker({ symbol, label, value, change, changePercent }) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-600 uppercase">{label}</p>
          <p className="text-lg font-bold text-gray-900">${value?.toFixed(2) || "N/A"}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {changePercent?.toFixed(2) || "0"}%
        </div>
      </div>
    </div>);

}

function NewsCard({ item, index }) {
  const isBullish = item.sentiment === "bullish";
  const isBearish = item.sentiment === "bearish";
  const image = NEWS_IMAGES[index % NEWS_IMAGES.length];

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer">

      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img src={image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
          {isBullish ?
          <div className="flex items-center gap-1 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div> :
          isBearish ?
          <div className="flex items-center gap-1 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div> :

          <div className="flex items-center gap-1 text-gray-400">
              <DollarSign className="w-4 h-4" />
            </div>
          }
        </div>
        
        <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">{item.summary}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">{item.source}</span>
          <span className="text-xs text-gray-400">{item.publishedAt}</span>
        </div>
      </div>
    </motion.a>);

}

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketLastUpdated, setMarketLastUpdated] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

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

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const response = await base44.functions.invoke("fetchLiveMarketData");
        setMarketData(response.data);
        setMarketLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setMarketLoading(false);
      }
    }
    fetchMarketData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await base44.functions.invoke("fetchMarketNews");
        if (response.data?.articles) {
          setNewsItems(response.data.articles);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setNewsLoading(false);
      }
    }
    fetchNews();
  }, []);

  const handleLogin = async () => {
    try {
      await base44.auth.redirectToLogin(createPageUrl("Calculator"));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>);

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
              className="w-10 h-10 rounded-lg shadow-md" />

            <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">WealthLens</span>
          </div>
          
          <Button
            onClick={handleLogin}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg">

            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
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

        {/* Hero Calculator */}
        <div className="mb-10">
          <HeroCalculator onGetStarted={handleLogin} />
        </div>

        {/* Features Grid */}
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

      {/* Live Market Data */}
      <section className="bg-white border-y border-gray-200 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8">

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Live Market Data</h2>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Real-time market information updated every 5 minutes
              {marketLastUpdated &&
              <span className="ml-2 text-emerald-600 font-medium">
                  · Last updated: {marketLastUpdated.toLocaleTimeString()}
                </span>
              }
            </p>
          </motion.div>

          {marketLoading ?
          <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
            </div> :
          marketData ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.stocks &&
            <>
                  <LiveMarketTicker
                symbol="SP500"
                label="S&P 500"
                value={marketData.stocks.sp500?.value}
                change={marketData.stocks.sp500?.change}
                changePercent={marketData.stocks.sp500?.changePercent} />

                  <LiveMarketTicker
                symbol="NASDAQ"
                label="NASDAQ"
                value={marketData.stocks.nasdaq?.value}
                change={marketData.stocks.nasdaq?.change}
                changePercent={marketData.stocks.nasdaq?.changePercent} />

                  <LiveMarketTicker
                symbol="DOW"
                label="DOW JONES"
                value={marketData.stocks.dow?.value}
                change={marketData.stocks.dow?.change}
                changePercent={marketData.stocks.dow?.changePercent} />

                </>
            }
              {marketData.crypto &&
            <LiveMarketTicker
              symbol="BTC"
              label="Bitcoin"
              value={marketData.crypto.bitcoin?.value}
              change={marketData.crypto.bitcoin?.change}
              changePercent={marketData.crypto.bitcoin?.changePercent} />

            }
            </div> :
          null}
        </div>
      </section>

      {/* News Section */}
      <section className="bg-gray-50 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8">

            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Market Insights</h2>
            </div>
            <p className="text-gray-600">Stay informed with the latest investment news and market analysis</p>
          </motion.div>

          {newsLoading ?
          <div className="flex items-center justify-center py-16">
              <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
              <span className="ml-3 text-gray-500 text-sm">Fetching today's news...</span>
            </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}>

                  <NewsCard item={item} index={idx} />
                </motion.div>
            )}
            </div>
          }
        </div>
      </section>

      <Testimonials />
      <ComparisonTable />
      <PricingSection />
      <FAQ />

      {/* CTA Section */}
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

      {/* Footer */}
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
                <li><a href="/Calculator" className="hover:text-indigo-400 transition-colors">Investment Calculator</a></li>
                <li><a href="/Portfolio" className="hover:text-indigo-400 transition-colors">Portfolio Builder</a></li>
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
             <span>Made with <span className="text-indigo-500">♥</span> for investors</span>
            </div>
          </div>
        </div>
      </footer>
    </div>);

}