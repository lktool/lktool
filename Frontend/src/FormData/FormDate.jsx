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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSubmission) {
      setReplyStatus('Please select a submission first');
      return;
    }

    setIsReplying(true);

    const analysisData = generateAnalysisPreview();

    if (!analysisData) {
      setIsReplying(false);
      return;
    }

    try {
      setShowPreview(true);
      setIsReplying(false);
    } catch (error) {
      console.error('Error generating preview:', error);
      setReplyStatus('Failed to generate preview');
      setIsReplying(false);
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

        const updatedSubmissions = submissions.map(sub =>
          sub.id === selectedSubmission.id
            ? { ...sub, admin_reply: replyText, is_processed: true }
            : sub
        );
        setSubmissions(updatedSubmissions);
        setShowPreview(false);
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
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  return (
    <div className="admin-dashboard">
      <div className="submissions-list">
        <h2>Pending Submissions</h2>
        {loading ? (
          <LoadingSpinner />
        ) : submissions.length === 0 ? (
          <p>No pending submissions found</p>
        ) : (
          <ul className="submission-cards">
            {submissions.map(submission => (
              <li
                key={submission.id}
                className={`submission-item ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
                onClick={() => handleSelectSubmission(submission)}
              >
                <div className="submission-preview">
                  <p><strong>From:</strong> {submission.email}</p>
                  <p><strong>URL:</strong> {submission.linkedin_url.substring(0, 30)}...</p>
                  <p><strong>Date:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="classroom-form-data">
        <h2 className="classroom-heading">LinkedIn Profile Analyzer</h2>

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

        <fieldset className="classroom-fieldset">
          <legend className="classroom-legend">2. Profile Quality</legend>
          {[
            ['hasProfileSummary', 'Has Summary or About Section'],
            ['hasProfessionalPhoto', 'Has Professional Profile Picture'],
            ['hasOldPhoto', 'Profile Picture Looks Outdated'],
            ['outdatedJobInfo', 'Has Outdated Job Info or Defunct Companies'],
            ['missingAboutOrEducation', 'Missing or Incomplete Education/Skills Info'],
            ['profileCompleteness', 'Overall Profile is Well-Filled'],
            ['hasRecommendations', 'Has Given/Received Recommendations'],
            ['personalizedProfile', 'Personalized Profile (unique summary or achievements)'],
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}
            </label>
          ))}
          <label>Skills Endorsements Count:
            <input name="skillsEndorsementsCount" type="number" value={form.skillsEndorsementsCount} onChange={handleChange} />
          </label>
        </fieldset>

        <fieldset className="classroom-fieldset">
          <legend className="classroom-legend">3. Activity & Engagement</legend>
          {[
            ['recentActivity', 'Recent Posts or Interactions (within 6 months)'],
            ['engagementWithContent', 'Others Engage with Their Content'],
            ['engagementHistory', 'Regularly Likes/Comments/Shares'],
            ['postHistoryOlderThanYear', 'Has Posts Older Than 1 Year']
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}
            </label>
          ))}
          <label>Last Post Date:
            <input name="lastPostDate" type="date" value={form.lastPostDate} onChange={handleChange} />
          </label>
        </fieldset>

        <fieldset className="classroom-fieldset">
          <legend className="classroom-legend">4. Outreach Suitability</legend>
          {[
            ['profileUpdates', 'Recently Updated Headline or Info'],
            ['sharedInterests', 'Shared Interests or Mutual Connections'],
            ['openToNetworking', 'Open to Connect or Recruit'],
            ['industryRelevance', 'In a Relevant Industry'],
            ['activeJobTitles', 'Has Active, Relevant Job Titles']
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}
            </label>
          ))}
        </fieldset>

        <fieldset className="classroom-fieldset">
          <legend className="classroom-legend classroom-danger">5. Low Score / Risk Signals</legend>
          {[
            ['newlyCreated', 'Newly Created Account'],
            ['sparseJobHistory', 'Sparse or Recently Added Job History'],
            ['defaultProfilePicture', 'Default/Stock Profile Picture'],
            ['lowConnections', 'Very Low (<100) Connections'],
            ['noEngagementOnPosts', 'No Meaningful Engagement on Content']
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}
            </label>
          ))}
        </fieldset>

        <button type="submit" className="classroom-submit-button">
          {showPreview ? 'Update Analysis' : 'Generate Analysis Preview'}
        </button>
      </form>

      {showPreview && (
        <div className="analysis-preview-container">
          <h2>Analysis Preview</h2>
          <div className="analysis-content">
            <pre>{analysisPreview}</pre>
          </div>
          <div className="preview-controls">
            <button
              className="edit-button"
              onClick={() => setShowPreview(false)}
            >
              Edit Analysis
            </button>
            <button
              className="send-button"
              onClick={handleSendAnalysis}
              disabled={isReplying}
            >
              {isReplying ? 'Sending...' : 'Send Analysis to User'}
            </button>
          </div>
        </div>
      )}

      {selectedSubmission && (
        <div className="reply-form-container">
          <h3>Reply to Submission</h3>
          <div className="submission-details">
            <p><strong>LinkedIn URL:</strong> <a href={selectedSubmission.linkedin_url}>{selectedSubmission.linkedin_url}</a></p>
            <p><strong>Message:</strong> {selectedSubmission.message}</p>
          </div>

          <textarea
            value={replyText}
            onChange={handleReplyChange}
            placeholder="Enter your reply to the user..."
            rows={5}
            className="reply-textarea"
          />

          {replyStatus && (
            <div className={`reply-status ${replyStatus.includes('success') ? 'success' : 'error'}`}>
              {replyStatus}
            </div>
          )}

          <button
            className="send-reply-button"
            onClick={handleSendAnalysis}
            disabled={isReplying || !replyText.trim()}
          >
            {isReplying ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FormData;
