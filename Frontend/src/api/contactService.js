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
        '/api/contact/submit/', // Fixed: add the missing /api/ prefix
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
      
      // Add CSRF error handling
      if (error.response && error.response.status === 403 && 
          error.response.data && error.response.data.includes('CSRF verification failed')) {
        throw {
          error: 'CSRF verification failed. Please refresh the page and try again.',
          isCsrfError: true
        };
      }
      
      // Handle authentication errors
      if (error.isAuthError || (error.response && error.response.status === 401)) {
        throw { 
          error: 'No authentication token available. Please login again.',
          isAuthError: true
        };
      }
      
      // Specific handling for CORS errors
      if (error.isCorsError || error.message === 'Network Error') {
        throw { 
          error: 'Cannot connect to the server. Please try again later.', 
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
