import React, { useState, useEffect } from 'react';
import "./FormData.css";
import { adminService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const FormData = () => {
  const [form, setForm] = useState({
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

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisPreview, setAnalysisPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentView, setCurrentView] = useState('submissions'); // 'submissions', 'analysis', 'preview'

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const result = await adminService.getSubmissions({ status: 'pending' });
        if (result.success && Array.isArray(result.data)) {
          setSubmissions(result.data);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSubmission) {
      if (selectedSubmission.linkedin_url.includes('premium')) {
        setForm(prev => ({ ...prev, accountType: 'premium' }));
      }
    }
  }, [selectedSubmission]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const generateAnalysisPreview = () => {
    if (!selectedSubmission) {
      setReplyStatus('Please select a submission first');
      return;
    }

    try {
      const riskFactors = [
        form.newlyCreated,
        form.sparseJobHistory,
        form.defaultProfilePicture,
        form.lowConnections,
        form.noEngagementOnPosts
      ];
      const riskCount = riskFactors.filter(Boolean).length;

      let riskLevel = 'medium';
      if (riskCount >= 3) {
        riskLevel = 'high';
      } else if (riskCount <= 1) {
        riskLevel = 'low';
      }

      const positiveFactors = [
        form.hasVerificationShield,
        form.hasCustomURL,
        form.hasProfileSummary,
        form.hasProfessionalPhoto,
        !form.hasOldPhoto,
        !form.outdatedJobInfo,
        !form.missingAboutOrEducation,
        form.profileCompleteness,
        form.hasRecommendations,
        form.personalizedProfile,
        form.recentActivity,
        form.engagementWithContent,
        form.engagementHistory,
        form.profileUpdates,
        form.sharedInterests,
        form.openToNetworking,
        form.industryRelevance,
        form.activeJobTitles
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

      if (form.hasVerificationShield) summary += "✓ Profile has verification shield\n";
      if (form.hasProfileSummary) summary += "✓ Profile has a summary section\n";
      if (form.hasProfessionalPhoto) summary += "✓ Profile has a professional photo\n";
      if (form.hasCustomURL) summary += "✓ Profile has a custom URL\n";
      if (form.hasRecommendations) summary += "✓ Profile has recommendations\n";
      if (form.personalizedProfile) summary += "✓ Profile content is personalized\n";
      if (form.recentActivity) summary += "✓ Profile shows recent activity\n";

      if (form.hasOldPhoto) summary += "✗ Profile photo appears outdated\n";
      if (form.outdatedJobInfo) summary += "✗ Profile contains outdated job information\n";
      if (form.missingAboutOrEducation) summary += "✗ Profile is missing About or Education sections\n";
      if (form.noEngagementOnPosts) summary += "✗ Profile shows no engagement on posts\n";
      if (form.defaultProfilePicture) summary += "✗ Profile uses a default picture\n";
      if (form.lowConnections) summary += "✗ Profile has very few connections\n";

      summary += "\nRecommendations:\n";
      if (form.missingAboutOrEducation) summary += "• Complete the About and Education sections\n";
      if (form.hasOldPhoto || form.defaultProfilePicture) summary += "• Update profile picture to a recent, professional photo\n";
      if (form.outdatedJobInfo) summary += "• Update job history with current information\n";
      if (!form.hasRecommendations) summary += "• Ask colleagues for recommendations\n";
      if (!form.hasCustomURL) summary += "• Create a custom LinkedIn URL\n";
      if (!form.recentActivity) summary += "• Increase activity by sharing relevant content\n";

      setAnalysisPreview(summary);
      setReplyText(summary);
      setShowPreview(true);

      return {
        summary,
        score,
        risk_level: riskLevel
      };
    } catch (error) {
      console.error('Error generating analysis:', error);
      setReplyStatus('Failed to generate analysis');
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedSubmission) {
      setReplyStatus('Please select a submission first');
      return;
    }

    handleGeneratePreview();
  };

  const handleGeneratePreview = () => {
    const analysisData = generateAnalysisPreview();
    if (analysisData) {
      setCurrentView('preview');
    }
  };

  const handleSendAnalysis = async () => {
    if (!selectedSubmission || !replyText.trim()) {
      setReplyStatus('Please generate an analysis first');
      return;
    }

    setIsReplying(true);
    setReplyStatus('');

    try {
      const analysisData = generateAnalysisPreview();

      if (!analysisData) {
        setIsReplying(false);
        return;
      }

      const result = await adminService.submitReply(selectedSubmission.id, replyText);

      if (result.success) {
        setReplyStatus('Analysis and reply sent successfully!');

        const updatedSubmissions = submissions.filter(sub =>
          sub.id !== selectedSubmission.id
        );
        setSubmissions(updatedSubmissions);
        setShowPreview(false);
        setCurrentView('submissions');
        setSelectedSubmission(null);
      } else {
        setReplyStatus(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending analysis:', error);
      setReplyStatus('Failed to send analysis');
    } finally {
      setIsReplying(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setReplyText(submission.admin_reply || '');
    setForm({
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
    setCurrentView('analysis');
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleCancel = () => {
    setCurrentView('submissions');
    setSelectedSubmission(null);
  };

  return (
    <div className="admin-dashboard">
      {currentView === 'submissions' && (
        <div className="submissions-container">
          <h2>Pending LinkedIn Profile Submissions</h2>
          {loading ? (
            <LoadingSpinner />
          ) : submissions.length === 0 ? (
            <div className="no-submissions">
              <p>No pending submissions found</p>
            </div>
          ) : (
            <div className="submission-cards-grid">
              {submissions.map(submission => (
                <div 
                  key={submission.id} 
                  className="submission-card"
                  onClick={() => handleSelectSubmission(submission)}
                >
                  <div className="submission-header">
                    <span className="submission-date">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="submission-body">
                    <p className="submission-email">
                      <strong>From:</strong> {submission.email}
                    </p>
                    <p className="submission-url">
                      <strong>LinkedIn:</strong> {submission.linkedin_url.substring(0, 30)}...
                    </p>
                    {submission.message && (
                      <p className="submission-message">
                        <strong>Message:</strong> {submission.message.substring(0, 50)}
                        {submission.message.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="submission-footer">
                    <button className="analyze-button">
                      Analyze Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'analysis' && selectedSubmission && (
        <div className="analysis-container">
          <div className="analysis-header">
            <h2>Analyzing LinkedIn Profile</h2>
            <div className="submission-details">
              <p><strong>Email:</strong> {selectedSubmission.email}</p>
              <p><strong>LinkedIn URL:</strong> <a href={selectedSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">{selectedSubmission.linkedin_url}</a></p>
              {selectedSubmission.message && (
                <p><strong>Message:</strong> {selectedSubmission.message}</p>
              )}
            </div>
            <button className="back-button" onClick={handleCancel}>
              ← Back to Submissions
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="classroom-form-data">
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">1. Profile Basics</legend>
              <label>Connections:
                <input name="connections" type="number" value={form.connections} onChange={handleChange} />
              </label>
              <label>
                <input type="checkbox" name="hasVerificationShield" checked={form.hasVerificationShield} onChange={handleChange} />
                Verification Shield Present
              </label>
              <label>Account Type:
                <select name="accountType" value={form.accountType} onChange={handleChange}>
                  <option value="normal">Normal</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <label>Account Age (years):
                <input name="accountAgeYears" type="number" value={form.accountAgeYears} onChange={handleChange} />
              </label>
              <label>Last Updated:
                <input name="lastUpdated" type="date" value={form.lastUpdated} onChange={handleChange} />
              </label>
              <label>
                <input type="checkbox" name="hasCustomURL" checked={form.hasCustomURL} onChange={handleChange} />
                Has Custom Short URL
              </label>
            </fieldset>

            {/* Add remaining fieldsets here - same as in original form */}
            {/* Profile Quality section */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">2. Profile Quality</legend>
              {/* Existing checkboxes */}
              {/* ... */}
            </fieldset>

            {/* Activity Signals section */}
            {/* ... */}

            {/* Outreach Suitability section */}
            {/* ... */}

            {/* Risk Signals section */}
            {/* ... */}

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="classroom-submit-button">
                Generate Analysis Preview
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview container */}
      {/* ... existing code ... */}

    </div>
  );
};

export default FormData;
