import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [showFaq, setShowFaq] = useState(null);
  
  const toggleFaq = (index) => {
    setShowFaq(showFaq === index ? null : index);
  };
  
  // FAQ data
  const faqs = [
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes basic LinkedIn profile analysis with core recommendations. You can submit one profile per month."
    },
    {
      question: "How is the Pro plan different from the Basic plan?",
      answer: "The Pro plan offers more detailed analysis, priority response time, and allows multiple profile submissions each month."
    },
    {
      question: "Can I upgrade or downgrade my plan later?",
      answer: "Yes, you can change your subscription at any time. Changes will be applied at the start of your next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans if you're not satisfied with our service."
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard encryption for all payment processing. We never store your complete credit card information on our servers."
    }
  ];

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h1>Choose the Right Plan for Your LinkedIn Success</h1>
        <p>Get professional insights to boost your LinkedIn profile and career opportunities</p>
        
        <div className="billing-toggle">
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
        </div>
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
              <li>Connections Analysis</li>
              <li>Verification Shield Detection</li>
              <li>Account Type Assessment</li>
              <li>Summary/About Section Check</li>
              <li>Open to Connect/Recruit Status</li>
            </ul>
          </div>
          <div className="plan-cta">
            <Link to="/signup" className="cta-button free">Get Started</Link>
          </div>
        </div>
        
        {/* Basic Plan */}
        <div className="pricing-plan popular">
          <div className="popular-badge">Most Popular</div>
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
              <li>Last Updated Timestamp Analysis</li>
              <li>Custom URL Audit</li>
              <li>Profile Picture Assessment</li>
              <li>Recent Activity Analysis</li>
              <li>Headline Update Check</li>
              <li>Job History Review</li>
              <li>Connections Quantity Analysis</li>
              <li>Engagement Level Assessment</li>
            </ul>
          </div>
          <div className="plan-cta">
            <Link to="/signup" className="cta-button basic">Choose Basic</Link>
          </div>
        </div>
        
        {/* Pro Plan */}
        <div className="pricing-plan">
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
              <li>Account Age Evaluation</li>
              <li>Profile Picture Age Analysis</li>
              <li>Job Info Relevance Check</li>
              <li>Education/Skills Completeness</li>
              <li>Overall Profile Completeness Score</li>
              <li>Recommendations Assessment</li>
              <li>Profile Personalization Analysis</li>
              <li>Skills Endorsements Count</li>
              <li>Content Engagement Analysis</li>
              <li>Interaction Pattern Assessment</li>
              <li>Historical Post Activity Review</li>
              <li>Post Recency Evaluation</li>
              <li>Shared Interests Detection</li>
              <li>Industry Relevance Analysis</li>
              <li>Job Titles Activity Check</li>
              <li>Account Creation Date Analysis</li>
            </ul>
          </div>
          <div className="plan-cta">
            <Link to="/signup" className="cta-button pro">Choose Premium</Link>
          </div>
        </div>
      </div>
      
      <div className="pricing-features">
        <h2>Compare Plan Features</h2>
        <div className="features-table-container">
          <table className="features-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Basic</th>
                <th>Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Profile Analysis</td>
                <td>✅</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Profile Picture Assessment</td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Content Engagement Metrics</td>
                <td>❌</td>
                <td>✅</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Profile Completeness Score</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Industry Relevance Analysis</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Personalization Assessment</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Recommendations Review</td>
                <td>❌</td>
                <td>❌</td>
                <td>✅</td>
              </tr>
              <tr>
                <td>Historical Activity Analysis</td>
                <td>❌</td>
                <td>Basic</td>
                <td>Comprehensive</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <button 
                className={`faq-question ${showFaq === index ? 'active' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <span className="faq-icon">{showFaq === index ? '−' : '+'}</span>
              </button>
              {showFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="pricing-cta-section">
        <h2>Ready to Transform Your LinkedIn Profile?</h2>
        <p>Join thousands of professionals who have improved their online presence</p>
        <Link to="/signup" className="main-cta-button">Get Started Today</Link>
      </div>
    </div>
  );
};

export default Pricing;
