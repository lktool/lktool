/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/'
  },
  SUBMISSIONS: {
    USER_LIST: '/api/contact/user-submissions/',
    SUBMIT: '/api/contact/submit/',
    ADMIN_LIST: '/api/admin/submissions/',
    ADMIN_REPLY: (id) => `/api/admin/submissions/${id}/reply/`,
    ADMIN_STATS: '/api/admin/stats/'
  }
};
