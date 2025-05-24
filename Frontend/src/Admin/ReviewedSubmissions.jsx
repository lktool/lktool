import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ReviewedSubmissions.css';
import { formatDate } from '../Utils/dateUtils';

const ReviewedSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const refreshTimerRef = useRef(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    // Add state to track expanded analysis content
    const [expandedAnalysis, setExpandedAnalysis] = useState({});

    // Function to toggle analysis expansion
    const toggleAnalysisExpansion = (id, event) => {
        // Prevent the click from bubbling up to parent elements
        event.stopPropagation();

        setExpandedAnalysis(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Function to fetch processed submissions with cache-busting
    const fetchProcessedSubmissions = async (pageNum = 1, silent = false) => {
        if (!silent) setLoading(true);
        
        try {
            // Add timestamp parameter to prevent caching
            const timestamp = new Date().getTime();
            const result = await adminService.getProcessedSubmissions({
                page: pageNum,
                t: timestamp
            });
            
            if (result.success) {
                setSubmissions(result.data);
                setTotalPages(result.meta?.pages || 1);
                setPage(pageNum);
                setLastRefreshTime(new Date());
                setError(null);
            } else {
                if (!silent) {
                    setError(result.error || 'Failed to load processed submissions');
                    setSubmissions([]);
                }
            }
        } catch (err) {
            console.error('Error fetching processed submissions:', err);
            if (!silent) {
                setError('An error occurred while loading data. Please try again.');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Set up initial data fetch and auto-refresh timer
    useEffect(() => {
        // Initial fetch
        fetchProcessedSubmissions(page);
        
        // Set up auto-refresh if enabled
        if (autoRefreshEnabled) {
            refreshTimerRef.current = setInterval(() => {
                console.log('Auto-refreshing processed submissions...');
                fetchProcessedSubmissions(page, true); // Silent refresh
            }, 15000); // 15 seconds refresh interval
        }
        
        // Clean up timer on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [page, autoRefreshEnabled]);

    // Function to toggle auto-refresh
    const toggleAutoRefresh = () => {
        setAutoRefreshEnabled(prev => !prev);
        
        // Clear existing timer
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
        
        // Set up new timer if enabling
        if (!autoRefreshEnabled) {
            refreshTimerRef.current = setInterval(() => {
                console.log('Auto-refreshing processed submissions...');
                fetchProcessedSubmissions(page, true);
            }, 15000);
        }
    };

    // Manual refresh handler
    const handleRefresh = () => {
        fetchProcessedSubmissions(page);
    };

    // Handle page navigation
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchProcessedSubmissions(newPage);
        }
    };

    // Handle submission deletion
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this submission?')) {
            return;
        }
        
        try {
            const result = await adminService.deleteSubmission(id);
            
            if (result.success) {
                // Remove the deleted submission from state
                setSubmissions(prev => prev.filter(sub => sub.id !== id));
                // Show a temporary success message
                alert('Submission deleted successfully');
            } else {
                alert(result.error || 'Failed to delete submission');
            }
        } catch (err) {
            console.error('Error deleting submission:', err);
            alert('An error occurred while deleting the submission');
        }
    };

    // Utility function to get relative time string
    const getRelativeTimeString = (date) => {
        const now = new Date();
        const processedDate = new Date(date);
        const diffInSeconds = Math.floor((now - processedDate) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        } else {
            return formatDate(date);
        }
    };

    // Render loading state
    if (loading && submissions.length === 0) {
        return <LoadingSpinner message="Loading processed submissions..." />;
    }

    return (
        <div className="reviewed-submissions-container">
            <div className="reviewed-header">
                <h2 className="main-title">Processed LinkedIn Profile Submissions</h2>
                
                <div className="dashboard-controls">
                    <div className="controls-section">
                        <div className="refresh-info">
                            {lastRefreshTime && (
                                <span className="last-refresh">
                                    Last updated: {lastRefreshTime.toLocaleTimeString()}
                                </span>
                            )}
                            <button 
                                className={`auto-refresh-toggle ${autoRefreshEnabled ? 'active' : ''}`} 
                                onClick={toggleAutoRefresh}
                                title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
                            >
                                {autoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
                            </button>
                        </div>
                    
                        <div className="button-container">
                            <button 
                                onClick={handleRefresh} 
                                className="refresh-button" 
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh Now'}
                            </button>
                            <Link to="/admin/dashboard" className="back-button">
                                Return to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {submissions.length === 0 ? (
                <div className="no-submissions">
                    <p>No processed submissions found</p>
                </div>
            ) : (
                <>
                    <div className="processed-submissions-list">
                        {submissions.map(submission => (
                            <div key={submission.id} className="processed-submission-card">
                                <div className="submission-header">
                                    <h2 className="processed-date" title={`Processed on ${formatDate(submission.admin_reply_date)}`}>
                                        <span className="relative-time">{getRelativeTimeString(submission.admin_reply_date)}</span>
                                    </h2>
                                    <div className="submission-actions">
                                        <Link 
                                            to={`/admin/dashboard?edit=${submission.id}`}
                                            className="edit-button"
                                        >
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(submission.id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <div className="submission-body">
                                    <p><strong>Email:</strong> {submission.email}</p>
                                    <p><strong>LinkedIn:</strong> <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">{submission.linkedin_url}</a></p>
                                    <p><strong>Submitted:</strong> {formatDate(submission.created_at)}</p>
                                    
                                    <div className="analysis-preview">
                                        <h4>Analysis:</h4>
                                        <div 
                                            className="analysis-content"
                                            onClick={(e) => toggleAnalysisExpansion(submission.id, e)}
                                        >
                                            {expandedAnalysis[submission.id] 
                                                ? submission.admin_reply 
                                                : `${submission.admin_reply.substring(0, 200)}${submission.admin_reply.length > 200 ? '...' : ''}`
                                            }
                                            {submission.admin_reply.length > 200 && (
                                                <span className="expand-indicator">
                                                    {expandedAnalysis[submission.id] ? ' (collapse)' : ' (expand)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                                className="page-button"
                            >
                                Previous
                            </button>
                            <span className="page-info">Page {page} of {totalPages}</span>
                            <button 
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || loading}
                                className="page-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewedSubmissions;
