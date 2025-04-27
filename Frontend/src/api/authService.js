import axios from 'axios';
import { API_CONFIG, getApiUrl, buildApiUrl } from './apiConfig';

// Create an axios instance with optimized config
const apiClient = axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // Increased timeout to 30 seconds
    withCredentials: true,  // Important for CORS with credentials
});

// Token storage with TTL for caching
const tokenCache = {
    setToken(token, ttl = 3600000) { // Default 1 hour TTL
        const item = {
            value: token,
            expiry: Date.now() + ttl
        };
        localStorage.setItem('token', JSON.stringify(item));
    },
    getToken() {
        const itemStr = localStorage.getItem('token');
        if (!itemStr) return null;
        
        try {
            const item = JSON.parse(itemStr);
            const now = Date.now();
            
            if (now > item.expiry) {
                localStorage.removeItem('token');
                localStorage.setItem('expired_token', 'true');
                return null;
            }
            
            return item.value;
        } catch (e) {
            // Handle legacy format
            return localStorage.getItem('token');
        }
    }
};

// Add a response interceptor to handle token refresh with retry queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Don't retry if we're already retrying or if it's a 401 on auth endpoints
        if (error.response?.status === 401 && !originalRequest._retry &&
            !originalRequest.url?.includes('auth/login') && 
            !originalRequest.url?.includes('auth/signup') && 
            !originalRequest.url?.includes('auth/refresh')) {
            
            if (isRefreshing) {
                // Add failed request to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(
                        getApiUrl(API_CONFIG.AUTH.REFRESH), 
                        { refresh: refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    
                    if (response.data.access) {
                        const newToken = response.data.access;
                        tokenCache.setToken(newToken);
                        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        processQueue(null, newToken);
                        return apiClient(originalRequest);
                    }
                }
                processQueue(error, null);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Only clear tokens if refresh explicitly fails
                if (refreshError.response && refreshError.response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Add token to requests if available
apiClient.interceptors.request.use(
    (config) => {
        // Don't add Authorization header for auth endpoints
        if (config.url && (
            config.url.includes('auth/signup') || 
            config.url.includes('auth/login') ||
            config.url.includes('auth/refresh')
        )) {
            return config;
        }
        
        const token = tokenCache.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Create a Map to track active requests
const activeRequests = new Map();

// Add a memory cache for common data
const memoryCache = {
    data: new Map(),
    set(key, value, ttl = 60000) { // Default 1 minute TTL
        const item = {
            value,
            expiry: Date.now() + ttl
        };
        this.data.set(key, item);
    },
    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.data.delete(key);
            return null;
        }
        
        return item.value;
    },
    delete(key) {
        this.data.delete(key);
    },
    clear() {
        this.data.clear();
    }
};

export const authService = {
    // Register a new user with improved error handling
    async register(email, password, password2) {
        try {
            console.log("Sending signup request with:", { email, password, password2 });
            
            // Add debug info for CORS troubleshooting
            console.log(`Sending request from ${window.location.origin} to ${getApiUrl(API_CONFIG.AUTH.SIGNUP)}`);
            
            // Create controller for request cancellation, but without timeout
            const controller = new AbortController();
            
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.SIGNUP), 
                { email, password, password2 }, 
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        // Add explicit CORS headers for debugging
                        'Access-Control-Request-Method': 'POST',
                        'Access-Control-Request-Headers': 'content-type'
                    },
                    signal: controller.signal,
                    withCredentials: true  // Important for CORS with credentials
                }
            );
            
            if (response.data.token) {
                tokenCache.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error) {
            // Enhanced error logging
            console.error('Registration error details:', error.response?.data || error.message);
            console.error('Full error object:', error);
            
            // Special handling for CORS errors
            if (error.message && error.message.includes('Network Error')) {
                console.error('CORS issue detected. Check server CORS configuration.');
            }
            
            throw error;
        }
    },

    // Login user with better error handling and performance
    async login(email, password) {
        try {
            // Only log in development to reduce console spam
            if (process.env.NODE_ENV === 'development') {
                console.log(`Sending login request to ${getApiUrl(API_CONFIG.AUTH.LOGIN)}`);
            }
            
            // Cancel any existing login requests
            if (activeRequests.has('login')) {
                activeRequests.get('login').abort();
                activeRequests.delete('login');
            }
            
            // Create new AbortController without timeout
            const controller = new AbortController();
            activeRequests.set('login', controller);
            
            const formattedEmail = email.trim().toLowerCase();
            
            // Add timestamp to prevent caching issues
            const timestamp = new Date().getTime();
            const url = `${getApiUrl(API_CONFIG.AUTH.LOGIN)}?_=${timestamp}`;
            
            const response = await axios.post(
                url, 
                { email: formattedEmail, password }, 
                {
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    withCredentials: true
                }
            );
            
            activeRequests.delete('login');
            
            if (response.data.access) {
                // Store tokens with improved caching
                tokenCache.setToken(response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                localStorage.setItem('user_email', formattedEmail);
                
                // Pre-fetch user profile data if needed
                this.prefetchUserData();
            }
            
            return response.data;
        } catch (error) {
            // Enhanced error logging
            console.log('Login error details:', error.message || 'Unknown error');
            console.log('Full error object:', error);
            
            // Clean up active request
            activeRequests.delete('login');
            
            // Handle specific error types - removed timeout specific error handling
            if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
                throw new Error('Login request was canceled. Please try again.');
            }
            
            // Handle other specific errors from the server
            if (error.response?.data?.email) {
                throw new Error(`Email error: ${error.response.data.email[0]}`);
            } else if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            } else if (error.response?.status === 401) {
                throw new Error("Invalid email or password");
            } else if (error.message && (error.message.includes('CORS') || error.message.includes('Network Error'))) {
                throw new Error("Cannot connect to the server. This may be a CORS or network issue.");
            }
            
            throw error;
        }
    },
    
    // Prefetch user data after login to make subsequent pages load faster
    async prefetchUserData() {
        try {
            // Check if we already have cached data
            if (memoryCache.get('user_profile')) {
                return memoryCache.get('user_profile');
            }
            
            const response = await apiClient.get(API_CONFIG.AUTH.USER_PROFILE);
            if (response.data) {
                // Cache in memory for faster access
                memoryCache.set('user_profile', response.data, 60000); // 1 minute cache
                
                // Also update localStorage for persistence between refreshes
                localStorage.setItem('user_data', JSON.stringify(response.data));
                return response.data;
            }
        } catch (error) {
            console.log('Could not prefetch user data:', error.message);
            // Don't throw - this is just an optimization
        }
    },
    
    // Clean up any active requests (call this on component unmount)
    cancelActiveRequests() {
        activeRequests.forEach((controller, key) => {
            controller.abort();
        });
        activeRequests.clear();
    },

    // Enhanced token validation to prevent unauthorized access
    async checkTokenValidity() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;
            
            // IMPORTANT: Make an actual API call to validate the token
            try {
                // Make server validate the token by requesting protected resource
                const response = await apiClient.get(API_CONFIG.AUTH.USER_PROFILE);
                return response && response.status === 200;
            } catch (error) {
                console.error('Token validation failed:', error);
                this.logout(); // Clear invalid tokens
                return false;
            }
        } catch (error) {
            console.error('Token check error:', error);
            this.logout();
            return false;
        }
    },

    // Enhanced logout to clear all auth data
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_data');
        
        // Clear any session storage as well
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('auth_state');
    },

    // Password reset request with improved error handling
    async requestPasswordReset(email) {
        try {
            console.log(`Sending password reset request for: ${email}`);
            
            // FORMAT FIX: Make sure email is trimmed and lowercase for consistency
            const formattedEmail = email.trim().toLowerCase();
            
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.PASSWORD_RESET), 
                { email: formattedEmail }, 
                { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000 // 10 second timeout
                }
            );
            
            console.log('Password reset response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Password reset error details:', error.response?.data || error.message);
            console.error('Full password reset error:', error);
            throw error;
        }
    },

    // Password reset confirmation
    async confirmPasswordReset(uid, token, password, password2) {
        try {
            const url = getApiUrl(API_CONFIG.AUTH.PASSWORD_RESET_CONFIRM)
                .replace(':uid', uid)
                .replace(':token', token);
                
            return await axios.post(
                url, 
                { password, password2 },
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Password reset confirmation error:', error);
            throw error;
        }
    },

    // Get current user
    async getCurrentUser() {
        return await apiClient.get(API_CONFIG.AUTH.USER_PROFILE);
    },
    
    // Check if user is authenticated - enhanced with validation
    isAuthenticated() {
        try {
            const token = tokenCache.getToken();
            return Boolean(token); // Return true only if valid token exists
        } catch (error) {
            return false;
        }
    },

    // Enhanced resend verification email method
    async resendVerification(email) {
        try {
            console.log(`Attempting to resend verification for email: ${email}`);
            
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.RESEND_VERIFICATION), 
                { email },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            
            console.log('Resend verification response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Failed to resend verification email:', error);
            
            // Check if the error is because the email is already verified
            if (error.response?.data?.detail?.includes('already verified')) {
                throw new Error('This email is already verified. Please try logging in.');
            }
            
            // Check if no account exists
            if (error.response?.status === 404) {
                throw new Error('No account found with this email address.');
            }
            
            throw error;
        }
    },

    // Enhanced email verification method
    async verifyEmail(token) {
        try {
            console.log("Sending verification request for token");
            
            // Don't encode the token in the URL (already done) but send it as-is in the request body
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.VERIFY_EMAIL), 
                { token: token },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000, // Longer timeout for verification
                }
            );
            
            if (response.status === 200) {
                console.log("Email verification successful");
            }
            
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error);
            
            // Enhanced error details for debugging
            if (error.response) {
                console.error('Server response:', error.response.data);
            } else if (error.request) {
                console.error('No response received from server');
            }
            
            throw error;
        }
    },
};
