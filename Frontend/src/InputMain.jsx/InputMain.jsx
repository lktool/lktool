import { useState, useEffect } from 'react';
import { submissionService } from '../api';
import { useSubscription } from '../context/SubscriptionContext';
import { Link } from 'react-router-dom';
import './InputMain.css';
import { FormInput, FormTextarea, SubmitButton, FormMessage } from '../components/FormElements';

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
    const { tier, loading: subscriptionLoading } = useSubscription();

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
                
                // Check if limit reached
                if ((tier === 'free' && monthlyCount >= 1) || 
                    (tier === 'basic' && monthlyCount >= 24)) {
                    setLimitReached(true);
                }
            } catch (err) {
                console.error('Error fetching submission count:', err);
            }
        };
        
        fetchSubmissionCount();
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
            } else {
                // Check if limit was reached
                if (response.limit_reached) {
                    setLimitReached(true);
                }
                setError(response.error || 'Failed to submit profile');
            }
        } catch (err) {
            console.error('Error submitting profile:', err);
            
            // Check for subscription limit errors
            if (err.response?.data?.limit_reached) {
                setLimitReached(true);
                setError(err.response.data.error || 'Subscription limit reached');
            } else {
                setError(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Get limit text based on subscription tier
    const getLimitText = () => {
        switch(tier) {
            case 'premium':
                return 'Unlimited submissions available';
            case 'basic':
                return `${24 - submissionCount} of 24 monthly submissions remaining`;
            case 'free':
            default:
                return submissionCount >= 1 ? 'Submission limit reached' : '1 submission available';
        }
    };

    return (
        <div className="input-main-container">
            <div className="two-column-layout">
                {/* Left Column - Content */}
                <div className="content-column">
                    <h1>LinkedIn Profile Analysis</h1>
                    
                    <div className="service-description">
                        <h2>Optimize Your Professional Presence</h2>
                        
                        {/* Purpose Point 1: In-depth LinkedIn Profile Analysis */}
                        <div className="feature-item">
                            <h3>Comprehensive Profile Analysis</h3>
                            <p>Our tool conducts thorough evaluations of LinkedIn profiles by examining over 20 key metrics including connections, profile completeness, activity patterns, and engagement quality to identify strengths and improvement areas.</p>
                        </div>
                        
                        {/* Purpose Point 2: Personalized Recommendations */}
                        <div className="feature-item">
                            <h3>Tailored Optimization Recommendations</h3>
                            <p>We provide customized, actionable suggestions to enhance your professional presence and improve visibility to potential employers and connections based on industry best practices.</p>
                        </div>
                        
                        {/* Purpose Point 3: Career Advancement */}
                        <div className="feature-item">
                            <h3>Career Growth Acceleration</h3>
                            <p>By optimizing your LinkedIn profile through our expert insights, you'll increase your professional opportunities, strengthen your network, and position yourself more competitively in your industry.</p>
                        </div>
                        
                        <div className="how-it-works">
                            <h3>How It Works</h3>
                            <ol>
                                <li>Submit your LinkedIn profile URL using our secure form</li>
                                <li>Our algorithm analyzes your profile content and engagement metrics</li>
                                <li>Receive a detailed report with actionable recommendations</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                {/* Right Column - Form */}
                <div className="form-column">
                    <div className="form-container">
                        <h2>Submit Your LinkedIn Profile</h2>
                        
                        {/* Display subscription tier and limits */}
                        <div className="subscription-info">
                            <p className={`tier-badge ${tier}`}>
                                {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                            </p>
                            <p className="submission-limit">
                                {getLimitText()}
                            </p>
                        </div>
                        
                        {success && (
                            <FormMessage type="success">
                                Your LinkedIn profile has been submitted successfully!
                            </FormMessage>
                        )}
                        
                        {error && (
                            <FormMessage type="error">
                                {error}
                            </FormMessage>
                        )}
                        
                        {limitReached ? (
                            <div className="limit-reached">
                                <p>You've reached your submission limit for this subscription tier.</p>
                                <Link to="/pricing" className="upgrade-button">
                                    Upgrade Your Plan
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="submission-form compact-form">
                                <FormInput
                                    id="linkedin_url"
                                    name="linkedin_url"
                                    value={formData.linkedin_url}
                                    onChange={handleChange}
                                    placeholder="https://www.linkedin.com/in/yourprofile"
                                    label="LinkedIn Profile URL"
                                    disabled={loading}
                                    required={true}
                                    className="compact" /* Add compact class to reduce spacing */
                                />
                                
                                <FormTextarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Any specific details you'd like us to know"
                                    label="Additional Information (Optional)"
                                    rows={4} /* Reduced from 5 to 4 */
                                    disabled={loading}
                                />
                                
                                <SubmitButton
                                    isLoading={loading}
                                    loadingText="Submitting..."
                                    disabled={loading}
                                >
                                    Submit Profile
                                </SubmitButton>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InputMain;