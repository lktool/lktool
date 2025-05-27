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
      const response = await apiClient.post(ENDPOINTS.SUBMIT_PROFILE, data);
      
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
