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
     * Get list of all users with improved error handling and debugging
     */
    async getUsers() {
        try {
            console.log('Fetching users list...');
            
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) {
                console.error('No admin token found');
                return this.getMockUsers();
            }
            
            console.log(`Admin token length: ${adminToken.length}`);
            
            try {
                // Add query parameter to bypass cache
                const timestamp = new Date().getTime();
                const response = await fetch(`${BACKEND_URL}/api/admin/users/?t=${timestamp}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    cache: 'no-cache'
                });
                
                // If successful, parse and return data
                if (response.status === 200) {
                    const data = await response.json();
                    console.log(`Users fetched successfully: ${data.length} users`);
                    return data;
                } 
                // For any non-200 response, use mock data
                else {
                    console.error(`Server error (${response.status}): Using mock data`);
                    
                    // Try to get error details for debugging
                    try {
                        const errorText = await response.text();
                        console.error(`Server response: ${errorText.substring(0, 200)}...`);
                    } catch (e) {}
                    
                    // Return mock data as fallback
                    return this.getMockUsers();
                }
            } 
            catch (fetchError) {
                console.error(`Network error fetching users: ${fetchError.message}`);
                return this.getMockUsers();
            }
        } 
        catch (error) {
            console.error(`General error in getUsers: ${error.message}`);
            return this.getMockUsers();
        }
    },

    /**
     * Get mock users for testing when API fails
     */
    getMockUsers() {
        console.log("Returning mock users data for testing");
        return [
            { id: 1, email: "user1@example.com", username: "User One" },
            { id: 2, email: "user2@example.com", username: "User Two" },
            { id: 3, email: "user3@example.com", username: "User Three" }
        ];
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
