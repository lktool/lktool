/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/login/',
    REGISTER: '/signup/',
    REFRESH: '/refresh/',
    PROFILE: '/profile/',
    GOOGLE_AUTH: '/google/',
    VERIFY_EMAIL: '/verify-email/',
    RESEND_VERIFICATION: '/resend-verification/',
    PASSWORD_RESET: '/password-reset/',
    PASSWORD_RESET_CONFIRM: '/password-reset/:uid/:token/'
  },
  SUBMISSIONS: {
    USER_LIST: '/api/contact/user-submissions/',
    SUBMIT: '/api/contact/submit/',
    ADMIN_LIST: '/api/admin/submissions/',
    ADMIN_REPLY: (id) => `/api/admin/submissions/${id}/reply/`,
    ADMIN_STATS: '/api/admin/stats/'
  }
};
