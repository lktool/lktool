import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { unifiedAuthService } from '../api/unifiedAuthService';
import './UserSubmissions.css';

function UserSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true);
      try {
        // Use unified auth service to fetch user submissions
        const data = await unifiedAuthService.getMySubmissions();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setError('Failed to load your submissions');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubmissions();
  }, []);

  // Add a refresh button handler
  const handleRefresh = () => {
    async function fetchSubmissions() {
      setLoading(true);
      setLastRefresh(new Date());
      
      try {
        const data = await unifiedAuthService.getMySubmissions();
        setSubmissions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user submissions:', err);
        setError('Failed to load your submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  };

  if (loading) {
    return (
      <div className="submissions-container">
        <LoadingSpinner size="large" text="Loading your submissions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="submissions-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <h1>My Submissions</h1>
        <button 
          className="refresh-button" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="last-refresh">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>

      {submissions.length === 0 ? (
        <div className="no-submissions">
          <p>You haven't made any submissions yet.</p>
          <p>Go to the Input page to submit your LinkedIn profile for analysis.</p>
        </div>
      ) : (
        <>
          <p className="submissions-count">
            You have submitted {submissions.length} profile{submissions.length !== 1 ? 's' : ''} for analysis.
          </p>
          
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div className="submission-card" key={submission.id || submission.created_at}>
                <div className="submission-header">
                  <span className="submission-date">
                    {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}
                  </span>
                  <span className={`submission-status ${submission.is_processed ? 'processed' : 'pending'}`}>
                    {submission.is_processed ? 'Processed' : 'Pending Review'}
                  </span>
                </div>
                
                <div className="submission-body">
                  <div className="submission-field">
                    <label>LinkedIn URL:</label>
                    <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">
                      {submission.linkedin_url}
                    </a>
                  </div>
                  
                  {submission.message && (
                    <div className="submission-field">
                      <label>Message:</label>
                      <p className="submission-message">{submission.message}</p>
                    </div>
                  )}
                  
                  {/* Add admin reply section */}
                  {submission.admin_reply && (
                    <div className="submission-field admin-reply">
                      <label>Admin Response:</label>
                      <div className="admin-reply-content">
                        <p>{submission.admin_reply}</p>
                        {submission.admin_reply_date && (
                          <div className="admin-reply-date">
                            Response date: {new Date(submission.admin_reply_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default UserSubmissions;
