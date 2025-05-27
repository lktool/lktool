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
  refreshSubscription: () => {},
  lastRefresh: null
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
      // Always add timestamp parameter to prevent caching
      const timestamp = new Date().getTime();
      
      // FIXED: Use the base URL with API_BASE_URL from config, not a relative path
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lktool.onrender.com';
      const endpoint = `${API_BASE_URL}/api/auth/subscription/?t=${timestamp}`;
      
      console.log(`Fetching subscription info${forceRefresh ? ' (forced refresh)' : ''}...`);
      console.log('Subscription API URL:', endpoint);
      
      const response = await axios({
        method: 'GET',
        url: endpoint,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          // Remove cache-control header that's causing CORS issues
          'Accept': 'application/json'
        },
        responseType: 'text' // First get as text to validate
      });
      
      // Add improved validation for HTML responses
      if (typeof response.data === 'string' && response.data.trim().startsWith('<!doctype html')) {
        console.error('Received HTML instead of JSON. API URL may be incorrect:', endpoint);
        setSubscription(prev => ({
          ...prev,
          loading: false,
          tier: 'free', // Default to free tier on error
          error: 'Invalid API response format (received HTML). Please contact support.',
          lastUpdated: new Date(),
          debugInfo: 'HTML response detected'
        }));
        return;
      }
      
      // Parse response data if it's a string
      const responseData = typeof response.data === 'string' 
        ? JSON.parse(response.data) 
        : response.data;
      
      console.log('DEBUG: Subscription API response:', responseData);
      
      // Always normalize tier to lowercase for consistent comparison
      const tier = (responseData.tier || 'free').toLowerCase();
      
      console.log(`DEBUG: Setting subscription tier to: '${tier}'`);
      
      setSubscription({
        tier: tier,
        endDate: responseData.end_date || null,
        subscriptionId: responseData.subscription_id,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        debugInfo: responseData.debug_info || null
      });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      
      // Gracefully handle CORS errors
      if (error.message === 'Network Error') {
        console.warn('CORS or network issue detected with subscription API');
        // Default to free tier on CORS error
        setSubscription(prev => ({
          ...prev,
          loading: false,
          tier: 'free', // Default to free tier on error
          error: 'Connection issue detected. Using free tier as fallback.',
          lastUpdated: new Date(),
          debugInfo: 'CORS/Network Error - defaulting to free tier'
        }));
        return;
      }
      
      // Keep the current tier on error instead of defaulting to free
      setSubscription(prev => ({
        ...prev,
        loading: false,
        error: error.response?.status === 500 
          ? 'Server error loading subscription. Please try refreshing.' 
          : 'Failed to load subscription data',
        lastUpdated: new Date()
      }));
    }
  };

  // Update subscription data when auth status changes
  useEffect(() => {
    fetchSubscription();
    
    // Listen for auth changes
    const handleAuthChange = () => fetchSubscription(true);
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

    // Normalize tiers for consistent comparison
    const userLevel = tierLevels[(subscription.tier || 'free').toLowerCase()] || 0;
    const requiredLevel = tierLevels[(requiredTier || 'free').toLowerCase()] || 0;

    return userLevel >= requiredLevel;
  };

  // Manually refresh subscription data
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
        refreshSubscription,
        debugInfo: subscription.debugInfo
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook
export const useSubscription = () => useContext(SubscriptionContext);

export default SubscriptionContext;
