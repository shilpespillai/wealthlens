import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { supabase, isSupabaseEnabled } from '@/lib/supabaseClient';

const AuthContext = createContext();

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

          // If we just landed with tokens in the hash on the home page, redirect to the calculator
          if (window.location.hash.includes('access_token=') && (window.location.pathname === '/' || window.location.pathname === '')) {
            // Use replaceState to clear the hash without a full reload if possible, 
            // but for Supabase it's safer to let the AuthCallback or a hard-redirect handle the transition
            // to ensure storage is synchronized.
            setTimeout(() => {
               window.location.href = '/Calculator';
            }, 500);
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
          // Check local storage mock fallback
          const localUser = await base44.auth.me();
          if (localUser) {
            setUser(localUser);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setAuthError({ type: 'auth_required', message: 'Authentication required' });
          }
        }
      } else {
        // purely mock fallback
        const localUser = await base44.auth.me();
        if (localUser) {
          setUser(localUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError({ type: 'auth_required', message: 'Authentication required' });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('mockUser');
    if (shouldRedirect) {
      window.location.replace('/');
    }
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
