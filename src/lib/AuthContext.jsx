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

  // Unified user mapping with premium check
  const mapUserWithPremium = React.useCallback(async (supabaseUser) => {
    if (!supabaseUser) return null;
    
    let dbIsPremium = false;
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('is_premium')
        .or(`id.eq.${supabaseUser.id},email.eq.${supabaseUser.email}`)
        .maybeSingle();
      dbIsPremium = !!dbUser?.is_premium;
    } catch (e) {
      console.warn("Premium check failed:", e);
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
      provider: supabaseUser.app_metadata?.provider || 'supabase',
      avatar: supabaseUser.user_metadata?.avatar_url,
      subscription_tier: dbIsPremium ? 'pro' : (supabaseUser.user_metadata?.subscription_tier || 'free'),
      is_premium: dbIsPremium,
      ...supabaseUser.user_metadata,
    };
  }, []);

  useEffect(() => {
    checkAppState();
    let authSubscription = null;
    
    if (isSupabaseEnabled) {
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
    } else {
      setIsLoadingAuth(false);
    }

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [mapUserWithPremium]);

  const checkUserAuth = React.useCallback(async () => {
    if (!isSupabaseEnabled) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser) {
        const mappedUser = await mapUserWithPremium(freshUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  }, [mapUserWithPremium]);

  const checkAppState = React.useCallback(async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAppPublicSettings({ id: appParams.appId, public_settings: {} });
      // We rely on the onAuthStateChange listener to handle the user session
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('AppState error:', error);
      setIsLoadingPublicSettings(false);
    }
  }, []);

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
