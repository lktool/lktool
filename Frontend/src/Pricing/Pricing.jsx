import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showComingSoonMessage, setShowComingSoonMessage] = useState(false);
  const [comingSoonPlan, setComingSoonPlan] = useState('');
  
  const handlePaidPlanClick = (planName) => {
    setComingSoonPlan(planName);
    setShowComingSoonMessage(true);
    
    setTimeout(() => {
      setShowComingSoonMessage(false);
    }, 3000);
  };
  
  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose the Right Plan for Your LinkedIn Success</h1>
        <p>Get professional insights to boost your LinkedIn profile and career opportunities</p>
        
        {/* <div className="billing-toggle">
          <span className={billingPeriod === 'monthly' ? 'active' : ''}>Monthly</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={billingPeriod === 'yearly'} 
              onChange={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={billingPeriod === 'yearly' ? 'active' : ''}>
            Yearly
            <div className="save-badge">Save 20%</div>
          </span>
        </div> */}
      </div>
      
      <div className="pricing-plans">
        {/* Free Plan */}
        <div className="pricing-plan">
{/*           <div className="coming-soon-badge">Coming Soon</div> */}
          <div className="plan-header">
            <h2>Free</h2>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">forever</span>
            </div>
          </div>
          <div className="plan-features">
            <ul>
              <li>Connections analysis</li>
              <li>Verification Shield check</li>
              <li>Account Type identification</li>
              <li>Profile Summary assessment</li>
              <li>Open to Connect/Recruit evaluation</li>
              <li>Basic recommendations</li>
              <li>1 profile submission per month</li>
            </ul>
          </div>
          <div className="plan-cta">
            <Link to="/signup" className="cta-button free coming-soon">Get Started</Link>
          </div>
        </div>
        
        {/* Basic Plan */}
        <div className="pricing-plan popular">
          <div className="popular-badge">Most Popular</div>
          <div className="coming-soon-badge">Coming Soon</div>
          <div className="plan-header">
            <h2>Basic</h2>
            <div className="plan-price">
              <span className="price">${billingPeriod === 'monthly' ? '12' : '9.60'}</span>
              <span className="period">per month</span>
            </div>
            {billingPeriod === 'yearly' && <div className="billed-annually">Billed annually (${9.60 * 12})</div>}
          </div>
          <div className="plan-features">
            <ul>
              <li>All Free features, plus:</li>
              <li>Last update date analysis</li>
              <li>Custom URL check</li>
              <li>Profile picture assessment</li>
              <li>Recent activity evaluation</li>
              <li>Headline analysis</li>
              <li>Job history evaluation</li>
              <li>Connection quality assessment</li>
              <li>Engagement analysis</li>
              <li>3 profile submissions per month</li>
            </ul>
          </div>
          <div className="plan-cta">
            <button 
              className="cta-button basic coming-soon" 
              onClick={() => handlePaidPlanClick('Basic')}
            >
              Choose Basic
            </button>
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="pricing-plan">
          <div className="coming-soon-badge">Coming Soon</div>
          <div className="plan-header">
            <h2>Premium</h2>
            <div className="plan-price">
              <span className="price">${billingPeriod === 'monthly' ? '29' : '23.20'}</span>
              <span className="period">per month</span>
            </div>
            {billingPeriod === 'yearly' && <div className="billed-annually">Billed annually (${23.20 * 12})</div>}
          </div>
          <div className="plan-features">
            <ul>
              <li>All Basic features, plus:</li>
              <li>Account age evaluation</li>
              <li>Photo freshness analysis</li>
              <li>Job information accuracy check</li>
              <li>Education/Skills completeness</li>
              <li>Overall profile completeness score</li>
              <li>Recommendations assessment</li>
              <li>Profile personalization analysis</li>
              <li>Skills endorsements evaluation</li>
              <li>Content engagement analysis</li>
              <li>Activity pattern assessment</li>
              <li>Post history evaluation</li>
              <li>Industry relevance analysis</li>
              <li>Job title optimization</li>
              <li>Unlimited profile submissions</li>
            </ul>
          </div>
          <div className="plan-cta">
            <button 
              className="cta-button pro coming-soon" 
              onClick={() => handlePaidPlanClick('Premium')}
            >
              Choose Premium
            </button>
          </div>
        </div>
      </div>
      
      {/* Coming Soon message toast */}
      {showComingSoonMessage && (
        <div className="coming-soon-toast">
          {comingSoonPlan} plan is coming soon!
        </div>
      )}
      
      {/* Replace the existing features-comparison section with this improved version */}
      <div className="features-comparison">
        <h2>Detailed Feature Comparison</h2>
        
        <div className="comparison-table">
          <div className="comparison-header">
            <div className="feature-column">Features</div>
            <div className="plan-column free">Free</div>
            <div className="plan-column basic">Basic</div>
            <div className="plan-column premium">Premium</div>
          </div>
          
          {/* Profile Basics */}
          <div className="comparison-category">
            <div className="category-header">Profile Basics</div>
            
            <div className="comparison-row">
              <div className="feature-column">Connections Analysis</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Verification Shield Check</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Account Type Identification</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Account Age Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Last Updated Date Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Custom URL Check</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="comparison-category">
            <div className="category-header">Profile Content</div>
            
            <div className="comparison-row">
              <div className="feature-column">Summary/About Section Assessment</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Profile Picture Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Photo Freshness Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Job Information Accuracy</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Education/Skills Completeness</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Overall Profile Completeness Score</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Engagement & Activity */}
          <div className="comparison-category">
            <div className="category-header">Engagement & Activity</div>
            
            <div className="comparison-row">
              <div className="feature-column">Recent Activity Evaluation</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Content Engagement Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Activity Pattern Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Post History Evaluation</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Network Quality */}
          <div className="comparison-category">
            <div className="category-header">Network Quality</div>
            
            <div className="comparison-row">
              <div className="feature-column">Connection Quality Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Recommendations Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Skills Endorsements Evaluation</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Industry Relevance Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Service Limits */}
          <div className="comparison-category">
            <div className="category-header">Service Limits</div>
            
            <div className="comparison-row">
              <div className="feature-column">Profile Submissions per Month</div>
              <div className="plan-column free">1</div>
              <div className="plan-column basic">3</div>
              <div className="plan-column premium">Unlimited</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Response Time</div>
              <div className="plan-column free">3-5 days</div>
              <div className="plan-column basic">1-2 days</div>
              <div className="plan-column premium">24 hours</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pricing-cta-section">
        <h2>Ready to Transform Your LinkedIn Profile?</h2>
        <p>Join thousands of professionals who have improved their online presence</p>
        <div className="coming-soon-note">
          <p>All plans coming soon! Submit your profile for a free analysis in the meantime.</p>
        </div>
        <Link to="/signup" className="main-cta-button">Get Started Today</Link>
      </div>
    </div>
  );
};

export default Pricing;
