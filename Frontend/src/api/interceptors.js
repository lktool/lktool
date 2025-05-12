/**
 * API Interceptors
 * Handle authentication, refresh tokens, and common error handling
 */
import axios from 'axios';
import { BASE_URL, AUTH_CONFIG, REQUEST_CONFIG } from './config';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: REQUEST_CONFIG.DEFAULT_HEADERS,
  timeout: REQUEST_CONFIG.TIMEOUT,
});

/**
 * Configure request interceptor
 * Automatically adds auth token to requests if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    // If token exists, add it to the request headers
    if (token) {
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
    const originalRequest = error.config;
    
    // If error is unauthorized and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        
        // Only try to refresh if we have a refresh token
        if (refreshToken) {
          // Get a new token
          const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken
          });
          
          // Update the stored token
          if (response.data?.access) {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.access);
            
            // Update the authorization header
            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
            
            // Retry the original request
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_ROLE_KEY);
        localStorage.removeItem(AUTH_CONFIG.USER_EMAIL_KEY);
        
        // Dispatch auth change event
        window.dispatchEvent(new Event(AUTH_CONFIG.AUTH_CHANGE_EVENT));
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
