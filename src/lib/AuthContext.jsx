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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Unified user mapping with premium check
  const mapUserWithPremium = React.useCallback(async (supabaseUser) => {
    if (!supabaseUser) return null;
    
    // 1. FAST PATH: Check user_metadata first (Instant, zero DB query)
    let dbIsPremium = !!supabaseUser.user_metadata?.is_premium;
    
    // 2. FALLBACK: Check public users table for legacy users who haven't migrated to metadata yet
    if (!dbIsPremium) {
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('is_premium')
          .or(`id.eq.${supabaseUser.id},email.eq.${supabaseUser.email}`)
          .maybeSingle();
        dbIsPremium = !!dbUser?.is_premium;
      } catch (e) {
        console.warn("Premium legacy fallback check failed:", e);
      }
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
      provider: supabaseUser.app_metadata?.provider || 'supabase',
      avatar: supabaseUser.user_metadata?.avatar_url,
      subscription_tier: dbIsPremium ? 'pro' : (supabaseUser.user_metadata?.subscription_tier || 'free'),
      is_premium: dbIsPremium,
      stripe_customer_id: supabaseUser.user_metadata?.stripe_customer_id,
      ...supabaseUser.user_metadata,
    };
  }, []);

  const checkAppState = React.useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAppPublicSettings({ id: appParams.appId, public_settings: {} });
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('AppState error:', error);
      setIsLoadingPublicSettings(false);
    }
  }, []);

  useEffect(() => {
    let authSubscription = null;
    
    async function initAuth() {
      try {
        await checkAppState();
        
        if (isSupabaseEnabled) {
          // 1. Get initial session immediately
          try {
            const result = await supabase.auth.getSession();
            const initialSession = result?.data?.session;
            if (initialSession?.user) {
              const mappedUser = await mapUserWithPremium(initialSession.user);
              setUser(mappedUser);
              setIsAuthenticated(true);
              localStorage.setItem('mockUser', JSON.stringify(mappedUser));
            }
          } catch (e) {
            console.warn("[Auth] Initial session check failed:", e);
          }

          // 2. Setup listener for future changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const mappedUser = await mapUserWithPremium(session.user);
              setUser(mappedUser);
              setIsAuthenticated(true);
              localStorage.setItem('mockUser', JSON.stringify(mappedUser));
              setAuthError(null);
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
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    initAuth();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [mapUserWithPremium, checkAppState]);

  const logout = async () => {
    setIsLoggingOut(true); // Flag immediately so AuthGuard shows spinner, not "Terminal Locked"
    if (isSupabaseEnabled) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }

    localStorage.removeItem('mockUser');
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    
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
      isLoggingOut,
      authError,
      appPublicSettings,
      isPaidUser: (
        user?.subscription_tier === 'pro' || 
        user?.subscription_tier === 'premium' || 
        user?.is_premium === true ||
        user?.email === 'admin@wealthlens.com'
      ),
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
