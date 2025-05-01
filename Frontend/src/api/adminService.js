import axios from 'axios';

// Base URL configuration
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://lktool.onrender.com'
  : 'http://localhost:8000';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/admin/login/`,
  SUBMISSIONS: `${BASE_URL}/api/admin/submissions/`,
  SUBMISSION_DETAIL: `${BASE_URL}/api/admin/submissions/:id/`,
  STATS: `${BASE_URL}/api/admin/stats/`
};

// Create an API client with admin authorization header
const createAdminClient = () => {
  const token = localStorage.getItem('adminToken');
  
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Admin-Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export const adminService = {
  /**
   * Admin login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login response with token
   */
  async login(email, password) {
    try {
      const response = await axios.post(
        ADMIN_ENDPOINTS.LOGIN,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      // Store the admin token on successful login
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  },
  
  /**
   * Check if admin is authenticated
   * @returns {boolean} True if admin is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },
  
  /**
   * Logout admin
   */
  logout() {
    localStorage.removeItem('adminToken');
  },
  
  /**
   * Get all form submissions
   * @param {string} filter - Optional filter for submissions ('all', 'pending', 'processed')
   * @returns {Promise<Array>} Array of form submissions
   */
  async getSubmissions(filter = '') {
    try {
      const apiClient = createAdminClient();
      const queryParam = filter && filter !== 'all' ? `?status=${filter}` : '';
      const response = await apiClient.get(`${ADMIN_ENDPOINTS.SUBMISSIONS}${queryParam}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  /**
   * Update submission status
   * @param {number} id - Submission ID
   * @param {boolean} isProcessed - New processed status
   * @returns {Promise<Object>} Updated submission
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const apiClient = createAdminClient();
      const url = ADMIN_ENDPOINTS.SUBMISSION_DETAIL.replace(':id', id);
      const response = await apiClient.patch(url, { is_processed: isProcessed });
      return response.data;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  },
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getStats() {
    try {
      const apiClient = createAdminClient();
      const response = await apiClient.get(ADMIN_ENDPOINTS.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
    }
  }
};
