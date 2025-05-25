import { useState } from 'react';
import { submissionService } from '../api';
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
            
            console.log('Submission response:', response);
            
            setFormData({
                linkedin_url: '',
                message: ''
            });
            
            setSuccess(true);
            
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
            
        } catch (err) {
            console.error('Error submitting profile:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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
                        
                        <p className="lead">
                            Get expert insights and recommendations to make your LinkedIn profile stand out.
                        </p>
                        
                        <div className="feature-item">
                            <h3>Comprehensive Analysis</h3>
                            <p>Our tool examines over 20 key metrics on your profile to identify strengths and improvement areas.</p>
                        </div>
                        
                        <div className="feature-item">
                            <h3>Personalized Recommendations</h3>
                            <p>Receive tailored suggestions to optimize your visibility to recruiters and potential connections.</p>
                        </div>
                        
                        <div className="feature-item">
                            <h3>Professional Insights</h3>
                            <p>Learn how your profile compares to industry standards and get actionable improvement steps.</p>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InputMain;