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
    BASE: `${BASE_URL}/api/auth`,
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
    GOOGLE_ALT: `${BASE_URL}/google/`, // Root-level endpoint
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
  
  // Admin endpoints
  ADMIN: {
    BASE: `${BASE_URL}/api/admin`,
    SUBMISSIONS: '/submissions/',
    SUBMISSION_DETAIL: (id) => `/submissions/${id}/`,
    PROFILE_ANALYSES: '/analyses/',
    PROFILE_ANALYSIS_DETAIL: (id) => `/analyses/${id}/`,
    ANALYSIS_STATUS: (id) => `/submissions/${id}/analysis-status/`,
    DASHBOARD_STATS: '/dashboard/stats/',
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

// OAuth configuration
export const OAUTH_CONFIG = {
  GOOGLE: {
    REDIRECT_URI: 'https://projectsection-ten.vercel.app/auth/google/callback',
    CLIENT_ID: '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com',
    RESPONSE_TYPE: 'id_token',
    SCOPE: 'email profile',
    PROMPT: 'select_account',
  }
};
