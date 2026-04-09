import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    // Initial state check
    checkAppState();

    // Listen for Supabase auth changes
    let authSubscription = null;
    if (isSupabaseEnabled) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        if (session?.user) {
          const mappedUser = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            provider: session.user.app_metadata?.provider || 'supabase',
            avatar: session.user.user_metadata?.avatar_url,
            ...session.user.user_metadata,
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
          setAuthError(null);
          localStorage.setItem('mockUser', JSON.stringify(mappedUser));

          // If we are on the home page and a session is detected, redirect to the dashboard
          // This catches cases where the OAuth redirect lands on / instead of /auth/callback
          if (window.location.pathname === '/' || window.location.pathname === '' || window.location.hash.includes('access_token=')) {
            console.log('Detected session on home page, pushing to Dashboard...');
            setTimeout(() => {
               // Use origin to ensure we strip codes/hashes from the URL
               window.location.href = window.location.origin + '/Dashboard';
            }, 300);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('mockUser');
          if (event === 'SIGNED_OUT') {
            setAuthError({ type: 'auth_required', message: 'Signed out successfully' });
          }
        }
        setIsLoadingAuth(false);
      });
      authSubscription = subscription;
    }

    // Safety: Clear mockUser if in production to prevent interference
    if (import.meta.env.PROD) {
      localStorage.removeItem('mockUser');
    }

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAppPublicSettings({ id: appParams.appId, public_settings: {} });
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('AppState error:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const mappedUser = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            provider: session.user.app_metadata?.provider || 'supabase',
            avatar: session.user.user_metadata?.avatar_url,
            ...session.user.user_metadata,
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
          localStorage.setItem('mockUser', JSON.stringify(mappedUser));
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
        }
      } else {
        // purely mock fallback — only in dev
        if (!import.meta.env.PROD) {
          const localUser = await base44.auth.me();
          if (localUser) {
            setUser(localUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async () => {
    console.log('--- NUKE LOGOUT INITIATED ---');
    
    if (isSupabaseEnabled) {
      try {
        await supabase.auth.signOut();
        console.log('Supabase signOut() called');
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }

    // 1. Clear LocalStorage
    const keysToRemove = [
      'mockUser', 
      'token', 
      'base44_token', 
      'base44_access_token', 
      'base44_mock_user'
    ];
    
    // Also clear all Supabase specific keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase.auth.token') || key.startsWith('sb-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      console.log(`Cleared localStorage: ${k}`);
    });

    // 2. Clear SessionStorage
    sessionStorage.clear();
    console.log('sessionStorage cleared');

    // 3. Set Context State
    setUser(null);
    setIsAuthenticated(false);

    // 4. Force Cookie Clearing (Best Effort)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log('Cookies cleared');

    // 5. Hard Refresh to absolute root to ensure all state is wiped
    console.log('Redirecting to Home with hard refresh...');
    
    // Small delay to allow state to settle before the browser kills the process
    setTimeout(() => {
        window.location.href = '/';
    }, 100);
  };

  const navigateToLogin = (returnUrl) => {
    const url = new URL('/login', window.location.origin);
    if (returnUrl) {
      url.searchParams.set('redirect_to', returnUrl);
    } else if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
      url.searchParams.set('redirect_to', window.location.pathname);
    }
    window.location.href = url.toString();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
