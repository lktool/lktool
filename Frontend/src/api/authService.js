/**
 * Authentication Service
 * Handles login, registration, token validation, and user management
 */
import { apiClient, createAuthClient } from './interceptors';
import { ENDPOINTS, AUTH_CONFIG, OAUTH_CONFIG } from './config';

export const authService = {
  /**
   * Login with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Login response with tokens and user info
   */
  async login(email, password) {
    try {
      console.log(`Attempting login with email: ${email}`);
      
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.LOGIN}`, 
        { email, password }
      );
      
      if (response.data?.access) {
        this._storeAuthData(response.data);
        
        return {
          success: true,
          isAdmin: response.data.role === 'admin',
          userInfo: {
            email: email,
            role: response.data.role || 'user',
            userId: response.data.user_id
          }
        };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      
      return this._handleAuthError(error);
    }
  },
  
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} password2 - Password confirmation
   * @returns {Promise<Object>} Registration response
   */
  async register(email, password, password2) {
    try {
      console.log(`Attempting registration with email: ${email}`);
      
      // Construct the full URL for debugging
      const fullUrl = `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.SIGNUP}`;
      console.log(`Using endpoint: ${fullUrl}`);
      
      // Make request with full URL to avoid any path manipulation
      const response = await apiClient.post(
        fullUrl,
        { email, password, password2 }
      );
      
      console.log('Registration response:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Registration successful!',
        requiresVerification: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show detailed error response for debugging
      if (error.response?.data) {
        console.error('Error response:', error.response.data);
      }
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Field-specific errors with improved output
        if (errorData.email && Array.isArray(errorData.email)) {
          return { success: false, error: `Email error: ${errorData.email[0]}` };
        }
        if (errorData.password && Array.isArray(errorData.password)) {
          return { success: false, error: `Password error: ${errorData.password[0]}` };
        }
        if (errorData.password2 && Array.isArray(errorData.password2)) {
          return { success: false, error: `Confirm password error: ${errorData.password2[0]}` };
        }
        // Handle non-array error formats
        if (errorData.email) {
          return { success: false, error: typeof errorData.email === 'string' ? errorData.email : `Email error: ${JSON.stringify(errorData.email)}` };
        }
        if (errorData.password) {
          return { success: false, error: typeof errorData.password === 'string' ? errorData.password : `Password error: ${JSON.stringify(errorData.password)}` };
        }
        if (errorData.password2) {
          return { success: false, error: typeof errorData.password2 === 'string' ? errorData.password2 : `Confirm password error: ${JSON.stringify(errorData.password2)}` };
        }
        
        if (errorData.message) return { success: false, error: errorData.message };
        if (errorData.error) return { success: false, error: errorData.error };
        if (errorData.detail) return { success: false, error: errorData.detail };
        
        // Return the raw error data if none of the above matched
        return { success: false, error: `Registration failed: ${JSON.stringify(errorData)}` };
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  },
  
  /**
   * Authenticate with Google OAuth
   * @param {string} credential - Google ID token
   * @param {string} action - 'login' or 'signup'
   * @returns {Promise<Object>} Authentication result
   */
  async googleAuth(credential, action = 'login') {
    try {
      // Use the API endpoint that works reliably
      const endpoint = ENDPOINTS.AUTH.GOOGLE_ALT;
      
      const response = await apiClient.post(endpoint, { credential, action });
      
      if (response.data?.access) {
        this._storeAuthData(response.data);
        
        return {
          success: true,
          isNewUser: response.data.is_new_user || false,
          isAdmin: response.data.role === 'admin'
        };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Check for specific error responses
      if (error.response?.status === 404 && error.response.data?.needs_signup) {
        return {
          success: false,
          needsSignup: true,
          error: 'No account found with this email. Please sign up first.'
        };
      }
      
      if (error.response?.status === 409 && error.response.data?.needs_login) {
        return {
          success: false,
          needsLogin: true,
          error: 'An account already exists with this email. Please log in instead.'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Google authentication failed'
      };
    }
  },
  
  /**
   * Verify user's email with token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.VERIFY_EMAIL}`,
        { token }
      );
      
      return {
        success: true,
        message: response.data.detail || 'Email verified successfully!'
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Email verification failed'
      };
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result of verification email request
   */
  async resendVerification(email) {
    try {
      console.log(`Requesting verification email for: ${email}`);
      
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.RESEND_VERIFICATION}`,
        { email }
      );
      
      return {
        success: true,
        message: response.data.detail || 'Verification email sent!'
      };
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to resend verification email'
      };
    }
  },
  
  /**
   * Request password reset for an email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result of password reset request
   */
  async requestPasswordReset(email) {
    try {
      console.log(`Requesting password reset for email: ${email}`);
      console.log(`Using endpoint: ${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`);
      
      const response = await apiClient.post(
        `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET}`,
        { email }
      );
      
      console.log('Password reset response:', response.data);
      
      return {
        success: true,
        message: response.data.detail || 'Password reset email sent!'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.detail) {
        return { success: false, error: error.response.data.detail };
      }
      
      return {
        success: false,
        error: 'Failed to request password reset. Please try again.'
      };
    }
  },
  
  /**
   * Reset password with token
   * @param {string} uid - User ID
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} password2 - Password confirmation
   * @returns {Promise<Object>} Password reset result
   */
  async resetPassword(uid, token, password, password2) {
    try {
      console.log(`Attempting password reset for uid: ${uid}`);
      const endpoint = `${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.CONFIRM_PASSWORD_RESET(uid, token)}`;
      console.log(`Using endpoint: ${endpoint}`);
      
      const response = await apiClient.post(endpoint, { 
        password, 
        password2 
      });
      
      return {
        success: true,
        message: response.data.detail || 'Password reset successful!'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.data?.detail) {
        return { 
          success: false, 
          error: error.response.data.detail 
        };
      }
      
      return {
        success: false,
        error: 'Failed to reset password. The link may be invalid or expired.'
      };
    }
  },
  
  /**
   * Verify if the current token is valid
   * @returns {Promise<boolean>} Token validity
   */
  async verifyToken() {
    try {
      // Use the full path to ensure consistency
      const response = await apiClient.get('/api/auth/profile/');
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },
  
  /**
   * Get user profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get(`${ENDPOINTS.AUTH.BASE}${ENDPOINTS.AUTH.PROFILE}`);
      
      return {
        success: true,
        profile: response.data
      };
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return {
        success: false,
        error: 'Failed to load profile'
      };
    }
  },
  
  /**
   * Log out the current user
   */
  logout() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_ROLE_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_EMAIL_KEY);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event(AUTH_CONFIG.AUTH_CHANGE_EVENT));
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  },
  
  /**
   * Check if user is an admin
   * @returns {boolean} Admin status
   */
  isAdmin() {
    return localStorage.getItem(AUTH_CONFIG.USER_ROLE_KEY) === 'admin';
  },
  
  /**
   * Get current user email
   * @returns {string|null} User email
   */
  getCurrentUserEmail() {
    return localStorage.getItem(AUTH_CONFIG.USER_EMAIL_KEY);
  },
  
  /**
   * Generate Google OAuth URL
   * @returns {string} Google OAuth URL
   */
  getGoogleAuthUrl() {
    const { CLIENT_ID, REDIRECT_URI, RESPONSE_TYPE, SCOPE, PROMPT } = OAUTH_CONFIG.GOOGLE;
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: RESPONSE_TYPE,
      scope: SCOPE,
      prompt: PROMPT,
      nonce: Math.random().toString(36).substring(2, 15),
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },
  
  /**
   * Store authentication data in localStorage
   * @private
   * @param {Object} data - Authentication data from API
   */
  _storeAuthData(data) {
    if (data.access) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, data.access);
    }
    
    if (data.refresh) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, data.refresh);
    }
    
    if (data.role) {
      localStorage.setItem(AUTH_CONFIG.USER_ROLE_KEY, data.role);
    }
    
    if (data.email) {
      localStorage.setItem(AUTH_CONFIG.USER_EMAIL_KEY, data.email);
    }
    
    // Dispatch auth change event
    window.dispatchEvent(new Event(AUTH_CONFIG.AUTH_CHANGE_EVENT));
  },
  
  /**
   * Handle authentication errors
   * @private
   * @param {Error} error - Error object
   * @returns {Object} Formatted error response
   */
  _handleAuthError(error) {
    if (error.response?.status === 401) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (error.response?.data?.detail) {
      return { success: false, error: error.response.data.detail };
    }
    
    if (error.message.includes('Network Error')) {
      return { success: false, error: 'Network error. Please check your connection.' };
    }
    
    return { success: false, error: 'Login failed. Please try again.' };
  }
};
