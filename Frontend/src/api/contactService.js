import axiosInstance from './axiosConfig';

/**
 * Contact form service for handling contact form submissions
 */
export const contactService = {
  /**
   * Submit contact form data to the backend
   */
  async submitContactForm(linkedinUrl, message, email) {
    try {
      console.log('Submitting contact form data');
      
      // Use the configured axios instance which already handles authentication
      const response = await axiosInstance.post(
        '/contact/submit/',
        {
          linkedin_url: linkedinUrl,
          message,
          email
        }
      );
      
      console.log('Contact form submission successful');
      return response.data;
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Specific handling for CORS errors
      if (error.isCorsError || error.message === 'Network Error') {
        throw { 
          error: 'Cannot connect to the server due to CORS policy restrictions. Please try again later.', 
          isCorsError: true 
        };
      }
      
      // Handle other error types
      if (error.response) {
        // Return the server's error response
        throw error.response.data;
      } else {
        // Network or other error
        throw { error: error.message || 'An unexpected error occurred' };
      }
    }
  }
};
