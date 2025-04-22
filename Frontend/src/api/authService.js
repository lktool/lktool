import axios from 'axios';
import { API_CONFIG, getApiUrl, buildApiUrl } from './apiConfig';

// Create an axios instance with base URL
const apiClient = axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,  // Important for CORS with credentials
});

// Add a response interceptor to handle token refresh
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
            
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    try {
                        const response = await axios.post(
                            getApiUrl(API_CONFIG.AUTH.REFRESH), 
                            { refresh: refreshToken },
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                        
                        if (response.data.access) {
                            localStorage.setItem('token', response.data.access);
                            apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                            originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
                            return apiClient(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error("Refresh token error", refreshError);
                        // Silent token removal on refresh failures
                        if (refreshError.response?.status === 401) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('refreshToken');
                        }
                    }
                }
            } catch (err) {
                console.error("Token refresh error", err);
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
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    // Register a new user - include password2
    async register(email, password, confirmPassword) {
        try {
            console.log("Sending signup request with:", { email, password });
            
            // Add delay for better UX - helps avoid race conditions
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.SIGNUP), 
                { 
                    email, 
                    password,
                    password2: confirmPassword // Make sure to send confirmation password
                }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (response.data.token) {
                localStorage.setItem('temp_token', response.data.token); // Don't set as main token yet
            }
            
            return response.data;
        } catch (error) {
            // Log the full error response for debugging
            console.error('Registration error details:', error.response?.data || error.message);
            
            // Format error message for email already exists
            if (error.response?.data?.email?.[0]?.includes('already exists')) {
                error.alreadyExists = true;
            }
            
            throw error;
        }
    },

    // Login user
    async login(email, password) {
        try {
            // Use regular axios for authentication requests
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.LOGIN), 
                { email, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (response.data.access) {
                localStorage.setItem('token', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
            }
            
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
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
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Resend verification email
    async resendVerification(email) {
        try {
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.RESEND_VERIFICATION), 
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to resend verification email:', error);
            throw error;
        }
    },

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await axios.post(
                getApiUrl(API_CONFIG.AUTH.VERIFY_EMAIL), 
                { token },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error);
            throw error;
        }
    },
};
