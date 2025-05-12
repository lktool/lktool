/**
 * Admin Service
 * Handles admin-specific API calls
 */
import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

export const adminService = {
  /**
   * Get submissions for admin dashboard
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Submissions data
   */
  async getSubmissions(filters = {}) {
    try {
      console.log(`Fetching submissions from: ${ENDPOINTS.ADMIN.SUBMISSIONS}`);
      
      // Add authorization debugging
      const token = localStorage.getItem('token');
      console.log(`Using auth token: ${token ? 'Present' : 'Missing'}`);
      
      const response = await apiClient.get(ENDPOINTS.ADMIN.SUBMISSIONS, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Submissions response:', response);
      
      return { 
        success: true,
        data: Array.isArray(response.data.submissions) ? response.data.submissions : []
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      console.error('Error details:', error.response?.data);
      
      // Check if we have a 403 (permission) error
      if (error.response?.status === 403) {
        console.error('Permission denied - Admin permissions required');
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submissions',
        data: [] // Always return an array to prevent "length" errors
      };
    }
  },

  /**
   * Get detailed information about a specific submission
   * @param {number} id - Submission ID
   * @returns {Promise<Object>} Submission details
   */
  async getSubmissionDetails(id) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.ADMIN.SUBMISSIONS}/${id}/`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching submission ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submission details'
      };
    }
  },

  /**
   * Submit a reply to a user submission
   * @param {number} submissionId - Submission ID
   * @param {string} reply - Admin reply text
   * @returns {Promise<Object>} Reply result
   */
  async submitReply(submissionId, reply) {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ADMIN.SUBMIT_REPLY(submissionId)}`, {
        reply
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting reply:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit reply'
      };
    }
  },

  /**
   * Submit LinkedIn profile analysis
   * @param {number} submissionId - Submission ID
   * @param {Object} analysisData - Analysis data
   * @returns {Promise<Object>} Analysis result
   */
  async submitProfileAnalysis(submissionId, analysisData) {
    try {
      const payload = {
        ...analysisData,
        submission_id: submissionId
      };
      
      const response = await apiClient.post(
        ENDPOINTS.ADMIN.PROFILE_ANALYSIS, 
        payload
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting analysis:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit analysis'
      };
    }
  },

  /**
   * Update submission status (processed/unprocessed)
   * @param {number} submissionId - Submission ID
   * @param {boolean} isProcessed - Is the submission processed
   * @returns {Promise<Object>} Update result
   */
  async updateSubmissionStatus(submissionId, isProcessed) {
    try {
      const response = await apiClient.patch(`${ENDPOINTS.ADMIN.SUBMISSIONS}/${submissionId}/`, {
        is_processed: isProcessed
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating submission status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update submission status'
      };
    }
  },

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.DASHBOARD_STATS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch dashboard statistics'
      };
    }
  }
};
