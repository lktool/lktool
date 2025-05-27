/**
 * Submission Service
 * Handles LinkedIn profile submissions and retrieval
 */
import { apiClient } from './interceptors';

export const submissionService = {
  /**
   * Submit a LinkedIn profile for analysis
   * @param {Object} data - Submission data with linkedin_url and optional message
   * @returns {Promise<Object>} Submission result
   */
  async submitProfile(data) {
    try {
      const response = await apiClient.post('/api/contact/submit/', data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Profile submitted successfully'
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
   * Get user's submissions history
   * @param {string} queryString - Optional query string for cache busting
   * @returns {Promise<Array>} User submissions
   */
  async getUserSubmissions(queryString = '') {
    try {
      const response = await apiClient.get(`/api/contact/user-submissions/${queryString}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }
};
