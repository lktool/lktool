import React from 'react';
import './Pricing.css';

const Pricing = () => {
  return (
    <div className="pricing-container">
      <h1 className="pricing-title">LinkedIn Profile Analysis Packages</h1>
      
      <div className="pricing-plans-simple">
        {/* Free Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>FREEE</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              <li>Connections:</li>
              <li>Verification Shield Present</li>
              <li>Account Type:</li>
              <li>Has Summary or About Section</li>
              <li>Open to Connect or Recruit</li>
            </ul>
          </div>
        </div>
        
        {/* Basic Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>BASIC</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              <li>Last Updated:</li>
              <li>Has Custom Short URL</li>
              <li>Has Professional Profile Picture</li>
              <li>Recent Posts or Interactions (within 6 months)</li>
              <li>Recently Updated Headline or Info</li>
              <li>Sparse or Recently Added Job History</li>
              <li>Default/Stock Profile Picture</li>
              <li>Very Low (100) Connections</li>
              <li>No Meaningful Engagement on Content</li>
            </ul>
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>PREMIUM</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              <li>Account Age (years):</li>
              <li>Profile Picture Looks Outdated</li>
              <li>Has Outdated Job Info or Defunct Companies</li>
              <li>Missing or Incomplete Education/Skills Info</li>
              <li>Overall Profile is Well-Filled</li>
              <li>Has Given/Received Recommendations</li>
              <li>Personalized Profile (unique summary or achievements)</li>
              <li>Skills Endorsements Count:</li>
              <li>Others Engage with Their Content</li>
              <li>Regularly Likes/Comments/Shares</li>
              <li>Has Posts Older Than 1 Year</li>
              <li>Last Post Date:</li>
              <li>Shared Interests or Mutual Connections</li>
              <li>In a Relevant Industry</li>
              <li>Has Active, Relevant Job Titles</li>
              <li>Newly Created Account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
