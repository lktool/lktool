import { useState, useEffect } from 'react';
import { userSubmissionService } from '../api/userSubmissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserSubmissions.css';

function UserSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserSubmissions() {
      try {
        setLoading(true);
        const data = await userSubmissionService.getUserSubmissions();
        setSubmissions(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setError('Unable to load your submissions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserSubmissions();
  }, []);

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
      <h1>Your Submission History</h1>
      
      {submissions.length === 0 ? (
        <div className="no-submissions">
          <p>You haven't made any submissions yet.</p>
        </div>
      ) : (
        <>
          <p className="submissions-count">
            You have made {submissions.length} submission{submissions.length !== 1 ? 's' : ''}.
          </p>
          
          <div className="submissions-list">
            {submissions.map((submission) => (
              <div className="submission-card" key={submission.id}>
                <div className="submission-header">
                  <span className="submission-date">
                    {new Date(submission.created_at).toLocaleDateString()}
                  </span>
                  <span className={`submission-status ${submission.is_processed ? 'processed' : 'pending'}`}>
                    {submission.is_processed ? 'Processed' : 'Pending'}
                  </span>
                </div>
                
                <div className="submission-body">
                  <div className="submission-field">
                    <label>LinkedIn URL:</label>
                    <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">
                      {submission.linkedin_url}
                    </a>
                  </div>
                  
                  <div className="submission-field">
                    <label>Message:</label>
                    <p className="submission-message">{submission.message}</p>
                  </div>
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
