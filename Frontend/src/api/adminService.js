import axios from 'axios';
import { getApiUrl } from './apiConfig';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  LOGIN: '/api/admin/login/',
  SUBMISSIONS: '/api/admin/submissions/',
  UPDATE_SUBMISSION: '/api/admin/submissions/:id/'
};

// Create admin API client with admin token
const createAdminApiClient = () => {
  const adminToken = localStorage.getItem('adminToken');
  
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Admin-Authorization': adminToken ? `Bearer ${adminToken}` : ''
    }
  });
};

export const adminService = {
  /**
   * Admin login using hardcoded credentials
   */
  async login(email, password) {
    try {
      const response = await axios.post(
        getApiUrl(ADMIN_ENDPOINTS.LOGIN),
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data.token) {
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
   */
  isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },
  
  /**
   * Admin logout
   */
  logout() {
    localStorage.removeItem('adminToken');
  },
  
  /**
   * Get all submissions
   */
  async getSubmissions(statusFilter = '') {
    try {
      const url = `${ADMIN_ENDPOINTS.SUBMISSIONS}${statusFilter ? '?status=' + statusFilter : ''}`;
      const apiClient = createAdminApiClient();
      const response = await apiClient.get(getApiUrl(url));
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },
  
  /**
   * Update submission status
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const url = ADMIN_ENDPOINTS.UPDATE_SUBMISSION.replace(':id', id);
      const apiClient = createAdminApiClient();
      const response = await apiClient.patch(
        getApiUrl(url),
        { is_processed: isProcessed }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }
};
