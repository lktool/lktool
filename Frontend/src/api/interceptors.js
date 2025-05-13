import axios from 'axios';
import { BASE_URL, AUTH_CONFIG } from './config';

/**
 * API client with interceptors for authentication and error handling
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Add request interceptor to attach JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add auth token refresh on 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          // No refresh token, just propagate the error
          throw error;
        }
        
        const response = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data && response.data.access) {
          // Update the access token
          localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.data.access);
          
          // Update Authorization header and retry
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed, clear auth and notify
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        window.dispatchEvent(new Event(AUTH_CONFIG.AUTH_CHANGE_EVENT));
      }
    }
    
    return Promise.reject(error);
  }
);

// Create a secondary client for auth endpoints that uses axios directly
const createAuthClient = () => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
};

export { apiClient, createAuthClient };
