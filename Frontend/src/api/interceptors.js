import axios from 'axios';
import { formatEndpoint } from './config';

// Create new axios instance with interceptors
export const apiClient = axios.create();

// Request interceptor to format URLs and add auth headers
apiClient.interceptors.request.use(
  (config) => {
    // Only format the URL if it's not already a complete URL
    if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      const originalUrl = config.url;
      
      // Fix issue with double slashes in URL
      if (originalUrl.includes('//')) {
        config.url = originalUrl.replace(/\/+/g, '/');
      }
      
      // Use formatEndpoint to properly combine base URL and path
      config.url = formatEndpoint(config.url);
      
      console.log(`URL Transformed: ${originalUrl} → ${config.url}`);
    }
    
    // Add auth token if present
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log(`${config.method?.toUpperCase() || 'GET'} ${config.url}`, config.data || '');
    
    return config;
  },
  (error) => {
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
