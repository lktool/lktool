import React, { useState, useEffect } from 'react';
import "./FormData.css";
// Update import to use the new API structure
import { adminService } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const FormData = () => {
  // Form state for LinkedIn analysis
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

  // Admin reply state
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Load submissions when component mounts
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        console.log("Fetching submissions with admin token");
        // Use adminService instead of adminSubmissionService
        const result = await adminService.getSubmissions({ status: 'pending' });
        console.log("Submissions API response:", result);
        
        // Check if result is successful and has data array
        if (result.success && Array.isArray(result.data)) {
          setSubmissions(result.data);
          console.log("Submissions fetched:", result.data.length);
        } else {
          console.warn("Invalid submissions data format", result);
          setSubmissions([]); // Set empty array to prevent errors
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]); // Set empty array to prevent errors
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubmission) {
      setReplyStatus('Please select a submission first');
      return;
    }
    
    console.log('LinkedIn Profile Data:', form);
    setIsReplying(true);
    
    try {
      // Calculate a simple risk score based on risk signals
      const riskFactors = [
        form.newlyCreated,
        form.sparseJobHistory,
        form.defaultProfilePicture,
        form.lowConnections,
        form.noEngagementOnPosts
      ];
      const riskCount = riskFactors.filter(Boolean).length;
      
      // Determine risk level based on risk factors count
      let riskLevel = 'medium';
      if (riskCount >= 3) {
        riskLevel = 'high';
      } else if (riskCount <= 1) {
        riskLevel = 'low';
      }
      
      // Calculate a simple profile score (0-100)
      // More positive factors increase score, risk factors decrease it
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
      
      // Count true values in positive factors
      const positiveCount = positiveFactors.filter(Boolean).length;
      
      // Calculate a weighted score - positive factors matter more (max ~85) than risk factors (max ~15)
      const maxPositiveScore = 85;
      const maxNegativeImpact = 15;
      
      const positiveScore = (positiveCount / positiveFactors.length) * maxPositiveScore;
      const negativeImpact = (riskCount / riskFactors.length) * maxNegativeImpact;
      
      // Calculate final score (0-100 range)
      const score = Math.round(Math.max(0, Math.min(100, positiveScore - negativeImpact)));
      
      // Generate a summary based on the analysis
      let summary = `LinkedIn Profile Analysis\n\n`;
      summary += `Overall Score: ${score}/100\n`;
      summary += `Risk Level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}\n\n`;
      summary += `Key Observations:\n`;
      
      // Add positive observations
      if (form.hasVerificationShield) summary += "✓ Profile has verification shield\n";
      if (form.hasProfileSummary) summary += "✓ Profile has a summary section\n";
      if (form.hasProfessionalPhoto) summary += "✓ Profile has a professional photo\n";
      if (form.hasCustomURL) summary += "✓ Profile has a custom URL\n";
      if (form.hasRecommendations) summary += "✓ Profile has recommendations\n";
      if (form.personalizedProfile) summary += "✓ Profile content is personalized\n";
      if (form.recentActivity) summary += "✓ Profile shows recent activity\n";
      
      // Add negative observations
      if (form.hasOldPhoto) summary += "✗ Profile photo appears outdated\n";
      if (form.outdatedJobInfo) summary += "✗ Profile contains outdated job information\n";
      if (form.missingAboutOrEducation) summary += "✗ Profile is missing About or Education sections\n";
      if (form.noEngagementOnPosts) summary += "✗ Profile shows no engagement on posts\n";
      if (form.defaultProfilePicture) summary += "✗ Profile uses a default picture\n";
      if (form.lowConnections) summary += "✗ Profile has very few connections\n";
      
      // Add recommendations based on analysis
      summary += "\nRecommendations:\n";
      if (form.missingAboutOrEducation) summary += "• Complete the About and Education sections\n";
      if (form.hasOldPhoto || form.defaultProfilePicture) summary += "• Update profile picture to a recent, professional photo\n";
      if (form.outdatedJobInfo) summary += "• Update job history with current information\n";
      if (!form.hasRecommendations) summary += "• Ask colleagues for recommendations\n";
      if (!form.hasCustomURL) summary += "• Create a custom LinkedIn URL\n";
      if (!form.recentActivity) summary += "• Increase activity by sharing relevant content\n";
      
      // Submit analysis to backend
      const result = await adminService.submitProfileAnalysis(selectedSubmission.id, {
        ...form,
        summary,
        score,
        risk_level: riskLevel
      });
      
      if (result.success) {
        setReplyStatus('Analysis submitted successfully!');
        
        // Also submit a reply to the user with the summary
        await adminService.submitReply(selectedSubmission.id, summary);
        
        // Update local submission data to show as processed
        const updatedSubmissions = submissions.map(sub => 
          sub.id === selectedSubmission.id 
            ? {...sub, is_processed: true, admin_reply: summary} 
            : sub
        );
        setSubmissions(updatedSubmissions);
      } else {
        setReplyStatus(result.error || 'Failed to submit analysis');
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setReplyStatus('Failed to submit analysis');
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

  const handleSubmitReply = async () => {
    if (!selectedSubmission || !replyText.trim()) {
      setReplyStatus('Please enter a reply message');
      return;
    }

    setIsReplying(true);
    setReplyStatus('');

    try {
      // Use adminService for reply submission
      const result = await adminService.submitReply(selectedSubmission.id, replyText);
      
      if (result.success) {
        setReplyStatus('Reply sent successfully');
        
        // Update local submission data
        const updatedSubmissions = submissions.map(sub => 
          sub.id === selectedSubmission.id 
            ? {...sub, admin_reply: replyText, is_processed: true} 
            : sub
        );
        setSubmissions(updatedSubmissions);
      } else {
        setReplyStatus(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyStatus('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleMarkProcessed = async (id, isProcessed) => {
    try {
      await adminService.updateSubmissionStatus(id, isProcessed);
      // Update the local submissions list
      setSubmissions(submissions.map(sub => 
        sub.id === id 
          ? {...sub, is_processed: isProcessed} 
          : sub
      ));
    } catch (error) {
      console.error('Error updating submission status:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Submissions list */}
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

      {/* LinkedIn Profile Analysis Form */}
      <form onSubmit={handleSubmit} className="classroom-form-data">
        <h2 className="classroom-heading">LinkedIn Profile Analyzer</h2>
        
        {/* Profile Basics */}
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

        {/* Profile Quality */}
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

        {/* Activity Signals */}
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

        {/* Outreach Suitability */}
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

        {/* Low Score Signals */}
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
          Submit Profile Analysis
        </button>
      </form>

      {/* Reply Form Container */}
      <div className="submissions-container">
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
              onClick={handleSubmitReply}
              disabled={isReplying || !replyText.trim()}
            >
              {isReplying ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormData;
