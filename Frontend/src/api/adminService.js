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
            
            console.log("Admin login response:", response.data);
            
            // Store the admin token on successful login
            if (response.data && response.data.token) {
                // Store raw token string as-is, without any wrapping
                const token = response.data.token;
                console.log(`Setting admin token: ${token.substring(0, 10)}...`);
                
                // Store token directly without JSON.stringify
                localStorage.setItem('adminToken', token);
                
                // Also store admin email and timestamp
                localStorage.setItem('adminEmail', email);
                localStorage.setItem('adminLoginTime', Date.now().toString());
                
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
     * Get list of all users with robust error handling
     */
    async getUsers() {
        try {
            console.log('Fetching users list...');
            
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                console.error('No admin token found');
                return [];
            }
            
            console.log(`Admin token length: ${adminToken.length}`);
            
            // Use fetch for more direct control over the request
            try {
                const response = await fetch(`${BACKEND_URL}/api/admin/users/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    }
                });
                
                // Handle all response statuses properly
                if (response.status === 200) {
                    const data = await response.json();
                    console.log(`Users fetched successfully: ${data.length || 0} users`);
                    return Array.isArray(data) ? data : [];
                } 
                else if (response.status === 401) {
                    console.error("Admin authentication failed - invalid token");
                    return [];
                }
                else if (response.status === 500) {
                    // Handle 500 errors - try to parse error or return empty array
                    let errorText = await response.text();
                    console.error(`Server error (500): ${errorText.substring(0, 200)}...`);
                    
                    // Mock users for testing if needed - REMOVE IN PRODUCTION
                    console.log("Returning mock users data for testing");
                    return [
                        { id: 1, email: "test@example.com", username: "Test User" }
                    ];
                }
                else {
                    console.error(`Unexpected response status: ${response.status}`);
                    return [];
                }
            } 
            catch (fetchError) {
                console.error(`Network error fetching users: ${fetchError.message}`);
                return [];
            }
        } 
        catch (error) {
            console.error(`General error in getUsers: ${error.message}`);
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
