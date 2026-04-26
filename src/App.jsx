import React, { useEffect } from 'react'
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
import { Sparkles } from 'lucide-react';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

import { ReportProvider } from '@/lib/ReportContext';

function App() {
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
  const { user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, checkAppState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Listen for successful upgrade redirect
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

  // Redirect authenticated users from landing pages to dashboard
  useEffect(() => {
    console.log("[App] Auth State Check:", { isLoadingAuth, isAuthenticated, hasUser: !!user, path: window.location.pathname });
    if (!isLoadingAuth && isAuthenticated && user) {
        const path = window.location.pathname;
        const currentPath = path.toLowerCase();
        
        // Only redirect if we are strictly on the landing page or login page
        // AND not already on a path that starts with /dashboard
        const isLandingPage = currentPath === '/' || currentPath === '' || currentPath === '/login';
        
        if (isLandingPage) {
            // Self-Healing Loop Protector: If we redirect too many times, clear storage
            const redirectCount = parseInt(sessionStorage.getItem('wl_redirect_count') || '0');
            if (redirectCount > 5) {
                console.error("[Auth] Critical Loop Detected. Performing hard reset.");
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
                return;
            }
            sessionStorage.setItem('wl_redirect_count', (redirectCount + 1).toString());

            // Check if we've already redirected in this specific session window to prevent loops
            const hasRedirected = sessionStorage.getItem('wl_init_redirect');
            if (hasRedirected === 'true' && currentPath !== '/login') {
                console.log("[App] Blocked redundant redirect to Dashboard");
                return;
            }

            console.log("[App] Executing redirect to Dashboard from", path);
            sessionStorage.setItem('wl_init_redirect', 'true');
            
            // Final safety: Only navigate if we aren't already there
            if (window.location.pathname.toLowerCase() !== '/dashboard') {
              navigate('/Dashboard', { replace: true });
            }
        }
    }
  }, [isAuthenticated, user, isLoadingAuth, navigate]);

  const isPublicPage = ['/login', '/auth/callback', '/about', '/methodology', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/assumptions', '/cookie-policy', '/security-policy', '/'].includes(window.location.pathname.toLowerCase());

  // Show loading spinner while checking app public settings or auth
  if ((isLoadingPublicSettings || isLoadingAuth) && isPublicPage && !isAuthenticated) {
    console.log("[App] Showing Spinner (Public Page + Loading)");
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  const currentPath = window.location.pathname.toLowerCase();
  const isHomePage = currentPath === '/' || currentPath === '';

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only redirect if it's not a public page or home page
      if (!isPublicPage && !isHomePage) {
        if (window.location.pathname.toLowerCase() !== '/login') {
          console.log("[App] Redirecting to Login due to auth_required");
          navigateToLogin();
        }
        return null;
      }
    }
  }

  // Render the main app
  return (
    <ReportProvider>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        } />
        
        {Object.entries(Pages).map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ))}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ReportProvider>
  );
};

export default App;
