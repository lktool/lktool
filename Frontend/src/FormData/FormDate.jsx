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
  const [isReplying, setIsReplying] = useState(false);useState(null);
  const [replyStatus, setReplyStatus] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const handleChange = (e) => {tatus] = useState('');
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };const fetchSubmissions = async () => {
      setLoading(true);
  const handleSubmit = (e) => {
    e.preventDefault();ait adminService.getSubmissions('pending');
    console.log('LinkedIn Profile Data:', form);
  };  } catch (error) {
        console.error('Error fetching submissions:', error);
  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setReplyText(submission.admin_reply || '');
  };};

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };
  const handleChange = (e) => {
  const handleSubmitReply = async () => {= e.target;
    if (!selectedSubmission || !replyText.trim()) {? checked : value });
      setReplyStatus('Please enter a reply message');
      return;
    }st handleSubmit = (e) => {
    e.preventDefault();
    setIsReplying(true);n Profile Data:', form);
    setReplyStatus('');

    try {andleSelectSubmission = (submission) => {
      await adminService.submitReply(selectedSubmission.id, replyText);
      setReplyStatus('Reply sent successfully');
      
      // Update local submission data
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? {...sub, admin_reply: replyText, is_processed: true} 
          : sub
      );handleSubmitReply = async () => {
      setSubmissions(updatedSubmissions);.trim()) {
    } catch (error) {'Please enter a reply message');
      console.error('Error sending reply:', error);
      setReplyStatus('Failed to send reply');
    } finally {
      setIsReplying(false);
    }etReplyStatus('');
  };
    try {
  const handleMarkProcessed = async (id, isProcessed) => {t adminService.submitReply(selectedSubmission.id, replyText);
    try {essfully');
      await adminService.updateSubmissionStatus(id, isProcessed);
      // Update the local submissions list
      setSubmissions(submissions.map(sub =>         sub.id === selectedSubmission.id 
        sub.id === id ly: replyText, is_processed: true} 
          ? {...sub, is_processed: isProcessed} 
          : sub
      ));ubmissions);
    } catch (error) {
      console.error('Error updating submission status:', error);r('Error sending reply:', error);
    }tus('Failed to send reply');
  };

  return (
    <div className="admin-dashboard">
      <form onSubmit={handleSubmit} className="classroom-form-data">
        <h2 className="classroom-heading">LinkedIn Profile Analyzer</h2>

        {/* Profile Basics */}"submissions-list">
        <fieldset className="classroom-fieldset">g Submissions</h2>
          <legend className="classroom-legend">1. Profile Basics</legend>
          <label>Connections:
            <input name="connections" type="number" value={form.connections} onChange={handleChange} />sions.length === 0 ? (
          </label>sions found</p>
          <label>
            <input type="checkbox" name="hasVerificationShield" checked={form.hasVerificationShield} onChange={handleChange} />sName="submission-cards">
            Verification Shield Presentissions.map(submission => (
          </label>
          <label>Account Type:id} 
            <select name="accountType" value={form.accountType} onChange={handleChange}>assName={`submission-item ${selectedSubmission?.id === submission.id ? 'selected' : ''}`}
              <option value="normal">Normal</option>lick={() => handleSelectSubmission(submission)}
              <option value="premium">Premium</option>              >
            </select>"submission-preview">
          </label>ission.email}</p>
          <label>Account Age (years):ing(0, 30)}...</p>
            <input name="accountAgeYears" type="number" value={form.accountAgeYears} onChange={handleChange} />      <p><strong>Date:</strong> {new Date(submission.created_at).toLocaleDateString()}</p>
          </label>
          <label>Last Updated:
            <input name="lastUpdated" type="date" value={form.lastUpdated} onChange={handleChange} />
          </label>
          <label>
            <input type="checkbox" name="hasCustomURL" checked={form.hasCustomURL} onChange={handleChange} />
            Has Custom Short URL
          </label>
        </fieldset>ading">LinkedIn Profile Analyzer</h2>

        {/* Profile Quality */}
        <fieldset className="classroom-fieldset">ssName="classroom-fieldset">
          <legend className="classroom-legend">2. Profile Quality</legend>assName="classroom-legend">1. Profile Basics</legend>
          {[bel>Connections:
            ['hasProfileSummary', 'Has Summary or About Section'],"number" value={form.connections} onChange={handleChange} />
            ['hasProfessionalPhoto', 'Has Professional Profile Picture'],
            ['hasOldPhoto', 'Profile Picture Looks Outdated'],
            ['outdatedJobInfo', 'Has Outdated Job Info or Defunct Companies'],type="checkbox" name="hasVerificationShield" checked={form.hasVerificationShield} onChange={handleChange} />
            ['missingAboutOrEducation', 'Missing or Incomplete Education/Skills Info'],            Verification Shield Present
            ['profileCompleteness', 'Overall Profile is Well-Filled'],
            ['hasRecommendations', 'Has Given/Received Recommendations'],
            ['personalizedProfile', 'Personalized Profile (unique summary or achievements)'],Change}>
          ].map(([key, label]) => (  <option value="normal">Normal</option>
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}
            </label>
          ))}Years" type="number" value={form.accountAgeYears} onChange={handleChange} />
          <label>Skills Endorsements Count:
            <input name="skillsEndorsementsCount" type="number" value={form.skillsEndorsementsCount} onChange={handleChange} />
          </label>me="lastUpdated" type="date" value={form.lastUpdated} onChange={handleChange} />
        </fieldset>
bel>
        {/* Activity Signals */}x" name="hasCustomURL" checked={form.hasCustomURL} onChange={handleChange} />
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
            </label>funct Companies'],
          ))}cation/Skills Info'],
          <label>Last Post Date: 'Overall Profile is Well-Filled'],
            <input name="lastPostDate" type="date" value={form.lastPostDate} onChange={handleChange} />ons', 'Has Given/Received Recommendations'],
          </label>
        </fieldset>, label]) => (
ey={key}>
        {/* Outreach Suitability */} <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
        <fieldset className="classroom-fieldset">l}
          <legend className="classroom-legend">4. Outreach Suitability</legend>            </label>
          {[
            ['profileUpdates', 'Recently Updated Headline or Info'],
            ['sharedInterests', 'Shared Interests or Mutual Connections'], onChange={handleChange} />
            ['openToNetworking', 'Open to Connect or Recruit'],label>
            ['industryRelevance', 'In a Relevant Industry'],
            ['activeJobTitles', 'Has Active, Relevant Job Titles']
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />egend>
              {label}
            </label>, 'Recent Posts or Interactions (within 6 months)'],
          ))}
        </fieldset>entHistory', 'Regularly Likes/Comments/Shares'],
storyOlderThanYear', 'Has Posts Older Than 1 Year']
        {/* Low Score Signals */}ap(([key, label]) => (
        <fieldset className="classroom-fieldset">key={key}>
          <legend className="classroom-legend classroom-danger">5. Low Score / Risk Signals</legend>              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
          {[
            ['newlyCreated', 'Newly Created Account'],
            ['sparseJobHistory', 'Sparse or Recently Added Job History'],
            ['defaultProfilePicture', 'Default/Stock Profile Picture'],bel>Last Post Date:
            ['lowConnections', 'Very Low (<100) Connections'],            <input name="lastPostDate" type="date" value={form.lastPostDate} onChange={handleChange} />
            ['noEngagementOnPosts', 'No Meaningful Engagement on Content']
          ].map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              {label}>
            </label>
          ))}
        </fieldset>ileUpdates', 'Recently Updated Headline or Info'],
['sharedInterests', 'Shared Interests or Mutual Connections'],
        <button type="submit" className="classroom-submit-button">etworking', 'Open to Connect or Recruit'],
          Submit Profile Analysis', 'In a Relevant Industry'],
        </button>e, Relevant Job Titles']
      </form>
={key}>
      <div className="submissions-container">e={key} checked={form[key]} onChange={handleChange} />
        {selectedSubmission && ({label}
          <div className="reply-form-container"></label>
            <h3>Reply to Submission</h3>
            <div className="submission-details">
              <p><strong>LinkedIn URL:</strong> <a href={selectedSubmission.linkedin_url}>{selectedSubmission.linkedin_url}</a></p>
              <p><strong>Message:</strong> {selectedSubmission.message}</p>e Signals */}
            </div>set className="classroom-fieldset">
            egend className="classroom-legend classroom-danger">5. Low Score / Risk Signals</legend>
            <textarea
              value={replyText} Account'],
              onChange={handleReplyChange}or Recently Added Job History'],
              placeholder="Enter your reply to the user..."file Picture'],
              rows={5}'lowConnections', 'Very Low (<100) Connections'],
              className="reply-textarea"ement on Content']
            />, label]) => (
            el key={key}>
            {replyStatus && (    <input type="checkbox" name={key} checked={form[key]} onChange={handleChange} />
              <div className={`reply-status ${replyStatus.includes('success') ? 'success' : 'error'}`}>  {label}
                {replyStatus}  </label>
              </div>      ))}
            )}      </fieldset>
            
            <buttonbmit" className="classroom-submit-button">
              className="send-reply-button"          Submit Profile Analysis














export default FormData;};  );    </div>      </div>        )}          </div>            </button>              {isReplying ? 'Sending...' : 'Send Reply'}            >              disabled={isReplying || !replyText.trim()}              onClick={handleSubmitReply}        </button>
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
