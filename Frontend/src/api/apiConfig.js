// API configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  API_PREFIX: '/api',
  
  // Full API base URL with prefix
  get API_URL() {
    return this.BASE_URL + this.API_PREFIX;
  },
  
  // Auth endpoints
  AUTH: {
    SIGNUP: '/auth/signup/',
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    PASSWORD_RESET: '/auth/password-reset/',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/:uid/:token/',
    USER_PROFILE: '/auth/user/',
    GOOGLE_AUTH: '/auth/google/'
  },
  
  // Other endpoints can be added here as needed
  SCRAPE: {
    LINKEDIN: '/scrape/linkedin/'
  }
};

// Helper function to get full URL for an endpoint
export const getApiUrl = (endpoint) => {
  return API_CONFIG.API_URL + endpoint;
};

// Helper function to build URL with parameters
export const buildApiUrl = (endpointTemplate, params = {}) => {
  let url = API_CONFIG.API_URL + endpointTemplate;
  
  // Replace URL parameters (e.g., :uid, :token)
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

export default API_CONFIG;