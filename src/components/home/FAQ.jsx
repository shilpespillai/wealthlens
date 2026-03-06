import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is WealthLens really free to use?",
    a: "Yes! The core investment calculator, scenario comparison, growth charts, and portfolio overview are completely free — no credit card needed. Premium features like the AI Coach, Portfolio Builder, and PDF export are unlocked with a one-time $29 payment."
  },
  {
    q: "What's included in the free plan vs premium?",
    a: "Free gives you the full investment calculator with all asset classes, 20+ currencies, scenario modelling, and year-by-year breakdowns. Premium unlocks AI-powered tools (Investment Coach, Portfolio Builder, Retirement Planner), Market Sentiment Analysis, Tax Optimisation, Property Analyser, and the ability to save & export reports as PDF."
  },
  {
    q: "Is it really a one-time payment? No subscriptions?",
    a: "Yes — $29 once, yours forever. We believe great financial tools shouldn't cost you a monthly fee. Pay once and get lifetime access including all future updates."
  },
  {
    q: "Is my financial data safe?",
    a: "Absolutely. We don't sell your data or share it with third parties. All calculations are processed securely, and we use industry-standard encryption. You're in full control of your data at all times."
  },
  {
    q: "Do I need to connect my bank account?",
    a: "No. WealthLens is a planning and projection tool — you manually enter the numbers you want to model. We never ask for bank credentials or access to your financial accounts."
  },
  {
    q: "Can I use it for any country or currency?",
    a: "Yes! WealthLens supports 20+ currencies including USD, AUD, EUR, GBP, CAD, JPY, and many more. The calculator works for any country's investment environment."
  },
  {
    q: "How accurate are the projections?",
    a: "Projections are based on compound interest mathematics with adjustments for inflation, fees, and taxes. They're educational estimates — real returns will vary with market conditions. Always consult a licensed financial adviser for personalised advice."
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-gray-50 py-10 sm:py-14 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-sm">Everything you need to know before getting started.</p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}