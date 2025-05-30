/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Get base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL ;

// Log the API base URL for debugging
console.log('API Base URL configured as:', API_BASE_URL);

// Helper to ensure URLs are properly formed
const formatEndpoint = (endpoint) => {
  // If endpoint already starts with http/https, return as is (it's already a complete URL)
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // Fix double slashes in endpoints before joining
  if (endpoint.includes('//')) {
    endpoint = endpoint.replace(/\/+/g, '/');
  }
  
  // Make sure endpoint starts with a slash
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  
  // Fix base URL trailing slash if needed
  let baseUrl = API_BASE_URL;
  if (baseUrl.endsWith('/') && endpoint.startsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // Return the properly formatted URL
  return `${baseUrl}${endpoint}`;
};

// Base URL for API requests
export const BASE_URL = API_BASE_URL;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    BASE: '/api/auth/',
    LOGIN: 'login/',
    SIGNUP: 'signup/',
    GOOGLE: 'google/',
    GOOGLE_ALT: '/api/auth/google/',  // Ensure this has the /api prefix
    PROFILE: 'profile/',
    VERIFY_EMAIL: 'verify-email/',
    RESEND_VERIFICATION: 'resend-verification/',
    REQUEST_PASSWORD_RESET: 'password-reset/',
    CONFIRM_PASSWORD_RESET: (uid, token) => `password-reset-confirm/${uid}/${token}/`,
  },
  
  // User submissions
  SUBMIT_PROFILE: `${BASE_URL}/api/contact/submit/`,
  USER_SUBMISSIONS: `${BASE_URL}/api/contact/user-submissions/`,
  
  // Admin endpoints
  ADMIN: {
    SUBMISSIONS: `${BASE_URL}/api/admin/submissions/`,
    PROCESSED_SUBMISSIONS: `${BASE_URL}/api/admin/processed/`,
    SUBMISSION_DETAIL: (id) => `${BASE_URL}/api/admin/submissions/${id}/`,
    SUBMIT_REPLY: (id) => `${BASE_URL}/api/contact/submissions/${id}/reply/`,
  },
};

// Auth configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken', 
  USER_ROLE_KEY: 'userRole',
  USER_EMAIL_KEY: 'userEmail',
  AUTH_CHANGE_EVENT: 'authChange',
};

// OAuth configuration
export const OAUTH_CONFIG = {
  GOOGLE: {
    // Use the environment variable for CLIENT_ID
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ,
    REDIRECT_URI: `${window.location.origin}/auth/google/callback`,
    RESPONSE_TYPE: 'id_token',
    SCOPE: 'email profile',
    PROMPT: 'select_account',
  }
};

export { API_BASE_URL, formatEndpoint };
