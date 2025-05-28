import React, { useState, useEffect } from 'react';
// Update to use the correct service for LinkedIn profile submissions
import { submissionService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserSubmissions.css';
import { formatDate } from '../Utils/dateUtils'; 
import { useNavigate } from 'react-router-dom';

const UserSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [submissionNumbers, setSubmissionNumbers] = useState({});
    const maxRetries = 2;
    // Add state to track which response cards are expanded
    const [expandedResponses, setExpandedResponses] = useState({});
    const navigate = useNavigate();

    // Function to fetch submissions with proper authentication handling
    const fetchSubmissions = async (retry = 0) => {
        try {
            setLoading(true);
            
            // Check if we're authenticated before making request
            const isAuth = localStorage.getItem('token');
            if (!isAuth) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Add cache-busting parameter to prevent browser caching
            const timestamp = new Date().getTime();
            const data = await submissionService.getUserSubmissions(`?t=${timestamp}`);
            
            if (Array.isArray(data)) {
                // First sort chronologically (oldest to newest) to determine proper submission numbers
                const chronologicalOrder = [...data].sort((a, b) => 
                    new Date(a.created_at) - new Date(b.created_at)
                );
                
                // Now create a map of id to submission number
                const submissionNumbers = {};
                chronologicalOrder.forEach((sub, index) => {
                    submissionNumbers[sub.id] = index + 1;
                });
                
                // Then sort for display (newest first)
                const displayOrder = [...data].sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
                
                // Store both the display order and the numbering map
                setSubmissions(displayOrder);
                setSubmissionNumbers(submissionNumbers);
                setError(null);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
            
            // Handle 401 errors by forcing re-authentication
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                setError('Your session has expired. Please log in again.');
                setLoading(false);
                return;
            }
            
            // Implement retry logic for transient errors
            if (retry < maxRetries) {
                console.log(`Retrying fetch (${retry + 1}/${maxRetries})...`);
                // Wait a bit before retrying (exponential backoff)
                setTimeout(() => {
                    fetchSubmissions(retry + 1);
                }, 1000 * Math.pow(2, retry));
                return;
            }
            
            setError('Failed to load your submissions. Please try again later.');
        } finally {
            if (retry === 0 || retry >= maxRetries) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        // On component mount or token change, fetch submissions
        fetchSubmissions();
        
        // Set up event listener for auth changes
        const handleAuthChange = () => {
            fetchSubmissions();
        };
        window.addEventListener('authChange', handleAuthChange);
        
        return () => {
            window.removeEventListener('authChange', handleAuthChange);
        };
    }, []);

    // Add manual refresh functionality
    const handleRefresh = () => {
        setRetryCount(prev => prev + 1);
        fetchSubmissions();
    };

    // Function to toggle response expansion
    const toggleResponseExpansion = (id, event) => {
        // Stop event propagation to prevent other handlers from firing
        event.stopPropagation();
        
        setExpandedResponses(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Add navigation to submission details
    const viewSubmissionDetails = (submission) => {
        navigate(`/submission/${submission.id}`);
    };
    
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
            <div className="submissions-header">
                <h2>Your LinkedIn Profile Submissions</h2>
                <button 
                    onClick={handleRefresh} 
                    className="refresh-button" 
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>
            <div className="submissions-list">
                {submissions.map((submission) => (
                    <div 
                        key={submission.id} 
                        className="submission-card"
                        onClick={() => viewSubmissionDetails(submission)}
                    >
                        <div className="submission-header">
                            <h3>Submission #{submissionNumbers[submission.id] || '?'}</h3>
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
                            <div 
                                className={`admin-reply ${expandedResponses[submission.id] ? 'expanded' : 'collapsed'}`}
                                onClick={(e) => toggleResponseExpansion(submission.id, e)}
                            >
                                <div className="reply-header">
                                    <h4>Our Response:</h4>
                                    <span className="expand-indicator">
                                        {expandedResponses[submission.id] ? 'Hide Details' : 'Show Details'}
                                    </span>
                                </div>
                                
                                <div className="reply-content-wrapper">
                                    <div className="reply-content">
                                        {submission.admin_reply}
                                    </div>
                                </div>
                                
                                {submission.admin_reply_date && (
                                    <div className="reply-date">
                                        Replied on {formatDate(submission.admin_reply_date)}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Add view details button */}
                        <div className="card-actions">
                            <button className="view-details-button">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserSubmissions;
