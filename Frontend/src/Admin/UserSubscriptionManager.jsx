import React, { useState, useEffect } from 'react';
import { adminService } from '../api';
import './UserSubscriptionManager.css';

const UserSubscriptionManager = () => {
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('free');
  const [validForDays, setValidForDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  
  // Load existing subscriptions when component mounts
  useEffect(() => {
    fetchSubscribers();
  }, []);
  
  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const result = await adminService.getSubscribedUsers();
      if (result.success) {
        setSubscribers(result.data || []);
      } else {
        console.error('Failed to fetch subscribers:', result.error);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoadingSubscribers(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const result = await adminService.assignUserSubscription({
        email, 
        tier, 
        valid_for_days: validForDays || undefined
      });
      
      if (result.success) {
        setMessage(`Successfully assigned ${tier} plan to ${email}`);
        setEmail('');
        setTier('free');
        setValidForDays('');
        
        // Refresh subscriber list
        fetchSubscribers();
      } else {
        setError(result.error || 'Failed to update subscription');
      }
    } catch (err) {
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="subscription-manager-container">
      <h2>Manage User Subscriptions</h2>
      <p className="info-text">
        Assign premium access to specific users without payment processing.
      </p>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="subscription-form">
        <div className="form-group">
          <label htmlFor="email">User Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tier">Subscription Tier:</label>
          <select 
            id="tier" 
            value={tier} 
            onChange={(e) => setTier(e.target.value)}
            required
          >
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="valid-days">Valid For (days):</label>
          <input
            type="number"
            id="valid-days"
            value={validForDays}
            onChange={(e) => setValidForDays(e.target.value)}
            placeholder="Leave empty for unlimited"
            min="1"
          />
          <small>Leave empty for unlimited access</small>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Assign Subscription'}
        </button>
      </form>
      
      <div className="subscribers-list">
        <h3>Current Subscribers</h3>
        {loadingSubscribers ? (
          <p>Loading subscribers...</p>
        ) : subscribers.length > 0 ? (
          <table className="subscribers-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Plan</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(user => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>
                    <span className={`plan-badge ${user.tier}`}>
                      {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                    </span>
                  </td>
                  <td>{user.end_date || 'Unlimited'}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEmail(user.email);
                        setTier(user.tier);
                        setValidForDays('');
                      }}
                      className="edit-button"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subscribers found.</p>
        )}
      </div>
    </div>
  );
};

export default UserSubscriptionManager;
