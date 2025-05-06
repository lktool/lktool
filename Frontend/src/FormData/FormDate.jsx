import React, { useState, useEffect } from 'react';
import "./FormData.css";
import NavBar from '../NavBar/NavBar';
import { adminService } from '../api/adminService';

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
  const [selectedSubmission, setSelectedSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setMessage({ text: 'Fetching users...', type: 'info' });
        
        const userData = await adminService.getUsers();
        
        console.log("Received user data:", userData);
        
        if (Array.isArray(userData) && userData.length > 0) {
          console.log(`Successfully loaded ${userData.length} users`);
          setUsers(userData);
          setMessage({ text: `Loaded ${userData.length} users successfully`, type: 'success' });
          // Add small delay to clear success message
          setTimeout(() => {
            setMessage({ text: '', type: '' });
          }, 3000);
        } else {
          console.warn('No users returned from API:', userData);
          setMessage({ text: 'No users found. Using mock data.', type: 'warning' });
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setMessage({ text: `Error loading users: ${err.message || 'Unknown error'}`, type: 'error' });
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setSubmissions([]);
      return;
    }

    const fetchUserSubmissions = async () => {
      try {
        const submissionsData = await adminService.getUserSubmissions(selectedUser);
        setSubmissions(submissionsData);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
        setMessage({ text: 'Error loading user submissions', type: 'error' });
      }
    };

    fetchUserSubmissions();
  }, [selectedUser]);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
    setSelectedSubmission('');
  };

  const handleSubmissionChange = (e) => {
    setSelectedSubmission(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser || !selectedSubmission) {
      setMessage({ text: 'Please select both a user and submission', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const analysisData = {
        user: selectedUser,
        submission: selectedSubmission,
        data: { ...form }
      };

      await adminService.submitAnalysis(analysisData);

      setMessage({ text: 'Analysis submitted successfully', type: 'success' });

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

    } catch (err) {
      console.error('Failed to submit analysis:', err);
      setMessage({ text: 'Error submitting analysis: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="classroom-form-data">
        <h2 className="classroom-heading">LinkedIn Profile Analyzer</h2>

        <fieldset className="classroom-fieldset">
          <legend className="classroom-legend">Select User and Submission</legend>
          <div className="classroom-select-container">
            <label htmlFor="user-select">User:</label>
            <select
              id="user-select"
              value={selectedUser}
              onChange={handleUserChange}
              disabled={loading || users.length === 0}
              className="classroom-select"
            >
              <option value="">
                {users.length === 0 ? 'No users available' : 'Select a user'}
              </option>
              {users && users.length > 0 ? (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email || user.displayName || `User #${user.id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {loading ? "Loading users..." : "No users available"}
                </option>
              )}
            </select>
            {users && users.length > 0 && (
              <div className="user-count">{users.length} users found</div>
            )}
          </div>

          <div className="classroom-select-container">
            <label htmlFor="submission-select">Submission:</label>
            <select
              id="submission-select"
              value={selectedSubmission}
              onChange={handleSubmissionChange}
              disabled={!selectedUser || loading}
              className="classroom-select"
            >
              <option value="">Select a submission</option>
              {submissions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {new Date(sub.created_at).toLocaleDateString()} - {sub.linkedin_url.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {message.text && (
          <div className={`classroom-message ${message.type}`}>
            {message.text}
          </div>
        )}

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

        <button
          type="submit"
          className="classroom-submit-button"
          disabled={loading || !selectedUser || !selectedSubmission}
        >
          {loading ? 'Submitting...' : 'Submit Profile Analysis'}
        </button>
      </form>
    </>
  );
};

export default FormData;
