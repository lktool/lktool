import axios from 'axios';
import { AUTH_CONFIG } from './config';

// Check the axios baseURL configuration to ensure it's not duplicating domains
// Create and export the main API client
export const apiClient = axios.create({
  baseURL: '', // Use empty string to ensure relative paths work correctly
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log requests in development mode
apiClient.interceptors.request.use(
  config => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    // Add token to request if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Log detailed error information
    if (error.response) {
      console.error(`Response error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
