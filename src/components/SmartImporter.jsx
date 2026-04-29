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
  FileSearch
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { base44, invokeUniversalAI } from '@/api/base44Client';
import { resolveCanonicalCategory } from '@/utils/constants';
import { robustParseDate } from '@/utils/dateParser';

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

  // --- 2. PDF ENGINE (HEURISTIC SCANNER) ---
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
      
      // Universal Regex: Handles ANY currency symbol (or none), spaces, and international dates
      // Bound description to 150 chars max to prevent header/metadata bleed across pages
      const txRegex = /(\d{1,2}\s[A-Za-z]{3}\s\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w{3}\s\d{1,2})\s+(.{1,150}?)\s+(-?\s*[^\d\s]*\s*[\d,]+\.\d{2})(?:\s+-?\s*[^\d\s]*\s*[\d,]+\.\d{2})?/g;
      
      const found = [];
      let match;
      while ((match = txRegex.exec(fullText)) !== null) {
        found.push({
          date: match[1],
          merchant: match[2].trim(),
          // Aggressively strip ALL characters except digits, decimals, and minus signs
          amount: parseFloat(match[3].replace(/[^\d.-]/g, '')),
          category: "Uncategorized"
        });
      }

      if (found.length === 0) {
        toast.error("No transactions detected in PDF. Try a CSV instead or copy-paste text.");
        setStep('upload');
        return;
      }

      const targetAccount = accounts.find(a => String(a.id) === String(selectedAccountId));
      const isCreditCard = targetAccount?.type === 'debt' || targetAccount?.name.toLowerCase().includes('credit');

      // Convert to "Grid View" format for preview
      const items = found.map((item, idx) => {
        // Strict mathematical sign mapping (Negative = Expense, Positive = Income)
        // Works universally for both standard accounts and credit cards with this bank format
        const txType = item.amount >= 0 ? 'income' : 'expense';
        
        return {
          ...item,
          id: `pdf-${idx}`,
          type: txType,
          amount: Math.abs(item.amount),
          selected: true,
          isDuplicate: false // Will check in preview step
        };
      });

      await enrichWithDeduplication(items);
    } catch (err) {
      console.error("PDF Scan failed:", err);
      toast.error("Failed to parse PDF. Is it password protected?");
      setStep('upload');
    }
  };

  // --- 3. COMMON FLOWS ---

  const enrichWithDeduplication = async (items) => {
    setLoadingMessage("Checking for duplicates & learning categories...");
    try {
      const allTx = await base44.db.getTable('transactions') || [];
      const accountTx = allTx.filter(t => String(t.account_id) === String(selectedAccountId));
      
      const enriched = items.map(item => {
        // 1. Deduplication Engine
        const isDuplicate = accountTx.some(existing => 
          existing.merchant.toLowerCase().includes(item.merchant.toLowerCase()) &&
          Math.abs(existing.amount) === Math.abs(item.amount)
        );

        // 2. Historical Auto-Categorization Engine
        let autoCategory = item.category;
        if (autoCategory === "Uncategorized" || !autoCategory) {
           // Look through all historical transactions for the same merchant to 'learn' user preferences
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
             // Fallback to hardcoded neural dictionary for common global merchants
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

      // 3. LLM Batch Categorization (for any remaining "Uncategorized" merchants)
      const uncategorizedMerchants = [...new Set(enriched.filter(i => i.category === "Uncategorized" && i.merchant).map(i => i.merchant))];
      
      if (uncategorizedMerchants.length > 0) {
        setLoadingMessage(`Neural Hub analyzing ${uncategorizedMerchants.length} unknown merchants...`);
        
        // Process in batches of 20 to prevent AI response truncation/timeout
        const batchSize = 20;
        for (let i = 0; i < uncategorizedMerchants.length; i += batchSize) {
          const batch = uncategorizedMerchants.slice(i, i + batchSize);
          try {
            const promptText = `Map these merchants to one of the following canonical categories: Income, Housing, Utilities, Financial, Groceries, Dining & Food, Fuel & Transport, Healthcare, Lifestyle, Insurance, Education, Travel, Shopping, Gifts & Donations, Maintenance, Transfer, Reimbursement. 

Respond ONLY with a JSON object in this format: { "categories": { "Merchant Name": "Category Name" } }. Do not include any markdown or explanation.

Merchants: ${JSON.stringify(batch)}`;
            
            const aiResult = await invokeUniversalAI(promptText, 'categorize');
            
            if (aiResult && aiResult.categories) {
              enriched.forEach(item => {
                 if (item.category === "Uncategorized" && aiResult.categories[item.merchant]) {
                   item.category = resolveCanonicalCategory(aiResult.categories[item.merchant]);
                 }
              });
            }
          } catch (llmErr) {
            console.warn(`Batch ${i/batchSize + 1} failed:`, llmErr);
          }
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedAccountId) return toast.error("Please select a destination account first");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file) => {
    if (!file || !selectedAccountId) {
        if (!selectedAccountId) toast.error("Please select an account first");
        return;
    }

    if (file.type === 'application/pdf') {
      setFileType('pdf');
      await scanPDF(file);
    } else {
      setFileType('csv');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const { headers, rows } = parseCSV(event.target.result);
        if (headers.length === 0) return toast.error("Invalid CSV format");
        setHeaders(headers);
        setCsvData(rows);
        
        // Fingerprinting logic for CSV
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
    const targetAccount = accounts.find(a => String(a.id) === String(selectedAccountId));
    const isCreditCard = targetAccount?.type === 'debt' || targetAccount?.name.toLowerCase().includes('credit');

    const items = rows.map((row, idx) => {
      const rowData = {};
      headersList.forEach((h, i) => rowData[h] = row[i]);
      const rawAmount = rowData[finalMapping.amount] || "0";
      
      // Clean the string (preserve minus signs and decimals, strip currency symbols)
      const cleanAmountStr = String(rawAmount).replace(/[^\d.-]/g, '');
      const parsedAmount = parseFloat(cleanAmountStr) || 0;
      
      // Strict mathematical sign mapping
      const txType = parsedAmount >= 0 ? 'income' : 'expense';

      return {
        id: `csv-${idx}`,
        date: rowData[finalMapping.date] || "",
        merchant: rowData[finalMapping.merchant] || "Unknown",
        amount: Math.abs(parseFloat(rawAmount.replace(/[^-0-9.]/g, ''))) || 0,
        category: resolveCanonicalCategory(rowData[finalMapping.category] || "Uncategorized"),
        type: txType,
        selected: true
      };
    });
    await enrichWithDeduplication(items);
  };

  const handleCommitImport = async () => {
    const toImport = previewItems.filter(p => p.selected);
    if (toImport.length === 0) return toast.error("No transactions selected");

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
      toast.success(`Imported ${toImport.length} items to ${accounts.find(a => String(a.id) === String(selectedAccountId))?.name}`);
      onComplete();
    } catch (err) {
      toast.error("Persistence failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-white">
      
      {/* Target Account Context */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Destination</p>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="h-7 border-none bg-transparent p-0 font-black text-slate-900 focus:ring-0">
                <SelectValue placeholder="Which account is this for?" />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(a => !a.isVirtual).map(acc => (
                  <SelectItem key={acc.id} value={String(acc.id)} className="font-bold">{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        
        {step === 'loading' && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <FileSearch className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
               <h3 className="text-lg font-black text-slate-900 tracking-tighter">AI Scanning Active</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">{loadingMessage}</p>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <label 
            htmlFor="file-upload"
            className={`flex-1 m-6 border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-12 text-center space-y-8 transition-all relative overflow-hidden cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' : 'border-slate-200 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-300'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => {
              if (!selectedAccountId) {
                e.preventDefault(); // Stop the label from triggering the input
                toast.error("Please select a destination account first");
              }
            }}
          >
            {/* The actual input is safely hidden in the DOM */}
            <input 
              id="file-upload"
              type="file" 
              accept=".csv, .pdf" 
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <div className="flex items-center gap-4 pointer-events-none">
               <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center shadow-sm">
                  <Table className="w-6 h-6 text-slate-300" />
               </div>
               <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all ${isDragging ? 'bg-indigo-600 shadow-xl shadow-indigo-200 scale-110' : 'bg-indigo-50 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50'}`}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-indigo-600'}`} />
               </div>
               <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-slate-300" />
               </div>
            </div>
            
            <div className="space-y-2 pointer-events-none">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Universal Statement Import</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">Drop your <span className="font-black text-indigo-600">CSV</span> or <span className="font-black text-rose-500">PDF</span> bank statements here. WealthLens will extract the data automatically.</p>
            </div>

            <Button 
              variant="outline"
              asChild
              className="pointer-events-none bg-white border-slate-200 text-slate-900 px-10 py-6 rounded-[20px] shadow-sm font-black uppercase tracking-widest text-[10px]"
            >
              <span>Browse Files</span>
            </Button>
          </label>
        )}

        {step === 'mapping' && (
          <div className="h-full flex flex-col p-8 space-y-6 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3">
               <Fingerprint className="w-6 h-6 text-indigo-600" />
               <h3 className="text-lg font-black text-slate-900 tracking-tight">New CSV Layout</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Date Column", field: "date" },
                  { label: "Merchant Column", field: "merchant" },
                  { label: "Amount Column", field: "amount" },
                  { label: "Category (Optional)", field: "category" },
                ].map(item => (
                  <div key={item.field} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</label>
                    <Select value={mapping[item.field]} onValueChange={(v) => setMapping(prev => ({ ...prev, [item.field]: v }))}>
                      <SelectTrigger className="rounded-2xl border-slate-200 bg-white h-11 text-xs font-bold shadow-sm">
                        <SelectValue placeholder="Pick Header" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map(h => <SelectItem key={h} value={h} className="text-xs font-medium">{h}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
             </div>

             <div className="mt-auto pt-8 flex justify-end gap-3">
               <Button variant="ghost" onClick={() => setStep('upload')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</Button>
               <Button 
                onClick={() => {
                   if (!mapping.date || !mapping.amount || !mapping.merchant) return toast.error("Map required fields");
                   const fingerprint = btoa(headers.join('|')).substring(0, 32);
                   localStorage.setItem(`wl_mapping_${selectedAccountId}_${fingerprint}`, JSON.stringify(mapping));
                   processCsvToPreview(csvData, headers, mapping);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-10 h-11 rounded-2xl"
               >
                 Verify Layout
               </Button>
             </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="h-full flex flex-col animate-in fade-in duration-700">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${fileType === 'pdf' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {fileType} SCAN
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Results Found: {previewItems.length}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('upload')} className="h-7 text-[9px] font-black uppercase text-slate-400 hover:text-indigo-600">
                <ArrowLeft className="w-3 h-3 mr-1.5" /> Re-scan
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
               <div className="divide-y divide-slate-50">
                 {previewItems.map((item, i) => (
                   <div key={i} className={`flex items-center justify-between p-5 transition-all ${item.selected ? 'bg-white' : 'bg-slate-50/50 opacity-40 grayscale'}`}>
                     <div className="flex items-center gap-5">
                       <button 
                        onClick={() => setPreviewItems(prev => prev.map(p => p.id === item.id ? { ...p, selected: !p.selected } : p))}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                       >
                         {item.selected && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                       </button>
                       <div>
                         <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1.5">{item.merchant}</p>
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.date}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">{item.category}</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className={`text-base font-black tabular-nums tracking-tighter ${item.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                         {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                       {item.isDuplicate && (
                         <div className="flex items-center justify-end gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Already in Ledger</span>
                         </div>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            </ScrollArea>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</span>
                  <span className="text-xs font-black text-slate-900">{previewItems.filter(p => p.selected).length} Selected for import</span>
               </div>
               <Button 
                onClick={handleCommitImport} 
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-12 h-12 rounded-2xl shadow-xl shadow-indigo-100"
               >
                 {isProcessing ? "Finalising..." : "Confirm & Commit"}
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SmartImporter;
