import axios from 'axios';

// Backend URL
const BACKEND_URL = 'https://lktool.onrender.com';

// Admin-specific API endpoints
const ADMIN_ENDPOINTS = {
  LOGIN: `${BACKEND_URL}/api/admin/login/`,
  SUBMISSIONS: `${BACKEND_URL}/api/admin/submissions/`,
  SUBMISSION_DETAIL: `${BACKEND_URL}/api/admin/submissions/:id/`,
  STATS: `${BACKEND_URL}/api/admin/stats/`,
};

// Create an API client with admin authorization header
const createAdminClient = () => {
  const token = localStorage.getItem('adminToken');
  
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Admin-Authorization': token ? `Bearer ${token}` : '',
    }
  });
};

export const adminService = {
  /**
   * Admin login with direct connection to backend
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<boolean>} Success flag
   */
  async login(email, password) {
    try {
      console.log(`Attempting admin login to ${ADMIN_ENDPOINTS.LOGIN}`);
      
      const response = await axios.post(
        ADMIN_ENDPOINTS.LOGIN,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('Admin login response:', response);
      
      // Store the admin token on successful login
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error.response || error);
      throw error;
    }
  },
  
  /**
   * Check if admin is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },
  
  /**
   * Admin logout
   */
  logout() {
    localStorage.removeItem('adminToken');
    // Notify components about auth state change
    window.dispatchEvent(new Event('authChange'));
  },
  
  /**
   * Get form submissions with optional filtering
   * @param {string} filter - Filter submissions (processed, pending, all)
   * @returns {Promise<Array>} List of submissions
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
   * @param {boolean} isProcessed - Processed flag
   * @returns {Promise<Object>} Updated submission
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const apiClient = createAdminClient();
      const url = ADMIN_ENDPOINTS.SUBMISSION_DETAIL.replace(':id', id);
      const response = await apiClient.patch(url, { is_processed: isProcessed });
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },
  
  /**
   * Get dashboard statistics
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
