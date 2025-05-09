/**
 * Centralized API endpoint paths
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/'
  },
  
  // Contact/submission endpoints
  SUBMISSIONS: {
    USER_LIST: '/api/contact/user-submissions/',
    SUBMIT: '/api/contact/submit/',
    ADMIN_LIST: '/api/admin/submissions/',
    ADMIN_REPLY: (id) => `/api/admin/submissions/${id}/reply/`,
    ADMIN_STATS: '/api/admin/stats/'
  }
};
