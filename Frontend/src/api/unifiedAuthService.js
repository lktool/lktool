import axios from 'axios';
import { API_CONFIG } from './apiConfig';

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
      const response = await axios.post(`${API_BASE}/auth/login/`, {
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
      const response = await axios.post(`${API_BASE}/auth/register/`, {
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
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise<Object>} Response data
   */
  async resendVerification(email) {
    try {
      const response = await axios.post(`${API_BASE}/auth/resend-verification/`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Error resending verification:', error);
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
      
      const response = await axios.post(`${API_BASE}/auth/refresh/`, {
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
  
  // User submissions
  async getMySubmissions() {
    try {
      const client = authClient();
      const response = await client.get('/submissions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  async submitProfile(data) {
    try {
      const client = authClient();
      const response = await client.post('/submissions/', data);
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
  
  // Admin methods
  async getAdminSubmissions(filter = '') {
    try {
      const client = authClient();
      const queryParams = filter ? `?status=${filter}` : '';
      const response = await client.get(`/admin/submissions/${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin submissions:', error);
      return [];
    }
  },
  
  async submitAdminReply(submissionId, replyText) {
    try {
      const client = authClient();
      const response = await client.patch(`/admin/submissions/${submissionId}/`, {
        admin_reply: replyText,
        is_processed: true
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting admin reply:', error);
      return {
        success: false,
        error: error.response?.data || 'Reply failed'
      };
    }
  },
  
  async getAdminStats() {
    try {
      const client = authClient();
      const response = await client.get('/admin/submissions/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
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
