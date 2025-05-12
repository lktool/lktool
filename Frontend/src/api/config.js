/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Base URLs - Configurable from environment variables
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lktool.onrender.com';

// API Endpoints configuration
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    BASE: `${BASE_URL}/api/auth`,  // Ensure this has /api/ prefix
    LOGIN: '/login/',
    SIGNUP: '/signup/',  // Make sure this matches the backend URL pattern
    REFRESH_TOKEN: '/refresh/',
    PROFILE: '/profile/',
    VERIFY_EMAIL: '/verify-email/',
    REQUEST_PASSWORD_RESET: '/password-reset/',  // Make sure this matches the backend URL pattern
    CONFIRM_PASSWORD_RESET: (uid, token) => `/password-reset-confirm/${uid}/${token}/`,
    RESEND_VERIFICATION: '/resend-verification/',
    // Google Auth has multiple endpoints
    GOOGLE: '/google/',
    GOOGLE_ALT: `${BASE_URL}/api/auth/google/`, // This is the endpoint that works reliably
    GOOGLE_DIRECT: `${BASE_URL}/auth/google/`, // Alternative endpoint
  },
  
  // Contact and submission endpoints
  CONTACT: {
    BASE: `${BASE_URL}/api/contact`,
    SUBMIT: '/submit/',
    USER_SUBMISSIONS: '/user-submissions/',
    CONTACT_MESSAGE: '/message/',
    ADMIN_REPLY: (id) => `/submissions/${id}/reply/`,
  },
  
  // Admin endpoints - Fix paths to include /api prefix consistently
  ADMIN: {
    // Fix: Make sure all admin endpoints use the full URL with /api prefix
    SUBMISSIONS: `${BASE_URL}/api/admin/submissions/`,
    PROCESSED_SUBMISSIONS: `${BASE_URL}/api/admin/processed/`,
    SUBMISSION_DETAIL: (id) => `${BASE_URL}/api/admin/submissions/${id}/`,
    SUBMIT_REPLY: (id) => `${BASE_URL}/api/contact/submissions/${id}/reply/`,
    PROFILE_ANALYSIS: `${BASE_URL}/api/admin/analyses/`,
    ANALYSIS_DETAIL: (id) => `${BASE_URL}/api/admin/analyses/${id}/`,
    SUBMISSION_ANALYSIS_STATUS: (id) => `${BASE_URL}/api/admin/submissions/${id}/analysis-status/`,
    DASHBOARD_STATS: `${BASE_URL}/api/admin/dashboard/stats/`,
  }
};

// Auth configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_ROLE_KEY: 'userRole',
  USER_EMAIL_KEY: 'userEmail',
  AUTH_CHANGE_EVENT: 'authChange',
};

// Request configuration
export const REQUEST_CONFIG = {
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  TIMEOUT: 30000, // 30 seconds
};

// OAuth configuration - Ensure this matches Google Console settings
export const OAUTH_CONFIG = {
  GOOGLE: {
    REDIRECT_URI: 'https://projectsection-ten.vercel.app/auth/google/callback', // Matches Google Console
    CLIENT_ID: '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com', // Client ID looks correct
    RESPONSE_TYPE: 'id_token',
    SCOPE: 'email profile',
    PROMPT: 'select_account',
  }
};
