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
  const [deleteInProgress, setDeleteInProgress] = useState({});
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [editedReply, setEditedReply] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const navigate = useNavigate();

  // Fetch submissions when component mounts or page changes
  useEffect(() => {
    const fetchProcessedSubmissions = async () => {
      setLoading(true);
      try {
        const result = await adminService.getProcessedSubmissions({ page: currentPage });
        if (result.success) {
          setSubmissions(result.data);
          setTotalPages(result.totalPages);
          setError(null);
        } else {
          setError(result.error || 'Failed to load submissions');
          setSubmissions([]);
        }
      } catch (err) {
        console.error('Error fetching processed submissions:', err);
        setError('Failed to load submissions. Please try again.');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessedSubmissions();
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      setDeleteInProgress(prev => ({ ...prev, [id]: true }));
      try {
        const result = await adminService.deleteSubmission(id);
        if (result.success) {
          setSubmissions(submissions.filter(sub => sub.id !== id));
        } else {
          alert(result.error || 'Failed to delete submission');
        }
      } catch (err) {
        console.error('Error deleting submission:', err);
        alert('An error occurred while deleting the submission');
      } finally {
        setDeleteInProgress(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleEdit = (submission) => {
    setEditingSubmission(submission);
    setEditedReply(submission.admin_reply || '');
    setEditStatus('');
  };

  const closeEditModal = () => {
    setEditingSubmission(null);
    setEditedReply('');
    setEditStatus('');
  };

  const handleReplyChange = (e) => {
    setEditedReply(e.target.value);
    if (editStatus) setEditStatus('');
  };

  const handleResendAnalysis = async (e) => {
    e.preventDefault();
    if (!editingSubmission || !editedReply.trim()) {
      setEditStatus('Please enter a reply before submitting');
      return;
    }

    setIsSubmittingEdit(true);
    setEditStatus('');

    try {
      const result = await adminService.submitReply(editingSubmission.id, editedReply);
      
      if (result.success) {
        // Update the submission in the local state
        const updatedSubmissions = submissions.map(sub => 
          sub.id === editingSubmission.id 
            ? { ...sub, admin_reply: editedReply, admin_reply_date: new Date().toISOString() }
            : sub
        );
        setSubmissions(updatedSubmissions);
        
        setEditStatus('Analysis updated and resent successfully!');
        setTimeout(() => {
          closeEditModal();
        }, 2000);
      } else {
        setEditStatus(result.error || 'Failed to update and resend analysis');
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      setEditStatus('An error occurred while updating the analysis');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleViewDetails = (submission) => {
    // Show submission details in a modal or expand the row
    alert(`Submission details:\n${JSON.stringify(submission, null, 2)}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && submissions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="reviewed-submissions-container">
      <div className="reviewed-submissions-header">
        <h1>Reviewed Submissions</h1>
        <button 
          className="back-to-pending-button"
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
                  <th>Replied</th>
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
                    <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                    <td>{submission.admin_reply_date ? new Date(submission.admin_reply_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="action-buttons">
                      <button
                        className="view-button"
                        onClick={() => handleViewDetails(submission)}
                      >
                        View
                      </button>
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(submission)}
                      >
                        Edit & Resend
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(submission.id)}
                        disabled={deleteInProgress[submission.id]}
                      >
                        {deleteInProgress[submission.id] ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>{currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingSubmission && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Edit & Resend Analysis</h2>
              <button className="close-button" onClick={closeEditModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="submission-info">
                <p><strong>Email:</strong> {editingSubmission.email}</p>
                <p><strong>LinkedIn:</strong> <a href={editingSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">{editingSubmission.linkedin_url}</a></p>
                <p><strong>Originally Sent:</strong> {new Date(editingSubmission.admin_reply_date).toLocaleString()}</p>
              </div>
              
              <form onSubmit={handleResendAnalysis}>
                <div className="form-group">
                  <label htmlFor="editedReply">Update Analysis:</label>
                  <textarea
                    id="editedReply"
                    value={editedReply}
                    onChange={handleReplyChange}
                    rows="10"
                    className="edit-textarea"
                    disabled={isSubmittingEdit}
                  />
                </div>
                
                {editStatus && (
                  <div className={`status-message ${editStatus.includes('success') ? 'success' : 'error'}`}>
                    {editStatus}
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={closeEditModal}
                    disabled={isSubmittingEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmittingEdit}
                  >
                    {isSubmittingEdit ? 'Sending...' : 'Update & Resend'}
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
