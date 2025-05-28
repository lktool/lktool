import React, { useState, useEffect } from 'react';
import { adminService } from '../api';
import { toast } from 'react-toastify';
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
  const [databaseError, setDatabaseError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
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
        setDatabaseError(false);
      } else {
        console.error('Failed to fetch subscribers:', result.error);
        // Check for the database setup error
        if (result.error && result.error.includes('relation "users_usersubscription" does not exist')) {
          setDatabaseError(true);
        }
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      // Check for the database setup error
      if (err.message && err.message.includes('relation "users_usersubscription" does not exist')) {
        setDatabaseError(true);
      }
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
        // Show a more readable error message for foreign key constraint violations
        if (result.error && result.error.includes('foreign key constraint')) {
          setError('Failed to assign role. Check that the user exists and try again.');
        } else {
          setError(result.error || 'Failed to update subscription');
        }
      }
    } catch (err) {
      console.error('Error in subscription assignment:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Add delete functionality
  const handleDeleteClick = (user) => {
    setConfirmDelete(user);
  };
  
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    setDeleteLoading(true);
    try {
      const result = await adminService.deleteUserSubscription(confirmDelete.email);
      
      if (result.success) {
        // Remove the deleted subscription from the local state
        setSubscribers(subscribers.filter(user => user.email !== confirmDelete.email));
        setMessage(`Successfully removed subscription from ${confirmDelete.email}`);
        setConfirmDelete(null);
      } else {
        setError(result.error || 'Failed to delete subscription');
      }
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  // Render database setup required message
  if (databaseError) {
    return (
      <div className="subscription-manager-container">
        <h2>Database Setup Required</h2>
        <div className="error-message">
          <p>The subscription database tables have not been set up yet. Please complete the following steps:</p>
          <ol>
            <li>Create the migration file as shown in the instructions</li>
            <li>Apply the migration with <code>python manage.py migrate</code></li>
            <li>Restart the server</li>
          </ol>
          <p>This is a one-time setup process. Once completed, subscription management will be available.</p>
          <button 
            onClick={fetchSubscribers} 
            className="refresh-button"
            disabled={loading}
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }
  
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
      
      {/* Add delete confirmation dialog */}
      {confirmDelete && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the subscription for {confirmDelete.email}?</p>
            <p>This will set the user back to the free tier.</p>
            <div className="delete-modal-buttons">
              <button 
                className="cancel-button" 
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                className="delete-button" 
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                  <td className="action-buttons">
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
                    <button
                      onClick={() => handleDeleteClick(user)}
                      className="delete-button"
                    >
                      Delete
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
