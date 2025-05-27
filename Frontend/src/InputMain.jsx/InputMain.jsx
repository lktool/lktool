import { useState, useEffect } from 'react';
import { submissionService } from '../api';
import { useSubscription } from '../context/SubscriptionContext';
import { Link } from 'react-router-dom';
import './InputMain.css';
import { FormInput, FormTextarea, SubmitButton, FormMessage } from '../components/FormElements';
import { authService } from '../api/authService'; // Import authService to check admin status

function InputMain() {
    const [formData, setFormData] = useState({
        linkedin_url: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submissionCount, setSubmissionCount] = useState(0);
    const [limitReached, setLimitReached] = useState(false);
    
    // Get subscription information from context
    const { tier, loading: subscriptionLoading, refreshSubscription } = useSubscription();

    useEffect(() => {
        // Fetch the user's submission count for the current month
        const fetchSubmissionCount = async () => {
            try {
                const submissions = await submissionService.getUserSubmissions();
                
                // Count submissions for the current month
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                
                const monthlyCount = submissions.filter(sub => 
                    new Date(sub.created_at) >= startOfMonth
                ).length;
                
                setSubmissionCount(monthlyCount);
                
                // FIXED: Premium users should never reach limit
                // Also normalize tier comparison to be case-insensitive
                if ((tier?.toLowerCase() === 'free' && monthlyCount >= 1) || 
                    (tier?.toLowerCase() === 'basic' && monthlyCount >= 24)) {
                    setLimitReached(true);
                } else {
                    // Explicitly set to false to handle tier changes
                    setLimitReached(false);
                }
            } catch (err) {
                console.error('Error fetching submission count:', err);
            }
        };
        
        fetchSubmissionCount();
        // Add tier to dependencies so it rechecks when tier changes
    }, [tier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error when user edits
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.linkedin_url) {
            setError('LinkedIn URL is required');
            return;
        }
        
        if (!formData.linkedin_url.includes('linkedin.com')) {
            setError('Please enter a valid LinkedIn URL');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const response = await submissionService.submitProfile({
                linkedin_url: formData.linkedin_url,
                message: formData.message,
            });
            
            if (response.success) {
                setFormData({
                    linkedin_url: '',
                    message: ''
                });
                
                setSuccess(true);
                
                // Update the submission count
                setSubmissionCount(prev => prev + 1);
                
                // Check if we've hit the limit after this submission
                if ((tier === 'free' && submissionCount + 1 >= 1) || 
                    (tier === 'basic' && submissionCount + 1 >= 24)) {
                    setLimitReached(true);
                }
                
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
            } else {   // Check if limit was reached
            }ponse.limit_reached) {
        } catch (err) {
            console.error('Error submitting profile:', err);    }
             to submit profile');
            // Check for subscription limit errors
            if (err.response?.data?.limit_reached) {
                setLimitReached(true);
                setError(err.response.data.error || 'Subscription limit reached');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');f (err.response?.data?.limit_reached) {
            }LimitReached(true);
        } finally {esponse.data.error || 'Subscription limit reached');
            setLoading(false);   } else {
        }          setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    };        }
    
    // Get limit text based on subscription tier
    const getLimitText = () => {
        switch(tier) {
            case 'premium':
                return 'Unlimited submissions available';ed on subscription tier
            case 'basic':
                return `${24 - submissionCount} of 24 monthly submissions remaining`;
            case 'free':emium':
            default:
                return submissionCount >= 1 ? 'Submission limit reached' : '1 submission available';   case 'basic':
        }          return `${24 - submissionCount} of 24 monthly submissions remaining`;
    };            case 'free':

    // Add a function to manually refresh subscription'Submission limit reached' : '1 submission available';
    const handleRefreshSubscription = (e) => {
        e.preventDefault();
        refreshSubscription();
    };// Add a function to manually refresh subscription
    ndleRefreshSubscription = (e) => {
    return (
        <div className="input-main-container">
            <div className="two-column-layout">
                {/* Left Column - Content */}
                <div className="content-column">
                    <h1>LinkedIn Profile Analysis</h1>me="input-main-container">
                    
                    <div className="service-description">
                        <h2>Optimize Your Professional Presence</h2>ssName="content-column">
                        
                        {/* Purpose Point 1: In-depth LinkedIn Profile Analysis */}
                        <div className="feature-item">
                            <h3>Comprehensive Profile Analysis</h3>
                            <p>Our tool conducts thorough evaluations of LinkedIn profiles by examining over 20 key metrics including connections, profile completeness, activity patterns, and engagement quality to identify strengths and improvement areas.</p>
                        </div>{/* Purpose Point 1: In-depth LinkedIn Profile Analysis */}
                        
                        {/* Purpose Point 2: Personalized Recommendations */}Analysis</h3>
                        <div className="feature-item">inkedIn profiles by examining over 20 key metrics including connections, profile completeness, activity patterns, and engagement quality to identify strengths and improvement areas.</p>
                            <h3>Tailored Optimization Recommendations</h3>
                            <p>We provide customized, actionable suggestions to enhance your professional presence and improve visibility to potential employers and connections based on industry best practices.</p>
                        </div>{/* Purpose Point 2: Personalized Recommendations */}
                        
                        {/* Purpose Point 3: Career Advancement */}Recommendations</h3>
                        <div className="feature-item">e suggestions to enhance your professional presence and improve visibility to potential employers and connections based on industry best practices.</p>
                            <h3>Career Growth Acceleration</h3>
                            <p>By optimizing your LinkedIn profile through our expert insights, you'll increase your professional opportunities, strengthen your network, and position yourself more competitively in your industry.</p>
                        </div>{/* Purpose Point 3: Career Advancement */}
                        
                        <div className="how-it-works">eleration</h3>
                            <h3>How It Works</h3>y optimizing your LinkedIn profile through our expert insights, you'll increase your professional opportunities, strengthen your network, and position yourself more competitively in your industry.</p>
                            <ol>
                                <li>Submit your LinkedIn profile URL using our secure form</li>
                                <li>Our algorithm analyzes your profile content and engagement metrics</li>
                                <li>Receive a detailed report with actionable recommendations</li>ow It Works</h3>
                            </ol>l>
                        </div>      <li>Submit your LinkedIn profile URL using our secure form</li>
                    </div>          <li>Our algorithm analyzes your profile content and engagement metrics</li>
                </div>                <li>Receive a detailed report with actionable recommendations</li>
                
                {/* Right Column - Form */}
                <div className="form-column">
                    <div className="form-container">
                        <h2>Submit Your LinkedIn Profile</h2>
                        
                        {/* Display subscription tier and limits */}
                        <div className="subscription-info">
                            <p className={`tier-badge ${tier}`}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                            </p>mits */}
                            <p className="submission-limit">tion-info">
                                {getLimitText()}lassName={`tier-badge ${tier}`}>
                            </p>r.charAt(0).toUpperCase() + tier.slice(1)} Tier
                            <button 
                                onClick={handleRefreshSubscription}
                                className="refresh-subscription-btn"
                                title="Refresh subscription info"/p>
                            >on 
                                ↻ck={handleRefreshSubscription}
                            </button>  className="refresh-subscription-btn"
                        </div>        title="Refresh subscription info"
                        
                        {success && (
                            <FormMessage type="success">
                                Your LinkedIn profile has been submitted successfully!
                            </FormMessage>
                        )}{success && (
                        ssage type="success">
                        {error && (has been submitted successfully!
                            <FormMessage type="error">ge>
                                {error}
                            </FormMessage>
                        )}{error && (
                        type="error">
                        {limitReached ? (
                            <div className="limit-reached">
                                <p>You've reached your submission limit for this subscription tier.</p>
                                <Link to="/pricing" className="upgrade-button">
                                    Upgrade Your Plan (
                                </Link>lassName="limit-reached">
                            </div>   <p>You've reached your submission limit for this subscription tier.</p>
                        ) : (
                            <form onSubmit={handleSubmit} className="submission-form compact-form">e Your Plan
                                <FormInput
                                    id="linkedin_url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url}lassName="submission-form compact-form">
                                    onChange={handleChange}
                                    placeholder="https://www.linkedin.com/in/yourprofile"
                                    label="LinkedIn Profile URL""
                                    disabled={loading}.linkedin_url}
                                    required={true}
                                    className="compact" /* Add compact class to reduce spacing */  placeholder="https://www.linkedin.com/in/yourprofile"
                                />    label="LinkedIn Profile URL"
                                {loading}
                                <FormTextareaue}
                                    id="message"pact" /* Add compact class to reduce spacing */
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Any specific details you'd like us to know"
                                    label="Additional Information (Optional)"
                                    rows={4} /* Reduced from 5 to 4 */ssage}
                                    disabled={loading}  onChange={handleChange}
                                />    placeholder="Any specific details you'd like us to know"
                                ditional Information (Optional)"
                                <SubmitButton from 5 to 4 */
                                    isLoading={loading}
                                    loadingText="Submitting..."
                                    disabled={loading}
                                >
                                    Submit Profileloading}
                                </SubmitButton> loadingText="Submitting..."
                            </form>          disabled={loading}
                        )}      >
                                      Submit Profile
                        {/* Add debug panel for admins only */}              </SubmitButton>
                        {authService.isAdmin() && (              </form>
                            <div className="admin-debug-panel">                  )}
                                <h4>Admin Subscription Debug</h4>                   </div>
                                <p>Current Tier: <strong>{tier || 'undefined'}</strong></p>                </div>
                                <p>Limit Reached: <strong>{limitReached ? 'Yes' : 'No'}</strong></p>





















export default InputMain;}    );        </div>            </div>                </div>                    </div>                        )}                            </div>                                </button>                                    Force Refresh & Reload                                >                                    className="debug-refresh-btn"                                    }}                                        setTimeout(() => window.location.reload(), 1000);                                        refreshSubscription();                                        console.log('Force refreshing subscription...');                                    onClick={() => {                                <button                                 <p>Monthly Submissions: <strong>{submissionCount}</strong></p>        </div>
    );
}

export default InputMain;