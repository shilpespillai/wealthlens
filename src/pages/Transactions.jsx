import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Download, 
  Filter, 
  MoreHorizontal, 
  ChevronRight, 
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Tag,
  Search as SearchIcon,
  User,
  Settings,
  HelpCircle,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  Wrench,
  ExternalLink,
  Edit2
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/AuthGuard";

// --- Mock Data ---

const MOCK_TRANSACTIONS = [
  { id: 1, date: "Mar 18", merchant: "Payment Received, thank you", amount: 160.00, category: "Repay Credit Card", account: "Sample Credit Card", balance: -2345.54, status: "confirmed", type: "income" },
  { id: 2, date: "Mar 18", merchant: "Payment to Visa xxxx-1234", amount: -180.00, category: "Repay Credit Card", account: "Sample Bank Account", balance: 3555.45, status: "confirmed", type: "expense" },
  { id: 3, date: "Mar 18", merchant: "Momotea", amount: -9.80, category: "Eating Out", account: "Sample Bank Account", balance: 3715.45, status: "uncategorized", type: "expense" },
  { id: 4, date: "Mar 18", merchant: "Esquires Lorne Street Cafe", amount: -9.40, category: "Eating Out", account: "Sample Bank Account", balance: 3725.25, status: "confirmed", type: "expense" },
  { id: 5, date: "Mar 17", merchant: "Nol Bu Ne Restaurant", amount: -26.00, category: "Eating Out", account: "Sample Bank Account", balance: 3734.65, status: "confirmed", type: "expense", note: "Finding this place was a little scary due to how hidden it is. But service was prompt, prices are cheap and the food is decent!" },
  { id: 6, date: "Mar 17", merchant: "Velluto Cafe", amount: -4.20, category: "Eating Out", account: "Sample Bank Account", balance: 3760.65, status: "confirmed", type: "expense" },
  { id: 7, date: "Mar 17", merchant: "Countdown Dunedin", amount: -24.00, category: "Groceries", account: "Sample Bank Account", balance: 3764.85, status: "confirmed", type: "expense", note: "First time making my own hot sauce. Simple and delicious!" },
  { id: 8, date: "Mar 15", merchant: "The Point Cafe & Bar Balclutha", amount: -17.70, category: "Eating Out", account: "Sample Bank Account", balance: 3788.85, status: "confirmed", type: "expense" },
  { id: 9, date: "Mar 14", merchant: "Netflix Subscription", amount: -19.99, category: "Entertainment", account: "Sample Credit Card", balance: -2505.54, status: "confirmed", type: "expense" },
  { id: 10, date: "Mar 14", merchant: "Weekly Salary", amount: 2400.00, category: "Salary", account: "Sample Bank Account", balance: 6188.85, status: "confirmed", type: "income" },
  { id: 11, date: "Mar 13", merchant: "Shell Gas Station", amount: -85.00, category: "Transport", account: "Sample Bank Account", balance: 3788.85, status: "awaiting", type: "expense" },
  { id: 12, date: "Mar 12", merchant: "Amazon Prime", amount: -12.99, category: "Entertainment", account: "Sample Credit Card", balance: -2525.53, status: "confirmed", type: "expense" },
  // Adding more to reach a "robust" feel
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: 13 + i,
    date: `Mar ${Math.max(1, 12 - Math.floor(i/4))}`,
    merchant: ["Uber", "Starbucks", "Gym Membership", "Internet Provider", "Water utility", "Rent Payment"][i % 6],
    amount: -[15.00, 5.50, 60.00, 80.00, 45.00, 1800.00][i % 6],
    category: ["Transport", "Eating Out", "Health", "Utilities", "Utilities", "Fixed"][i % 6],
    account: i % 2 === 0 ? "Sample Bank Account" : "Sample Credit Card",
    balance: 3000 - (i * 50),
    status: i % 10 === 0 ? "uncategorized" : (i % 7 === 0 ? "awaiting" : "confirmed"),
    type: "expense"
  }))
];

const SIDEBAR_ITEMS = [
  { id: "all", label: "All transactions", count: 213, icon: List, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "uncategorized", label: "Uncategorized items", count: 3, icon: Tag, color: "text-orange-600", bg: "bg-orange-50" },
  { id: "awaiting", label: "Awaiting confirmation", count: 19, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
];

const ACCOUNTS = [
  { name: "Sample Bank Account", balance: 3547.45, color: "bg-rose-500" },
  { name: "Sample Credit Card", balance: -2345.54, color: "bg-rose-500" },
];

const CATEGORIES = [
  "Salary and Wages", "Eating Out", "Groceries", "Entertainment", "Transport", "Utilities", "Health", "Fixed"
];

function TransactionsContent() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState("25");

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTab === "uncategorized") return matchesSearch && tx.status === "uncategorized";
      if (selectedTab === "awaiting") return matchesSearch && tx.status === "awaiting";
      return matchesSearch;
    });
  }, [selectedTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Header - Institutional Grade */}
      <header className="h-14 bg-[#5e1d8d] flex items-center justify-between px-6 shrink-0 transition-all">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-lg font-medium tracking-tight">Transactions</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              className="bg-white/10 text-white text-xs rounded-full py-1.5 pl-9 pr-4 w-64 outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
            />
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <LayoutGrid className="w-4 h-4 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Secondary Sidebar */}
        <aside className="w-72 bg-[#f8f9fa] border-r border-slate-200 overflow-y-auto p-4 flex flex-col gap-8 shrink-0">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Overview</p>
            <div className="space-y-1">
              <div className="bg-slate-200/50 rounded-lg p-3 border border-slate-200 mb-4">
                <div className="flex justify-between items-center px-1">
                   <span className="text-xs font-medium text-slate-500">Sum total</span>
                   <span className="text-sm font-bold text-slate-700">($1,106.79)</span>
                </div>
              </div>

              {SIDEBAR_ITEMS.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${selectedTab === item.id ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${selectedTab === item.id ? 'text-white' : item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved searches</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {["All uncategorised", "Craft beer", "Good food", "Healthcare", "London", "Bargains"].map(s => (
                <button key={s} className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all flex items-center gap-2">
                  <Search className="w-3 h-3 text-slate-300" /> {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accounts</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-2 px-2">
              {ACCOUNTS.map(acc => (
                <div key={acc.name} className="space-y-1 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${acc.color}`} />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{acc.name}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 tabular-nums ml-5">
                    {acc.balance < 0 ? `(${Math.abs(acc.balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : acc.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categories</p>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </div>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button key={c} className="w-full text-left px-4 py-1.5 text-xs text-slate-500 hover:text-purple-600 transition-colors truncate">
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Action Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 text-xs font-bold border-slate-200">
                      <Plus className="w-4 h-4 text-slate-500" /> Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" /> Add manually
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Download className="w-4 h-4" /> Import file
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Modals are handled separately by their content */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>Enter the details of the transaction below.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-xs font-bold">Merchant</label>
                      <Input placeholder="Esquires Cafe" className="col-span-3 h-9" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-xs font-bold">Amount</label>
                      <Input type="number" placeholder="0.00" className="col-span-3 h-9" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right text-xs font-bold">Date</label>
                      <Input type="date" className="col-span-3 h-9" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Transaction</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" className="h-9 gap-2 text-xs font-bold text-slate-500">
                <Wrench className="w-4 h-4" /> Tools
              </Button>
              <Button variant="ghost" className="h-9 gap-2 text-xs font-bold text-slate-500">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Show</span>
                 <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
                   <SelectTrigger className="h-8 w-20 text-[10px] font-bold">
                     <SelectValue placeholder="25" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="10">10 entries</SelectItem>
                     <SelectItem value="25">25 entries</SelectItem>
                     <SelectItem value="50">50 entries</SelectItem>
                     <SelectItem value="100">100 entries</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                <button className="p-1.5 hover:bg-slate-50 transition-colors border-r border-slate-200 disabled:opacity-30" disabled>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button className="p-1.5 hover:bg-slate-50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="px-2">Showing 1-{Math.min(filteredTransactions.length, parseInt(entriesPerPage))} of {filteredTransactions.length} transactions.</span>
            {selectedTransactions.length > 0 && (
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-bold shadow-sm shadow-purple-100 animate-in zoom-in-50">
                {selectedTransactions.length} selected
              </span>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-[#fcfcfc] border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[50px] p-4">
                    <Checkbox 
                      checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0} 
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[80px] p-4">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-slate-400 cursor-pointer hover:text-purple-600 transition-colors">
                    Date <span className="text-[8px] ml-1">▼</span>
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-slate-400">Merchant</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest p-4 text-slate-400">Amount</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-slate-400">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-slate-400">Account</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-widest p-4 text-slate-400">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, parseInt(entriesPerPage)).map((tx) => (
                  <React.Fragment key={tx.id}>
                    <TableRow className={`group transition-colors ${selectedTransactions.includes(tx.id) ? 'bg-purple-50/50' : 'hover:bg-slate-50/50'}`}>
                      <TableCell className="p-4">
                        <Checkbox 
                          checked={selectedTransactions.includes(tx.id)} 
                          onCheckedChange={() => toggleSelect(tx.id)}
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded">
                                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 text-rose-600"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                           {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 whitespace-nowrap p-4">{tx.date}</TableCell>
                      <TableCell className="p-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.merchant}</span>
                          {tx.note && <span className="text-[11px] text-slate-500 mt-1.5 leading-relaxed max-w-md bg-slate-50 p-2 rounded-lg border border-slate-100">{tx.note}</span>}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right text-sm font-medium p-4 tabular-nums ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.amount < 0 ? `(${Math.abs(tx.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge variant="outline" className={`text-[10px] font-medium border-slate-200 bg-white px-2.5 py-0.5 whitespace-nowrap ${tx.status === 'uncategorized' ? 'text-orange-600 border-orange-100 bg-orange-50' : ''}`}>
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 p-4 whitespace-nowrap">{tx.account}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-400 p-4 tabular-nums">
                        {tx.balance < 0 ? `(${Math.abs(tx.balance).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})` : tx.balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <AuthGuard>
      <TransactionsContent />
    </AuthGuard>
  );
}
