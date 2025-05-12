/**
 * Contact Service
 * Handles contact form submissions and general inquiries
 */
import { apiClient } from './interceptors';
import { ENDPOINTS } from './config';

export const contactService = {
  /**
   * Submit a contact message
   * @param {Object} data - Contact form data
   * @param {string} data.name - Name of the sender
   * @param {string} data.email - Email of the sender
   * @param {string} data.subject - Subject of the message
   * @param {string} data.message - Message body
   * @param {string} data.message_type - Type of message (general, feedback, etc.)
   * @returns {Promise<Object>} Submission result
   */
  async submitContactForm(data) {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.CONTACT.BASE}${ENDPOINTS.CONTACT.CONTACT_MESSAGE}`, 
        data
      );
      
      return {
        success: true,
        message: response.data.message || 'Message sent successfully!'
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // Process validation errors
      if (error.response?.data && typeof error.response.data === 'object') {
        const errors = {};
        Object.keys(error.response.data).forEach(key => {
          errors[key] = Array.isArray(error.response.data[key]) 
            ? error.response.data[key][0] 
            : error.response.data[key];
        });
        
        return {
          success: false,
          error: 'Please correct the errors in your form.',
          validationErrors: errors
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send message'
      };
    }
  }
};
