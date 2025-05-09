import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import { API_ENDPOINTS } from './apiEndpoints';

// API base URL
const API_BASE = `${API_CONFIG.API_URL}/api/v2`;

// Create authenticated axios instance
const authClient = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export const unifiedAuthService = {
  // Authentication methods
  async login(email, password) {
    try {
      const response = await axios.post(`${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`, {
        email,
        password
      });
      
      if (response.data && response.data.access) {
        // Store token
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Store user role and info
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userEmail', response.data.email);
        
        return {
          success: true,
          isAdmin: response.data.role === 'admin',
          userInfo: {
            email: response.data.email,
            role: response.data.role,
            userId: response.data.user_id
          }
        };
      }
      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} confirmPassword - Password confirmation
   * @returns {Promise<Object>} Response data
   */
  async register(email, password, confirmPassword) {
    try {
      const response = await axios.post(`${API_BASE}${API_ENDPOINTS.AUTH.REGISTER}`, {
        email,
        password,
        password2: confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Refresh the authentication token
   * @returns {Promise<boolean>} Success flag
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }
      
      const response = await axios.post(`${API_BASE}${API_ENDPOINTS.AUTH.REFRESH}`, {
        refresh: refreshToken
      });
      
      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      return false;
    }
  },
  
  /**
   * Get user profile info
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile() {
    try {
      const client = authClient();
      const response = await client.get(API_ENDPOINTS.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Utility methods
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  isAdmin() {
    return localStorage.getItem('userRole') === 'admin';
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  }
};
