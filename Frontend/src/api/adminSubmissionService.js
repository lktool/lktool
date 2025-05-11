import axios from 'axios';
import { API_CONFIG, getApiUrl } from './apiConfig';
import { unifiedAuthService } from './unifiedAuthService'; // Add this import

// Create authenticated axios instance
const authClient = () => {
  const token = localStorage.getItem('token');
  
  return axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    withCredentials: true
  });
};

export const adminSubmissionService = {
  /**
   * Get all form submissions
   * @param {string} status - Filter by status (optional)
   * @returns {Promise<Array>} List of submissions
   */
  async getSubmissions(status = null) {
    try {
      const client = authClient();
      let url = '/api/admin/submissions/';
      
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await client.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  /**
   * Update submission status
   * @param {string} id - Submission ID
   * @param {boolean} isProcessed - Whether submission is processed
   * @returns {Promise<Object>} Updated submission
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const client = authClient();
      const response = await client.patch(`/api/admin/submissions/${id}/`, {
        is_processed: isProcessed
      });
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard stats
   */
  async getStats() {
    try {
      const client = authClient();
      const response = await client.get('/api/admin/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total: 0,
        processed: 0,
        pending: 0
      };
    }
  },
  
  /**
   * Send reply to a submission
   * @param {string} id - Submission ID
   * @param {string} reply - Reply text
   * @returns {Promise<Object>} Response data
   */
  async sendReply(id, reply) {
    try {
      const client = authClient();
      const response = await client.post(`/api/admin/submissions/${id}/reply/`, {
        reply
      });
      return response.data;
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }
};
