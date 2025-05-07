import React, { useState, useEffect } from 'react';
import "./FormData.css";
import NavBar from '../NavBar/NavBar';
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

  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('LinkedIn Profile Data:', form);
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await adminService.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage({ text: 'Failed to load users', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch submissions when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setSubmissions([]);
      return;
    }

    const fetchUserSubmissions = async () => {
      try {
        setLoading(true);
        const data = await adminService.getUserSubmissions(selectedUser);
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching user submissions:', error);
        setMessage({ text: 'Failed to load submissions', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, [selectedUser]);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setSelectedSubmission(null);
    setShowAnalysisForm(false);
  };

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setShowAnalysisForm(true);
    // Pre-populate form with existing analysis if it exists
    if (submission.analysis) {
      setForm(submission.analysis);
    } else {
      // Reset form to defaults
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
    }
  };

  const handleAnalysisSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    try {
      setLoading(true);
      await adminService.submitAnalysis({
        submission: selectedSubmission.id,
        data: form
      });
      setMessage({ text: 'Analysis saved successfully', type: 'success' });
      setShowAnalysisForm(false);
      
      // Refresh submissions list
      if (selectedUser) {
        const data = await adminService.getUserSubmissions(selectedUser);
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setMessage({ text: 'Failed to save analysis', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="admin-dashboard">
        <h1>LinkedIn Profile Analysis Dashboard</h1>
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="user-selection">
          <label>Select User:</label>
          <select value={selectedUser} onChange={handleUserChange} disabled={loading}>
            <option value="">Choose a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="submissions-container">
            {selectedUser && submissions.length === 0 ? (
              <p className="no-data">No submissions found for this user.</p>
            ) : (
              <div className="submissions-list">
                {submissions.map(submission => (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <span className="submission-date">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                      <span className={`submission-status ${submission.is_processed ? 'processed' : 'pending'}`}>
                        {submission.is_processed ? 'Analyzed' : 'Not Analyzed'}
                      </span>
                    </div>
                    
                    <div className="submission-body">
                      <p><strong>LinkedIn URL:</strong> <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">{submission.linkedin_url}</a></p>
                      {submission.message && (
                        <p><strong>Message:</strong> {submission.message}</p>
                      )}
                      
                      <button 
                        className="analyze-button"
                        onClick={() => handleSubmissionSelect(submission)}
                      >
                        {submission.is_processed ? 'Update Analysis' : 'Add Analysis'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show analysis form only when a submission is selected */}
      {showAnalysisForm && selectedSubmission ? (
        <form onSubmit={handleAnalysisSubmit} className="classroom-form-data">
          <h2 className="classroom-heading">LinkedIn Profile Analysis</h2>
          <p>Analyzing profile for: <a href={selectedSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">{selectedSubmission.linkedin_url}</a></p>

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

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => setShowAnalysisForm(false)}>
              Cancel
            </button>
            <button type="submit" className="classroom-submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Analysis'}
            </button>
          </div>
        </form>
      ) : (
        // Show regular form when no submission is selected
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
      )}
    </>
  );
};

export default FormData;
