import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
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
    // Add the new fields for the requested metrics
    profileScorePercentage: 0,
    goodForOutreach: false,
    spamScore: 0
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

  // State for tracking if we're editing an existing submission
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // State for auto-refresh feature
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  const refreshTimerRef = useRef(null);
  const navigate = useNavigate(); // Add this hook

  // Add state to track expanded messages
  const [expandedMessages, setExpandedMessages] = useState({});

  useEffect(() => {
    // Check if we're in edit mode from URL params
    const queryParams = new URLSearchParams(window.location.search);
    const editParam = queryParams.get('edit');
    
    if (editParam) {
      setEditMode(true);
      setEditId(parseInt(editParam, 10));
      
      // Only load the submission once when the component mounts
      if (!selectedSubmission) {
        loadSubmissionForEdit(editParam);
      }
    } else {
      // Regular mode - fetch pending submissions
      fetchPendingSubmissions();
      
      // Set up auto-refresh if enabled
      if (autoRefreshEnabled && currentView === 'submissions') {
        refreshTimerRef.current = setInterval(() => {
          console.log('Auto-refreshing submissions...');
          fetchPendingSubmissions(true); // Silent refresh
        }, 15000); // Refresh every 15 seconds
      }
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [autoRefreshEnabled, currentView]);  // Remove selectedSubmission from deps to prevent loops

  const fetchPendingSubmissions = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const result = await adminService.getSubmissions({ 
        status: 'pending', 
        t: timestamp 
      });
      
      if (result.success && Array.isArray(result.data)) {
        setSubmissions(result.data);
        setLastRefreshTime(new Date());
      } else {
        if (!silent) {
          setSubmissions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      if (!silent) {
        setSubmissions([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadSubmissionForEdit = async (submissionId) => {
    setLoading(true);
    try {
      // Fetch the submission details including form data
      const result = await adminService.getSubmissionDetails(submissionId);
      
      if (result.success) {
        console.log("Successfully loaded submission for edit:", result.data);
        setSelectedSubmission(result.data);
        
        // If submission has form data, populate the form
        if (result.data.form_data && Object.keys(result.data.form_data).length > 0) {
          console.log("Setting form with data:", result.data.form_data);
          setForm(result.data.form_data);
        } else {
          console.log("No form data available, using defaults");
          // Set defaults if no form data exists
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
            // Add the new fields for the requested metrics
            profileScorePercentage: 0,
            goodForOutreach: false,
            spamScore: 0
          });
        }
        
        // Set reply text from admin_reply
        setReplyText(result.data.admin_reply || '');
        
        setCurrentView('analysis');
      } else {
        alert('Failed to load submission data for editing: ' + result.error);
        // Redirect back to reviewed submissions
        navigate('/admin/reviewed');
      }
    } catch (error) {
      console.error('Error loading submission for edit:', error);
      alert('An error occurred while loading the submission');
      navigate('/admin/reviewed');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Calculate profile score percentage (directly use the existing score)
      const profileScorePercentage = score;
      
      // Calculate spam score (0-100, higher means more likely to be spam)
      const spamFactors = [
        form.newlyCreated ? 25 : 0,
        form.sparseJobHistory ? 20 : 0,
        form.defaultProfilePicture ? 20 : 0,
        form.lowConnections ? 15 : 0,
        form.noEngagementOnPosts ? 10 : 0,
        !form.hasProfileSummary ? 5 : 0,
        form.outdatedJobInfo ? 5 : 0
      ];
      const spamScore = Math.min(100, spamFactors.reduce((sum, val) => sum + val, 0));
      
      // Determine if profile is good for outreach
      const outreachPositiveFactors = [
        form.openToNetworking,
        form.industryRelevance,
        form.recentActivity,
        form.engagementWithContent,
        form.hasVerificationShield,
        form.hasProfessionalPhoto,
        !form.lowConnections
      ];
      const outreachScore = outreachPositiveFactors.filter(Boolean).length / outreachPositiveFactors.length;
      const goodForOutreach = outreachScore > 0.6; // Over 60% positive factors means good for outreach

      let summary = `LinkedIn Profile Analysis\n\n`;
      summary += `Overall Score: ${score}/100 (${profileScorePercentage}%)\n`;
      summary += `Risk Level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}\n`;
      summary += `Spam Score: ${spamScore}/100\n`;
      summary += `Good for Outreach: ${goodForOutreach ? 'Yes' : 'No'}\n\n`;
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

      // Add outreach-specific recommendations
      if (!goodForOutreach) {
        summary += "\nOutreach Limitations:\n";
        if (!form.openToNetworking) summary += "• Profile doesn't indicate openness to networking\n";
        if (!form.industryRelevance) summary += "• Profile isn't in a relevant industry for your outreach\n";
        if (!form.recentActivity) summary += "• Lack of recent activity may indicate an inactive user\n";
        if (!form.engagementWithContent) summary += "• Low engagement with content suggests limited responsiveness\n";
        if (form.lowConnections) summary += "• Small network size limits potential reach\n";
      }

      // Update form state with the calculated metrics
      setForm(prevForm => ({
        ...prevForm,
        profileScorePercentage,
        goodForOutreach,
        spamScore
      }));

      setAnalysisPreview(summary);
      setReplyText(summary);
      setShowPreview(true);

      return {
        summary,
        score,
        risk_level: riskLevel,
        profile_score_percentage: profileScorePercentage,
        good_for_outreach: goodForOutreach,
        spam_score: spamScore
      };
    } catch (error) {
      console.error('Error generating analysis:', error);
      setReplyStatus('Failed to generate analysis');
      return null;
    }
  };

  const handleSubmit = (e) => {
    // This line is critical - we need to prevent default form submission
    e.preventDefault();

    if (!selectedSubmission) {
      setReplyStatus('Please select a submission first');
      return;
    }

    // Don't directly call handleGeneratePreview which changes the view
    // Instead generate the analysis first and make sure it works
    try {
      const analysisData = generateAnalysisPreview();
      console.log("Generated analysis data:", analysisData);
      
      if (analysisData) {
        // Only change the view if we have valid data
        setCurrentView('preview');
      } else {
        setReplyStatus('Failed to generate analysis preview');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setReplyStatus('An error occurred while generating the preview');
    }
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
      // Log what we're about to submit for debugging
      console.log(`Submitting analysis for ${editMode ? 'editing' : 'new'} submission ${selectedSubmission.id}`);
      console.log("Form data being sent:", form);
      console.log("Reply text:", replyText);
      
      const result = await adminService.submitReply(
        selectedSubmission.id, 
        replyText,
        form // Send the form data along with the reply
      );

      if (result.success) {
        setReplyStatus(`Analysis ${editMode ? 'updated' : 'sent'} successfully!`);

        if (!editMode) {
          // Remove from pending list in regular mode
          const updatedSubmissions = submissions.filter(sub =>
            sub.id !== selectedSubmission.id
          );
          setSubmissions(updatedSubmissions);
        }
        
        setShowPreview(false);
        
        // After successful update, allow time to see success message
        setTimeout(() => {
          if (editMode) {
            // Use navigate instead of direct window.location to prevent full page reload
            navigate('/admin/reviewed');
          } else {
            setCurrentView('submissions');
            setSelectedSubmission(null);
          }
        }, 2000);
      } else {
        setReplyStatus(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending analysis:', error);
      setReplyStatus('Failed to send analysis: ' + (error.message || 'Unknown error'));
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
      // Add the new fields for the requested metrics
      profileScorePercentage: 0,
      goodForOutreach: false,
      spamScore: 0
    });
    setCurrentView('analysis');
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleCancel = () => {
    if (editMode) {
      // In edit mode, go back to the reviewed submissions page
      window.location.href = '/admin/reviewed';
    } else {
      // In regular mode, go back to submissions list
      setCurrentView('submissions');
      setSelectedSubmission(null);
    }
  };

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    fetchPendingSubmissions();
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(prev => !prev);
    
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    // Set up new timer if enabling
    if (!autoRefreshEnabled) {
      refreshTimerRef.current = setInterval(() => {
        console.log('Auto-refreshing submissions...');
        fetchPendingSubmissions(true);
      }, 15000);
    }
  };

  // Add function to toggle message expansion
  const toggleMessageExpansion = (id, event) => {
    // Prevent the click from bubbling up to the card
    event.stopPropagation();
    
    setExpandedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="admin-dashboard">
      {currentView === 'submissions' && !editMode && (
        <div className="submissions-container">
          <div className="submissions-header">
            <h3 style={{ marginBottom: '2.5rem' }}>Profile Submissions</h3>
            <div className="dashboard-controls" style={{ marginTop: '1.5rem' }}>
              <div className="refresh-info">
                {lastRefreshTime && (
                  <span className="last-refresh">
                    Last updated: {lastRefreshTime.toLocaleTimeString()}
                  </span>
                )}
                <button 
                  className={`auto-refresh-toggle ${autoRefreshEnabled ? 'active' : ''}`} 
                  onClick={toggleAutoRefresh}
                  title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
                >
                  {autoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
                </button>
              </div>
              
              <div className="button-container" style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                <button 
                  onClick={handleRefresh} 
                  className="refresh-button" 
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Now'}
                </button>
                <Link to="/admin/reviewed" className="view-processed-button">
                  View Processed Submissions
                </Link>
              </div>
            </div>
          </div>
          
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
                      <p 
                        className="submission-message"
                        onClick={(e) => toggleMessageExpansion(submission.id, e)}
                      >
                        <strong>Message:</strong>{' '}
                        {expandedMessages[submission.id] 
                          ? submission.message
                          : `${submission.message.substring(0, 50)}${submission.message.length > 50 ? '...' : ''}`
                        }
                        <span className="expand-indicator">
                          {expandedMessages[submission.id] ? ' (collapse)' : ' (expand)'}
                        </span>
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
            <h2>{editMode ? 'Edit LinkedIn Profile Analysis' : 'Analyzing LinkedIn Profile'}</h2>
            <div className="submission-details">
              <p><strong>Email:</strong> {selectedSubmission.email}</p>
              <p><strong>LinkedIn URL:</strong> <a href={selectedSubmission.linkedin_url} target="_blank" rel="noopener noreferrer">{selectedSubmission.linkedin_url}</a></p>
              {selectedSubmission.message && (
                <p><strong>Message:</strong> {selectedSubmission.message}</p>
              )}
            </div>
            <button className="back-button" onClick={handleCancel}>
              {editMode ? 'Back to Reviewed Submissions' : 'Back to Submissions'}
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

            {/* Profile Quality section */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">2. Profile Quality</legend>
              <label>
                <input type="checkbox" name="hasProfileSummary" checked={form.hasProfileSummary} onChange={handleChange} />
                Has Summary or About Section
              </label>
              <label>
                <input type="checkbox" name="hasProfessionalPhoto" checked={form.hasProfessionalPhoto} onChange={handleChange} />
                Has Professional Profile Picture
              </label>
              <label>
                <input type="checkbox" name="hasOldPhoto" checked={form.hasOldPhoto} onChange={handleChange} />
                Profile Picture Looks Outdated
              </label>
              <label>
                <input type="checkbox" name="outdatedJobInfo" checked={form.outdatedJobInfo} onChange={handleChange} />
                Has Outdated Job Info or Defunct Companies
              </label>
              <label>
                <input type="checkbox" name="missingAboutOrEducation" checked={form.missingAboutOrEducation} onChange={handleChange} />
                Missing or Incomplete Education/Skills Info
              </label>
              <label>
                <input type="checkbox" name="profileCompleteness" checked={form.profileCompleteness} onChange={handleChange} />
                Overall Profile is Well-Filled
              </label>
              <label>
                <input type="checkbox" name="hasRecommendations" checked={form.hasRecommendations} onChange={handleChange} />
                Has Given/Received Recommendations
              </label>
              <label>
                <input type="checkbox" name="personalizedProfile" checked={form.personalizedProfile} onChange={handleChange} />
                Personalized Profile (unique summary or achievements)
              </label>
              <label>Skills Endorsements Count:
                <input name="skillsEndorsementsCount" type="number" value={form.skillsEndorsementsCount} onChange={handleChange} />
              </label>
            </fieldset>

            {/* Activity Signals section */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">3. Activity & Engagement</legend>
              <label>
                <input type="checkbox" name="recentActivity" checked={form.recentActivity} onChange={handleChange} />
                Recent Posts or Interactions (within 6 months)
              </label>
              <label>
                <input type="checkbox" name="engagementWithContent" checked={form.engagementWithContent} onChange={handleChange} />
                Others Engage with Their Content
              </label>
              <label>
                <input type="checkbox" name="engagementHistory" checked={form.engagementHistory} onChange={handleChange} />
                Regularly Likes/Comments/Shares
              </label>
              <label>
                <input type="checkbox" name="postHistoryOlderThanYear" checked={form.postHistoryOlderThanYear} onChange={handleChange} />
                Has Posts Older Than 1 Year
              </label>
              <label>Last Post Date:
                <input name="lastPostDate" type="date" value={form.lastPostDate} onChange={handleChange} />
              </label>
            </fieldset>

            {/* Suitability section */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">4. Profile Suitability</legend>
              <label>
                <input type="checkbox" name="sharedInterests" checked={form.sharedInterests} onChange={handleChange} />
                Shared Interests or Mutual Connections
              </label>
              <label>
                <input type="checkbox" name="profileUpdates" checked={form.profileUpdates} onChange={handleChange} />
                Recently Updated Headline or Info
              </label>
              <label>
                <input type="checkbox" name="openToNetworking" checked={form.openToNetworking} onChange={handleChange} />
                Open to Connect or Recruit
              </label>
              <label>
                <input type="checkbox" name="industryRelevance" checked={form.industryRelevance} onChange={handleChange} />
                In a Relevant Industry
              </label>
              <label>
                <input type="checkbox" name="activeJobTitles" checked={form.activeJobTitles} onChange={handleChange} />
                Has Active, Relevant Job Titles
              </label>
            </fieldset>

            {/* Risk Signals section */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend classroom-danger">5. Low Score / Risk Signals</legend>
              <label>
                <input type="checkbox" name="newlyCreated" checked={form.newlyCreated} onChange={handleChange} />
                Newly Created Account
              </label>
              <label>
                <input type="checkbox" name="sparseJobHistory" checked={form.sparseJobHistory} onChange={handleChange} />
                Sparse or Recently Added Job History
              </label>
              <label>
                <input type="checkbox" name="defaultProfilePicture" checked={form.defaultProfilePicture} onChange={handleChange} />
                Default/Stock Profile Picture
              </label>
              <label>
                <input type="checkbox" name="lowConnections" checked={form.lowConnections} onChange={handleChange} />
                Very Low (100) Connections
              </label>
              <label>
                <input type="checkbox" name="noEngagementOnPosts" checked={form.noEngagementOnPosts} onChange={handleChange} />
                No Meaningful Engagement on Content
              </label>
            </fieldset>

            {/* Add a new fieldset for the metrics */}
            <fieldset className="classroom-fieldset">
              <legend className="classroom-legend">6. Profile Metrics</legend>
              
              <label>Profile Score Percentage:
                <input 
                  type="number" 
                  name="profileScorePercentage" 
                  value={form.profileScorePercentage} 
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  name="goodForOutreach" 
                  checked={form.goodForOutreach} 
                  onChange={handleChange}
                />
                Good for Outreach
              </label>
              
              <label>Spam Score (0-100):
                <input 
                  type="number" 
                  name="spamScore" 
                  value={form.spamScore} 
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
              </label>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="classroom-submit-button">
                {editMode ? 'Update Analysis Preview' : 'Generate Analysis Preview'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview container */}
      {currentView === 'preview' && showPreview && (
        <div className="preview-container">
          <h2>{editMode ? 'Updated Analysis Preview' : 'Analysis Preview'}</h2>
          <pre>{analysisPreview}</pre>
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              type="button" 
              className="classroom-submit-button" 
              onClick={handleSendAnalysis}
              disabled={isReplying}
            >
              {isReplying ? 'Sending...' : editMode ? 'Update & Resend Analysis' : 'Send Analysis'}
            </button>
          </div>
          {replyStatus && <p className="reply-status">{replyStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default FormData;
