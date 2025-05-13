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
  const [formData, setFormData] = useState({
    connections: '',
    hasVerificationShield: false,
    accountType: 'normal',
    accountAgeYears: '',
    lastUpdated: '',
    hasCustomURL: false,
    hasProfileSummary: false,
    hasProfessionalPhoto: true,
    hasOldPhoto: false,
    outdatedJobInfo: false,
    missingAboutOrEducation: false,
    profileCompleteness: false,
    skillsEndorsementsCount: '',
    hasRecommendations: false,
    personalizedProfile: false,
    recentActivity: true,
    lastPostDate: '',
    engagementWithContent: false,
    engagementHistory: false,
    postHistoryOlderThanYear: false,
    profileUpdates: false,
    sharedInterests: false,
    openToNetworking: false,
    industryRelevance: false,
    activeJobTitles: false,
    newlyCreated: false,
    sparseJobHistory: false,
    defaultProfilePicture: false,
    lowConnections: false,
    noEngagementOnPosts: false,
  });
  const [analysisPreview, setAnalysisPreview] = useState('');
  const [currentTab, setCurrentTab] = useState('form');
  const navigate = useNavigate();

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
    prepopulateFormData(submission.admin_reply);
  };

  const prepopulateFormData = (replyText) => {
    const newFormData = { ...formData };

    if (replyText) {
      if (replyText.includes('verification shield')) newFormData.hasVerificationShield = true;
      if (replyText.includes('premium')) newFormData.accountType = 'premium';
      if (replyText.includes('custom URL')) newFormData.hasCustomURL = true;
      if (replyText.includes('summary section')) newFormData.hasProfileSummary = true;
      if (replyText.includes('professional photo')) newFormData.hasProfessionalPhoto = true;
      if (replyText.includes('outdated')) newFormData.hasOldPhoto = true;
      if (replyText.includes('recommendations')) newFormData.hasRecommendations = true;
      if (replyText.includes('few connections')) newFormData.lowConnections = true;

      const scoreMatch = replyText.match(/Overall Score: (\d+)\/100/);
      if (scoreMatch && scoreMatch[1]) {
        const score = parseInt(scoreMatch[1]);
        if (score < 50) {
          newFormData.missingAboutOrEducation = true;
          newFormData.outdatedJobInfo = true;
          newFormData.profileCompleteness = false;
        } else if (score > 70) {
          newFormData.profileCompleteness = true;
          newFormData.personalizedProfile = true;
          newFormData.recentActivity = true;
        }
      }
    }

    setFormData(newFormData);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const generateAnalysisPreview = () => {
    if (!editingSubmission) return null;

    try {
      const riskFactors = [
        formData.newlyCreated,
        formData.sparseJobHistory,
        formData.defaultProfilePicture,
        formData.lowConnections,
        formData.noEngagementOnPosts
      ];
      const riskCount = riskFactors.filter(Boolean).length;

      let riskLevel = 'medium';
      if (riskCount >= 3) {
        riskLevel = 'high';
      } else if (riskCount <= 1) {
        riskLevel = 'low';
      }

      const positiveFactors = [
        formData.hasVerificationShield,
        formData.hasCustomURL,
        formData.hasProfileSummary,
        formData.hasProfessionalPhoto,
        !formData.hasOldPhoto,
        !formData.outdatedJobInfo,
        !formData.missingAboutOrEducation,
        formData.profileCompleteness,
        formData.hasRecommendations,
        formData.personalizedProfile,
        formData.recentActivity,
        formData.engagementWithContent,
        formData.engagementHistory,
        formData.profileUpdates,
        formData.sharedInterests,
        formData.openToNetworking,
        formData.industryRelevance,
        formData.activeJobTitles
      ];

      const positiveCount = positiveFactors.filter(Boolean).length;
      const maxPositiveScore = 85;
      const maxNegativeImpact = 15;

      const positiveScore = (positiveCount / positiveFactors.length) * maxPositiveScore;
      const negativeImpact = (riskCount / riskFactors.length) * maxNegativeImpact;

      const score = Math.round(Math.max(0, Math.min(100, positiveScore - negativeImpact)));

      let summary = `LinkedIn Profile Analysis\n\n`;
      summary += `Overall Score: ${score}/100\n`;
      summary += `Risk Level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}\n\n`;
      summary += `Key Observations:\n`;

      if (formData.hasVerificationShield) summary += "✓ Profile has verification shield\n";
      if (formData.hasProfileSummary) summary += "✓ Profile has a summary section\n";
      if (formData.hasProfessionalPhoto) summary += "✓ Profile has a professional photo\n";
      if (formData.hasCustomURL) summary += "✓ Profile has a custom URL\n";
      if (formData.hasRecommendations) summary += "✓ Profile has recommendations\n";
      if (formData.personalizedProfile) summary += "✓ Profile content is personalized\n";
      if (formData.recentActivity) summary += "✓ Profile shows recent activity\n";

      if (formData.hasOldPhoto) summary += "✗ Profile photo appears outdated\n";
      if (formData.outdatedJobInfo) summary += "✗ Profile contains outdated job information\n";
      if (formData.missingAboutOrEducation) summary += "✗ Profile is missing About or Education sections\n";
      if (formData.noEngagementOnPosts) summary += "✗ Profile shows no engagement on posts\n";
      if (formData.defaultProfilePicture) summary += "✗ Profile uses a default picture\n";
      if (formData.lowConnections) summary += "✗ Profile has very few connections\n";

      summary += "\nRecommendations:\n";
      if (formData.missingAboutOrEducation) summary += "• Complete the About and Education sections\n";
      if (formData.hasOldPhoto || formData.defaultProfilePicture) summary += "• Update profile picture to a recent, professional photo\n";
      if (formData.outdatedJobInfo) summary += "• Update job history with current information\n";
      if (!formData.hasRecommendations) summary += "• Ask colleagues for recommendations\n";
      if (!formData.hasCustomURL) summary += "• Create a custom LinkedIn URL\n";
      if (!formData.recentActivity) summary += "• Increase activity by sharing relevant content\n";

      setAnalysisPreview(summary);
      setEditedReply(summary);

      return {
        summary,
        score,
        risk_level: riskLevel
      };
    } catch (error) {
      console.error('Error generating analysis:', error);
      setEditStatus('Failed to generate analysis');
      return null;
    }
  };

  const handleUpdatePreview = () => {
    generateAnalysisPreview();
  };

  const handleResendAnalysis = async (e) => {
    e.preventDefault();
    if (!editingSubmission || !editedReply.trim()) {
      setEditStatus('Please enter a reply before submitting');
      return;
    }

    setIsSubmittingEdit(true);
    setEditStatus('');

    const analysisData = generateAnalysisPreview();

    if (!analysisData) {
      setIsSubmittingEdit(false);
      return;
    }

    try {
      const result = await adminService.submitReply(editingSubmission.id, editedReply);

      if (result.success) {
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

  const closeEditModal = () => {
    setEditingSubmission(null);
    setEditedReply('');
    setEditStatus('');
  };

  const handleReplyChange = (e) => {
    setEditedReply(e.target.value);
    if (editStatus) setEditStatus('');
  };

  const handleViewDetails = (submission) => {
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

              <form onSubmit={handleResendAnalysis} className="edit-form">
                <div className="form-tabs">
                  <button
                    type="button"
                    className="tab-button form-tab"
                    onClick={() => setCurrentTab('form')}
                  >
                    Edit Analysis Parameters
                  </button>
                  <button
                    type="button"
                    className="tab-button preview-tab"
                    onClick={() => {
                      handleUpdatePreview();
                      setCurrentTab('preview');
                    }}
                  >
                    Preview Analysis
                  </button>
                </div>

                <div className="tab-content">
                  {currentTab === 'form' ? (
                    <div className="form-fields">
                      <fieldset className="edit-fieldset">
                        <legend>1. Profile Basics</legend>
                        <div className="form-group">
                          <label>Connections:
                            <input
                              name="connections"
                              type="number"
                              value={formData.connections}
                              onChange={handleFormChange}
                            />
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="hasVerificationShield"
                              checked={formData.hasVerificationShield}
                              onChange={handleFormChange}
                            />
                            Verification Shield Present
                          </label>

                          <label>Account Type:
                            <select
                              name="accountType"
                              value={formData.accountType}
                              onChange={handleFormChange}
                            >
                              <option value="normal">Normal</option>
                              <option value="premium">Premium</option>
                            </select>
                          </label>

                          <label>Account Age (years):
                            <input
                              name="accountAgeYears"
                              type="number"
                              value={formData.accountAgeYears}
                              onChange={handleFormChange}
                            />
                          </label>

                          <label>Last Updated:
                            <input
                              name="lastUpdated"
                              type="date"
                              value={formData.lastUpdated}
                              onChange={handleFormChange}
                            />
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="hasCustomURL"
                              checked={formData.hasCustomURL}
                              onChange={handleFormChange}
                            />
                            Has Custom Short URL
                          </label>
                        </div>
                      </fieldset>

                      <fieldset className="edit-fieldset">
                        <legend>2. Profile Quality</legend>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              name="hasProfileSummary"
                              checked={formData.hasProfileSummary}
                              onChange={handleFormChange}
                            />
                            Has Summary or About Section
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="hasProfessionalPhoto"
                              checked={formData.hasProfessionalPhoto}
                              onChange={handleFormChange}
                            />
                            Has Professional Profile Picture
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="hasOldPhoto"
                              checked={formData.hasOldPhoto}
                              onChange={handleFormChange}
                            />
                            Profile Picture Looks Outdated
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="outdatedJobInfo"
                              checked={formData.outdatedJobInfo}
                              onChange={handleFormChange}
                            />
                            Has Outdated Job Info
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="missingAboutOrEducation"
                              checked={formData.missingAboutOrEducation}
                              onChange={handleFormChange}
                            />
                            Missing Education/Skills Info
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="profileCompleteness"
                              checked={formData.profileCompleteness}
                              onChange={handleFormChange}
                            />
                            Overall Profile is Well-Filled
                          </label>

                          <label>Skills Endorsements Count:
                            <input
                              name="skillsEndorsementsCount"
                              type="number"
                              value={formData.skillsEndorsementsCount}
                              onChange={handleFormChange}
                            />
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="hasRecommendations"
                              checked={formData.hasRecommendations}
                              onChange={handleFormChange}
                            />
                            Has Recommendations
                          </label>
                        </div>
                      </fieldset>

                      <fieldset className="edit-fieldset">
                        <legend>3. Activity & Engagement</legend>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              name="recentActivity"
                              checked={formData.recentActivity}
                              onChange={handleFormChange}
                            />
                            Recent Posts/Interactions
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="engagementWithContent"
                              checked={formData.engagementWithContent}
                              onChange={handleFormChange}
                            />
                            Others Engage with Content
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="engagementHistory"
                              checked={formData.engagementHistory}
                              onChange={handleFormChange}
                            />
                            Regularly Likes/Comments
                          </label>
                        </div>
                      </fieldset>

                      <fieldset className="edit-fieldset risk-signals">
                        <legend>4. Risk Signals</legend>
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              name="newlyCreated"
                              checked={formData.newlyCreated}
                              onChange={handleFormChange}
                            />
                            Newly Created Account
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="sparseJobHistory"
                              checked={formData.sparseJobHistory}
                              onChange={handleFormChange}
                            />
                            Sparse Job History
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="defaultProfilePicture"
                              checked={formData.defaultProfilePicture}
                              onChange={handleFormChange}
                            />
                            Default Profile Picture
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="lowConnections"
                              checked={formData.lowConnections}
                              onChange={handleFormChange}
                            />
                            Low Connections
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              name="noEngagementOnPosts"
                              checked={formData.noEngagementOnPosts}
                              onChange={handleFormChange}
                            />
                            No Engagement On Posts
                          </label>
                        </div>
                      </fieldset>

                      <button
                        type="button"
                        className="update-preview-button"
                        onClick={handleUpdatePreview}
                      >
                        Update Preview
                      </button>
                    </div>
                  ) : (
                    <div className="preview-fields">
                      <h3>Analysis Preview</h3>
                      <pre className="analysis-preview">{analysisPreview || editedReply}</pre>

                      <div className="form-group">
                        <label htmlFor="editedReply">Edit Final Text:</label>
                        <textarea
                          id="editedReply"
                          value={editedReply}
                          onChange={handleReplyChange}
                          rows="10"
                          className="edit-textarea"
                          disabled={isSubmittingEdit}
                        />
                      </div>
                    </div>
                  )}
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
