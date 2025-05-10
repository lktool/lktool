import { useState } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';
import './InputMain.css'; // Ensure CSS is correctly imported
import LoadingSpinner from '../components/LoadingSpinner';

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
            const response = await unifiedAuthService.submitLinkedInProfile({
                linkedin_url: formData.linkedin_url,
                message: formData.message,
            });
            
            console.log('Submission response:', response.data);
            
            // Reset form on success
            setFormData({
                linkedin_url: '',
                message: ''
            });
            
            setSuccess(true);
            
            // Reset success message after 5 seconds
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
            
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="input-main-container">
            <h1>Submit Your LinkedIn Profile</h1>
            
            {success && (
                <div className="success-message">
                    Your LinkedIn profile has been submitted successfully!
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="submission-form">
                <div className="form-group">
                    <label htmlFor="linkedin_url">LinkedIn Profile URL</label>
                    <input
                        type="text"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        placeholder="https://www.linkedin.com/in/yourprofile"
                        disabled={loading}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="message">Additional Information (Optional)</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Any specific details you'd like us to know"
                        rows="5"
                        disabled={loading}
                    ></textarea>
                </div>
                
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? (
                        <LoadingSpinner size="small" text="" textVisible={false} />
                    ) : (
                        'Submit Profile'
                    )}
                </button>
            </form>
        </div>
    );
}

export default InputMain;