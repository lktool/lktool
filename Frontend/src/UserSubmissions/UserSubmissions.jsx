import React, { useState, useEffect } from 'react';
// Update to use the correct service for LinkedIn profile submissions
import { submissionService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserSubmissions.css';
import { formatDate } from '../utils/dateUtils';

const UserSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch user's submissions when component mounts
        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                // This fetches from the /api/contact/user-submissions/ endpoint
                const data = await submissionService.getUserSubmissions();
                setSubmissions(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching submissions:', err);
                setError('Failed to load your submissions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return <LoadingSpinner message="Loading your submissions..." />;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    if (!submissions.length) {
        return (
            <div className="no-submissions">
                <h2>No Submissions Found</h2>
                <p>You haven't submitted any LinkedIn profiles for review yet.</p>
                <button onClick={() => window.location.href = '/inputMain'} className="cta-button">
                    Submit a Profile
                </button>
            </div>
        );
    }

    return (
        <div className="submissions-container">
            <h1>Your LinkedIn Profile Submissions</h1>
            <div className="submissions-list">
                {submissions.map((submission) => (
                    <div key={submission.id} className="submission-card">
                        <div className="submission-header">
                            <h3>Submission #{submission.id}</h3>
                            <span className={`status ${submission.is_processed ? 'processed' : 'pending'}`}>
                                {submission.is_processed ? 'Reviewed' : 'Pending Review'}
                            </span>
                        </div>
                        
                        <div className="submission-details">
                            <p><strong>LinkedIn URL:</strong> <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">{submission.linkedin_url}</a></p>
                            <p><strong>Submitted:</strong> {formatDate(submission.created_at)}</p>
                            
                            {submission.message && (
                                <div className="submission-message">
                                    <strong>Your Message:</strong>
                                    <p>{submission.message}</p>
                                </div>
                            )}
                        </div>
                        
                        {submission.admin_reply && (
                            <div className="admin-reply">
                                <h4>Our Response:</h4>
                                <div className="reply-content">{submission.admin_reply}</div>
                                <div className="reply-date">
                                    Replied on {formatDate(submission.admin_reply_date)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSubmissions;
