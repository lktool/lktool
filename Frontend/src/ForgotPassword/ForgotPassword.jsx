import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../api'; // Updated to use new API structure
import './ForgotPassword.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            // Use new authService instead of unifiedAuthService
            await authService.requestPasswordReset(email);
            setSuccess(true);
        } catch (err) {
            console.error('Password reset request failed:', err);
            setError('Failed to send password reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
