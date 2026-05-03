import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calculator, 
  Wallet, 
  LineChart,
  Shield,
  Settings,
  HelpCircle,
  Menu,
  LogOut,
  Calendar,
  BarChart3,
  ArrowRightLeft,
  Building2,
  LineChart as TrendsIcon,
  FileText,
  Sparkles,
  Target,
  Palmtree,
  Layers,
  Table2,
  TrendingUp,
  BookOpen,
  Lock,
  Crown,
  Trash2
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import IntelligenceDialog from "../intelligence/IntelligenceDialog";
import SupportDialog from "../intelligence/SupportDialog";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function Sidebar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const { logout, isAuthenticated, user, isPaidUser, isAdmin } = useAuth();

  const isActive = (path, tab) => {
    if (tab) return location.pathname === path && currentTab === tab;
    return location.pathname === path && !currentTab;
  };

  const [familyBudgetOpen, setFamilyBudgetOpen] = React.useState(
    location.pathname.includes('FamilyBudget') || location.pathname.includes('SetBudget')
  );

  const [calculatorOpen, setCalculatorOpen] = React.useState(
    location.pathname.includes('Calculator')
  );

  const [intelOpen, setIntelOpen] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen overflow-y-auto shrink-0 z-10 transition-all">
      {/* Sidebar Branding - Top Padding */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-medium text-lg">W</div>
          <span className="text-sm font-serif font-medium text-slate-900 tracking-tight italic">Wealth<span className="text-orange-600">Lens</span></span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {isAdmin ? (
          <>
            <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 mb-4">Command center</p>
            <Link 
              to="/AdminDashboard" 
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/AdminDashboard') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
            >
              <LayoutDashboard className={`w-4 h-4 ${isActive('/AdminDashboard') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="text-xs font-medium uppercase tracking-widest">Global Analytics</span>
              {isActive('/AdminDashboard') && <div className="ml-auto w-1 h-4 bg-[#C5A059] rounded-full" />}
            </Link>
          </>
        ) : (
          <>
            <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 mb-4">Command center</p>
            
            <Link 
              to="/Dashboard" 
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/Dashboard') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
            >
              <LayoutDashboard className={`w-4 h-4 ${isActive('/Dashboard') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="text-xs font-medium uppercase tracking-widest">Dashboard</span>
              {isActive('/Dashboard') && <div className="ml-auto w-1 h-4 bg-[#C5A059] rounded-full" />}
            </Link>

            {/* Calculator with Analysis Suite */}
            <div className="space-y-1">
              <div 
                onClick={() => setCalculatorOpen(!calculatorOpen)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${location.pathname === '/Calculator' ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
              >
                <Calculator className={`w-4 h-4 ${location.pathname === '/Calculator' ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className="text-xs font-medium uppercase tracking-widest">Calculator</span>
                <Menu className={`ml-auto w-3 h-3 transition-transform ${calculatorOpen ? 'rotate-90' : ''}`} />
              </div>

              {calculatorOpen && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                  <Link 
                    to="/Calculator" 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/Calculator') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                  >
                    Overview
                  </Link>
                  
                  <div className="pt-2 pb-1 px-4">
                    <p className="text-[8px] font-medium text-slate-400 uppercase tracking-[0.2em]">Analysis Suite</p>
                  </div>

                  {[
                    { id: "coach", label: "AI Coach", icon: Sparkles },
                    { id: "pillars", label: "8-Pillars", icon: BarChart3 },
                    { id: "fairvalue", label: "Fair Value", icon: Target },
                    { id: "retirement", label: "Retirement", icon: Palmtree },
                    { id: "chart", label: "Growth Chart", icon: LineChart },
                    { id: "market", label: "Market analysis", icon: TrendingUp },
                    { id: "tax", label: "Tax Strategies", icon: Shield },
                    { id: "scenarios", label: "Scenarios", icon: Layers },
                    { id: "table", label: "Breakdown", icon: Table2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.id}
                        to={isPaidUser ? `/Calculator?tab=${item.id}` : "#"} 
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/Calculator', item.id) ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                        onClick={(e) => {
                          if (!isPaidUser) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Icon className="w-3 h-3" />
                        {item.label}
                        {!isPaidUser && <Lock className="ml-auto w-2.5 h-2.5 text-gray-700" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            
            <Link 
              to="/Portfolio" 
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/Portfolio') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
            >
              <Wallet className={`w-4 h-4 ${isActive('/Portfolio') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span className="text-xs font-medium uppercase tracking-widest">Portfolio</span>
              {isActive('/Portfolio') && <div className="ml-auto w-1 h-4 bg-[#C5A059] rounded-full" />}
            </Link>
            
            <div className="space-y-1">
              <div 
                onClick={() => setFamilyBudgetOpen(!familyBudgetOpen)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive('/FamilyBudget') || isActive('/SetBudget') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'}`}
              >
                <LineChart className={`w-4 h-4 ${isActive('/FamilyBudget') || isActive('/SetBudget') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className="text-xs font-medium uppercase tracking-widest">Family Budget</span>
                <Menu className={`ml-auto w-3 h-3 transition-transform ${familyBudgetOpen ? 'rotate-90' : ''}`} />
              </div>

              {familyBudgetOpen && (
                <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                  <Link 
                    to="/FamilyBudget" 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/FamilyBudget') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                  >
                    Overview
                  </Link>
                  <Link 
                    to="/SetBudget" 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/SetBudget') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                  >
                    Set Budget
                  </Link>
                  <Link 
                    to="/BudgetCalendar" 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/BudgetCalendar') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                  >
                    Calendar
                  </Link>
                  <Link 
                    to="/Transactions" 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/Transactions') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-900/5'}`}
                  >
                    Transactions
                  </Link>
                </div>
              )}
            </div>

            {/* Intelligence Reports Section */}
            <div className="pt-8">
              <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 mb-4">Intelligence Reports</p>
              <div className="space-y-1">
                {[
                  { to: "/reports/IncomeExpense", icon: BarChart3, label: "Income & Expense" },
                  { to: "/reports/Cashflows", icon: ArrowRightLeft, label: "Cashflows" },
                  { to: "/reports/NetWorth", icon: Building2, label: "Net Worth" },
                  { to: "/reports/Trends", icon: TrendsIcon, label: "Trends" },
                  { to: "/reports/Digest", icon: FileText, label: "Digest" },
                  { to: "/reports/AIReports", icon: Sparkles, label: "AI Insights" },
                ].map((item) => (
                  <Link 
                    key={item.to}
                    to={isPaidUser ? item.to : "#"} 
                    onClick={(e) => {
                      if (!isPaidUser) {
                        e.preventDefault();
                        toast.error("Pro Feature", {
                          description: "This advanced reporting module is reserved for Pro members."
                        });
                      }
                    }}
                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive(item.to) ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-slate-500 hover:text-slate-900 hover:bg-[#C5A059]/5'}`}
                  >
                    <item.icon className={`w-3.5 h-3.5 ${isActive(item.to) ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-[#C5A059]'}`} />
                    <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
                    {!isPaidUser && <Lock className="ml-auto w-2.5 h-2.5 text-slate-400" />}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Systems Section (Visible to all) */}
      <nav className="px-4 space-y-1">
        <div className="pt-8">
          <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-slate-400 mb-4">Intelligence</p>
          <div className="space-y-1">
              <Link 
                 to="/PrivacyProtocol"
                 className={`flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5 ${isActive('/PrivacyProtocol') ? 'bg-[#C5A059]/10 text-[#C5A059]' : ''}`}
              >
                 <Shield className={`w-4 h-4 ${isActive('/PrivacyProtocol') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-[#C5A059]'}`} />
                 <span className="text-[10px] font-medium uppercase tracking-widest">Privacy Protocol</span>
              </Link>

              <Link 
                 to="/HelpCenter"
                 className={`flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5 ${isActive('/HelpCenter') ? 'bg-[#C5A059]/10 text-[#C5A059]' : ''}`}
              >
                 <BookOpen className={`w-4 h-4 ${isActive('/HelpCenter') ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-[#C5A059]'}`} />
                 <span className="text-[10px] font-medium uppercase tracking-widest">Documentation</span>
              </Link>

              <Link 
                 to="/DataMaintenance"
                 className={`flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-slate-900/5 ${isActive('/DataMaintenance') ? 'bg-rose-500/10 text-rose-500' : ''}`}
              >
                 <Trash2 className={`w-4 h-4 ${isActive('/DataMaintenance') ? 'text-rose-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                 <span className="text-[10px] font-medium uppercase tracking-widest">Maintenance Hub</span>
              </Link>

              <div 
                 onClick={() => {
                    if (isPaidUser) {
                      setIntelOpen(true);
                    } else {
                      toast.error("Pro Feature", {
                        description: "Configuring the AI Brain is reserved for Pro members."
                      });
                    }
                 }}
                 className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5"
              >
                 <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-[#C5A059]" />
                 <span className="text-[10px] font-medium uppercase tracking-widest">Configure Brain</span>
                 {!isPaidUser && <Lock className="ml-auto w-2.5 h-2.5 text-slate-400" />}
              </div>

              <div 
                 onClick={() => setSupportOpen(true)}
                 className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5"
              >
                 <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#C5A059]" />
                 <span className="text-[10px] font-medium uppercase tracking-widest">Direct Support</span>
              </div>
             
             {isAdmin && (
                <Link 
                   to="/AdminSettings"
                   className={`flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 cursor-pointer group rounded-xl transition-all hover:bg-slate-900/5 ${isActive('/AdminSettings') ? 'bg-amber-500/10 text-amber-600' : ''}`}
                >
                   <Settings className={`w-4 h-4 ${isActive('/AdminSettings') ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                   <span className="text-[10px] font-medium uppercase tracking-widest">Admin Control</span>
                </Link>
             )}

             {isAuthenticated && (
                <div 
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-[#C5A059] cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5 border border-transparent hover:border-[#C5A059]/10"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-[#C5A059]" />
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none">Terminal Exit</span>
                </div>
             )}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-slate-100 bg-white mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A059] to-[#E5C48B] flex items-center justify-center text-[10px] font-medium text-[#111827]">
            {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : (user?.email?.[0] || 'U')}
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest truncate max-w-[120px] flex items-center gap-1.5">
              {user?.full_name || user?.email?.split('@')[0] || "User"}
              {(isPaidUser || isAdmin) && <Crown className="w-2.5 h-2.5 text-[#C5A059] fill-[#C5A059]/20" />}
            </p>
            <p className="text-[9px] text-[#C5A059] uppercase tracking-tighter">
              {isAdmin ? 'System Admin' : (isPaidUser ? 'Pro Member' : 'Member')}
            </p>
            {!isPaidUser && !isAdmin && (
              <button 
                onClick={async () => {
                  try {
                    const u = user;
                    if (!u?.id || !u?.email) {
                      toast.error("Session Incomplete", { description: "Please log out and back in to refresh your account data." });
                      return;
                    }

                    const price = await base44.app.getPrice() || 10;
                    const response = await base44.functions.invoke('stripeCheckout', {
                      userId: u.id,
                      priceId: "price_1T7w6sJkmG8taKBQqIH4PxqD",
                      email: u.email.trim(),
                      amount: price,
                      successUrl: window.location.origin + "/Dashboard",
                      cancelUrl: window.location.origin + "/Dashboard"
                    });
                    if (response.data?.url) {
                      window.location.href = response.data.url;
                    } else {
                      const msg = response.error || "The server could not initialize your payment session.";
                      toast.error("Checkout failed", { description: msg });
                    }
                  } catch (err) {
                    toast.error("Checkout error", { description: "Payment gateway unavailable. Please try again later." });
                    console.error("Checkout Error:", err);
                  }
                }}
                className="text-[8px] font-black text-amber-400 hover:text-white uppercase tracking-[0.2em] mt-1 block animate-pulse hover:animate-none text-left"
              >
                Upgrade to PRO
              </button>
            )}
          </div>
        </div>
      </div>

      <IntelligenceDialog open={intelOpen} onOpenChange={setIntelOpen} />
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} userEmail={user?.email} />
    </aside>
  );
}
