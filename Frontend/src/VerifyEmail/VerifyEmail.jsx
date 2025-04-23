import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api/authService';
import './VerifyEmail.css';

function VerifyEmail() {
    const { token } = useParams();
    const [status, setStatus] = useState('verifying'); 
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            // More robust token extraction
            let verificationToken = token;
            
            // If there are issues with HashRouter parameter extraction
            if (!verificationToken || verificationToken === 'undefined') {
                // Extract token from hash part for HashRouter
                const hash = window.location.hash;
                const match = hash.match(/\/verify-email\/(.+)$/);
                if (match && match[1]) {
                    verificationToken = match[1];
                }
            }
            
            if (!verificationToken) {
                setStatus('error');
                setMessage('No verification token provided.');
                return;
            }
            
            console.log("Attempting to verify email with token");

            try {
                const response = await authService.verifyEmail(verificationToken);
                
                setStatus('success');
                setMessage(response.message || 'Email successfully verified. You can now log in.');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                
            } catch (err) {
                console.error("Verification error:", err);
                setStatus('error');
                setMessage(err.response?.data?.error || 'Failed to verify email. The link may be invalid or expired.');
            }
        };

        verifyEmail();
    }, [token, navigate, location]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <h1>Email Verification</h1>
                
                {status === 'verifying' && (
                    <div className="verifying">
                        <p>Verifying your email...</p>
                        <div className="loading-spinner"></div>
                    </div>
                )}
                
                {status === 'success' && (
                    <div className="success-message">
                        <p>{message}</p>
                        <p>Redirecting to login page...</p>
                        <Link to="/login" className="login-link">Go to Login</Link>
                    </div>
                )}
                
                {status === 'error' && (
                    <div className="error-message">
                        <p>{message}</p>
                        <Link to="/login" className="login-link">Go to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
