import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Upload, 
  Table, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  Search,
  Fingerprint,
  Layers,
  Check,
  X,
  RefreshCcw,
  FileText,
  Plus,
  Loader2,
  FileSearch,
  Sparkles,
  Zap,
  ShieldCheck,
  CloudUpload,
  Landmark,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { base44, invokeUniversalAI } from '@/api/base44Client';
import { resolveCanonicalCategory } from '@/utils/constants';
import { robustParseDate } from '@/utils/dateParser';
import { motion, AnimatePresence } from "framer-motion";

// PDF.js Integration (Offline-Ready)
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const SmartImporter = ({ accounts, onComplete, onCancel }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState('upload'); // upload | mapping | preview | loading
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [fileType, setFileType] = useState(null); // 'csv' | 'pdf'
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    date: "",
    merchant: "",
    amount: "",
    category: ""
  });
  const [previewItems, setPreviewItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentFile, setCurrentFile] = useState(null);

  const handleRescan = () => {
    if (currentFile) processFile(currentFile);
    else setStep('upload');
  };

  // --- 1. CSV ENGINE ---
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return { headers: [], rows: [] };
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : (firstLine.includes(';') ? ';' : ',');
    const rows = lines.map(line => {
      const regex = new RegExp(`${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
      return line.split(regex).map(cell => cell.replace(/^"|"$/g, '').trim());
    });
    return { headers: rows[0], rows: rows.slice(1) };
  };

  // --- 2. PDF ENGINE ---
  const scanPDF = async (file) => {
    setStep('loading');
    setLoadingMessage("Scanning PDF layers...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        setLoadingMessage(`Reading page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + "\n";
      }

      setLoadingMessage("Analysing transaction patterns...");
      const txRegex = /(\d{1,2}\s[A-Za-z]{3}\s\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w{3}\s\d{1,2})\s+(.{1,150}?)\s+(-?\s*[^\d\s]*\s*[\d,]+\.\d{2})(?:\s+-?\s*[^\d\s]*\s*[\d,]+\.\d{2})?/g;
      
      const found = [];
      let match;
      while ((match = txRegex.exec(fullText)) !== null) {
        found.push({
          date: match[1],
          merchant: match[2].trim(),
          amount: parseFloat(match[3].replace(/[^\d.-]/g, '')),
          category: "Uncategorized"
        });
      }

      if (found.length === 0) {
        toast.error("No transactions detected in PDF.");
        setStep('upload');
        return;
      }

      const items = found.map((item, idx) => {
        const txType = item.amount >= 0 ? 'income' : 'expense';
        return {
          ...item,
          id: `pdf-${idx}`,
          type: txType,
          amount: Math.abs(item.amount),
          selected: true,
          isDuplicate: false
        };
      });

      await enrichWithDeduplication(items);
    } catch (err) {
      toast.error("Failed to parse PDF.");
      setStep('upload');
    }
  };

  const enrichWithDeduplication = async (items) => {
    setLoadingMessage("AI Deduplication Engine starting...");
    try {
      const allTx = await base44.db.getTable('transactions') || [];
      const accountTx = allTx.filter(t => String(t.account_id) === String(selectedAccountId));
      
      const enriched = items.map(item => {
        const isDuplicate = accountTx.some(existing => 
          existing.merchant.toLowerCase().includes(item.merchant.toLowerCase()) &&
          Math.abs(existing.amount) === Math.abs(item.amount)
        );

        let autoCategory = item.category;
        if (autoCategory === "Uncategorized" || !autoCategory) {
           const historicalMatch = allTx.find(t => 
             t.merchant && 
             item.merchant && 
             (t.merchant.toLowerCase().includes(item.merchant.toLowerCase()) || item.merchant.toLowerCase().includes(t.merchant.toLowerCase())) &&
             t.category && 
             t.category !== "Uncategorized"
           );
           
           if (historicalMatch) {
             autoCategory = historicalMatch.category;
           } else {
             const m = item.merchant.toLowerCase();
             if (m.includes('woolworths') || m.includes('coles') || m.includes('aldi')) autoCategory = "Groceries";
             else if (m.includes('uber') || m.includes('transport') || m.includes('train') || m.includes('petrol')) autoCategory = "Fuel & Transport";
             else if (m.includes('netflix') || m.includes('spotify') || m.includes('cinema')) autoCategory = "Lifestyle";
             else if (m.includes('pharmacy') || m.includes('chemist') || m.includes('doctor')) autoCategory = "Healthcare";
             else if (m.includes('mcdonald') || m.includes('kfc') || m.includes('cafe') || m.includes('coffee') || m.includes('restaurant')) autoCategory = "Dining & Food";
             else if (m.includes('insurance') || m.includes('bupa') || m.includes('medibank')) autoCategory = "Insurance";
             else autoCategory = "Uncategorized";
           }
        }

        return { ...item, isDuplicate, selected: !isDuplicate, category: autoCategory };
      });

      const uncategorizedMerchants = [...new Set(enriched.filter(i => i.category === "Uncategorized" && i.merchant).map(i => i.merchant))];
      
      if (uncategorizedMerchants.length > 0) {
        setLoadingMessage(`AI Neural Hub classifying ${uncategorizedMerchants.length} merchants...`);
        const batchSize = 20;
        for (let i = 0; i < uncategorizedMerchants.length; i += batchSize) {
          const batch = uncategorizedMerchants.slice(i, i + batchSize);
          try {
            const promptText = `Map these merchants to one of the following canonical categories: Income, Housing, Utilities, Financial, Groceries, Dining & Food, Fuel & Transport, Healthcare, Lifestyle, Insurance, Education, Travel, Shopping, Gifts & Donations, Maintenance, Transfer, Reimbursement. Respond ONLY JSON: { "categories": { "Name": "Category" } }. Merchants: ${JSON.stringify(batch)}`;
            const aiResult = await invokeUniversalAI(promptText, 'categorize');
            if (aiResult && aiResult.categories) {
              enriched.forEach(item => {
                 if (item.category === "Uncategorized" && aiResult.categories[item.merchant]) {
                   item.category = resolveCanonicalCategory(aiResult.categories[item.merchant]);
                 }
              });
            }
          } catch (llmErr) {}
        }
      }

      setPreviewItems(enriched);
      setStep('preview');
    } catch (err) {
      setPreviewItems(items);
      setStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file) => {
    if (!file || !selectedAccountId) {
        if (!selectedAccountId) toast.error("Select destination account first");
        return;
    }
    setCurrentFile(file);

    if (file.type === 'application/pdf') {
      setFileType('pdf');
      await scanPDF(file);
    } else {
      setFileType('csv');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const { headers, rows } = parseCSV(event.target.result);
        if (headers.length === 0) return toast.error("Invalid CSV");
        setHeaders(headers);
        setCsvData(rows);
        
        const fingerprint = btoa(headers.join('|')).substring(0, 32);
        const user = await base44.auth.me();
        const savedMapping = localStorage.getItem(`wl_mapping_${user.id}_${selectedAccountId}_${fingerprint}`);

        if (savedMapping) {
          setMapping(JSON.parse(savedMapping));
          processCsvToPreview(rows, headers, JSON.parse(savedMapping));
        } else {
          setStep('mapping');
        }
      };
      reader.readAsText(file);
    }
  };

  const processCsvToPreview = async (rows, headersList, finalMapping) => {
    const items = rows.map((row, idx) => {
      const rowData = {};
      headersList.forEach((h, i) => rowData[h] = row[i]);
      const rawAmount = rowData[finalMapping.amount] || "0";
      const cleanAmountStr = String(rawAmount).replace(/[^\d.-]/g, '');
      const parsedAmount = parseFloat(cleanAmountStr) || 0;
      const txType = parsedAmount >= 0 ? 'income' : 'expense';

      return {
        id: `csv-${idx}`,
        date: rowData[finalMapping.date] || "",
        merchant: rowData[finalMapping.merchant] || "Unknown",
        amount: Math.abs(parsedAmount),
        category: resolveCanonicalCategory(rowData[finalMapping.category] || "Uncategorized"),
        type: txType,
        selected: true
      };
    });
    await enrichWithDeduplication(items);
  };

  const handleCommitImport = async () => {
    const toImport = previewItems.filter(p => p.selected);
    if (toImport.length === 0) return toast.error("No items selected");

    setIsProcessing(true);
    try {
      const dbRows = toImport.map(item => {
        const parsedDate = robustParseDate(item.date);
        const isoDate = parsedDate ? parsedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        return {
          merchant: item.merchant,
          amount: item.amount,
          category: item.category,
          date: isoDate,
          type: item.type,
          spend_type: item.type === 'income' ? 'income' : 'variable',
          account_id: selectedAccountId
        };
      });

      await base44.db.insertRows('transactions', dbRows);
      toast.success(`Wealth Bridge Active: ${toImport.length} items synced.`);
      onComplete();
    } catch (err) {
      toast.error("Persistence error.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-white overflow-hidden relative">
      {/* VIBRANT AURORA BACKGROUNDS */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-orange-400/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none" />

      {/* VIBRANT ORANGE HEADER */}
      <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 p-8 pt-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
               <CloudUpload className="w-4 h-4 text-orange-100" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-100">Universal Importer</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter leading-none">Institutional <span className="text-orange-100/60">Bridge</span></h2>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
             <Layers className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      {/* Target Account Context (Context Bar) */}
      <div className="px-8 py-3 bg-white/40 backdrop-blur-sm border-b border-orange-100/30 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Landmark className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Destination Account</p>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="h-6 border-none bg-transparent p-0 font-black text-slate-900 focus:ring-0 text-xs">
                <SelectValue placeholder="Link to Account..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-orange-100 shadow-2xl p-1">
                {accounts.filter(a => !a.isVirtual).map(acc => (
                  <SelectItem key={acc.id} value={String(acc.id)} className="font-bold text-[10px] uppercase tracking-wider py-2">{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-[4px] border-orange-50 flex items-center justify-center">
                   <div className="w-full h-full rounded-full border-t-[4px] border-orange-500 animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                 <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">AI Protocol Active</h3>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] animate-pulse">{loadingMessage}</p>
              </div>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="h-full p-8"
            >
              <label 
                htmlFor="file-upload-dialog"
                className={`w-full h-full border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center space-y-8 transition-all relative overflow-hidden cursor-pointer ${isDragging ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 bg-white/50 hover:bg-white hover:border-orange-300'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
              >
                <input id="file-upload-dialog" type="file" accept=".csv, .pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50">
                      <FileText className="w-7 h-7 text-slate-300" />
                   </div>
                   <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${isDragging ? 'bg-orange-600 scale-110' : 'bg-orange-50 shadow-xl shadow-orange-100'}`}>
                      <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-orange-500'}`} />
                   </div>
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50">
                      <Table className="w-7 h-7 text-slate-300" />
                   </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Automated Intake</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-bold uppercase tracking-widest">
                    Drop <span className="text-orange-500">CSV</span> or <span className="text-teal-500">PDF</span> statements. WealthLens AI will handle the rest.
                  </p>
                </div>

                <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                   <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> AES-256</span>
                   <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-orange-400" /> AI Classification</span>
                </div>
              </label>
            </motion.div>
          )}

          {step === 'mapping' && (
            <motion.div 
              key="mapping"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="h-full p-10 flex flex-col space-y-10"
            >
               <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Layout Definition</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Map your CSV columns to the protocol</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: "Date Identity", field: "date", icon: <Calendar className="w-3 h-3" /> },
                    { label: "Merchant Label", field: "merchant", icon: <FileSearch className="w-3 h-3" /> },
                    { label: "Financial Amount", field: "amount", icon: <Zap className="w-3 h-3" /> },
                    { label: "Category Mapping", field: "category", icon: <Layers className="w-3 h-3" /> },
                  ].map(item => (
                    <div key={item.field} className="space-y-2 text-left">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        {item.icon} {item.label}
                      </label>
                      <Select value={mapping[item.field]} onValueChange={(v) => setMapping(prev => ({ ...prev, [item.field]: v }))}>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-white shadow-sm text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-orange-500/5 transition-all">
                          <SelectValue placeholder="Pick Header..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-orange-100 shadow-2xl p-2">
                          {headers.map(h => <SelectItem key={h} value={h} className="text-[10px] font-black uppercase tracking-wider py-3">{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
               </div>

               <div className="mt-auto flex justify-between items-center bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                 <Button variant="ghost" onClick={() => setStep('upload')} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</Button>
                 <Button 
                  onClick={() => {
                     if (!mapping.date || !mapping.amount || !mapping.merchant) return toast.error("Essential fields missing");
                     const fingerprint = btoa(headers.join('|')).substring(0, 32);
                     localStorage.setItem(`wl_mapping_${selectedAccountId}_${fingerprint}`, JSON.stringify(mapping));
                     processCsvToPreview(csvData, headers, mapping);
                  }} 
                  className="bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl shadow-slate-900/10"
                 >
                   Establish Link
                 </Button>
               </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col"
            >
              <div className="px-8 py-4 bg-orange-50/30 border-b border-orange-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Badge className={`${fileType === 'pdf' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-orange-50 text-orange-600 border-orange-100'} text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1`}>
                      {fileType} Protocol
                   </Badge>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{previewItems.length} Records Extracted</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRescan} className="h-8 text-[9px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-100/50 rounded-xl">
                  <RefreshCcw className="w-3 h-3 mr-2" /> Re-Scan Statement
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                 <div className="py-4 space-y-3">
                   {previewItems.map((item, i) => (
                     <div key={i} className={`group flex items-center justify-between p-5 rounded-[2rem] border transition-all ${item.selected ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-transparent opacity-40 grayscale'}`}>
                       <div className="flex items-center gap-5">
                         <button 
                          onClick={() => setPreviewItems(prev => prev.map(p => p.id === item.id ? { ...p, selected: !p.selected } : p))}
                          className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${item.selected ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-slate-200 bg-white'}`}
                         >
                           {item.selected && <Check className="w-4 h-4 stroke-[4px]" />}
                         </button>
                         <div className="text-left">
                           <p className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none mb-1.5">{item.merchant}</p>
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.date}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-200" />
                              <Badge className="bg-slate-100 text-slate-500 border-none text-[7px] font-black uppercase tracking-widest h-4 px-2">{item.category}</Badge>
                           </div>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className={`text-lg font-black tabular-nums tracking-tighter ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                           {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </p>
                         {item.isDuplicate && (
                           <div className="flex items-center justify-end gap-1 mt-1">
                              <AlertCircle className="w-3 h-3 text-rose-500" />
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Duplicate Detected</span>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
              </ScrollArea>

              <div className="p-8 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
                 <div className="text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Batch Summary</span>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{previewItems.filter(p => p.selected).length} Items Selected</span>
                 </div>
                 <Button 
                  onClick={handleCommitImport} 
                  disabled={isProcessing}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-black uppercase tracking-[0.2em] px-12 h-16 rounded-[2rem] shadow-2xl shadow-orange-500/30"
                 >
                   {isProcessing ? "Finalising..." : "Finalise Import"}
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Footer info bar */}
      <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-center">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-3">
           Secure Institutional Bridge Phase-1 Active
        </p>
      </div>
    </div>
  );
};

export default SmartImporter;
