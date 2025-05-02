import axios from 'axios';

const BACKEND_URL = 'https://lktool.onrender.com';

export const userSubmissionService = {
  /**
   * Get current user's submissions history
   */
  async getUserSubmissions() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
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
