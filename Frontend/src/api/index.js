/**
 * API Module Exports
 * Central export point for all API services
 */

import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';
import { authService } from './authService';

// Define the submission service
const submissionService = {
  /**
   * Submit a LinkedIn profile for analysis
   */
  async submitProfile(data) {
    try {
      const response = await apiClient.post(ENDPOINTS.SUBMIT_PROFILE, data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to submit profile'
      };
    }
  },

  /**
   * Get submissions for the current authenticated user
   * @param {string} queryParams - Optional query string parameters
   * @returns {Promise<Array>} Array of user submissions
   */
  async getUserSubmissions(queryParams = '') {
    try {
      console.log('Fetching user submissions...');
      
      // Ensure token is attached to request
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token available');
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get(`${ENDPOINTS.USER_SUBMISSIONS}${queryParams}`);
      
      // Validate response format
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        return [];
      }
      
      console.log(`Got ${response.data.length} submissions`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user submissions:', error);
      
      // If we get a 401, clear the token to force re-login
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('authChange'));
      }
      
      throw error;
    }
  }
};

// Define the admin service
const adminService = {
  /**
   * Get submissions for admin dashboard
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} List of submissions
   */
  async getSubmissions(filters = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.SUBMISSIONS, {
        params: filters
      });
      return {
        success: true,
        data: response.data.submissions,
        totalCount: response.data.total_count,
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submissions',
        data: []
      };
    }
  },

  /**
   * Submit a reply to a user's profile submission
   * @param {number} id - Submission ID
   * @param {string} reply - Admin's reply text
   * @returns {Promise<Object>} Result of submission
   */
  async submitReply(id, reply) {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ADMIN.SUBMIT_REPLY(id)}`, {
        reply
      });
      return {
        success: true,
        message: response.data.message
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
   * Get processed submissions
   * @param {Object} filters - Filter parameters like page and page_size
   * @returns {Promise<Object>} List of processed submissions
   */
  async getProcessedSubmissions(filters = {}) {
    try {
      console.log(`Fetching processed submissions`);
      
      const response = await apiClient.get(ENDPOINTS.ADMIN.PROCESSED_SUBMISSIONS, {
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
   * Get submission details
   * @param {number} id - Submission ID
   * @returns {Promise<Object>} Submission details
   */
  async getSubmissionDetails(id) {
    try {
      const response = await apiClient.get(`${ENDPOINTS.ADMIN.SUBMISSION_DETAIL(id)}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching submission details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch submission details',
        data: null
      };
    }
  },

  /**
   * Submit a reply to a user's profile submission with form data
   * @param {number} id - Submission ID
   * @param {string} reply - Admin's reply text
   * @param {Object|null} formData - Additional form data
   * @returns {Promise<Object>} Result of submission
   */
  async submitReply(id, reply, formData = null) {
    try {
      const response = await apiClient.post(`${ENDPOINTS.ADMIN.SUBMIT_REPLY(id)}`, {
        reply,
        form_data: formData
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error submitting reply:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit reply'
      };
    }
  }
};

// Export all services
export {
  authService,
  submissionService,
  adminService
};
