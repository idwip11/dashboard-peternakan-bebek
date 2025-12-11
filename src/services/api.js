// API Service Layer for Duck Farm Dashboard
// Base URL for backend API
// Automatically detects if running in production (Vercel) or development (Localhost)
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://dashboard-bebek-api.onrender.com/api' // Default production URL fallback
    : 'http://localhost:3001/api');

// Helper function for fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ===== BATCH API =====
export const batchAPI = {
  getAll: () => fetchAPI('/batches'),
  
  getById: (id) => fetchAPI(`/batches/${id}`),
  
  create: (data) => fetchAPI('/batches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => fetchAPI(`/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => fetchAPI(`/batches/${id}`, {
    method: 'DELETE',
  }),
};

// ===== DAILY RECORDS API =====
export const recordAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchAPI(`/records${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => fetchAPI(`/records/${id}`),
  
  create: (data) => fetchAPI('/records', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => fetchAPI(`/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => fetchAPI(`/records/${id}`, {
    method: 'DELETE',
  }),
};

// ===== KPI & ANALYTICS API =====
export const analyticsAPI = {
  getKPIs: (days = 30) => fetchAPI(`/kpis?days=${days}`),
  
  getMonthlyEggs: (months = 6) => fetchAPI(`/analytics/monthly-eggs?months=${months}`),
  
  getMonthlyFinance: (months = 6) => fetchAPI(`/analytics/monthly-finance?months=${months}`),
  
  getCostPerDuck: () => fetchAPI('/analytics/cost-per-duck'),
};

// ===== SETTINGS API =====
export const settingsAPI = {
  getAll: () => fetchAPI('/settings'),
  
  update: (key, value) => fetchAPI(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  }),
  
  initialize: () => fetchAPI('/settings/initialize', {
    method: 'POST',
  }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');
