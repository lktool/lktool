import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api';
import axios from 'axios';

// Create the context
const SubscriptionContext = createContext({
  tier: 'free',
  loading: true,
  error: null,
  hasPremiumAccess: false,
  hasBasicAccess: false,
  checkTierAccess: () => false,
  refreshSubscription: () => {} // Add this function
});

// Export the provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    tier: 'free',
    endDate: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchSubscription = async (forceRefresh = false) => {
    // Skip if not authenticated
    if (!authService.isAuthenticated()) {
      setSubscription({
        tier: 'free',
        endDate: null,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      return;
    }

    try {
      // Always use timestamp to prevent caching issues
      const timestamp = new Date().getTime();
      
      console.log(`Fetching subscription info${forceRefresh ? ' (forced refresh)' : ''}...`);
      
      const response = await axios.get(`/api/auth/subscription/?t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store'
        }
      });

      console.log('DEBUG: Subscription response:', response.data);
      
      // Normalize tier to lowercase for consistency
      const tier = (response.data.tier || 'free').toLowerCase();
      
      console.log(`DEBUG: Setting tier to: ${tier}`);
      
      setSubscription({
        tier: tier,
        endDate: response.data.end_date || null,
        subscriptionId: response.data.subscription_id,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      
      // Don't default to free tier if there was an error loading
      // Keep the current tier to avoid disrupting premium users
      setSubscription(prev => ({
        ...prev,
        loading: false,
        error: error.response?.status === 500 
          ? 'Database error. Please try refreshing.' 
          : 'Failed to load subscription data',
        lastUpdated: new Date()
      }));
    }
  };

  // Update subscription data when auth status changes
  useEffect(() => {
    fetchSubscription();
    
    // Listen for auth changes
    const handleAuthChange = () => fetchSubscription(true); // Force refresh on auth change
    window.addEventListener('authChange', handleAuthChange);
    
    // Create a refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (authService.isAuthenticated()) {
        fetchSubscription(true);
      }
    }, 5 * 60 * 1000);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(refreshInterval);
    };
  }, []);

  // Helper to check if user has access to a specific tier
  const checkTierAccess = (requiredTier) => {
    const tierLevels = {
      free: 0,
      basic: 1,
      premium: 2
    };

    // Normalize tiers to lowercase for consistent comparison
    const userLevel = tierLevels[subscription.tier?.toLowerCase() || 'free'] || 0;
    const requiredLevel = tierLevels[requiredTier?.toLowerCase() || 'free'] || 0;

    return userLevel >= requiredLevel;
  };

  // Function to manually refresh subscription data
  const refreshSubscription = () => {
    setSubscription(prev => ({ ...prev, loading: true }));
    fetchSubscription(true);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier: subscription.tier,
        endDate: subscription.endDate,
        loading: subscription.loading,
        error: subscription.error,
        lastUpdated: subscription.lastUpdated,
        hasPremiumAccess: checkTierAccess('premium'),
        hasBasicAccess: checkTierAccess('basic'),
        checkTierAccess,
        refreshSubscription // Expose refresh function
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook
export const useSubscription = () => useContext(SubscriptionContext);

export default SubscriptionContext;
