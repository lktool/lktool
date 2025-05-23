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
   * Get processed submissions with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Processed submissions
   */
  async getProcessedSubmissions(options = {}) {
    try {
      // Build query params
      const queryParams = new URLSearchParams();
      
      if (options.page) {
        queryParams.append('page', options.page);
      }
      
      // Always add timestamp for cache busting
      queryParams.append('t', options.t || new Date().getTime());
      
      // Make request with cache control headers
      const response = await apiClient.get(
        `/api/admin/processed/?${queryParams.toString()}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      return {
        success: true,
        data: response.data.submissions,
        meta: {
          total: response.data.total_count,
          pages: response.data.total_pages,
          current: response.data.current_page
        }
      };
    } catch (error) {
      console.error('Error fetching processed submissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch processed submissions'
      };
    }
  },

  /**
   * Delete a submission
   * @param {number} id - Submission ID
   * @returns {Promise<Object>} Result
   */
  async deleteSubmission(id) {
    try {
      const response = await apiClient.delete(`/api/admin/processed/${id}/`);
      return {
        success: true,
        message: response.data?.message || 'Submission deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting submission:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete submission'
      };
    }
  }
};
