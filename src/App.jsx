import React, { useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
    if (!isLoadingAuth && isAuthenticated && user) {
        const currentPath = window.location.pathname.toLowerCase();
        const hash = window.location.hash;
        
        // Only redirect if we are on the landing page or login page
        const isLandingPage = currentPath === '/' || currentPath === '' || currentPath === '/login';
        const hasAuthHash = hash.includes('access_token=') || hash.includes('id_token=');

        if (isLandingPage || hasAuthHash) {
            // Clean the URL hash first to prevent the next render from seeing it as a new login
            if (hash) {
                window.history.replaceState(null, null, window.location.pathname);
            }
            
            // Perform the redirect
            window.location.href = '/Dashboard';
        }
    }
  }, [isAuthenticated, user, isLoadingAuth]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  const path = window.location.pathname.toLowerCase();
  const isPublicPage = ['/login', '/auth/callback', '/about', '/methodology', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/assumptions', '/cookie-policy', '/security-policy'].includes(path);
  const isHomePage = path === '/' || path === '';

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only redirect if it's not a public page or home page
      if (!isPublicPage && !isHomePage) {
        navigateToLogin();
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
