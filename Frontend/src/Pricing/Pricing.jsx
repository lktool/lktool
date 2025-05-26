import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showComingSoonMessage, setShowComingSoonMessage] = useState(false);
  const [comingSoonPlan, setComingSoonPlan] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  
  const handlePaidPlanClick = (planName) => {
    setComingSoonPlan(planName);
    setShowComingSoonMessage(true);
    
    setTimeout(() => {
      setShowComingSoonMessage(false);
    }, 3000);
  };
  
  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
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
          <div className="plan-header">
            <h2>Free</h2>
            <div className="plan-price">
              <span className="price">$0</span>
              <span className="period">forever</span>
            </div>
          </div>
          <div className="plan-features">
            <ul>
              <li>Account Type identification</li>
              <li>Basic recommendations</li>
              <li>Connections analysis</li>
              <li>Open to Connect/Recruit evaluation</li>
              <li>One response per month</li>
              <li>Profile Summary assessment</li>
              <li>Response within 24 hours</li>
              <li>Verification Shield check</li>
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
              <span className="price">${billingPeriod === 'monthly' ? '899' : '719.20'}</span>
              <span className="period">per month</span>
            </div>
            {billingPeriod === 'yearly' && <div className="billed-annually">Billed annually (${719.20 * 12})</div>}
          </div>
          <div className="plan-features">
            <ul>
              <li>All Free features, plus:</li>
              <li>Connection quality assessment</li>
              <li>Custom URL check</li>
              <li>Engagement analysis</li>
              <li>Headline analysis</li>
              <li>Job history evaluation</li>
              <li>Last update date analysis</li>
              <li>Profile picture assessment</li>
              <li>Recent activity evaluation</li>
              <li>24 profile submissions per month</li>
              <li><strong>Immediate results</strong></li>
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
              <span className="price">${billingPeriod === 'monthly' ? '1299' : '1039.20'}</span>
              <span className="period">per month</span>
            </div>
            {billingPeriod === 'yearly' && <div className="billed-annually">Billed annually (${1039.20 * 12})</div>}
          </div>
          <div className="plan-features">
            <ul>
              <li>All Basic features, plus:</li>
              <li>Account age evaluation</li>
              <li>Activity pattern assessment</li>
              <li>Content engagement analysis</li>
              <li>Education/Skills completeness</li>
              <li>Industry relevance analysis</li>
              <li>Job information accuracy check</li>
              <li>Job title optimization</li>
              <li>Overall profile completeness score</li>
              <li>Photo freshness analysis</li>
              <li>Post history evaluation</li>
              <li>Profile personalization analysis</li>
              <li>Recommendations assessment</li>
              <li>Skills endorsements evaluation</li>
              <li>Unlimited profile submissions</li>
              <li><strong>Immediate priority results</strong></li>
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
      
      {/* Replace the entire comparison table section with this fixed version */}
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
              <div className="feature-column">Account Age Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Account Type Identification</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Connections Analysis</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Custom URL Check</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Last Updated Date Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Verification Shield Check</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="comparison-category">
            <div className="category-header">Profile Content</div>
            
            <div className="comparison-row">
              <div className="feature-column">Education/Skills Completeness</div>
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
              <div className="feature-column">Overall Profile Completeness Score</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Photo Freshness Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Profile Picture Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Summary/About Section Assessment</div>
              <div className="plan-column free">✓</div>
              <div className="plan-column basic">✓</div>
              <div className="plan-column premium">✓</div>
            </div>
          </div>
          
          {/* Engagement & Activity */}
          <div className="comparison-category">
            <div className="category-header">Engagement & Activity</div>
            
            <div className="comparison-row">
              <div className="feature-column">Activity Pattern Assessment</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Content Engagement Analysis</div>
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
            
            <div className="comparison-row">
              <div className="feature-column">Recent Activity Evaluation</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">✓</div>
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
              <div className="feature-column">Industry Relevance Analysis</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
              <div className="plan-column premium">✓</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Job Title Optimization</div>
              <div className="plan-column free">-</div>
              <div className="plan-column basic">-</div>
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
          </div>
          
          {/* Service Limits */}
          <div className="comparison-category">
            <div className="category-header">Service Limits</div>
            
            <div className="comparison-row">
              <div className="feature-column">Profile Submissions per Month</div>
              <div className="plan-column free">1</div>
              <div className="plan-column basic">24</div>
              <div className="plan-column premium">Unlimited</div>
            </div>
            
            <div className="comparison-row">
              <div className="feature-column">Response Time</div>
              <div className="plan-column free">24 hours</div>
              <div className="plan-column basic">Immediate</div>
              <div className="plan-column premium">Immediate</div>
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
      
      {/* FAQ Section */}
      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <button 
              className={`faq-question ${activeFaq === 0 ? 'active' : ''}`}
              onClick={() => toggleFaq(0)}
            >
              How does the profile analysis work?
              <span className="faq-icon">{activeFaq === 0 ? '−' : '+'}</span>
            </button>
            {activeFaq === 0 && (
              <div className="faq-answer">
                <p>Our tool analyzes your LinkedIn profile by examining over 20 key factors including profile completeness, 
                engagement patterns, connection quality, and content strategy. We use these insights to provide specific 
                recommendations to improve your professional presence and visibility.</p>
              </div>
            )}
          </div>
          
          <div className="faq-item">
            <button 
              className={`faq-question ${activeFaq === 1 ? 'active' : ''}`}
              onClick={() => toggleFaq(1)}
            >
              How long does it take to get my results?
              <span className="faq-icon">{activeFaq === 1 ? '−' : '+'}</span>
            </button>
            {activeFaq === 1 && (
              <div className="faq-answer">
                <p>Free plan users receive their analysis within 24 hours. Basic and Premium 
                plan users receive immediate results, with Premium users getting priority processing during high volume periods.</p>
              </div>
            )}
          </div>
          
          <div className="faq-item">
            <button 
              className={`faq-question ${activeFaq === 2 ? 'active' : ''}`}
              onClick={() => toggleFaq(2)}
            >
              Can I upgrade my plan later?
              <span className="faq-icon">{activeFaq === 2 ? '−' : '+'}</span>
            </button>
            {activeFaq === 2 && (
              <div className="faq-answer">
                <p>Yes, you can upgrade your plan at any time. When you upgrade, you'll immediately gain access to all the 
                features and benefits of your new plan. If you upgrade from a monthly to a yearly plan, you'll also 
                benefit from the 20% discount.</p>
              </div>
            )}
          </div>
          
          <div className="faq-item">
            <button 
              className={`faq-question ${activeFaq === 3 ? 'active' : ''}`}
              onClick={() => toggleFaq(3)}
            >
              What if I'm not satisfied with the analysis?
              <span className="faq-icon">{activeFaq === 3 ? '−' : '+'}</span>
            </button>
            {activeFaq === 3 && (
              <div className="faq-answer">
                <p>We stand behind the quality of our service. If you're not completely satisfied with your analysis, 
                please contact our support team within 7 days of receiving your results, and we'll work to address 
                your concerns or provide a full refund.</p>
              </div>
            )}
          </div>
          
          <div className="faq-item">
            <button 
              className={`faq-question ${activeFaq === 4 ? 'active' : ''}`}
              onClick={() => toggleFaq(4)}
            >
              Is my profile data secure?
              <span className="faq-icon">{activeFaq === 4 ? '−' : '+'}</span>
            </button>
            {activeFaq === 4 && (
              <div className="faq-answer">
                <p>Absolutely. We take data privacy very seriously. Your profile information is only accessed for the purpose 
                of providing our analysis services. We never share your personal information with third parties, and all 
                data is processed according to our strict privacy policy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
