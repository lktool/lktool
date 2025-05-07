import React, { useState, useEffect } from 'react';
import "./FormData.css";
import { adminService } from '../api/adminService';
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

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('LinkedIn Profile Data:', form);
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
      await adminService.submitReply(selectedSubmission.id, replyText);
      setReplyStatus('Reply sent successfully');
      
      // Update local submission data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? {...sub, admin_reply: replyText, is_processed: true} 
          : sub
      );
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyStatus('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="admin-dashboard">
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
