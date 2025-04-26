import axios from 'axios';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: 'https://lktool.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Add CORS-specific configuration
  withCredentials: true
});

// Add request interceptor to add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Add logging for debugging CORS issues
    console.log(`Making ${config.method} request to: ${config.url}`);
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor with better CORS error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Special handling for CORS and network errors
    if (error.message === 'Network Error') {
      console.error('CORS or Network Error:', error);
      
      // Provide better user feedback for CORS issues
      const customError = new Error(
        'Unable to connect to the server. This may be due to a CORS policy restriction or network issue.'
      );
      customError.isCorsError = true;
      customError.originalError = error;
      return Promise.reject(customError);
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
