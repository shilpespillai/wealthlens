import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { base44, invokeUniversalAI } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { 
  Sparkles, Download, Loader2, BarChart3, TrendingUp, AlertCircle, Bot, FileText, PieChart
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { resolveCanonicalCategory } from '@/utils/constants';
import { getCurrencySymbol } from "@/components/calculator/CurrencySelector";

const PROMPT_TEMPLATES = [
  {
    id: 'lifestyle_audit',
    name: 'The Lifestyle Audit',
    description: 'Analyzes discretionary spending to detect lifestyle creep and inflation.',
    systemText: 'Analyze the provided financial data to identify patterns of discretionary spending. Highlight areas where spending is increasing month-over-month. Generate a professional markdown report with clear headers and analysis.'
  },
  {
    id: 'subscription_hunter',
    name: 'Subscription Leakage Hunter',
    description: 'Finds recurring payments and calculates long-term compounding loss.',
    systemText: 'Act as a professional financial analyst. Identify recurring subscriptions or recurring fees in the provided data. Calculate the 10-year potential savings if the bottom 30% of these were redirected to a savings account. Output a detailed markdown report.'
  },
  {
    id: 'stress_test',
    name: '50/30/20 Stress Test',
    description: 'Diagnoses exact transactions causing breaches in the 50/30/20 rule.',
    systemText: 'Analyze the provided data against the 50/30/20 budgeting framework. Identify the key categories contributing to any budget overages. Generate a formal financial markdown report with suggested adjustments.'
  },
  {
    id: 'custom',
    name: 'Custom Deep Dive',
    description: 'Ask any specific question against your ledger data.',
    systemText: 'Analyze the provided ledger data to answer the user\'s specific question. Provide a detailed, data-driven markdown report.'
  }
];

export default function AIReports() {
  const { getProductionLedger, normalizeTransactionData, getDatabaseTable, calculateMetrics } = useFinancialParser();
  const { isPaidUser, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dbAccounts, setDbAccounts] = useState([]);
  
  // Report states
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TEMPLATES[0].id);
  const [customQuery, setCustomQuery] = useState('');
  const [reportMarkdown, setReportMarkdown] = useState('');
  const reportRef = useRef(null);

  const monthKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }, [selectedDate]);

  useEffect(() => {
    async function initData() {
      if (!isPaidUser) return;
      setIsLoading(true);
      try {
        const allBudgets = await getDatabaseTable("budgets");
        const saved = (allBudgets || []).find(b => b.month === monthKey);
        const ledger = await getProductionLedger({ month: monthKey });
        const accounts = await getDatabaseTable("user_accounts");
        setDbAccounts(accounts || []);
        
        const { incomes: normIncs, expenses: normExps } = normalizeTransactionData(saved, selectedDate, ledger, accounts || []);
        
        setTransactions(ledger);
        setIncomes(normIncs);
        setExpenses(normExps);
        if (saved?.currency) setCurrency(saved.currency);
      } catch (err) {
        console.error("AI Report initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [monthKey, selectedDate, isPaidUser]);

  const changeMonth = (offset) => {
    const next = new Date(selectedDate);
    next.setMonth(next.getMonth() + offset);
    setSelectedDate(next);
    setReportMarkdown(''); 
  };

  const handleGenerateReport = async () => {
    if (!isPaidUser) return;
    if (transactions.length === 0) {
      toast.error("No transactions found for this month to analyze.");
      return;
    }

    setIsGenerating(true);
    try {
      const template = PROMPT_TEMPLATES.find(p => p.id === selectedPrompt);
      const userInstruction = selectedPrompt === 'custom' ? customQuery : template.systemText;
      
      const metrics = calculateMetrics(incomes, expenses, dbAccounts);
      
      const payload = {
        metrics,
        expenses: expenses.map(e => ({ cat: e.category || e.name, amt: e.amount, count: e.count })),
        topTransactions: transactions
          .filter(t => {
            const cat = resolveCanonicalCategory(t.category);
            const isTransfer = ['Transfer', 'Internal Transfer', 'Credit Card Payment', 'Payment'].includes(cat);
            const isDebtInflow = t.account_id && dbAccounts.find(a => String(a.id) === String(t.account_id))?.type === 'debt';
            return !isTransfer && !isDebtInflow;
          })
          .sort((a,b) => Math.abs(b.amount||0) - Math.abs(a.amount||0))
          .slice(0, 10)
      };

      const prompt = `INSTRUCTION: ${userInstruction}\nDATA: ${JSON.stringify(payload)}`;
      const response = await invokeUniversalAI(prompt, 'report');
      
      const content = typeof response === 'string' ? response : (response?.markdownContent || response?.report || response?.text || response?.analysis || response?.assessment);
      
      if (content) {
        setReportMarkdown(content);
        toast.success("Intelligence Report Generated");
      } else {
        throw new Error("Could not extract narrative from AI response");
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast.error("Generation failed. Retrying with deterministic fallback.");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    
    toast.loading("Rendering PDF...");
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WealthLens_AI_Insight_${monthKey}.pdf`);
      toast.dismiss();
      toast.success("PDF Downloaded");
    } catch (err) {
      console.error("PDF Export failed:", err);
      toast.dismiss();
      toast.error("Failed to export PDF");
    }
  };

  // Dynamic Visual Intelligence Logic
  const dynamicRadarData = useMemo(() => {
    const metrics = calculateMetrics(incomes, expenses, dbAccounts);
    const total = metrics.totalExpenses || 1;
    
    const fixed = expenses.filter(e => e.spendType === 'fixed').reduce((sum, e) => sum + e.amount, 0);
    const variable = expenses.filter(e => e.spendType === 'variable').reduce((sum, e) => sum + e.amount, 0);
    const savings = expenses.filter(e => e.spendType === 'savings').reduce((sum, e) => sum + e.amount, 0);

    if (selectedPrompt === 'subscription_hunter') {
      return [
        { subject: 'Recurring', A: (fixed / total) * 100, fullMark: 100 },
        { subject: 'One-off', A: (variable / total) * 100, fullMark: 100 },
        { subject: 'Buffer', A: (savings / total) * 100, fullMark: 100 },
      ];
    }

    if (selectedPrompt === 'lifestyle_audit') {
      return [
        { subject: 'Essentials', A: (fixed / total) * 100, fullMark: 100 },
        { subject: 'Discretionary', A: (variable / total) * 100, fullMark: 100 },
        { subject: 'Investment', A: (savings / total) * 100, fullMark: 100 },
      ];
    }

    return [
      { subject: 'Needs (50%)', A: (fixed / total) * 100, fullMark: 100 },
      { subject: 'Wants (30%)', A: (variable / total) * 100, fullMark: 100 },
      { subject: 'Savings (20%)', A: (savings / total) * 100, fullMark: 100 },
    ];
  }, [expenses, incomes, dbAccounts, selectedPrompt]);

  const dynamicBarData = useMemo(() => {
    let filtered = [...expenses];
    
    if (selectedPrompt === 'subscription_hunter') {
      filtered = expenses.filter(e => e.spendType === 'fixed');
    } else if (selectedPrompt === 'lifestyle_audit') {
      filtered = expenses.filter(e => e.spendType === 'variable');
    }

    return filtered.map(e => ({
      name: e.category || e.name || 'Other',
      value: e.amount,
      color: (e.spendType === 'fixed' || e.name === 'Housing') ? '#C5A059' : '#1E293B'
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [expenses, selectedPrompt]);

  const visualTitle = useMemo(() => {
    if (selectedPrompt === 'lifestyle_audit') return "Lifestyle Inflation Audit";
    if (selectedPrompt === 'subscription_hunter') return "Subscription Leakage Audit";
    if (selectedPrompt === 'stress_test') return "50/30/20 Stress Test";
    return "Intelligence Data Distribution";
  }, [selectedPrompt]);

  const radarLabel = useMemo(() => {
    if (selectedPrompt === 'subscription_hunter') return "Recurring vs One-off Ratio";
    if (selectedPrompt === 'lifestyle_audit') return "Fixed vs Discretionary Mix";
    return "Budget Proportions (50/30/20)";
  }, [selectedPrompt]);

  const barLabel = useMemo(() => {
    if (selectedPrompt === 'subscription_hunter') return "Top Recurring Drains";
    if (selectedPrompt === 'lifestyle_audit') return "Top Inflation Categories";
    return "Top 6 Spend Nodes";
  }, [selectedPrompt]);

  const sym = getCurrencySymbol(currency);

  if (authLoading) return null;

  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center border border-amber-100 mb-8 shadow-sm">
          <Crown className="w-10 h-10 text-amber-500 fill-amber-500/10" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pro Member Required</h2>
        <p className="text-slate-500 mt-4 max-w-md leading-relaxed font-medium">
          Advanced AI Intelligence Reports and the specialized analysis frameworks are exclusive features for our Pro members.
        </p>
        <div className="mt-8 flex gap-4">
           <button 
             onClick={() => window.location.href = '/'}
             className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all"
           >
             Upgrade to Pro
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Dynamic Header */}
      <div className="bg-[#1E293B] pb-32 pt-12 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A059]/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" /> Institutional Intelligence
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter leading-none">
              AI Insight <span className="text-[#C5A059]">Engine</span>
            </h1>
            <p className="text-slate-400 mt-4 font-medium tracking-wide max-w-xl text-sm leading-relaxed">
              Transforming raw ledger data into high-fidelity financial narratives and actionable institutional reporting.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => changeMonth(-1)} className="p-2 text-slate-400 hover:text-[#C5A059] transition-all hover:scale-110 active:scale-95"><TrendingUp className="w-5 h-5 rotate-[270deg]" /></button>
            <div className="text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest opacity-80">Analysis Period</p>
              <span className="text-lg font-black text-white uppercase tracking-tight">
                {format(selectedDate, 'MMM yyyy')}
              </span>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 text-slate-400 hover:text-[#C5A059] transition-all hover:scale-110 active:scale-95"><TrendingUp className="w-5 h-5 rotate-90" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Config */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#1E293B] flex items-center justify-center shadow-lg shadow-slate-900/20">
                  <Bot className="w-6 h-6 text-[#C5A059]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Report Config</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Select Analysis Framework</p>
                </div>
              </div>

              <div className="space-y-3">
                {PROMPT_TEMPLATES.map(pt => (
                  <label 
                    key={pt.id} 
                    className={`flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedPrompt === pt.id ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-slate-50 hover:border-slate-200 bg-[#F8FAFC]/50'}`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPrompt === pt.id ? 'border-[#C5A059] bg-[#C5A059]' : 'border-slate-300'}`}>
                      {selectedPrompt === pt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <input type="radio" name="prompt" value={pt.id} checked={selectedPrompt === pt.id} onChange={(e) => setSelectedPrompt(e.target.value)} className="hidden" />
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{pt.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed opacity-80">{pt.description}</p>
                    </div>
                  </label>
                ))}
                {selectedPrompt === 'custom' && (
                  <textarea
                    className="w-full bg-[#F8FAFC] border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#C5A059] min-h-[120px]"
                    placeholder="Ask a specific question..."
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                  />
                )}
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || isLoading || transactions.length === 0}
                className="w-full mt-8 bg-[#1E293B] hover:bg-[#0F172A] text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.97] disabled:opacity-50 flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-[10px]"
              >
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin text-[#C5A059]" /> Analyzing...</> : <><Sparkles className="w-5 h-5 text-[#C5A059]" /> Generate Narrative</>}
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Ledger</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">{transactions.length} NODES</span>
               </div>
            </div>
          </div>

          {/* Right Column: AI Output Terminal & Automated Visuals */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 min-h-[850px] flex flex-col overflow-hidden">
              
              {/* Terminal Header */}
              <div className="bg-[#F8FAFC] border-b border-slate-100 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300" /><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /></div>
                  <div className="h-4 w-px bg-slate-200 mx-2" />
                  <span>Intelligence_Output.md</span>
                </div>
                {reportMarkdown && (
                  <button onClick={exportToPDF} className="flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-white hover:bg-[#1E293B] bg-white px-4 py-2 rounded-xl border border-slate-200 uppercase tracking-widest transition-all">
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                )}
              </div>

              {/* Document Container */}
              <div className="p-10 flex-1 relative bg-white overflow-y-auto max-h-[1000px]">
                {reportMarkdown ? (
                  <div ref={reportRef} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {/* Automated Visual Intelligence Header */}
                    <div className="bg-gradient-to-br from-slate-50 to-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                       <div className="flex items-center gap-4 mb-10">
                          <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/10 flex items-center justify-center">
                             <PieChart className="w-6 h-6 text-[#C5A059]" />
                          </div>
                          <div>
                             <h2 className="text-2xl font-black text-slate-800 tracking-tight">{visualTitle}</h2>
                             <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.3em]">Automated Graphical Audit</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center border-b border-slate-50 pb-2">{radarLabel}</p>
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dynamicRadarData}>
                                    <PolarGrid stroke="#E2E8F0" />
                                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 9, fontWeight: 900, fill: '#64748B'}} />
                                    <Radar name="Budget" dataKey="A" stroke="#C5A059" fill="#C5A059" fillOpacity={0.5} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                  </RadarChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                          <div className="space-y-6">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center border-b border-slate-50 pb-2">{barLabel}</p>
                             <div className="h-64 w-full flex items-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={dynamicBarData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => `${sym}${value.toLocaleString()}`} contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                                      {dynamicBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* AI Narrative Section */}
                    <div className="prose prose-slate max-w-none 
                        prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-[#1E293B]
                        prose-h1:text-4xl prose-h1:border-b-4 prose-h1:border-[#C5A059] prose-h1:pb-6 prose-h1:mb-10
                        prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                        prose-h3:text-[#C5A059] prose-h3:uppercase prose-h3:text-xs prose-h3:tracking-[0.3em] prose-h3:mb-4
                        prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium prose-p:text-base
                        prose-strong:text-[#1E293B] prose-strong:font-black
                        prose-ul:my-8 prose-li:text-slate-600 prose-li:font-medium
                        prose-blockquote:border-l-8 prose-blockquote:border-[#C5A059] prose-blockquote:bg-[#F8FAFC] prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:font-bold prose-blockquote:text-slate-700 prose-blockquote:italic
                        pb-20"
                    >
                      <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
                    </div>

                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#F8FAFC] flex items-center justify-center border-2 border-dashed border-slate-200 mb-8 animate-pulse">
                      <FileText className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-2xl font-black text-[#1E293B] tracking-tight">Ready for Generation</h4>
                    <p className="text-sm font-semibold text-slate-400 mt-3 max-w-xs leading-relaxed">
                      Select an institutional framework and launch the engine to begin your automated audit.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
