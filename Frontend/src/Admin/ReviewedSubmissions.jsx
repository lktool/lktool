import React, { useState, useEffect } from 'react';
import { adminService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ReviewedSubmissions.css';
import { useNavigate } from 'react-router-dom';

const ReviewedSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editedReply, setEditedReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [deleteInProgress, setDeleteInProgress] = useState({});
  const navigate = useNavigate();

  // Fetch processed submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const result = await adminService.getProcessedSubmissions({ page: currentPage });
        if (result.success) {
          setSubmissions(result.data);
          setTotalPages(result.totalPages);
          setError(null);
        } else {
          setError(result.error || 'Failed to load submissions');
        }
      } catch (error) {
        setError('An error occurred while fetching submissions');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEditSubmission = (submission) => {
    setEditingSubmission(submission);
    setEditedReply(submission.admin_reply || '');
    setUpdateStatus('');
  };

  const handleCancelEdit = () => {
    if (!isSubmitting) {
      setEditingSubmission(null);
      setEditedReply('');
    }
  };

  const handleUpdateReply = async (e) => {
    e.preventDefault();
    
    if (!editedReply.trim()) {
      setUpdateStatus('Please enter an analysis before submitting');
      return;
    }

    setIsSubmitting(true);
    setUpdateStatus('Sending update...');

    try {
      const result = await adminService.submitReply(editingSubmission.id, editedReply);
      
      if (result.success) {
        // Update the local state with the new reply
        const updatedSubmissions = submissions.map(sub => 
          sub.id === editingSubmission.id 
            ? { ...sub, admin_reply: editedReply, admin_reply_date: new Date().toISOString() }
            : sub
        );
        
        setSubmissions(updatedSubmissions);
        setUpdateStatus('Analysis updated and resent successfully!');
        
        // Close the edit form after a brief delay to show the success message
        setTimeout(() => {
          setEditingSubmission(null);
        }, 1500);
      } else {
        setUpdateStatus(`Failed to update analysis: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      setUpdateStatus('An error occurred while updating the analysis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyChange = (e) => {
    setEditedReply(e.target.value);
  };

  const handleDeleteSubmission = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      setDeleteInProgress(prev => ({ ...prev, [id]: true }));
      
      try {
        const result = await adminService.deleteSubmission(id);
        if (result.success) {
          // Remove the deleted submission from the state
          setSubmissions(submissions.filter(sub => sub.id !== id));
        } else {
          alert(result.error || 'Failed to delete submission');
        }
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('An error occurred while deleting the submission');
      } finally {
        setDeleteInProgress(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !submissions.length) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="reviewed-submissions-container">
      <div className="submissions-header">
        <h1>Reviewed LinkedIn Profile Submissions</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/admin/dashboard')}
        >
          Back to Pending Submissions
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {submissions.length === 0 ? (
        <div className="no-submissions">
          <p>No reviewed submissions found</p>
        </div>
      ) : (
        <>
          <div className="submission-table-container">
            <table className="submission-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>LinkedIn URL</th>
                  <th>Submitted</th>
                  <th>Analysis Sent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.email}</td>
                    <td>
                      <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">
                        {submission.linkedin_url.substring(0, 30)}...
                      </a>
                    </td>
                    <td>{formatDate(submission.created_at)}</td>
                    <td>{formatDate(submission.admin_reply_date)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-button" 
                          onClick={() => window.alert(submission.admin_reply)}
                        >
                          View
                        </button>
                        <button 
                          className="edit-button" 
                          onClick={() => handleEditSubmission(submission)}
                        >
                          Edit & Resend
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteSubmission(submission.id)}
                          disabled={deleteInProgress[submission.id]}
                        >
                          {deleteInProgress[submission.id] ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit & Resend Modal */}
      {editingSubmission && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h2>Edit & Resend Analysis</h2>
              <button 
                className="close-button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>
            
            <div className="edit-modal-content">
              <div className="submission-details">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{editingSubmission.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">LinkedIn URL:</span>
                  <span className="detail-value">
                    <a href={editingSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">
                      {editingSubmission.linkedin_url}
                    </a>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Originally Sent:</span>
                  <span className="detail-value">{formatDate(editingSubmission.admin_reply_date)}</span>
                </div>
              </div>
              
              <form onSubmit={handleUpdateReply}>
                <div className="form-group">
                  <label htmlFor="editedReply">Update Analysis:</label>
                  <textarea
                    id="editedReply"
                    value={editedReply}
                    onChange={handleReplyChange}
                    disabled={isSubmitting}
                    className="analysis-textarea"
                    placeholder="Enter your updated analysis here..."
                    rows={12}
                  />
                </div>
                
                {updateStatus && (
                  <div className={`status-message ${updateStatus.includes('success') ? 'success' : 'error'}`}>
                    {updateStatus}
                  </div>
                )}
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting || !editedReply.trim()}
                  >
                    {isSubmitting ? 'Sending...' : 'Update & Resend Analysis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewedSubmissions;
