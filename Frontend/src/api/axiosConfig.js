import axios from 'axios';
import { API_CONFIG } from './apiConfig';

// Function to get CSRF token from cookies
function getCsrfToken() {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
}

// Create an axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor to include auth token and CSRF token on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      try {
        // Try to parse the token in case it's stored as a JSON object
        let tokenValue = token;
        try {
          const parsedToken = JSON.parse(token);
          if (parsedToken.value) {
            tokenValue = parsedToken.value;
          }
        } catch (e) {
          // Not JSON, use as is
        }
        
        // Add Authorization header with Bearer token
        config.headers['Authorization'] = `Bearer ${tokenValue}`;
      } catch (error) {
        console.error('Error setting auth header:', error);
      }
    }
    
    // Get CSRF token from cookies and add to headers for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor remains the same
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Add a flag to indicate auth issues
      error.isAuthError = true;
      
      // Store redirect reason
      localStorage.setItem('auth_redirect_reason', 'login_required');
    }
    
    // Handle CORS errors
    if (error.message === 'Network Error') {
      error.isCorsError = true;
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
