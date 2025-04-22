// Base API URL
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
  },
  // Add other API endpoints as needed
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