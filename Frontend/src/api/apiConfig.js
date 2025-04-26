// Base API URL - update to absolute URL to avoid issues with BrowserRouter
const API_BASE_URL = 'https://lktool.onrender.com';

// API endpoint configuration
export const API_CONFIG = {
  API_URL: API_BASE_URL,
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

// Helper function to get complete API URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

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