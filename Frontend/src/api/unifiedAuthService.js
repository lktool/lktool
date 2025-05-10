import axios from 'axios';
import { API_CONFIG, getAuthUrl, getContactUrl } from './apiConfig';
import { API_ENDPOINTS } from './apiEndpoints';

// API base URL pointing to unified auth API
const API_BASE = API_CONFIG.AUTH_URL;

// Create authenticated axios instance
const authClient = () => {
  const token = localStorage.getItem('token');
  let tokenValue = token;
  
  // Handle token stored as JSON object
  if (token) {
    try {
      const parsedToken = JSON.parse(token);
      if (parsedToken.value) {
        tokenValue = parsedToken.value;
      }
    } catch (e) {
      // Not JSON, use as is
    }
  }
  
  return axios.create({
    baseURL: API_CONFIG.API_URL,  // Use base API URL for full paths
    headers: {
      'Content-Type': 'application/json',
      'Authorization': tokenValue ? `Bearer ${tokenValue}` : ''
    },
    withCredentials: true // Important for CORS with credentials
  });
};

export const unifiedAuthService = {
  // AUTHENTICATION METHODS
  
  /**
   * Login user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response with success flag and user info
   */
  async login(email, password) {
    try {
      console.log(`Attempting login with email: ${email}`);
      
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.LOGIN), {
        email,
        password
      });
      
      if (response.data && response.data.access) {
        // Store tokens
        localStorage.setItem('token', response.data.access);
        
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }
        
        // Store user role and other info
        localStorage.setItem('userRole', response.data.role || 'user');
        localStorage.setItem('userEmail', email);
        
        // Determine if user is admin
        const isAdmin = response.data.role === 'admin';
        
        // Notify components about authentication change
        window.dispatchEvent(new Event('authChange'));
        
        return {
          success: true,
          isAdmin: isAdmin,
          userInfo: {
            email: email,
            role: response.data.role || 'user',
            userId: response.data.user_id
          }
        };
      }
      
      return { 
        success: false,
        error: 'Invalid response from server'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error scenarios
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      
      if (error.response?.data?.detail) {
        return {
          success: false,
          error: error.response.data.detail
        };
      }
      
      if (error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Network error. Please check your connection.'
        };
      }
      
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  },
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Registration result
   */
  async register(email, password, confirmPassword) {
    try {
      console.log(`Attempting registration for email: ${email}`);
      
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.REGISTER), {
        email,
        password,
        password2: confirmPassword
      });
      
      // If registration succeeded but doesn't return a token (e.g., requires email verification)
      console.log('Registration successful');
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Error handling with detailed error messages
      if (error.response?.data) {
        // Extract validation errors from response
        const errorData = error.response.data;
        
        // Handle specific field errors
        if (errorData.email) {
          throw new Error(`Email error: ${errorData.email[0]}`);
        }
        
        if (errorData.password) {
          throw new Error(`Password error: ${errorData.password[0]}`);
        }
        
        if (errorData.password2) {
          throw new Error(`Confirm password error: ${errorData.password2[0]}`);
        }
        
        // Handle general error messages
        if (errorData.message) {
          throw new Error(errorData.message);
        }
        
        if (errorData.error) {
          throw new Error(errorData.error);
        }
      }
      
      throw error;
    }
  },
  
  /**
   * Handle Google authentication
   * @param {string} credential - Google auth credential
   * @param {string} action - Login or signup action
   * @returns {Promise<Object>} Authentication result
   */
  async googleAuth(credential, action = 'login') {
    try {
      console.log(`Processing Google ${action} with credential`);
      
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.GOOGLE_AUTH), {
        credential,
        action: action
      });
      
      if (response.data && response.data.access) {
        // Store token information
        localStorage.setItem('token', response.data.access);
        
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }
        
        // Store user role and email
        const role = response.data.role || 'user';
        localStorage.setItem('userRole', role);
        
        if (response.data.email) {
          localStorage.setItem('userEmail', response.data.email);
        }
        
        // Notify components about authentication change
        window.dispatchEvent(new Event('authChange'));
        
        return {
          success: true,
          isNewUser: response.data.is_new_user || false,
          isAdmin: role === 'admin'
        };
      }
      
      return {
        success: false,
        error: 'Invalid response from server'
      };
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Handle specific error scenarios
      if (error.response?.status === 404 && error.response?.data?.needs_signup) {
        return {
          success: false,
          needsSignup: true,
          error: 'No account found with this email. Please sign up first.'
        };
      }
      
      if (error.response?.status === 409 && error.response?.data?.needs_login) {
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
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Operation result
   */
  async resendVerification(email) {
    try {
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.RESEND_VERIFICATION), { email });
      return response.data;
    } catch (error) {
      console.error('Failed to resend verification:', error);
      
      if (error.response?.data?.detail?.includes('already verified')) {
        throw new Error('This email is already verified. Please try logging in.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('No account found with this email address.');
      }
      
      throw error;
    }
  },
  
  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL), { token });
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Operation result
   */
  async requestPasswordReset(email) {
    try {
      const response = await axios.post(getAuthUrl(API_ENDPOINTS.AUTH.PASSWORD_RESET), { email });
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  /**
   * Confirm password reset
   * @param {string} uid - User ID
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Operation result
   */
  async confirmPasswordReset(uid, token, password, confirmPassword) {
    try {
      const url = API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM
        .replace(':uid', uid)
        .replace(':token', token);
        
      const response = await axios.post(getAuthUrl(url), {
        password,
        password2: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      throw error;
    }
  },
  
  /**
   * Verify if current token is valid
   * @returns {Promise<boolean>} Token validity
   */
  async verifyToken() {
    try {
      const client = authClient();
      const response = await client.get(getAuthUrl(API_ENDPOINTS.AUTH.PROFILE));
      return response.status === 200;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  },
  
  // USER SUBMISSIONS RELATED METHODS
  
  /**
   * Get user's submissions
   * @returns {Promise<Array>} User submissions
   */
  async getMySubmissions() {
    try {
      const client = authClient();
      const response = await client.get(getContactUrl(API_ENDPOINTS.CONTACT.USER_SUBMISSIONS));
      return response.data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.setItem('auth_redirect_reason', 'login_required');
        this.logout();
      }
      
      return [];
    }
  },
  
  /**
   * Submit LinkedIn profile for analysis
   * @param {Object} data - Submission data
   * @returns {Promise<Object>} Submission result
   */
  async submitLinkedInProfile(data) {
    try {
      const client = authClient();
      const response = await client.post(getContactUrl(API_ENDPOINTS.CONTACT.SUBMIT), data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting profile:', error);
      return {
        success: false,
        error: error.response?.data || 'Submission failed'
      };
    }
  },
  
  // UTILITY METHODS
  
  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Check if user is an admin
   * @returns {boolean} Admin status
   */
  isAdmin() {
    return localStorage.getItem('userRole') === 'admin';
  },
  
  /**
   * Get current user email
   * @returns {string|null} User email
   */
  getCurrentUserEmail() {
    return localStorage.getItem('userEmail');
  },
  
  /**
   * Log out user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    
    // Notify components about authentication change
    window.dispatchEvent(new Event('authChange'));
  }
};
