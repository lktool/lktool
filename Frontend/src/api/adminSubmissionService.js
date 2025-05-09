import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import { API_ENDPOINTS } from './apiEndpoints';

// Backend URL from centralized config
const BACKEND_URL = API_CONFIG.API_URL;

/**
 * Service for handling admin submission operations
 */
export const adminSubmissionService = {
  /**
   * Get submissions with optional filtering
   * @param {string} filter - Filter submissions (processed, pending, all)
   * @returns {Promise<Array>} List of submissions
   */
  async getSubmissions(filter = '') {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return [];
      }
      
      const queryParam = filter && filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMISSIONS.ADMIN_LIST}${queryParam}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching admin submissions:', error);
      if (error.response?.status === 401) {
        console.error('Admin authentication failed. Token may be invalid.');
      }
      return [];
    }
  },
  
  /**
   * Submit admin reply to a user submission
   * @param {number} submissionId - Submission ID
   * @param {string} replyText - Admin's reply text
   * @returns {Promise<Object>} Response data
   */
  async submitReply(submissionId, replyText) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }
      
      const response = await axios.post(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMISSIONS.ADMIN_REPLY(submissionId)}`,
        { reply: replyText },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
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
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getStats() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { total: 0, processed: 0, pending: 0 };
      }
      
      const response = await axios.get(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMISSIONS.ADMIN_STATS}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
    }
  }
};
