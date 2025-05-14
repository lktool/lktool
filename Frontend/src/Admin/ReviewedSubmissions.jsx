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
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState({});
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

  const handleViewSubmission = (submission) => {
    setViewingSubmission(submission);
  };

  const closeViewModal = () => {
    setViewingSubmission(null);
  };

  const handleEdit = (submission) => {
    try {
      // Navigate to FormData component with the submission ID to load form data
      navigate(`/admin/dashboard?edit=${submission.id}`);
    } catch (error) {
      console.error("Error navigating to edit mode:", error);
      alert("There was an error entering edit mode. Please try again.");
    }
  };

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                    <td>{formatDate(submission.created_at)}</td>
                    <td>{formatDate(submission.admin_reply_date)}</td>
                    <td className="action-buttons">
                      <button 
                        className="view-button" 
                        onClick={() => handleViewSubmission(submission)}
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
          {totalPages > 1 && (
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
          )}
        </>
      )}

      {/* View Modal - Read-only display of analysis */}
      {viewingSubmission && (
        <div className="modal-backdrop">
          <div className="edit-modal view-modal">
            <div className="modal-header">
              <h2>View Analysis</h2>
              <button className="close-button" onClick={closeViewModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="submission-info">
                <p><strong>Email:</strong> {viewingSubmission.email}</p>
                <p><strong>LinkedIn:</strong> <a href={viewingSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">{viewingSubmission.linkedin_url}</a></p>
                <p><strong>Submitted:</strong> {formatDate(viewingSubmission.created_at)}</p>
                <p><strong>Analysis Sent:</strong> {formatDate(viewingSubmission.admin_reply_date)}</p>
              </div>
              
              <div className="analysis-content">
                <h3>Analysis Details</h3>
                <pre className="analysis-text">{viewingSubmission.admin_reply}</pre>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="close-view-button"
                  onClick={closeViewModal}
                >
                  Close
                </button>
                <button 
                  className="edit-from-view-button"
                  onClick={() => {
                    closeViewModal();
                    handleEdit(viewingSubmission);
                  }}
                >
                  Edit & Resend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewedSubmissions;
