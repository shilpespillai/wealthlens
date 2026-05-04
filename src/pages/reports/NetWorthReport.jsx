import React, { useState, useMemo, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Calendar as CalendarIcon,
  Wallet,
  Landmark,
  Car,
  CreditCard,
  Target,
  X,
  ArrowRightLeft,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths, subMonths, endOfMonth, isSameMonth } from "date-fns";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useFinancialParser } from "@/hooks/useFinancialParser";
import { useAuth } from "@/lib/AuthContext";
import PremiumOverlay from "@/components/layout/PremiumOverlay";
import { generateManualPdf } from "@/utils/generateManualPdf";
import { calculatePortfolioHoldings } from "@/api/portfolioEngine";

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const ASSET_COLORS = ['#10B981', '#06B6D4', '#6366F1', '#8B5CF6', '#F59E0B'];
const DEBT_COLORS  = ['#EF4444', '#F97316', '#475569', '#334155', '#94A3B8'];
const NW_COLORS    = ['#C5A059', '#1E293B'];

// Mock generation removed for production data integrity.

const INITIAL_ACCOUNTS = [];

export default function NetWorthReport() {
  const { isPaidUser } = useAuth();
  const { getProductionLedger, getDatabaseTable } = useFinancialParser();
  const { user: authUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to current month
  const [viewMode, setViewMode] = useState('networth'); // networth, assets, debt
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [addMode, setAddMode] = useState(null); 
  const [newAccount, setNewAccount] = useState({ name: '', category: 'Bank', value: '' });
  const [allTransactions, setAllTransactions] = useState([]);

  // Load from Production DB
  useEffect(() => {
    async function load() {
      const monthContext = format(selectedDate, 'yyyy-MM');
      const [rawAccounts, portfolioSnapshots] = await Promise.all([
        getDatabaseTable("user_accounts", { month: monthContext }),
        getDatabaseTable("portfolio_holdings", { month: monthContext })
      ]);

      // Deduplicate accounts by id
      const seenIds = new Set();
      const dbAccounts = (rawAccounts || []).filter(a => {
        if (seenIds.has(a.id)) return false;
        seenIds.add(a.id);
        return true;
      });

      // Map user_accounts fields: use base_balance as value, category from schema
      let merged = dbAccounts.map(a => ({
        ...a,
        value: Number(a.base_balance || 0)
      }));
      
      if (portfolioSnapshots && portfolioSnapshots.length > 0) {
        // Use intelligent Engine to get latest snapshot (handles JSONB flattening automatically)
        const latest = calculatePortfolioHoldings(portfolioSnapshots);
        
        const converted = latest.map(s => ({
          id: s.id,
          name: s.label || s.name,
          category: s.asset_class === 'property' ? 'Property' : 'Investments',
          type: 'asset',
          value: Number(s.current_value),
          mortgage: Number(s.mortgage_amount || 0)
        }));
        merged = [...merged, ...converted];
      }

      setAccounts(merged);

      const ledger = await getProductionLedger();
      setAllTransactions(ledger);
    }
    load();
  }, [getDatabaseTable, getProductionLedger, selectedDate]);

  // Unified Save
  const saveAccounts = async (updated) => {
    setAccounts(updated);
    // Note: We don't save to the vault anymore. 
    // Individual adds are handled in handleAddAccount via db.insertRow
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.value) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const accountData = {
      name: newAccount.name,
      category: newAccount.category,
      base_balance: parseFloat(newAccount.value),
      type: addMode,
      currency: 'AUD'
    };

    const loadingToast = toast.loading("Saving account...");
    const result = await base44.db.insertRow("user_accounts", accountData);

    if (result && !result.error) {
      setAccounts([...accounts, { ...result, value: Number(result.base_balance) }]);
      setNewAccount({ name: '', category: 'Bank', value: '' });
      setAddMode(null);
      toast.success(`${addMode === 'asset' ? 'Asset' : 'Debt'} added successfully`, { id: loadingToast });
    } else {
      toast.error("Failed to save account to database", { id: loadingToast });
    }
  };

  // Temporal Logic: Calculate Cumulative Surplus up to Selected Month
  const cumulativeSurplus = useMemo(() => {
    const endOfSelected = endOfMonth(selectedDate);
    return allTransactions
      .filter(t => new Date(t.date || t.actualDate) <= endOfSelected)
      .reduce((sum, t) => {
        const val = Math.abs(Number(t.amount || 0));
        const isIncome = t.type === 'income';
        return isIncome ? sum + val : sum - val;
      }, 0);
  }, [allTransactions, selectedDate]);

  // Adjust Bank Account only for visual display
  const temporalAccounts = useMemo(() => {
    return (accounts || []).map(a => {
      if (a.name === 'Primary Bank' || a.category === 'Bank') {
        const baseVal = Number(a.value || a.base_balance || 0);
        return { ...a, value: baseVal + cumulativeSurplus };
      }
      return { ...a, value: Number(a.value || a.base_balance || 0), mortgage: Number(a.mortgage || 0) };
    });
  }, [accounts, cumulativeSurplus]);

  const portfolioMortgages = useMemo(() => {
    return temporalAccounts.reduce((sum, a) => sum + (Number(a.mortgage) || 0), 0);
  }, [temporalAccounts]);

  const assets = temporalAccounts.filter(a => a.type === 'asset');
  const debts = temporalAccounts.filter(a => a.type === 'debt');
  
  const totalAssets = assets.reduce((s, a) => s + Math.abs(a.value || 0), 0);
  const totalDebts = debts.reduce((s, d) => s + Math.abs(d.value || 0), 0) + portfolioMortgages;
  const netWorth = totalAssets - totalDebts;

  const handleExportPDF = async () => {
    const element = document.getElementById("networth-export-area");
    if (!element) return;
    const loadingToast = toast.loading("Generating PDF snapshot...");
    try {
      await generateManualPdf(element, { filename: `WealthLens-NetWorth-${format(selectedDate, 'MMM-yyyy')}.pdf` });
      toast.success("PDF downloaded successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to generate PDF.", { id: loadingToast });
    }
  };

  const chartData = useMemo(() => {
    if (viewMode === 'assets') {
      const groups = assets.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + a.value;
        return acc;
      }, {});
      return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }
    if (viewMode === 'debt') {
      const groups = debts.reduce((acc, d) => {
        acc[d.category] = (acc[d.category] || 0) + d.value;
        return acc;
      }, {});
      return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }
    return [
      { name: 'Total Assets', value: totalAssets },
      { name: 'Total Debts', value: totalDebts }
    ];
  }, [temporalAccounts, viewMode, totalAssets, totalDebts]);

  const displayValue = viewMode === 'assets' ? totalAssets : viewMode === 'debt' ? totalDebts : netWorth;

  return (
    <div id="networth-export-area" className="flex flex-col min-h-screen bg-white font-sans overflow-x-hidden relative">
      {!isPaidUser && <PremiumOverlay featureName="Net Worth Intelligence" />}
      {/* Premium Header */}
      <div className="w-full px-2 pt-4 pb-2 bg-white z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
               <Building2 className="w-6 h-6 text-[#C5A059]" />
               <h1 className="text-xl font-bold text-slate-900 tracking-tight">Net Worth Breakdown</h1>
            </div>
            
            <div className="flex items-center gap-6">
               <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100 h-10 px-4 rounded-xl gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">
                      <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
                      {format(selectedDate, "MMMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-slate-100 shadow-2xl" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      initialFocus
                      className="bg-white"
                    />
                  </PopoverContent>
               </Popover>
               
               <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                  <button onClick={() => setSelectedDate(subMonths(selectedDate, 1))} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 border-r border-slate-100 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedDate(addMonths(selectedDate, 1))} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
               </div>

               <Button 
                  onClick={handleExportPDF}
                  variant="outline" 
                  className="bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 h-10 px-4 rounded-xl gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
               >
                 <Download className="w-4 h-4 text-[#C5A059]" />
                 Export
               </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto bg-[#F8F9FB] p-2">
        <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
           {/* Analysis View (Left Card) */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[32px] p-10 flex flex-col items-center shadow-xl relative overflow-hidden min-h-[600px]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-3xl opacity-50" />
             
             <div className="flex items-center bg-slate-50 rounded-xl p-1 mb-8 self-center shadow-sm border border-slate-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode('assets')}
                  className={cn("text-[10px] font-bold uppercase tracking-widest px-6 h-8 transition-all", viewMode === 'assets' ? "bg-slate-900 text-white shadow-md rounded-lg" : "text-slate-400")}
                >Assets</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode('networth')}
                  className={cn("text-[10px] font-bold uppercase tracking-widest px-6 h-8 transition-all", viewMode === 'networth' ? "bg-slate-900 text-white shadow-md rounded-lg" : "text-slate-400")}
                >Net Worth</Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode('debt')}
                  className={cn("text-[10px] font-bold uppercase tracking-widest px-6 h-8 transition-all", viewMode === 'debt' ? "bg-slate-900 text-white shadow-md rounded-lg" : "text-slate-400")}
                >Debt</Button>
             </div>

             <div className="text-center mb-8 relative z-10">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-1">{viewMode.toUpperCase()}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{formatCurrency(displayValue)}</p>
             </div>

             <div className="w-full h-[280px] mb-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => {
                          const palette = viewMode === 'assets' ? ASSET_COLORS : viewMode === 'debt' ? DEBT_COLORS : NW_COLORS;
                          return <Cell key={`cell-${index}`} fill={palette[index % palette.length]} stroke="rgba(255,255,255,0.1)" />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: '1px solid #F1F5F9', 
                          borderRadius: '16px', 
                          padding: '12px 16px',
                          color: '#0F172A', 
                          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)',
                          backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                   </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Global</span>
                  <span className="text-sm font-medium text-slate-800">{viewMode === 'debt' ? 'Liabilities' : 'Wealth'}</span>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-y-3 w-full">
                {chartData.map((item, idx) => {
                   const palette = viewMode === 'assets' ? ASSET_COLORS : viewMode === 'debt' ? DEBT_COLORS : NW_COLORS;
                   return (
                    <div key={idx} className="flex items-center justify-between bg-white/40 p-3 rounded-xl border border-white/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: palette[idx % palette.length] }} />
                          <span className="text-[10px] font-medium text-slate-600 uppercase tracking-widest leading-none">{item.name}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-800">{formatCurrency(item.value)}</span>
                    </div>
                   );
                })}
             </div>
          </div>

          {/* Breakdown List */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
             
             {/* Assets Column */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div>
                      <h2 className="text-xl font-medium text-slate-800 tracking-tight">Assets</h2>
                      <p className="text-[10px] uppercase font-medium text-teal-600 tracking-widest">What I Own</p>
                   </div>
                   <span className="text-lg font-medium text-teal-600">{formatCurrency(totalAssets)}</span>
                </div>

                <div className="space-y-4">
                   {assets.map(asset => (
                      <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group hover:border-[#C5A059]/40 transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                 {asset.category === 'Vehicles' ? <Car className="w-5 h-5" /> : asset.category === 'Bank' ? <Landmark className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-medium text-slate-800">{asset.name}</span>
                                 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{asset.category}</span>
                              </div>
                           </div>
                           <span className="text-sm font-medium text-slate-800">{formatCurrency(asset.value)}</span>
                        </div>
                      </div>
                   ))}

                   <Dialog open={addMode === 'asset'} onOpenChange={(val) => setAddMode(val ? 'asset' : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full h-14 bg-teal-50/50 hover:bg-teal-50 border border-dashed border-teal-200 text-teal-700 text-xs font-medium uppercase tracking-widest gap-3 rounded-2xl transition-all">
                          <Plus className="w-4 h-4" /> Add Asset
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white rounded-[24px]">
                        <DialogHeader>
                          <DialogTitle className="font-medium text-lg">Add New Asset</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Asset Name</Label>
                            <Input id="name" placeholder="e.g. Primary Residence" className="rounded-xl border-slate-200" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Category</Label>
                              <Select value={newAccount.category} onValueChange={(v) => setNewAccount({...newAccount, category: v})}>
                                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="Bank">Bank</SelectItem>
                                  <SelectItem value="Property">Property</SelectItem>
                                  <SelectItem value="Vehicles">Vehicles</SelectItem>
                                  <SelectItem value="Investments">Investments</SelectItem>
                                  <SelectItem value="Personal">Personal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="value" className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Current Value</Label>
                              <Input id="value" type="number" placeholder="50000" className="rounded-xl border-slate-200" value={newAccount.value} onChange={(e) => setNewAccount({...newAccount, value: e.target.value})} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddAccount} className="bg-[#C5A059] hover:bg-[#B38F4D] text-white font-medium uppercase tracking-widest px-8 rounded-xl h-11 transition-all">Save Asset</Button>
                        </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>
             </div>

             {/* Debts Column */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div>
                      <h2 className="text-xl font-medium text-slate-800 tracking-tight">Debts</h2>
                      <p className="text-[10px] uppercase font-medium text-rose-500 tracking-widest">What I Owe</p>
                   </div>
                   <span className="text-lg font-medium text-rose-500">({formatCurrency(totalDebts)})</span>
                </div>

                <div className="space-y-4">
                   {debts.map(debt => (
                      <div key={debt.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group hover:border-rose-300/40 transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                 {debt.category === 'Loans' ? <Landmark className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-medium text-slate-800">{debt.name}</span>
                                 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{debt.category}</span>
                              </div>
                           </div>
                           <span className="text-sm font-medium text-slate-800">({formatCurrency(debt.value)})</span>
                        </div>
                      </div>
                   ))}

                   {portfolioMortgages > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg group transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[#C5A059]">
                                 <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-medium text-white">Portfolio Mortgages</span>
                                 <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Secured Debt</span>
                              </div>
                           </div>
                           <span className="text-sm font-medium text-white">({formatCurrency(portfolioMortgages)})</span>
                        </div>
                      </div>
                   )}

                   <Dialog open={addMode === 'debt'} onOpenChange={(val) => setAddMode(val ? 'debt' : null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full h-14 bg-rose-50/50 hover:bg-rose-50 border border-dashed border-rose-200 text-rose-700 text-xs font-medium uppercase tracking-widest gap-3 rounded-2xl transition-all">
                          <Plus className="w-4 h-4" /> Add Debt
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white rounded-[24px]">
                        <DialogHeader>
                          <DialogTitle className="font-medium text-lg">Add New Debt</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="dname" className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Debt Name</Label>
                            <Input id="dname" placeholder="e.g. Student Loan" className="rounded-xl border-slate-200" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Category</Label>
                              <Select value={newAccount.category} onValueChange={(v) => setNewAccount({...newAccount, category: v})}>
                                <SelectTrigger className="rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="Loans">Loans</SelectItem>
                                  <SelectItem value="Credit Cards">Credit Cards</SelectItem>
                                  <SelectItem value="Mortgage">Mortgage</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="dvalue" className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Outstanding Balance</Label>
                              <Input id="dvalue" type="number" placeholder="2500" className="rounded-xl border-slate-200" value={newAccount.value} onChange={(e) => setNewAccount({...newAccount, value: e.target.value})} />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddAccount} className="bg-rose-600 hover:bg-rose-700 text-white font-medium uppercase tracking-widest px-8 rounded-xl h-11 transition-all">Save Debt</Button>
                        </DialogFooter>
                      </DialogContent>
                   </Dialog>
                </div>
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}
