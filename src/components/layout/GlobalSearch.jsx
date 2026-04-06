import React, { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/SecurityDetail?symbol=${query.toUpperCase()}`);
      setOpen(false);
      setQuery("");
    }
  };

  const SUGGESTIONS = [
    { symbol: "^AXJO", Name: "ASX 200 (Australia)" },
    { symbol: "^GSPC", Name: "S&P 500 (US)" },
    { symbol: "BINANCE:BTCUSDT", Name: "Bitcoin" },
    { symbol: "AAPL", Name: "Apple Inc." },
    { symbol: "BHP.AX", Name: "BHP Group" }
  ];

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors border border-gray-200"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">Search markets...</span>
        <kbd className="ml-2 text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-gray-300">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center p-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input 
                  autoFocus
                  placeholder="Type a symbol (e.g. ^AXJO, BTC, AAPL)..."
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600">Esc</button>
              </form>

              <div className="p-2 max-h-[300px] overflow-y-auto">
                <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Benchmarks</p>
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => {
                      navigate(`/SecurityDetail?symbol=${item.symbol}`);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 rounded-xl transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 group-hover:bg-white group-hover:shadow-sm">
                        {item.symbol.substring(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.symbol}</p>
                        <p className="text-xs text-gray-500">{item.Name}</p>
                      </div>
                    </div>
                    <Command className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
