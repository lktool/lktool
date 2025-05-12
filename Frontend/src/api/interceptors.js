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
    const originalUrl = config.url;
    
    // Don't modify URLs that already include the protocol
    if (originalUrl.startsWith('http')) {
      console.log(`Not modifying absolute URL: ${originalUrl}`);
      // Just add auth headers
    } 
    // Make sure URLs have proper API prefix structure
    else if (!originalUrl.startsWith('/api/')) {
      // Extract the path parts
      const withoutLeadingSlash = originalUrl.startsWith('/') 
        ? originalUrl.substring(1) 
        : originalUrl;
      
      // Split by first slash to get main path section
      const pathParts = withoutLeadingSlash.split('/', 1);
      const mainPath = pathParts[0];
      
      // Only add /api prefix for certain paths
      if (['auth', 'contact', 'admin'].includes(mainPath)) {
        config.url = `/api${originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`}`;
        console.log(`Standardized API URL: ${originalUrl} → ${config.url}`);
      }
    }
    
    // Always add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      console.log(`Adding auth token to request: ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
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
