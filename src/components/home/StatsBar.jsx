import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: 10000, suffix: "+", label: "Investors" },
  { value: 2, prefix: "$", suffix: "B+", label: "Wealth Projected" },
  { value: 20, suffix: "+", label: "Currencies" },
  { value: 8, suffix: "+", label: "Asset Classes" },
];

function Counter({ value, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  const display = value >= 1000 ? (count / 1000).toFixed(count >= 1000 ? 0 : 1) + "K" : count;

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{value >= 1000 ? display : count}{suffix}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-violet-600 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-black">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <div className="text-sm text-indigo-100 mt-1 font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}