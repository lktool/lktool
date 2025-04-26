import axios from 'axios';
import { API_CONFIG, getApiUrl } from './apiConfig';

// Helper function to get token from various storages
const getAuthToken = () => {
  // Try to get from localStorage first (different possible names)
  const token = localStorage.getItem('token') || 
                localStorage.getItem('accessToken');
  
  // If not in localStorage, try sessionStorage
  if (!token) {
    return sessionStorage.getItem('accessToken') || 
           sessionStorage.getItem('token');
  }
  
  // Try to parse JSON format if present
  if (token && token.includes('{')) {
    try {
      const parsed = JSON.parse(token);
      return parsed.value; // Return token value from cache object
    } catch (e) {
      return token; // If parsing fails, return the raw token
    }
  }
  
  return token;
};

/**
 * Contact form service for handling contact form submissions
 */
export const contactService = {
  /**
   * Submit contact form data
   * @param {string} linkedinUrl - User's LinkedIn URL
   * @param {string} message - Message content
   * @param {string} email - User's email address
   * @returns {Promise} - Response from the API
   */
  async submitContactForm(linkedinUrl, message, email) {
    try {
      console.log(`Submitting contact form with LinkedIn URL: ${linkedinUrl}`);
      
      // Get the token with proper fallback strategy
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }
      
      const response = await axios.post(
        getApiUrl(API_CONFIG.CONTACT.SUBMIT),
        {
          linkedin_url: linkedinUrl,
          message: message,
          email: email
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a non-2xx status
        if (error.response.status === 401) {
          console.error('Authentication error: Token may be expired');
          // Clear tokens on auth error
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
        }
        
        // Return the error response data to allow component-level handling
        throw error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw { error: 'No response received from server. Please try again later.' };
      } else {
        // Something happened in setting up the request
        throw { error: error.message || 'An unexpected error occurred' };
      }
    }
  }
};
