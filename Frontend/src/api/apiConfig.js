// Base API URL from environment variable or default to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lktool.onrender.com';

// API endpoint configuration
export const API_CONFIG = {
  API_URL: API_BASE_URL,
  AUTH_URL: `${API_BASE_URL}/api/auth`,  // Used for most auth endpoints
  CONTACT_URL: `${API_BASE_URL}/api/contact`,
  ADMIN_URL: `${API_BASE_URL}/api/admin`,
  AUTH: {
    LOGIN: '/login/',
    SIGNUP: '/signup/', 
    REFRESH: '/refresh/',
    PROFILE: '/profile/',
    GOOGLE_AUTH: '/google/',
    VERIFY_EMAIL: '/verify-email/',
    RESEND_VERIFICATION: '/resend-verification/',
    PASSWORD_RESET: '/password-reset/',
    PASSWORD_RESET_CONFIRM: '/password-reset/:uid/:token/'
  },
  CONTACT: {
    USER_SUBMISSIONS: '/user-submissions/',
    SUBMIT: '/submit/'
  },
  ADMIN: {
    SUBMISSIONS: '/submissions/',
    SUBMISSION_DETAIL: (id) => `/submissions/${id}/`,
    REPLY: (id) => `/submissions/${id}/reply/`,
    STATS: '/stats/'
  }
};

// Helper function to get complete API URL
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// Helper to generate auth URLs with debugging
export const getAuthUrl = (path) => {
  // Special case for Google auth to match the backend route
  if (path === '/google/') {
    const url = `${API_BASE_URL}/auth/google/`;
    console.log(`Special Google Auth URL constructed: ${url}`);
    return url;
  }
  
  const url = `${API_CONFIG.AUTH_URL}${path}`;
  return url;
};

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

// For OAuth configs - any redirect URIs specifically
export const OAUTH_CONFIG = {
  google: {
    redirectUri: 'https://projectsection-ten.vercel.app/auth/google/callback', 
    clientId: '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com'
  }
};