import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../Utils/validate";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { authService } from '../api/authService';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState({ sent: false, loading: false });
    const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);
    const loginAttemptRef = useRef(null); // For debouncing login attempts
    const navigate = useNavigate();

    // Client-side validation function to avoid unnecessary API calls
    const validateForm = () => {
        if (!email.trim()) {
            setError("Email is required");
            return false;
        }
        
        if (!validateEmail(email)) {
            setError("Please provide valid Email address");
            return false;
        }

        if (!password) {
            setError("Password is required");
            return false;
        }
        
        return true;
    };

    // Check for token expiration or session issues
    useEffect(() => {
        // Check if we already have a valid token
        const token = localStorage.getItem('token');
        if (token) {
            // Verify token validity without full profile fetch (lightweight check)
            authService.checkTokenValidity()
                .then(isValid => {
                    if (isValid) {
                        navigate("/inputMain");
                    }
                })
                .catch(() => {
                    // Token invalid, but we don't need to show an error
                    localStorage.removeItem('token');
                });
        }
        
        // Clear any expired tokens message
        const expiredToken = localStorage.getItem('expired_token');
        if (expiredToken === 'true') {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('expired_token');
        }
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();

        // Prevent multiple rapid login attempts
        if (loginAttemptRef.current) {
            clearTimeout(loginAttemptRef.current);
        }

        // Client-side validation
        if (!validateForm()) {
            return;
        }

        setError("");
        setLoading(true);
        setIsUnverifiedEmail(false); // Reset unverified email status

        // Debounce login attempts
        loginAttemptRef.current = setTimeout(async () => {
            try {
                // Use authService with timeout handling
                await authService.login(email, password);
                navigate("/inputMain");
            }
            catch (err) {
                console.error("Login error:", err);
                
                // Check specifically for unverified email errors
                if (err.response?.data?.detail?.includes('not verified') || 
                    err.response?.data?.detail?.includes('verification') ||
                    err.message?.includes('not verified')) {
                    setIsUnverifiedEmail(true);
                    setError("Your email address has not been verified. Please verify your email or request a new verification link below.");
                } else if (err.message === 'Request timeout') {
                    setError("Login request timed out. Please try again.");
                } else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                } else if (err.response?.status === 401) {
                    setError("Invalid email or password");
                } else {
                    setError("Login failed. Please check your credentials.");
                }
            } finally {
                setLoading(false);
                loginAttemptRef.current = null;
            }
        }, 100); // Small timeout to prevent multiple submissions
    }

    async function handleResendVerification() {
        if (!email || !validateEmail(email)) {
            setError("Please enter a valid email address to resend verification.");
            return;
        }
        
        setResendStatus({ sent: false, loading: true });
        
        try {
            await authService.resendVerification(email);
            setResendStatus({ sent: true, loading: false });
            setError(""); // Clear any previous errors
        } catch (err) {
            console.error("Failed to resend verification:", err);
            setResendStatus({ sent: false, loading: false });
            setError("Failed to resend verification email. Please try again.");
        }
    }

    function handleEmail(event) {
        setEmail(event.target.value);
        // Reset unverified status and resend status when email changes
        setIsUnverifiedEmail(false);
        setResendStatus({ sent: false, loading: false });
    }
    
    function handlePassword(event) {
        setPassword(event.target.value);
    }
    
    function toggleVisibility() {
        setVisible((prev) => !prev);
    }

    return (<>
        <div className="container2">
            <div className="inside2">
                <div className="inside2.1">
                    <h2 className="login">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-email">
                            <input type="email" 
                                placeholder="Email"
                                onChange={handleEmail}
                                value={email} />
                        </div>
                        <div className="input-password">
                            <input type={visible ? "text" : "password"}
                                placeholder="Password"
                                onChange={handlePassword}
                                value={password} 
                                />
                                {
                                    visible? <AiOutlineEye className="eye-icon" onClick={toggleVisibility}/> :
                                    <AiOutlineEyeInvisible className="eye-icon" onClick={toggleVisibility}/>
                                }
                            
                        </div>
                        <p className="error-message">{error}</p>
                        
                        {/* Show resend verification option when appropriate */}
                        {isUnverifiedEmail && (
                            <div className="verification-actions">
                                {resendStatus.sent ? (
                                    <div className="success-message">
                                        Verification email has been sent! Please check your inbox.
                                    </div>
                                ) : (
                                    <button 
                                        type="button"
                                        className="resend-verification-btn"
                                        onClick={handleResendVerification}
                                        disabled={resendStatus.loading}
                                    >
                                        {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
                                    </button>
                                )}
                            </div>
                        )}
                        
                        <Link to="/forgot-password">Forgot Password?</Link>
                        <div className="control">
                            <button className="login-btn" type="submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                        
                        <div className="or-divider">
                            <span>OR</span>
                        </div>
                        
                        <GoogleLoginButton onSuccess={() => navigate("/inputMain")} actionType="login" />
                        
                        <p>Don't have an account? <span><Link to="/signup">Signup</Link></span></p>
                    </form>
                </div>
            </div>
        </div>
    </>)
}
export default Login;