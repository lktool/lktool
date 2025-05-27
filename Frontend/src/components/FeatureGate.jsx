import React from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import './FeatureGate.css';

/**
 * Component to conditionally render content based on user's subscription tier
 * 
 * @param {Object} props
 * @param {string} props.requiredTier - The minimum subscription tier required ('free', 'basic', 'premium')
 * @param {React.ReactNode} props.children - Content to render if user has access
 * @param {React.ReactNode} props.fallback - Optional custom fallback UI when user doesn't have access
 * @returns {React.ReactNode}
 */
const FeatureGate = ({ requiredTier = 'free', children, fallback }) => {
  const subscription = useSubscription();
  
  // Show loading indicator while subscription data is loading
  if (subscription.loading) {
    return <div className="feature-gate-loading">Loading...</div>;
  }
  
  // If user has access to the required tier, show the content
  if (subscription.checkTierAccess(requiredTier)) {
    return children;
  }
  
  // Otherwise, show the fallback or default upgrade message
  if (fallback) {
    return fallback;
  }
  
  return (
    <div className="feature-gate-upgrade">
      <h3>Premium Feature</h3>
      <p>This feature requires a {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} subscription.</p>
      <a href="/pricing" className="upgrade-button">View Pricing</a>
    </div>
  );
};

export default FeatureGate;
