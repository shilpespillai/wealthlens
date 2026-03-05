import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const DOCS = [
  {
    title: "Getting Started",
    items: [
      { title: "Signing In", content: "Create an account and log in to access WealthLens. You can sign in with your email and password or through other authentication methods." },
      { title: "Dashboard Overview", content: "The main calculator dashboard shows your investment parameters on the left and results on the right. Use the tabs to explore different analysis views." },
    ]
  },
  {
    title: "Using the Calculator",
    items: [
      { title: "Setting Parameters", content: "Configure your investment details: initial amount, monthly contributions, investment period, expected return rate, inflation rate, tax rate, and fees." },
      { title: "Selecting Assets", content: "Choose from stocks, bonds, ETFs, crypto, real estate, and more. Each asset class has default return rate scenarios: conservative, moderate, and aggressive." },
      { title: "Investment Profiles", content: "Quick-start profiles are available for different investor types: Starting Out, Balanced, Growth, and High Net Worth. Click any profile to auto-fill parameters." },
    ]
  },
  {
    title: "Understanding Results",
    items: [
      { title: "Summary Cards", content: "Key metrics include total contributions, investment growth, taxes paid, final portfolio value, and total return percentage." },
      { title: "Growth Chart", content: "Visualize your portfolio growth over time. The chart shows contributions, nominal value, and inflation-adjusted (real) value." },
      { title: "Yearly Breakdown", content: "View year-by-year details including contributions, growth, taxes, fees, and cumulative portfolio value." },
      { title: "Scenarios", content: "Compare conservative (lower returns), moderate (expected), and aggressive (higher returns) market scenarios side-by-side." },
    ]
  },
  {
    title: "Premium Features",
    items: [
      { title: "AI Coach", content: "Get personalized investment advice based on your parameters and financial goals." },
      { title: "AI Portfolio Builder", content: "Receive recommendations for a diversified portfolio allocation across multiple asset classes." },
      { title: "Retirement Planner", content: "Plan for retirement by calculating how much you need to save to achieve your retirement income goals." },
      { title: "Tax Strategies", content: "Explore advanced tax optimization strategies to maximize your after-tax returns." },
      { title: "Market Sentiment", content: "View AI-powered market analysis including trends, sentiment, and risk factors for your chosen asset class." },
      { title: "Property Analysis", content: "Detailed real estate investment analysis including property vs ETF comparisons and equity unlock planning." },
    ]
  },
  {
    title: "Saving & Exporting",
    items: [
      { title: "Save Calculations", content: "Save your investment scenarios with custom names for future reference. Access saved calculations from the Save & Export section." },
      { title: "Export as PDF", content: "Generate a professional PDF report of your analysis including charts, scenarios, and summary tables." },
      { title: "Download Data", content: "Export all your saved calculations as a JSON file for backup or external analysis." },
    ]
  },
  {
    title: "Settings & Account",
    items: [
      { title: "Account Management", content: "Update your profile, view your email, and manage your account settings." },
      { title: "Data Privacy", content: "Download your data or clear your saved calculations. Your data is always encrypted and secure." },
      { title: "Keyboard Shortcuts", content: "Use keyboard shortcuts to work faster: Cmd+S to save, Cmd+E to export, Cmd+/ for settings." },
    ]
  },
  {
    title: "Tips & Best Practices",
    items: [
      { title: "Realistic Assumptions", content: "Use historical average returns for your asset class. Don't be overly optimistic with return rate assumptions." },
      { title: "Regular Reviews", content: "Revisit your calculations annually or when your circumstances change to stay on track." },
      { title: "Diversification", content: "Use the AI Portfolio Builder to explore diversified allocations across different asset classes." },
      { title: "Tax Planning", content: "Review the Tax Strategies section to understand how different account types and withdrawal strategies affect your returns." },
    ]
  },
];

export default function DocumentationSection() {
  const [docsOpen, setDocsOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-cyan-400" />
        Documentation
      </h3>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setDocsOpen(true)}
        className="w-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4 text-left hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">How to Use WealthLens</span>
          <ChevronDown className="w-5 h-5 text-cyan-400" />
        </div>
      </motion.button>

      {/* Documentation Dialog */}
      <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
        <DialogContent className="bg-slate-900 border-white/10 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">WealthLens Documentation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {DOCS.map((section, idx) => (
              <Collapsible
                key={idx}
                open={expanded === idx}
                onOpenChange={() => setExpanded(expanded === idx ? null : idx)}
              >
                <CollapsibleTrigger className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/10 rounded-lg p-4 flex items-center justify-between transition-all">
                  <h4 className="font-bold text-white">{section.title}</h4>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === idx ? "rotate-180" : ""}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-slate-800/30 rounded-lg p-4 border border-white/5">
                      <h5 className="font-semibold text-indigo-300 mb-2">{item.title}</h5>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}