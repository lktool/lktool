import { useState } from 'react';
import { validateEmail } from '../Utils/validate';
import { Link } from 'react-router-dom';
import { authService } from '../api/authService';
import './ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!validateEmail(email)) {
            setError('Please provide a valid email address');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            // Use the authService instead of direct axios call
            await authService.requestPasswordReset(email);
            
            // If we reach here, the request was successful
            setSuccess(true);
        } catch (err) {
            console.error('Password reset request error:', err);
            
            // More specific error handling
            if (err.response?.status === 500) {
                setError('Server error. Please try again later or contact support.');
            } else if (err.response?.data?.email) {
                setError(`Email error: ${err.response.data.email[0]}`);
            } else {
                setError('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-inner">
                <h1>Reset Password</h1>

                {success ? (
                    <div className="success-message">
                        <p>Password reset instructions have been sent to your email.</p>
                        <p>Please check your inbox and follow the instructions.</p>
                        <Link to="/login" className="back-link">Back to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p>Enter your email address below and we'll send you instructions to reset your password.</p>
                        <div className="input-field">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={handleEmailChange}
                            />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button 
                            className="reset-button" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                        <p>
                            <Link to="/login" className="back-link">Back to Login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;
