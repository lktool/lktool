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



};
