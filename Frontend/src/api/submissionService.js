import axios from 'axios';
import { API_CONFIG } from './apiConfig';

// Create authenticated axios instance
const authClient = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: API_CONFIG.API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });
};

export const submissionService = {
  // User submissions
  async getMySubmissions() {
    try {
      const client = authClient();
      const response = await client.get('/api/contact/user-submissions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  async submitProfile(data) {
    try {
      const client = authClient();
      const response = await client.post('/api/contact/submit/', data);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting profile:', error);
      return {
        success: false,
        error: error.response?.data || 'Submission failed'
      };
    }
  },
  
  // Admin methods
  async getAdminSubmissions(filter = '') {
    try {
      const client = authClient();
      const queryParams = filter ? `?status=${filter}` : '';
      const response = await client.get(`/api/admin/submissions/${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin submissions:', error);
      if (error.response && error.response.status === 401) {
        console.error('Admin authentication failed. Token may be invalid.');
        // Add token details for debugging
        const token = localStorage.getItem('token');
        if (token) {
          console.log("Token starts with:", token.substring(0, 15) + "...");
        }
      }
      return [];
    }
  },
  
  async submitAdminReply(submissionId, replyText) {
    try {
      const client = authClient();
      const response = await client.post(`/api/admin/submissions/${submissionId}/reply/`, {
        reply: replyText
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error submitting admin reply:', error);
      return {
        success: false,
        error: error.response?.data || 'Reply failed'
      };
    }
  },
  
  async getAdminStats() {
    try {
      const client = authClient();
      const response = await client.get('/api/admin/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
    }
  }
};
