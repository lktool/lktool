/**
 * Admin Service
 * Handles admin-specific API calls
 */
import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

export const adminService = {
  /**
   * Get all submissions for admin dashboard
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status (all, pending, processed)
   * @param {string} options.search - Search term
   * @param {string} options.sort - Sort field
   * @param {number} options.page - Page number
   * @returns {Promise<Object>} Paginated submissions
   */
  async getSubmissions(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.status && options.status !== 'all') {
        params.append('status', options.status);
      }
      
      if (options.search) {
        params.append('search', options.search);
      }
      
      if (options.sort) {
        params.append('sort', options.sort);
      }
      
      if (options.page) {
        params.append('page', options.page);
      }
      
      const url = `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.SUBMISSIONS}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submissions'
      };
    }
  },
  
  /**
   * Update a submission's status
   * @param {number} submissionId - ID of the submission
   * @param {boolean} isProcessed - Whether the submission is processed
   * @returns {Promise<Object>} Updated submission data
   */
  async updateSubmissionStatus(submissionId, isProcessed) {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.SUBMISSION_DETAIL(submissionId)}`,
        { is_processed: isProcessed }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating submission status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update submission'
      };
    }
  },
  
  /**
   * Submit an admin reply to a user submission
   * @param {number} submissionId - ID of the submission
   * @param {string} reply - Admin's reply text
   * @returns {Promise<Object>} Result of the reply submission
   */
  async submitReply(submissionId, reply) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.CONTACT.BASE}${ENDPOINTS.CONTACT.ADMIN_REPLY(submissionId)}`,
        { reply }
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
   * @param {number} submissionId - ID of the submission to analyze
   * @param {Object} analysisData - Profile analysis data
   * @returns {Promise<Object>} Analysis result
   */
  async submitProfileAnalysis(submissionId, analysisData) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.PROFILE_ANALYSES}`,
        {
          submission_id: submissionId,
          ...analysisData
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting profile analysis:', error);
      return {
        success: false,
        error: error.response?.data || 'Failed to submit analysis'
      };
    }
  },
  
  /**
   * Get analysis for a specific submission
   * @param {number} analysisId - ID of the analysis
   * @returns {Promise<Object>} Analysis data
   */
  async getAnalysis(analysisId) {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.PROFILE_ANALYSIS_DETAIL(analysisId)}`
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching analysis:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch analysis'
      };
    }
  },
  
  /**
   * Check if a submission has been analyzed
   * @param {number} submissionId - ID of the submission
   * @returns {Promise<Object>} Analysis status and ID if it exists
   */
  async checkAnalysisStatus(submissionId) {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.ANALYSIS_STATUS(submissionId)}`
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking analysis status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check analysis status'
      };
    }
  },
  
  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.DASHBOARD_STATS}`
      );
      
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
   * Delete a submission
   * @param {number} submissionId - ID of the submission to delete
   * @returns {Promise<Object>} Operation result
   */
  async deleteSubmission(submissionId) {
    try {
      await apiClient.delete(
        `${ENDPOINTS.ADMIN.BASE}${ENDPOINTS.ADMIN.SUBMISSION_DETAIL(submissionId)}`
      );
      
      return {
        success: true,
        message: 'Submission deleted successfully'
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
