// Basiq API Adapter
// This file connects the frontend to the Basiq API via the Vite proxy (/basiq).

const BASIQ_API_KEY = import.meta.env.VITE_BASIQ_API_KEY;

/**
 * Gets a token from Basiq (optionally scoped to a user)
 */
export const getBasiqToken = async (scope = 'CLIENT_ACCESS') => {
  const params = new URLSearchParams();
  params.append('scope', scope);

  const response = await fetch('/basiq/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '2.1'
    },
    body: params.toString()
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[Basiq Token Error]:", data);
    throw new Error(data.errorMessage || "Failed to get Basiq token");
  }
  return data.access_token;
};

/**
 * Normalizes a mobile number to E.164 format (e.g., +61400000000)
 */
const normalizeMobile = (mobile) => {
  if (!mobile) return "+61400000000";
  
  // Remove all non-numeric characters except leading +
  let clean = mobile.replace(/(?!^\+)[^\d]/g, '');
  
  // If starts with 0 (AU local), replace with +61
  if (clean.startsWith('0')) {
    clean = '+61' + clean.substring(1);
  }
  
  // If doesn't start with +, assume AU (+61)
  if (!clean.startsWith('+')) {
    clean = '+61' + clean;
  }
  
  return clean;
};

/**
 * Creates or retrieves a Basiq User for the current WealthLens user
 */
export const getOrCreateBasiqUser = async (token, email, mobile) => {
  // First, check if we already have a Basiq User ID in localStorage for this user and mobile combination
  const normalizedMobile = normalizeMobile(mobile);
  const cacheKey = `wl_basiq_user_id_${email}_${normalizedMobile.replace(/[^0-9]/g, '')}`;
  const storedId = localStorage.getItem(cacheKey);
  if (storedId) return storedId;

  // 1. Search for existing user by email
  const filter = encodeURIComponent(`user.email.eq('${email}')`);
  const searchResp = await fetch(`/basiq/users?filter=${filter}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '2.1'
    }
  });

  if (searchResp.ok) {
    const searchData = await searchResp.json();
    if (searchData.data && searchData.data.length > 0) {
      // Return the most recently created user
      const existingUser = searchData.data[0];
      localStorage.setItem(cacheKey, existingUser.id);
      return existingUser.id;
    }
  }

  // 2. Create new user if not found
  const response = await fetch('/basiq/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '2.1'
    },
    body: JSON.stringify({
      email: email,
      mobile: normalizedMobile
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("[Basiq User Error Detail]:", data);
    throw new Error(data.errorMessage || "Failed to create Basiq user");
  }
  
  localStorage.setItem(cacheKey, data.id);
  return data.id;
};

/**
 * Fetches all active bank connections for a given user.
 */
export const getBasiqConnections = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/connections`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '2.1'
    }
  });

  if (!response.ok) {
    console.error("[Basiq Connections Error]:", await response.json());
    return [];
  }

  const data = await response.json();
  return data.data || [];
};

/**
 * Triggers a refresh for all connections of a user.
 */
export const refreshBasiqUser = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/refresh`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '2.1'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[Basiq Refresh Error]:", error);
    throw new Error(error.errorMessage || "Failed to trigger refresh");
  }

  return await response.json();
};

/**
 * Generates an Auth Link for the Basiq Connect UI
 */
export const getBasiqAuthLink = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/auth_link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '2.1'
    },
    body: JSON.stringify({
      action: 'connect',
      scope: 'identify account transaction',
      redirect_url: window.location.origin
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const detail = data.data && data.data[0] ? data.data[0] : data;
    console.error("[Basiq AuthLink Error]:", detail);
    throw new Error(detail.title || detail.message || detail.errorMessage || "Failed to create Auth Link");
  }
  return data.links.public;
};

/**
 * Polls for the latest job status for a user
 */
export const pollLatestJob = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '2.1'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errorMessage || "Failed to fetch jobs");
  
  // Return the most recent job
  return data.data && data.data.length > 0 ? data.data[0] : null;
};

/**
 * Fetches real transactions from Basiq
 */
export const fetchBasiqTransactions = async (token, userId, monthsToFetch = 1) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsToFetch);
  const dateStr = date.toISOString().split('T')[0];

  const response = await fetch(`/basiq/users/${userId}/transactions?filter=transaction.postDate.gt('${dateStr}')`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '2.1'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errorMessage || "Failed to fetch transactions");
  return data.data;
};

/**
 * Normalizes real Basiq JSON into WealthLens's expected schema.
 */
export const normalizeBasiqToWealthLens = (basiqData) => {
  return basiqData.map(tx => {
    const rawAmount = parseFloat(tx.amount);
    
    return {
      name: tx.description,
      amount: Math.abs(rawAmount),
      date: tx.postDate,
      category: tx.class === 'income' ? 'Income' : 'Uncategorized',
      type: rawAmount >= 0 ? 'income' : 'expense'
    };
  });
};
