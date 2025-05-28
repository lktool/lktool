/**
 * Admin Service
 * Handles admin-specific API calls
 */
import { apiClient } from './interceptors';
import { ENDPOINTS, AUTH_CONFIG } from './config';

export const adminService = {
  /**
   * Get submissions for admin dashboard
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Submissions data
   */
  async getSubmissions(filters = {}) {
    try {
      console.log(`Fetching admin submissions from: ${ENDPOINTS.ADMIN.SUBMISSIONS}`);
      
      // Get admin token
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      const isAdmin = localStorage.getItem(AUTH_CONFIG.USER_ROLE_KEY) === 'admin';
      
      console.log(`Admin check: token exists=${!!token}, isAdmin=${isAdmin}`);
      
      if (!token || !isAdmin) {
        throw new Error('Not authenticated as admin');
      }
      
      const response = await apiClient.get(ENDPOINTS.ADMIN.SUBMISSIONS, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Admin submissions response status:', response.status);
      
      if (!response.data?.submissions) {
        console.warn('Unexpected response format:', response.data);
        return { 
          success: false,
          error: 'Invalid response format from server',
          data: []
        };
      }
      
      return { 
        success: true,
        data: response.data.submissions
      };
    } catch (error) {
      console.error('Error fetching admin submissions:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication error - clearing admin token');
        // Force re-login on auth errors
        localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
        localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
        window.dispatchEvent(new Event(AUTH_CONFIG.AUTH_CHANGE_EVENT));
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submissions',
        data: []
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
      // Fix URL path to avoid double slashes
      const endpoint = `/api/admin/submissions/${id}/`.replace(/\/+/g, '/');
      console.log(`Fetching submission details from: ${endpoint}`);
      
      const response = await apiClient.get(endpoint);
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
   * Submit a reply to a user submission with analysis data
   * @param {number} submissionId - Submission ID
   * @param {string} reply - Admin reply text
   * @param {Object} analysisData - Optional analysis data 
   * @returns {Promise<Object>} Reply result
   */
  async submitReply(submissionId, reply, analysisData = null) {
    try {
      const payload = {
        reply,
      };
      
      // If analysis data is provided, include it in the payload
      if (analysisData) {
        payload.analysis = analysisData;
      }
      
      const response = await apiClient.post(
        `${ENDPOINTS.ADMIN.SUBMIT_REPLY(submissionId)}`, 
        payload
      );
      
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
  },

  /**
   * Get processed submissions
   * @param {Object} filters - Filter parameters like page and page_size
   * @returns {Promise<Object>} List of processed submissions
   */
  async getProcessedSubmissions(filters = {}) {
    try {
      // Fix URL path to avoid double slashes
      const endpoint = `/api/admin/processed/`.replace(/\/+/g, '/');
      console.log(`Fetching processed submissions from: ${endpoint}`);
      
      const response = await apiClient.get(endpoint, {
        params: filters
      });
      
      return { 
        success: true,
        data: Array.isArray(response.data.submissions) ? response.data.submissions : [],
        totalCount: response.data.total_count || 0,
        totalPages: response.data.total_pages || 1,
        currentPage: response.data.current_page || 1
      };
    } catch (error) {
      console.error('Error fetching processed submissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch processed submissions',
        data: []
      };
    }
  },

  /**
   * Delete a processed submission
   * @param {number} id - Submission ID to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteSubmission(id) {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.ADMIN.PROCESSED_SUBMISSIONS}${id}/`);
      return {
        success: true,
        message: response.data?.message || 'Submission deleted'
      };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete submission'
      };
    }
  },

  /**
   * Get list of users with their subscription details
   * @returns {Promise<Object>} API response with users list
   */
  async getSubscribedUsers() {
    try {
      const response = await apiClient.get('/api/auth/admin/user-subscription/');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching subscribed users:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users',
        data: []
      };
    }
  },

  /**
   * Assign subscription tier to user
   * @param {Object} data - Subscription data with email, tier, and optional validity period
   * @returns {Promise<Object>} API response
   */
  async assignUserSubscription(data) {
    try {
      const response = await apiClient.post('/api/auth/admin/user-subscription/', data);
      return {
        success: true,
        message: response.data.message || 'Subscription assigned successfully',
        ...response.data
      };
    } catch (error) {
      console.error('Error assigning subscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to assign subscription'
      };
    }
  },

  /**
   * Delete a user's subscription
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result of the operation
   */
  async deleteUserSubscription(email) {
    try {
      const response = await apiClient.delete(`/api/auth/admin/user-subscription/`, {
        params: { email }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete subscription'
      };
    }
  }
};
