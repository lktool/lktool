/**
 * API endpoints configuration - centralized endpoint paths
 */
export const API_ENDPOINTS = {
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
  },
  SUBMISSIONS: {
    USER_LIST: '/api/contact/user-submissions/',  // Add complete path
    SUBMIT: '/api/contact/submit/'                // Add complete path 
  }
};
