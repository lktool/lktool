import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { submissionService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../Utils/dateUtils';
import './SubmissionDetails.css';

const SubmissionDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        setLoading(true);
        const submissions = await submissionService.getUserSubmissions();
        
        // Find the specific submission by ID
        const foundSubmission = submissions.find(sub => sub.id === parseInt(id));
        
        if (foundSubmission) {
          setSubmission(foundSubmission);
        } else {
          setError('Submission not found');
        }
      } catch (err) {
        console.error('Error fetching submission details:', err);
        setError('Failed to load submission details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading submission details..." />;
  }

  if (error) {
    return (
      <div className="submission-details-container">
        <div className="error-message">{error}</div>
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/my-submissions')}>
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="submission-details-container">
        <div className="error-message">Submission not found</div>
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/my-submissions')}>
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submission-details-container">
      <div className="submission-details-header">
        <h1>Submission Details</h1>
        <div className="status-badge">
          <span className={`status ${submission.is_processed ? 'processed' : 'pending'}`}>
            {submission.is_processed ? 'Reviewed' : 'Pending Review'}
          </span>
        </div>
      </div>

      <div className="submission-details-card">
        <div className="submission-section">
          <h2>Profile Information</h2>
          <div className="detail-row">
            <div className="detail-label">LinkedIn URL</div>
            <div className="detail-value">
              <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">
                {submission.linkedin_url}
              </a>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Submitted</div>
            <div className="detail-value">{formatDate(submission.created_at)}</div>
          </div>
        </div>

        {submission.message && (
          <div className="submission-section">
            <h2>Your Message</h2>
            <div className="message-content">{submission.message}</div>
          </div>
        )}

        {submission.admin_reply && (
          <div className="submission-section response-section">
            <h2>Analysis Response</h2>
            <div className="response-date">
              Received on {formatDate(submission.admin_reply_date)}
            </div>
            <div className="response-content">{submission.admin_reply}</div>
          </div>
        )}

        {!submission.is_processed && (
          <div className="pending-message">
            <p>Your submission is still being reviewed. Check back later for results.</p>
          </div>
        )}

        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/my-submissions')}>
            Back to Submissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;
