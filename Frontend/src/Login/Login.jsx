import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../Utils/validate";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { authService } from '../api/authService';
import OAuthDebugger from '../components/OAuthDebugger';
import { GOOGLE_OAUTH_CONFIG } from '../config/oauthConfig';

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

    // Improved authentication checking that requires credentials
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
            authService.logout(); // Clear any remaining token
        }
        
        // CRITICAL FIX: Only check token validity if we didn't come from a protected route
        if (!redirectReason) {
            // Check token validity but don't auto-redirect if on login page
            authService.checkTokenValidity().then(isValid => {
                // Only redirect if valid AND user didn't explicitly navigate to login
                if (isValid && !window.location.href.includes('login')) {
                    navigate('/inputMain');
                }
            }).catch(() => {
                // Clear any invalid tokens silently
                authService.logout();
            });
        }
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();

        // Require both email and password
        if (!email.trim() || !password.trim()) {
            setError("Email and password are required");
            return;
        }

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

        // Debounce login attempts
        loginAttemptRef.current = setTimeout(async () => {
            try {
                // Use authService with timeout handling
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

    const handleGoogleLogin = () => {
      // Use the redirect URI from our config
      const redirectUri = encodeURIComponent(GOOGLE_OAUTH_CONFIG.REDIRECT_URI);
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const scope = encodeURIComponent('email profile');
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      
      // Log for debugging
      console.log('Redirecting to Google with URI:', decodeURIComponent(redirectUri));
      
      // Redirect to Google sign-in page
      window.location.href = googleAuthUrl;
    };

    return (
      <div>
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
                        {error && <p className="error-message">{error}</p>}

                        
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

        {/* Add debugger in development only */}
        {import.meta.env.DEV && <OAuthDebugger />}
      </div>
    )
}
export default Login;