import React from "react";
import { motion } from "framer-motion";
import { UserPlus, SlidersHorizontal, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up Free",
    desc: "Create your account in seconds. No credit card required to get started.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: SlidersHorizontal,
    step: "02",
    title: "Configure Your Portfolio",
    desc: "Enter your investment amount, time horizon, and asset class. Adjust inflation, tax, and fees.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "See Your Financial Future",
    desc: "Get AI-powered projections, scenario comparisons, and personalised advice — instantly.",
    color: "from-emerald-500 to-teal-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-10 sm:py-14 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Get from zero to a complete investment strategy in under 2 minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200 z-0" />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-300 mb-1 tracking-widest">{step.step}</span>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}