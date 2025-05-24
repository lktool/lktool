import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing = () => {
  const [expandedPlans, setExpandedPlans] = useState({
    free: false,
    basic: false,
    premium: false
  });
  const [showFaq, setShowFaq] = useState(null);

  // Toggle expanded state for a specific plan
  const togglePlanDetails = (plan) => {
    setExpandedPlans({
      ...expandedPlans,
      [plan]: !expandedPlans[plan]
    });
  };

  // Toggle FAQ visibility
  const toggleFaq = (index) => {
    setShowFaq(showFaq === index ? null : index);
  };

  // Define feature lists for each plan
  const freePlanFeatures = [
    'Connections count',
    'Verification Shield Present',
    'Account Type analysis',
    'Has Summary or About Section',
    'Open to Connect or Recruit'
  ];

  const basicPlanFeatures = [
    'Last Updated date analysis',
    'Has Custom Short URL',
    'Has Professional Profile Picture',
    'Recent Posts or Interactions (within 6 months)',
    'Recently Updated Headline or Info',
    'Sparse or Recently Added Job History',
    'Default/Stock Profile Picture',
    'Very Low (100) Connections',
    'No Meaningful Engagement on Content'
  ];

  const premiumPlanFeatures = [
    'Account Age (years) analysis',
    'Profile Picture Looks Outdated',
    'Has Outdated Job Info or Defunct Companies',
    'Missing or Incomplete Education/Skills Info',
    'Overall Profile is Well-Filled',
    'Has Given/Received Recommendations',
    'Personalized Profile (unique summary or achievements)',
    'Skills Endorsements Count analysis',
    'Others Engage with Their Content',
    'Regularly Likes/Comments/Shares',
    'Has Posts Older Than 1 Year',
    'Last Post Date analysis',
    'Shared Interests or Mutual Connections',
    'In a Relevant Industry',
    'Has Active, Relevant Job Titles',
    'Newly Created Account detection'
  ];

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
      <div className="coming-soon-banner">
        <span>Coming Soon</span>
      </div>
      
      <h1 className="pricing-title">LinkedIn Profile Analysis Packages</h1>
      
      <div className="pricing-plans-simple">
        {/* Free Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>FREE</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              {freePlanFeatures.slice(0, expandedPlans.free ? freePlanFeatures.length : 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {freePlanFeatures.length > 3 && (
              <button 
                onClick={() => togglePlanDetails('free')} 
                className="read-more-button"
              >
                {expandedPlans.free ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
        
        {/* Basic Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>BASIC</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              {basicPlanFeatures.slice(0, expandedPlans.basic ? basicPlanFeatures.length : 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {basicPlanFeatures.length > 3 && (
              <button 
                onClick={() => togglePlanDetails('basic')} 
                className="read-more-button"
              >
                {expandedPlans.basic ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
        
        {/* Premium Plan */}
        <div className="pricing-plan">
          <div className="plan-header">
            <h2>PREMIUM</h2>
          </div>
          <div className="plan-features">
            <ul className="feature-list">
              {premiumPlanFeatures.slice(0, expandedPlans.premium ? premiumPlanFeatures.length : 3).map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            {premiumPlanFeatures.length > 3 && (
              <button 
                onClick={() => togglePlanDetails('premium')} 
                className="read-more-button"
              >
                {expandedPlans.premium ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
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
{/*       
      <div className="pricing-cta-section">
        <h2>Ready to Transform Your LinkedIn Profile?</h2>
        <p>Join thousands of professionals who have improved their online presence</p>
        <Link to="/signup" className="main-cta-button">Get Started Today</Link>
      </div> */}
    </div>
  );
};

export default Pricing;
