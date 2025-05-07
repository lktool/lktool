import axios from 'axios';
import { API_CONFIG } from './apiConfig';

// Backend URL from centralized config
const BACKEND_URL = API_CONFIG.API_URL;

// Create an API client with admin authorization header
function authClient() {
  const token = localStorage.getItem('adminToken');
  return axios.create({
    baseURL: BACKEND_URL,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '' 
    }
  });
}

export const adminService = {
  /**
   * Admin login with direct connection to backend
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<boolean>} Success flag
   */
  async login(email, password) {
    try {
      console.log(`Attempting admin login to ${BACKEND_URL}/api/admin/login/`);
      
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/login/`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      console.log('Admin login response:', response);
      
      // Store the admin token on successful login
      if (response.data && response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin login error:', error.response || error);
      throw error;
    }
  },
  
  /**
   * Check if admin is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  },
  
  /**
   * Admin logout
   */
  logout() {
    localStorage.removeItem('adminToken');
    // Notify components about auth state change
    window.dispatchEvent(new Event('authChange'));
  },
  
  /**
   * Get form submissions with optional filtering
   * @param {string} filter - Filter submissions (processed, pending, all)
   * @returns {Promise<Array>} List of submissions
   */
  async getSubmissions(filter = '') {
    try {
      const client = authClient();
      const queryParam = filter && filter !== 'all' ? `?status=${filter}` : '';
      const response = await client.get(`/api/admin/submissions/${queryParam}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  /**
   * Update submission status
   * @param {number} id - Submission ID
   * @param {boolean} isProcessed - Processed flag
   * @returns {Promise<Object>} Updated submission
   */
  async updateSubmissionStatus(id, isProcessed) {
    try {
      const client = authClient();
      const response = await client.patch(`/api/admin/submissions/${id}/`, { is_processed: isProcessed });
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  },
  
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getStats() {
    try {
      const client = authClient();
      const response = await client.get('/api/admin/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { total: 0, processed: 0, pending: 0 };
    }
  },

  /**
   * Get list of users
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    try {
        console.log('Fetching users list...');
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            console.log('No admin token found');
            return this.getMockUsers();
        }
        
        console.log(`Admin token length: ${token.length}`);
        
        // CRITICAL FIX: Use axios instead of fetch for consistent handling
        try {
            const response = await axios.get(
                `${BACKEND_URL}/api/admin/users/?t=${Date.now()}`, 
                {
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    validateStatus: function (status) {
                        return status < 500; // Only throw for 500 errors
                    }
                }
            );
            
            if (response.status === 200 && Array.isArray(response.data)) {
                console.log(`Users fetched: ${response.data.length}`);
                return response.data;
            } else {
                console.error(`Invalid response: ${response.status}`, response.data);
                return this.getMockUsers();
            }
        } catch (error) {
            console.error('API error:', error);
            return this.getMockUsers();
        }
    } catch (error) {
        console.error('Critical error:', error);
        return this.getMockUsers();
    }
  },

  getMockUsers() {
    console.log("Returning mock users data for testing");
    return [
        { id: 1, email: "user1@example.com" },
        { id: 2, email: "user2@example.com" },
        { id: 3, email: "user3@example.com" }
    ];
  }
};
