/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Base URL for API requests
export const BASE_URL = 'https://lktool.onrender.com';

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
    CLIENT_ID: '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com',
    REDIRECT_URI: `${window.location.origin}/auth/google/callback`,
    RESPONSE_TYPE: 'id_token',
    SCOPE: 'email profile',
    PROMPT: 'select_account',
  }
};
