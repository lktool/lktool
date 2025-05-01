import axios from 'axios';
import { getApiUrl } from './apiConfig';

// Admin API endpoints
const ADMIN_ENDPOINTS = {
  LOGIN: '/api/admin/login/',
  SUBMISSIONS: '/api/admin/submissions/',
  UPDATE_SUBMISSION: '/api/admin/submissions/:id/'
};

export const adminService = {
  /**
   * Check if admin is authenticated
   */
  isAdminAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },
  
  /**
   * Admin logout
   */
  logout() {
    localStorage.removeItem('adminToken');
  },
  
  /**
   * Get all submissions with optional filtering
   */
  async getSubmissions(statusFilter = '') {
    try {
      // Create a query string if filter is specified
      const queryString = statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      
      // For simplicity, returning mock data for now
      return mockSubmissions;
      
      // In a real implementation, you would uncomment this:
      /*
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        getApiUrl(ADMIN_ENDPOINTS.SUBMISSIONS + queryString),
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
      */
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  /**
   * Update submission status
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      // For simplicity, just returning success for now
      console.log(`Updating submission ${id} to ${isProcessed ? 'processed' : 'pending'}`);
      return { success: true };
      
      // In a real implementation, you would uncomment this:
      /*
      const token = localStorage.getItem('adminToken');
      const url = ADMIN_ENDPOINTS.UPDATE_SUBMISSION.replace(':id', id);
      const response = await axios.patch(
        getApiUrl(url),
        { is_processed: isProcessed },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
      */
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }
};

// Mock data for development
const mockSubmissions = [
  {
    id: 1,
    email: 'user1@example.com',
    linkedin_url: 'https://linkedin.com/in/user1',
    message: 'I am interested in your services.',
    created_at: '2025-04-25T10:30:00Z',
    is_processed: false
  },
  {
    id: 2,
    email: 'user2@example.com',
    linkedin_url: 'https://linkedin.com/in/user2',
    message: 'Looking for your expertise.',
    created_at: '2025-04-24T14:20:00Z',
    is_processed: true
  }
];
