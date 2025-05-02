import axios from 'axios';

// Backend URL for API calls
const BACKEND_URL = 'https://lktool.onrender.com';

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
      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Make authenticated request to get user submissions
      const response = await axios.get(
        `${BACKEND_URL}/api/contact/user-submissions/`,
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
      throw error;
    }
  }
};
