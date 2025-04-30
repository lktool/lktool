import axios from 'axios';
import { getApiUrl } from './apiConfig';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  FORM_SUBMISSIONS: '/api/admin/submissions/',
  FORM_SUBMISSION_DETAIL: '/api/admin/submissions/:id/',
  ADMIN_STATS: '/api/admin/stats/'
};

// Create authenticated admin API client
const createAdminApiClient = () => {
  const token = localStorage.getItem('token');
  
  return axios.create({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export const adminService = {
  /**
   * Get all form submissions
   * @returns {Promise<Array>} Array of form submissions
   */
  async getFormSubmissions(queryString = '') {
    try {
      const apiClient = createAdminApiClient();
      const endpoint = `${ADMIN_ENDPOINTS.FORM_SUBMISSIONS}${queryString}`;
      const response = await apiClient.get(getApiUrl(endpoint));
      return response.data;
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      
      // For development, return mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock data since API failed');
        return mockSubmissions;
      }
      
      throw error;
    }
  },

  /**
   * Update a submission's processed status
   * @param {number} id - The submission ID
   * @param {boolean} isProcessed - New processed status
   * @returns {Promise<Object>} Updated submission
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const apiClient = createAdminApiClient();
      const url = ADMIN_ENDPOINTS.FORM_SUBMISSION_DETAIL.replace(':id', id);
      const response = await apiClient.patch(getApiUrl(url), { is_processed: isProcessed });
      return response.data;
    } catch (error) {
      console.error(`Error updating form submission ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get admin dashboard statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStats() {
    try {
      const apiClient = createAdminApiClient();
      const response = await apiClient.get(getApiUrl(ADMIN_ENDPOINTS.ADMIN_STATS));
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        total_submissions: mockSubmissions.length,
        processed_submissions: mockSubmissions.filter(s => s.is_processed).length,
        pending_submissions: mockSubmissions.filter(s => !s.is_processed).length
      };
    }
  }
};

// Mock data for development/testing
const mockSubmissions = [
  {
    id: 1,
    email: 'user1@example.com',
    linkedin_url: 'https://linkedin.com/in/user1',
    message: 'I am interested in your services. Please contact me to discuss further.',
    created_at: '2025-04-25T10:30:00Z',
    is_processed: false
  },
  {
    id: 2,
    email: 'user2@example.com',
    linkedin_url: 'https://linkedin.com/in/user2',
    message: 'Looking for a consultation about your LinkedIn services.',
    created_at: '2025-04-24T14:20:00Z',
    is_processed: true
  },
  {
    id: 3,
    email: 'user3@example.com',
    linkedin_url: 'https://linkedin.com/in/user3',
    message: 'Can you help me optimize my LinkedIn profile? I need professional assistance.',
    created_at: '2025-04-23T09:15:00Z',
    is_processed: false
  }
];
