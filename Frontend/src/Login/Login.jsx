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
    const [corsError, setCorsError] = useState(false);
    const loginAttemptRef = useRef(null);
    const navigate = useNavigate();
    
    // Collect all errors in a single array instead of field-specific objects
    const [formErrors, setFormErrors] = useState([]);

    // Clean up requests when component unmounts
    useEffect(() => {
        return () => {
            if (loginAttemptRef.current) {
                clearTimeout(loginAttemptRef.current);
            }
            authService.cancelActiveRequests();
        };
    }, []);

    // Modified validation to collect all errors in one array
    const validateForm = () => {
        const errors = [];
        
        // Email validation
        if (!email.trim()) {
            errors.push("Email is required");
        } else if (!validateEmail(email)) {
            errors.push("Please provide valid Email address");
        }

        // Password validation
        if (!password) {
            errors.push("Password is required");
        }
        
        // Set all errors at once
        setFormErrors(errors);
        return errors.length === 0;
    };

    // Improved authentication checking
    useEffect(() => {
        // First check for redirect reasons
        const redirectReason = localStorage.getItem('auth_redirect_reason');
        if (redirectReason) {
            if (redirectReason === 'login_required') {
                setError('Authentication required. Please log in to continue.');
            }
            localStorage.removeItem('auth_redirect_reason');
        }
        
        // Clear expired tokens
        const expiredToken = localStorage.getItem('expired_token');
        if (expiredToken === 'true') {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('expired_token');
            authService.logout();
        }
        
        // Only check token validity if we didn't come from a protected route
        if (!redirectReason) {
            authService.checkTokenValidity().then(isValid => {
                if (isValid && !window.location.href.includes('login')) {
                    navigate('/inputMain');
                }
            }).catch(() => {
                authService.logout();
            });
        }
    }, [navigate]);

    // Simple change handler without immediate validation
    function handleEmailChange(event) {
        setEmail(event.target.value);
        
        // Reset errors and statuses
        setIsUnverifiedEmail(false);
        setResendStatus({ sent: false, loading: false });
        setError("");
        setFormErrors([]); // Clear all form errors
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
        setError("");
        setFormErrors([]); // Clear all form errors
    }

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
        setIsUnverifiedEmail(false); 
        setCorsError(false);

        // Use a shorter debounce time for faster response
        loginAttemptRef.current = setTimeout(async () => {
            try {
                const response = await authService.login(email, password);
                
                // Only navigate if we have a valid token
                if (response && (response.access || response.token)) {
                    navigate("/inputMain");
                } else {
                    setError("Authentication failed. Please try again.");
                }
            }
            catch (err) {
                console.error("Login error:", err);
                
                // Handle canceled requests specifically
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || 
                    (err.message && err.message.includes('cancel'))) {
                    setError("Login request was canceled. Please try again.");
                }
                // Check for CORS or network errors
                else if (err.message && (err.message.includes('CORS') || 
                                    err.message.includes('Network Error'))) {
                    setError("Cannot connect to the server. This may be a CORS or network issue.");
                    setCorsError(true);
                }
                // Check specifically for unverified email errors
                else if (err.response?.data?.detail?.includes('not verified') || 
                         err.response?.data?.detail?.includes('verification') ||
                         err.message?.includes('not verified')) {
                    setIsUnverifiedEmail(true);
                    setError("Your email address has not been verified. Please verify your email or request a new verification link below.");
                } 
                // Handle specific email errors from the server
                else if (err.response?.data?.email) {
                    setError(`Email error: ${err.response.data.email[0]}`);
                }
                else if (err.message === 'Request timeout') {
                    setError("Login request timed out. Please try again.");
                } 
                else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                } 
                else if (err.response?.status === 401) {
                    setError("Invalid email or password");
                } 
                else {
                    setError(err.message || "Login failed. Please check your credentials.");
                }
            } finally {
                setLoading(false);
                loginAttemptRef.current = null;
            }
        }, 50);
    }

    // Async function for resending verification emails
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
                            <input 
                                type="email" 
                                placeholder="Email"
                                onChange={handleEmailChange}
                                value={email}
                            />
                        </div>
                        <div className="input-password">
                            <input 
                                type={visible ? "text" : "password"}
                                placeholder="Password"
                                onChange={handlePasswordChange}
                                value={password}
                            />
                            {
                                visible ? <AiOutlineEye className="eye-icon" onClick={toggleVisibility}/> :
                                <AiOutlineEyeInvisible className="eye-icon" onClick={toggleVisibility}/>
                            }
                        </div>
                        
                        <Link to="/forgot-password">Forgot Password?</Link>
                        
                        {/* Modified: Display only one error message at a time */}
                        {(formErrors.length > 0 || error) && (
                            
                                <p className="error-message">
                                    {formErrors.length > 0 ? formErrors[0] : error}
                           </p>
                        )}

                        {/* Show CORS error info if detected */}
                        {corsError && (
                            <div className="cors-error">
                                <p>CORS error detected. The server might be unavailable or not configured to accept requests from this domain.</p>
                            </div>
                        )}
                        
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
    </>);
}

export default Login;