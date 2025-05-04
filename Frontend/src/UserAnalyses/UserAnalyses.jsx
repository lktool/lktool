import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserAnalyses.css';
import LoadingSpinner from '../components/LoadingSpinner';

function UserAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Not authenticated');
        }
        
        const authToken = typeof token === 'string' ? token : JSON.parse(token).value;
        
        const response = await axios.get('https://lktool.onrender.com/api/contact/user-analyses/', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        setAnalyses(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analyses:', err);
        setError('Unable to load your analyses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyses();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your analyses..." />;
  }

  if (error) {
    return <div className="analysis-error">{error}</div>;
  }

  if (analyses.length === 0) {
    return (
      <div className="no-analyses">
        <h2>No Analyses Yet</h2>
        <p>Your LinkedIn profile submissions haven't been analyzed yet.</p>
      </div>
    );
  }

  // Function to render analysis cards
  const renderAnalysisCard = (analysis) => {
    const data = analysis.analysis;
    if (!data) return null;
    
    return (
      <div className="analysis-card" key={analysis.id}>
        <div className="analysis-header">
          <h3>LinkedIn Analysis</h3>
          <span className="analysis-date">
            {new Date(analysis.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="analysis-url">
          <a href={analysis.linkedin_url} target="_blank" rel="noopener noreferrer">
            {analysis.linkedin_url}
          </a>
        </div>
        
        <div className="analysis-sections">
          <div className="analysis-section">
            <h4>Profile Basics</h4>
            <div className="analysis-items">
              <div className="analysis-item">
                <span>Connections:</span> {data.connections || "Not specified"}
              </div>
              <div className="analysis-item">
                <span>Verification Shield:</span> {data.hasVerificationShield ? "Yes" : "No"}
              </div>
              <div className="analysis-item">
                <span>Account Type:</span> {data.accountType || "Normal"}
              </div>
            </div>
          </div>
          
          {/* Additional sections for quality, activity, etc. */}
        </div>
      </div>
    );
  };

  return (
    <div className="analyses-container">
      <h1>Your LinkedIn Profile Analyses</h1>
      <div className="analyses-list">
        {analyses.map(renderAnalysisCard)}
      </div>
    </div>
  );
}

export default UserAnalyses;
