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
  checkTierAccess: () => false
});

// Export the provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    tier: 'free',
    endDate: null,
    loading: true,
    error: null
  });

  // Update subscription data when auth status changes
  useEffect(() => {
    const fetchSubscription = async () => {
      // Skip if not authenticated
      if (!authService.isAuthenticated()) {
        setSubscription({
          tier: 'free',
          endDate: null,
          loading: false,
          error: null
        });
        return;
      }

      try {
        // Try to fetch subscription info, but don't break if it fails
        try {
          const response = await axios.get('/api/auth/subscription/', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          setSubscription({
            tier: response.data.tier || 'free',
            endDate: response.data.end_date || null,
            loading: false,
            error: null
          });
        } catch (error) {
          // If we get a 500 error about missing database table, just use free tier
          // This allows the app to work while migrations are being applied
          console.error('Failed to fetch subscription:', error);
          
          setSubscription({
            tier: 'free',
            endDate: null,
            loading: false,
            error: error.response?.status === 500 ? 'Database setup in progress. Using free tier.' : 'Failed to load subscription data'
          });
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
        setSubscription({
          tier: 'free',
          endDate: null,
          loading: false,
          error: 'Failed to load subscription data'
        });
      }
    };

    fetchSubscription();

    // Listen for auth changes
    const handleAuthChange = () => fetchSubscription();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Helper to check if user has access to a specific tier
  const checkTierAccess = (requiredTier) => {
    const tierLevels = {
      free: 0,
      basic: 1,
      premium: 2
    };

    const userLevel = tierLevels[subscription.tier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 0;

    return userLevel >= requiredLevel;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier: subscription.tier,
        endDate: subscription.endDate,
        loading: subscription.loading,
        error: subscription.error,
        hasPremiumAccess: checkTierAccess('premium'),
        hasBasicAccess: checkTierAccess('basic'),
        checkTierAccess
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook
export const useSubscription = () => useContext(SubscriptionContext);

export default SubscriptionContext;
