/**
 * API Module Exports
 * Central export point for all API services
 */

import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

// Import services from individual files
import { authService } from './authService';
import { submissionService } from './submissionService';
import { adminService } from './adminService';

// Export services - make sure each one is exported only once
export {
  authService,
  submissionService,
  adminService
};

// Export config
export * from './config';

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
      console.log(`Fetching submissions with filters:`, filters);
      
      const response = await apiClient.get(ENDPOINTS.ADMIN.SUBMISSIONS, {
        params: filters,
        timeout: 15000 // Add timeout to prevent hanging requests
      });
      
      console.log(`Submissions response:`, response.data);
      
      return {
        success: true,
        data: Array.isArray(response.data.submissions) ? response.data.submissions : [],
        totalCount: response.data.total_count || 0,
        totalPages: response.data.total_pages || 1,
        currentPage: response.data.current_page || 1
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      console.error('Error details:', error.response?.data);
      
      // Handle auth errors specifically
      if (error.response?.status === 401) {
        console.log('Authentication error - logging out');
        authService.logout();
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch submissions',
        data: []
      };
    }
  },

  /**
   * Submit a reply to a user's profile submission
   * @param {number} id - Submission ID
   * @param {string} reply - Admin's reply text
   * @param {Object|null} formData - Additional form data
   * @returns {Promise<Object>} Result of submission
   */
  async submitReply(id, reply, formData = null) {
    try {
      console.log(`Submitting reply for ID ${id} with formData:`, formData);
      
      const payload = { reply };
      if (formData) {
        payload.form_data = formData;
      }
      
      const response = await apiClient.post(`${ENDPOINTS.ADMIN.SUBMIT_REPLY(id)}`, payload);
      
      console.log('Submit reply response:', response.data);
      
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
        params: filters,
        timeout: 15000 // Add timeout to prevent hanging requests  
      });
      
      console.log(`Processed submissions response:`, response.data);
      
      return { 
        success: true,
        data: Array.isArray(response.data.submissions) ? response.data.submissions : [],
        totalCount: response.data.total_count || 0,
        totalPages: response.data.total_pages || 1,
        currentPage: response.data.current_page || 1
      };
    } catch (error) {
      console.error('Error fetching processed submissions:', error);
      console.error('Error details:', error.response?.data);
      
      // Handle auth errors specifically
      if (error.response?.status === 401) {
        console.log('Authentication error - logging out');
        authService.logout();
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch processed submissions',
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
      console.log(`Fetching details for submission ID: ${id}`);
      
      const response = await apiClient.get(`${ENDPOINTS.ADMIN.SUBMISSION_DETAIL(id)}`, {
        timeout: 15000
      });
      
      console.log('Raw submission details response:', response.data);
      
      // Check if we have valid data
      if (!response.data) {
        console.error('Empty response received');
        return {
          success: false,
          error: 'Empty response from server',
          data: null
        };
      }
      
      // Ensure form_data exists and is properly formatted
      if (!response.data.form_data) {
        console.log('No form_data in response, adding empty object');
        response.data.form_data = {};
      } else {
        console.log('Form data found in response:', response.data.form_data);
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching submission details:', error);
      console.error('Error response:', error.response?.data);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch submission details',
        data: null
      };
    }
  }
};
