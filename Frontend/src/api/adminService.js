import axios from 'axios';

// Backend URL
const BACKEND_URL = 'https://lktool.onrender.com';

// Create admin client with token - Fixed token handling
const createAdminClient = () => {
    const token = localStorage.getItem('adminToken');
    
    // Debug token retrieval
    console.log('Admin token from storage:', token ? `${token.substr(0, 10)}...` : 'none');
    
    return axios.create({
        baseURL: BACKEND_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        }
    });
};

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
            
            // Store the admin token on successful login - Make sure format is consistent
            if (response.data && response.data.token) {
                // Store raw token string, not JSON object
                const token = response.data.token;
                console.log(`Setting admin token: ${token.substr(0, 10)}...`);
                localStorage.setItem('adminToken', token);
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
            const apiClient = createAdminClient();
            const queryParam = filter && filter !== 'all' ? `?status=${filter}` : '';
            const response = await apiClient.get(`/api/admin/submissions${queryParam}`);
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
            const apiClient = createAdminClient();
            const response = await apiClient.patch(`/api/admin/submissions/${id}/`, { is_processed: isProcessed });
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
            const apiClient = createAdminClient();
            const response = await apiClient.get('/api/admin/stats/');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return { total: 0, processed: 0, pending: 0 };
        }
    },

    /**
     * Get list of all users with improved token handling
     * @returns {Promise<Array>} Array of users
     */
    async getUsers() {
        try {
            console.log('Fetching users list...');
            
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                console.error('No admin token found');
                return [];
            }
            
            console.log(`Admin token found (${adminToken.substr(0, 10)}...), requesting users list`);
            
            // Create new request manually instead of using createAdminClient helper
            const response = await axios.get(`${BACKEND_URL}/api/admin/users/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            
            console.log('Users fetched successfully:', response.data.length);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error.response?.data || error.message);
            
            // Special handling for token issues
            if (error.response?.status === 401) {
                console.error('Admin token invalid or expired. Please re-login.');
                // Force logout
                localStorage.removeItem('adminToken');
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);
            }
            
            return [];
        }
    },
    
    /**
     * Get submissions for specific user
     * @param {string|number} userId - User ID
     * @returns {Promise<Array>} Array of user's submissions
     */
    async getUserSubmissions(userId) {
        try {
            const apiClient = createAdminClient();
            const response = await apiClient.get(`/api/admin/users/${userId}/submissions/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user submissions:', error);
            return [];
        }
    },
    
    /**
     * Submit LinkedIn analysis
     * @param {Object} analysisData - Contains user, submission, and form data
     * @returns {Promise<Object>} Response data
     */
    async submitAnalysis(analysisData) {
        try {
            const apiClient = createAdminClient();
            const response = await apiClient.post('/api/admin/submissions/', analysisData);
            return response.data;
        } catch (error) {
            console.error('Error submitting analysis:', error);
            throw error;
        }
    }
};
