/**
 * API Module Exports
 * Central export point for all API services
 */

// Export all API services
export { authService } from './authService';
export { submissionService } from './submissionService';
export { adminService } from './adminService';

// Export config and interceptors for direct access if needed
export * from './config';
export * from './interceptors';

// Export all services
export { contactService } from './contactService';

// Re-export as a combined API object
import { authService } from './authService';
import { submissionService } from './submissionService';
import { contactService } from './contactService';
import { adminService } from './adminService';

export const api = {
  auth: authService,
  submissions: submissionService,
  contact: contactService,
  admin: adminService
};

export const submissionService = {
    /**
     * Get submissions for the current authenticated user
     * @param {string} queryParams - Optional query string parameters
     * @returns {Promise<Array>} Array of user submissions
     */
    async getUserSubmissions(queryParams = '') {
        try {
            console.log('Fetching user submissions...');
            
            // Ensure token is attached to request
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No auth token available');
                throw new Error('Authentication required');
            }
            
            const response = await apiClient.get(`${API_ENDPOINTS.USER_SUBMISSIONS}${queryParams}`);
            
            // Validate response format
            if (!Array.isArray(response.data)) {
                console.error('Invalid response format:', response.data);
                return [];
            }
            
            console.log(`Got ${response.data.length} submissions`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch user submissions:', error);
            
            // If we get a 401, clear the token to force re-login
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('authChange'));
            }
            
            throw error;
        }
    },
};
export default api;
