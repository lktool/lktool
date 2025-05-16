import axios from 'axios';
import { AUTH_CONFIG } from './config';

// Base API client with consistent configuration
export const apiClient = axios.create({
  baseURL: 'https://lktool.onrender.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true
});

// Add request interceptor for debugging API calls
apiClient.interceptors.request.use(
  config => {
    // Add token if available
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log(`${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
                config.params || config.data || '');
    
    return config;
  },
  error => {
    console.error('Request error:', error);
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
