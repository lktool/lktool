// Base API URL - update to absolute URL to avoid issues with BrowserRouter
const API_BASE_URL = 'https://lktool.onrender.com';

// API endpoint configuration
export const API_CONFIG = {
  API_URL: import.meta.env.VITE_API_BASE_URL || 'https://lktool.onrender.com',
  AUTH: {
    SIGNUP: '/api/auth/signup/',
    LOGIN: '/api/auth/login/',
    REFRESH: '/api/auth/refresh/',
    PASSWORD_RESET: '/api/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/api/auth/password-reset/:uid/:token/',
    USER_PROFILE: '/api/auth/user/',
    GOOGLE_AUTH: '/api/auth/google/',
    VERIFY_EMAIL: '/api/auth/verify-email/',
    RESEND_VERIFICATION: '/api/auth/resend-verification/',
    VERIFY_TOKEN: '/api/auth/verify-token/',  // Add this new endpoint
  },
  CONTACT: {
    SUBMIT: '/api/contact/submit/',
  }
};

// For OAuth configs - any redirect URIs specifically
export const OAUTH_CONFIG = {
  google: {
    redirectUri: 'https://projectsection-ten.vercel.app/auth/google/callback', // Fixed the URL format
  }
};

// API configuration with proper URLs for development and production

// Get the correct base URL depending on environment
export const getApiUrl = (endpoint) => {
  // Use absolute URL in production, relative in development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://lktool.onrender.com' // Your backend domain
    : 'http://localhost:8000'; // Local development backend
  
  // Make sure endpoint starts with a slash
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${baseUrl}${formattedEndpoint}`;
};

// Admin API endpoints
export const ADMIN_ENDPOINTS = {
  LOGIN: '/api/admin/login/',
  SUBMISSIONS: '/api/admin/submissions/',
  UPDATE_SUBMISSION: '/api/admin/submissions/:id/'
};

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
    fullApiUrl: getApiUrl('/api/auth/signup/')
  };
};