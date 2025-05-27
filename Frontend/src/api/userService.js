import { apiClient } from './interceptors';

export const userService = {
  /**
   * Get the current user's subscription information
   * @returns {Promise<Object>} User's subscription tier and expiration
   */
  async getSubscription() {
    try {
      const response = await apiClient.get('/api/auth/subscription/');
      return {
        success: true,
        tier: response.data.tier || 'free',
        endDate: response.data.end_date,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return {
        success: false,
        tier: 'free',
        error: error.response?.data?.error || 'Failed to fetch subscription data'
      };
    }
  },

  /**
   * Update the user's subscription tier
   * @param {string} tier - The new subscription tier (e.g., 'basic', 'premium')
   * @returns {Promise<Object>} Result of the update operation
   */
  async updateSubscription(tier) {
    try {
      const response = await apiClient.patch('/api/auth/subscription/', { tier });
      return {
        success: true,
        tier: response.data.tier,
        message: 'Subscription updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update subscription'
      };
    }
  },

  /**
   * Cancel the user's subscription
   * @returns {Promise<Object>} Result of the cancellation operation
   */
  async cancelSubscription() {
    try {
      const response = await apiClient.delete('/api/auth/subscription/');
      return {
        success: true,
        message: 'Subscription cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to cancel subscription'
      };
    }
  },

  // ...existing code...
};