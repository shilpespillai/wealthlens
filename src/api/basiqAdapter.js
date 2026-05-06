// Basiq API Adapter
// This file connects the frontend to the Basiq API via the Vite proxy (/basiq).

const BASIQ_API_KEY = import.meta.env.VITE_BASIQ_API_KEY;

/**
 * Gets a CLIENT_ACCESS token from Basiq
 */
export const getBasiqToken = async (scope = 'CLIENT_ACCESS') => {
  const response = await fetch('/basiq/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${BASIQ_API_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'basiq-version': '3.0'
    },
    body: `scope=${scope}`
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errorMessage || "Failed to get Basiq token");
  return data.access_token;
};

/**
 * Creates or retrieves a Basiq User for the current WealthLens user
 */
export const getOrCreateBasiqUser = async (token, email, mobile) => {
  // First, check if we already have a Basiq User ID in localStorage for this user
  const storedId = localStorage.getItem(`wl_basiq_user_id_${email}`);
  if (storedId) return storedId;

  // Otherwise, create a new one
  const response = await fetch('/basiq/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'basiq-version': '3.0'
    },
    body: JSON.stringify({
      email: email,
      mobile: mobile || "+61400000000" // Basiq requires a mobile number
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errorMessage || "Failed to create Basiq user");
  
  localStorage.setItem(`wl_basiq_user_id_${email}`, data.id);
  return data.id;
};

/**
 * Generates an Auth Link for the Basiq Connect UI
 */
export const getBasiqAuthLink = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/auth_link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0'
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errorMessage || "Failed to create Auth Link");
  return data.links.public;
};

/**
 * Polls for the latest job status for a user
 */
export const pollLatestJob = async (token, userId) => {
  const response = await fetch(`/basiq/users/${userId}/jobs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'basiq-version': '3.0'
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
      'basiq-version': '3.0'
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
