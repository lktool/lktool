/**
 * Submission Service
 * Handles LinkedIn profile submissions and retrieval
 */
import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

export const submissionService = {
  /**
   * Submit a LinkedIn profile for analysis
   * @param {Object} data - Submission data with linkedin_url and optional message
   * @returns {Promise<Object>} Submission result
   */
  async submitProfile(data) {
    try {
      // This endpoint is defined in contact/urls.py to point to SubmitFormView
      const response = await apiClient.post(
        `${ENDPOINTS.CONTACT.BASE}${ENDPOINTS.CONTACT.SUBMIT}`, 
        data
      );
      
      return {
        success: true,
        data: response.data,
        message: "LinkedIn profile submitted successfully!"
      };
    } catch (error) {
      console.error('Error submitting LinkedIn profile:', error);
      return {
        success: false,
        error: error.response?.data || 'Submission failed'
      };
    }
  },
  
  /**
   * Get current user's submissions
   * @returns {Promise<Array>} User's LinkedIn profile submissions
   */
  async getUserSubmissions() {
    try {
      // This endpoint is defined in contact/urls.py to point to UserSubmissionsView
      const response = await apiClient.get(
        `${ENDPOINTS.CONTACT.BASE}${ENDPOINTS.CONTACT.USER_SUBMISSIONS}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user LinkedIn profile submissions:', error);
      throw error;
    }
  }
};
