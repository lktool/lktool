// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lktool.onrender.com';

// API endpoint configuration
export const API_CONFIG = {
  API_URL: API_BASE_URL,
  AUTH_URL: `${API_BASE_URL}/api/auth`,  // Used for auth endpoints
  CONTACT_URL: `${API_BASE_URL}/api/contact`, // Added for clarity
  ADMIN_URL: `${API_BASE_URL}/api/admin`  // Added for clarity
};

// Helper function to get complete API URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Helper function for auth specific endpoints
export const getAuthUrl = (endpoint) => `${API_CONFIG.AUTH_URL}${endpoint}`;

// Helper function for contact specific endpoints
export const getContactUrl = (endpoint) => `${API_CONFIG.CONTACT_URL}${endpoint}`;

// Helper function for admin specific endpoints
export const getAdminUrl = (endpoint) => `${API_CONFIG.ADMIN_URL}${endpoint}`;

// Helper function to build URLs with path parameters
export const buildApiUrl = (urlTemplate, params) => {
  let url = urlTemplate;
  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
  }
  return getApiUrl(url);
};

// Export for use in debugging
export const getDomainInfo = () => {
  return {
    currentOrigin: window.location.origin,
    apiBaseUrl: API_BASE_URL,
    fullApiUrl: getApiUrl('/api/auth/login/')
  };
};