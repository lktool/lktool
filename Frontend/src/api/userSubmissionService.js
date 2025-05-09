import axios from 'axios';
import { API_CONFIG } from './apiConfig';
import { API_ENDPOINTS } from './apiEndpoints';

// Backend URL from centralized config
const BACKEND_URL = API_CONFIG.API_URL;

/**
 * Service for handling user submission data
 */
export const userSubmissionService = {
  /**
   * Fetch user's submissions from the backend
   * @returns {Promise<Array>} Array of user's submissions
   */
  async getUserSubmissions() {
    try {
      // Get the authentication token - use centralized token storage
      const token = localStorage.getItem('token');
      
      // Check for token before making request
      if (!token) {
        console.error('No authentication token found');
        return [];
      }
      
      // Make authenticated request to get user submissions
      const response = await axios.get(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMISSIONS.USER_LIST}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  },
  
  /**
   * Submit a LinkedIn profile for analysis
   * @param {Object} data - Submission data with LinkedIn URL and message
   * @returns {Promise<Object>} Result with success flag and data or error
   */
  async submitLinkedInProfile(data) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { 
          success: false, 
          error: 'Authentication required' 
        };
      }
      
      const response = await axios.post(
        `${BACKEND_URL}${API_ENDPOINTS.SUBMISSIONS.SUBMIT}`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting LinkedIn profile:', error);
      return {
        success: false,
        error: error.response?.data || 'Submission failed'
      };
    }
  }
};
