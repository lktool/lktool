import axios from 'axios';
import { API_CONFIG, getAdminUrl } from './apiConfig';
import { API_ENDPOINTS } from './apiEndpoints';
import { unifiedAuthService } from './unifiedAuthService';

/**
 * Admin service with consolidated methods
 * This replaces both the old adminService and adminSubmissionService
 */
export const adminService = {
  /**
   * Check if admin is authenticated using unified auth service
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return unifiedAuthService.isAuthenticated() && unifiedAuthService.isAdmin();
  },
  
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getStats() {
    try {
      if (!this.isAuthenticated()) {
        return { total: 0, processed: 0, pending: 0 };
      }
      
      const response = await axios.get(
        getAdminUrl(API_ENDPOINTS.ADMIN.STATS), 
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
    }
  },

  /**
   * Get form submissions with optional filtering
   * @param {string} filter - Filter submissions (processed, pending, all)
   * @returns {Promise<Array>} List of submissions
   */
  async getSubmissions(filter = '') {
    try {
      if (!this.isAuthenticated()) {
        console.error('Not authenticated as admin');
        return [];
      }
      
      const queryParam = filter && filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(
        getAdminUrl(API_ENDPOINTS.ADMIN.SUBMISSIONS + queryParam),
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
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
      if (!this.isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.post(
        getAdminUrl(API_ENDPOINTS.ADMIN.REPLY(submissionId)),
        { reply: replyText },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting reply:', error);
      return {
        success: false,
        error: error.response?.data || 'Reply failed'
      };
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
      if (!this.isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      const response = await axios.patch(
        getAdminUrl(API_ENDPOINTS.ADMIN.SUBMISSION_DETAIL(id)),
        { is_processed: isProcessed },
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating submission:', error);
      return {
        success: false,
        error: error.response?.data || 'Update failed'
      };
    }
  }
};
