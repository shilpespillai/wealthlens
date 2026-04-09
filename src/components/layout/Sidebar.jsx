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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const { logout, isAuthenticated } = useAuth();

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

  return (
    <aside className="w-64 bg-[#111827] border-r border-white/5 flex flex-col h-screen overflow-y-auto shrink-0 z-10 transition-all">
      {/* Sidebar Branding - Top Padding */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C5A059] rounded-lg flex items-center justify-center text-[#111827] font-medium text-lg">W</div>
          <span className="text-sm font-serif font-medium text-[#C5A059] tracking-tight italic">Wealth<span className="text-[#E5C48B]">Lens</span></span>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-gray-500 mb-4">Command center</p>
        
        <Link 
          to="/Dashboard" 
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/Dashboard') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <LayoutDashboard className={`w-4 h-4 ${isActive('/Dashboard') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-300'}`} />
          <span className="text-xs font-medium uppercase tracking-widest">Dashboard</span>
          {isActive('/Dashboard') && <div className="ml-auto w-1 h-4 bg-[#C5A059] rounded-full" />}
        </Link>

        {/* Calculator with Analysis Suite */}
        <div className="space-y-1">
          <div 
            onClick={() => setCalculatorOpen(!calculatorOpen)}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${location.pathname === '/Calculator' ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Calculator className={`w-4 h-4 ${location.pathname === '/Calculator' ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className="text-xs font-medium uppercase tracking-widest">Calculator</span>
            <Menu className={`ml-auto w-3 h-3 transition-transform ${calculatorOpen ? 'rotate-90' : ''}`} />
          </div>

          {calculatorOpen && (
            <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
              <Link 
                to="/Calculator" 
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/Calculator') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Overview
              </Link>
              
              <div className="pt-2 pb-1 px-4">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em]">Analysis Suite</p>
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
                    to={`/Calculator?tab=${item.id}`} 
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/Calculator', item.id) ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                  >
                    <Icon className="w-3 h-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        
        <Link 
          to="/Portfolio" 
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/Portfolio') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Wallet className={`w-4 h-4 ${isActive('/Portfolio') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-300'}`} />
          <span className="text-xs font-medium uppercase tracking-widest">Portfolio</span>
          {isActive('/Portfolio') && <div className="ml-auto w-1 h-4 bg-[#C5A059] rounded-full" />}
        </Link>
        
        <div className="space-y-1">
          <div 
            onClick={() => setFamilyBudgetOpen(!familyBudgetOpen)}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${isActive('/FamilyBudget') || isActive('/SetBudget') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LineChart className={`w-4 h-4 ${isActive('/FamilyBudget') || isActive('/SetBudget') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className="text-xs font-medium uppercase tracking-widest">Family Budget</span>
            <Menu className={`ml-auto w-3 h-3 transition-transform ${familyBudgetOpen ? 'rotate-90' : ''}`} />
          </div>

          {familyBudgetOpen && (
            <div className="ml-4 pl-4 border-l border-white/5 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
              <Link 
                to="/FamilyBudget" 
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/FamilyBudget') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Overview
              </Link>
              <Link 
                to="/SetBudget" 
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/SetBudget') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Set Budget
              </Link>
              <Link 
                to="/BudgetCalendar" 
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-widest transition-all ${isActive('/BudgetCalendar') ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
              >
                Calendar
              </Link>
            </div>
          )}
        </div>

        {/* Intelligence Reports Section */}
        <div className="pt-8">
          <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-gray-500 mb-4">Intelligence Reports</p>
          <div className="space-y-1">
            <Link 
              to="/reports/IncomeExpense" 
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive('/reports/IncomeExpense') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${isActive('/reports/IncomeExpense') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">Income & Expense</span>
            </Link>

            <Link 
              to="/reports/Cashflows" 
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive('/reports/Cashflows') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <ArrowRightLeft className={`w-3.5 h-3.5 ${isActive('/reports/Cashflows') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">Cashflows</span>
            </Link>

            <Link 
              to="/reports/NetWorth" 
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive('/reports/NetWorth') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Building2 className={`w-3.5 h-3.5 ${isActive('/reports/NetWorth') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">Net Worth</span>
            </Link>

            <Link 
              to="/reports/Trends" 
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive('/reports/Trends') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <TrendsIcon className={`w-3.5 h-3.5 ${isActive('/reports/Trends') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">Trends</span>
            </Link>

            <Link 
              to="/reports/Digest" 
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive('/reports/Digest') ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileText className={`w-3.5 h-3.5 ${isActive('/reports/Digest') ? 'text-[#C5A059]' : 'text-gray-500 group-hover:text-gray-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-widest">Digest</span>
            </Link>
          </div>
        </div>

        {/* Intelligence & Systems Section */}
        <div className="pt-8">
          <p className="px-4 text-[10px] uppercase font-medium tracking-[0.2em] text-gray-500 mb-4">Intelligence</p>
          <div className="space-y-1">
             <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white cursor-pointer group rounded-xl transition-all hover:bg-white/5">
                <Shield className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                <span className="text-[10px] font-medium uppercase tracking-widest">Privacy Protocol</span>
             </div>
             
             {isAuthenticated && (
                <div 
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-4 py-3 text-[#C5A059]/80 hover:text-[#C5A059] cursor-pointer group rounded-xl transition-all hover:bg-[#C5A059]/5 border border-transparent hover:border-[#C5A059]/10"
                >
                  <LogOut className="w-4 h-4 text-[#C5A059]/60 group-hover:text-[#C5A059]" />
                  <span className="text-[10px] font-medium uppercase tracking-widest leading-none">Terminal Exit</span>
                </div>
             )}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C5A059] to-[#E5C48B] flex items-center justify-center text-[10px] font-medium text-[#111827]">JD</div>
          <div>
            <p className="text-[10px] font-medium text-white uppercase tracking-widest">John Doe</p>
            <p className="text-[9px] text-[#C5A059] uppercase tracking-tighter">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
