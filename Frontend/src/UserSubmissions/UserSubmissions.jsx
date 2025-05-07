import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserSubmissions.css';

function UserSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        let authToken = token;
        try {
          const parsedToken = JSON.parse(token);
          if (parsedToken && parsedToken.value) {
            authToken = parsedToken.value;
          }
        } catch (e) {
        }
        
        const response = await axios.get(
          'https://lktool.onrender.com/api/contact/user-submissions/', 
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setSubmissions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user submissions:', err);
        setError('Failed to load your submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSubmissions();
  }, []);

  const handleRefresh = () => {
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
            You have submitted {submissions.length} profile{submissions.length !== 1 ? 's' : ''}.
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
