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
      
      // Check for token before making request
      if (!token) {
        console.error('No authentication token found');
        return [];
      }
      
      // Handle JWT token format - some tokens are stored as JSON objects
      let authToken = token;
      try {
        // Check if token is stored as JSON
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.value) {
          authToken = parsedToken.value;
        }
      } catch (e) {
        // Token is a plain string, which is fine
      }
      
      // Make authenticated request to get user submissions
      const response = await axios.get(
        `${BACKEND_URL}/api/contact/user-submissions/`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      // Return empty array instead of throwing to avoid crashing the component
      return [];
    }
  }
};
