import React, { useEffect } from 'react'
// Deployment Trigger: Institutional Hardening v4.2.1
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AuthCallback from '@/pages/AuthCallback';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useToast } from '@/components/ui/use-toast';
import AuthGuard from '@/components/AuthGuard';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

import { ReportProvider } from '@/lib/ReportContext';

function App() {
  console.log("[PHASE 0] App Component Initializing");
  
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

const MainContent = () => {
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, checkAppState, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 0. Domain Normalization Guard (Force WWW)
  useEffect(() => {
    const hostname = window.location.hostname;
    // If on wealthlens.info (no www), force redirect to www
    if (hostname === 'wealthlens.info') {
      console.log("[App] Normalizing domain: Redirecting to www.wealthlens.info");
      window.location.replace('https://www.wealthlens.info' + window.location.pathname + window.location.search + window.location.hash);
    }
  }, []);

  // 0. High-Priority Recovery Interceptor (Deep Freeze & Vault)
  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const hasToken = hash.includes('type=recovery') || hash.includes('access_token=') || search.includes('type=recovery') || search.includes('access_token=') || search.includes('code=');

    if (hasToken) {
      console.log("[App] CRITICAL: Recovery token detected. Vaulting and Freezing.");
      // Lock the token in a PERMANENT vault (localStorage) to survive reloads/domain shifts
      localStorage.setItem('recovery_vault_v2', hash + search);
      
      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath !== '/resetpassword') {
        window.location.replace('/ResetPassword');
      }
    }
  }, []);

  // 1. Handle Successful Upgrade
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      toast({
        title: "Upgrade Successful",
        description: "Welcome to WealthLens Pro! All institutional reports and tools are now unlocked.",
        className: "bg-slate-900 text-white border-slate-800",
      });
      checkAppState();
    }
  }, [checkAppState, toast]);

  // 2. Redirect Authenticated Users from Landing Pages to Dashboard
  // This is the ONLY top-level redirect allowed. It is guarded by sessionStorage to prevent loops.
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated && user) {
        const path = window.location.pathname.toLowerCase();
        const isLandingPage = path === '/' || path === '' || path === '/login';
        const isResetPage = path === '/resetpassword';
        
        if (isLandingPage && !isResetPage) {
            const hasRedirected = sessionStorage.getItem('wl_init_redirect');
            if (hasRedirected === 'true' && path !== '/login') return;

            console.log("[App] Guarded Redirect for", isAdmin ? "Admin" : "User", "from", path);
            sessionStorage.setItem('wl_init_redirect', 'true');
            
            const targetPath = isAdmin ? '/AdminDashboard' : '/Dashboard';
            if (window.location.pathname.toLowerCase() !== targetPath.toLowerCase()) {
              navigate(targetPath, { replace: true });
            }
        }
    }
  }, [isAuthenticated, user, isLoadingAuth, navigate, isAdmin]);

  const isPublicPage = (path) => [
    '/login', '/auth/callback', '/about', '/methodology', '/contact', 
    '/privacypolicy', '/termsofuse', '/disclaimer', '/assumptions', 
    '/cookiepolicy', '/securitypolicy', '/', '/testimonials', '/resetpassword'
  ].includes(path.toLowerCase());

  // 3. Global Loading State (Public Pages only)
  if ((isLoadingPublicSettings || isLoadingAuth) && isPublicPage(window.location.pathname) && !isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 4. Critical Errors
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <ReportProvider>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Landing Page Route */}
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        
        {/* Dynamically Generated Routes */}
        {Object.entries(Pages).map(([path, Page]) => {
            const pathLower = path.toLowerCase();
            const needsAuth = !isPublicPage(`/${pathLower}`);
            
            return (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  needsAuth ? (
                    <AuthGuard>
                      <LayoutWrapper currentPageName={path}>
                        <Page />
                      </LayoutWrapper>
                    </AuthGuard>
                  ) : (
                    path === "ResetPassword" ? (
                      <Page />
                    ) : (
                      <LayoutWrapper currentPageName={path}>
                        <Page />
                      </LayoutWrapper>
                    )
                  )
                }
              />
            );
        })}
        
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ReportProvider>
  );
};

export default App;
