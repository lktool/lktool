import axios from 'axios';
import { API_CONFIG, getApiUrl, buildApiUrl } from './apiConfig';

// Create an axios instance with optimized config
const apiClient = axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000, // 20 second timeout
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

// Enhanced auth service with better error handling
export const authService = {
    // Register a new user with improved error handling
    async register(email, password, password2) {
        try {
            console.log("Sending signup request with:", { email, password, password2 });
            
            // Add debug info for CORS troubleshooting
            console.log(`Sending request from ${window.location.origin} to ${getApiUrl(API_CONFIG.AUTH.SIGNUP)}`);
            
            // Use controller to implement timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
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
            
            clearTimeout(timeoutId);
            
            if (response.data.token) {
                tokenCache.setToken(response.data.token);
            }
            
            return response.data;
        } catch (error) {
            // Enhanced error logging
            console.error('Registration error details:', error.response?.data || error.message);
            console.error('Full error object:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            // Special handling for CORS errors
            if (error.message && error.message.includes('Network Error')) {
                console.error('CORS issue detected. Check server CORS configuration.');
            }
            
            throw error;
        }
    },

    // Login user with better error handling
    async login(email, password) {
        try {
            // Debug info
            console.log(`Sending login request from ${window.location.origin} to ${getApiUrl(API_CONFIG.AUTH.LOGIN)}`);
            
            // Use abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            // FORMAT FIX: Make sure email is trimmed and lowercase for consistency
            const formattedEmail = email.trim().toLowerCase();
            
            // Use regular axios for authentication requests
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.LOGIN), 
                { 
                    email: formattedEmail, 
                    password: password 
                },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    withCredentials: true // Important for CORS
                }
            );
            
            clearTimeout(timeoutId);
            
            if (response.data.access) {
                tokenCache.setToken(response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                
                // Also store the user's email for later use
                localStorage.setItem('user_email', formattedEmail);
            }
            
            return response.data;
        } catch (error) {
            // Enhanced error logging
            console.error('Login error details:', error.response?.data || error.message);
            console.error('Full error object:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
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

    // Password reset request
    async requestPasswordReset(email) {
        try {
            return await axios.post(
                getApiUrl(API_CONFIG.AUTH.PASSWORD_RESET), 
                { email }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error('Password reset error:', error);
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
