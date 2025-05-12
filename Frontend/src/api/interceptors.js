/**
 * API Interceptors
 * Handle authentication, refresh tokens, and common error handling
 */
import axios from 'axios';
import { BASE_URL, AUTH_CONFIG, REQUEST_CONFIG } from './config';

// Fix API base URL configuration to ensure it has consistent trailing slash
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Configure request interceptor
 * Automatically adds auth token to requests if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Make sure URLs with BASE_URL don't get modified
    if (config.url.startsWith('http')) {
      // URL is already absolute, just add auth headers
    } else if (!config.url.startsWith('/api/') && !config.url.startsWith('/auth/')) {
      // Add /api prefix to relative URLs that don't have it
      config.url = '/api' + (config.url.startsWith('/') ? config.url : `/${config.url}`);
    }
    
    // Get auth token
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    // Add auth token to every request if available
    if (token) {
      // Log token for debugging
      console.log(`Adding auth token to request: ${config.url}`);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Configure response interceptor
 * Handle token refresh, unauthorized errors, and other common errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 by attempting token refresh
    if (error.response && error.response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken
          });
          
          if (response.data.access) {
            // Update token in localStorage
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.access);
            
            // Update the failed request with new token and retry
            const config = error.config;
            config.headers['Authorization'] = `Bearer ${response.data.access}`;
            return axios(config);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Create an authenticated client for specific service needs
 */
export const createAuthClient = (customConfig = {}) => {
  const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      ...REQUEST_CONFIG.DEFAULT_HEADERS,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...customConfig.headers
    },
    ...customConfig
  });
};
