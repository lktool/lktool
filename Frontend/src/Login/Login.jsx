import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../Utils/validate";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { authService } from '../api/authService';
import CorsAlert from '../components/CorsAlert';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState({ sent: false, loading: false });
    const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);
    const [corsError, setCorsError] = useState(false);
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
            } catch (err) {
                console.error("Login error:", err);
                
                // Check specifically for unverified email errors
                if (err.response?.data?.detail?.includes('not verified') || 
                    err.response?.data?.detail?.includes('verification') ||
                    err.message?.includes('not verified')) {ror'
                    setIsUnverifiedEmail(true);
                    setError("Your email address has not been verified. Please verify your email or request a new verification link below.");to CORS policy restrictions. Please try again later or contact support.");
                } else if (err.message === 'Request timeout') {
                    setError("Login request timed out. Please try again.");ludes('not verified')) {
                } else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);een verified. Please verify your email or request a new verification link below.");
                } else if (err.response?.status === 401) {
                    setError("Invalid email or password");(err.message === 'Request timeout') {
                } else if (err.message && (
                    err.message.includes('CORS') ||  else if (err.response?.data?.detail) {
                    err.isCorsError ||Error(err.response.data.detail);
                    err.message === 'Network Error'ponse?.status === 401) {
                )) {password");
                    setError("Cannot connect to the server due to CORS policy restrictions.");   } else {
                    setCorsError(true);dentials or try again later.");
                } else {           }
                    setError("Login failed. Please check your credentials.");            } finally {
                }
            } finally {;
                setLoading(false);
                loginAttemptRef.current = null; Small timeout to prevent multiple submissions
            }
        }, 100); // Small timeout to prevent multiple submissions
    }
if (!email || !validateEmail(email)) {
    async function handleResendVerification() {etError("Please enter a valid email address to resend verification.");
        if (!email || !validateEmail(email)) {
            setError("Please enter a valid email address to resend verification.");
            return;
        }({ sent: false, loading: true });
        
        setResendStatus({ sent: false, loading: true });
        
        try {   setResendStatus({ sent: true, loading: false });
            await authService.resendVerification(email);       setError(""); // Clear any previous errors
            setResendStatus({ sent: true, loading: false });        } catch (err) {
            setError(""); // Clear any previous errors to resend verification:", err);
        } catch (err) {alse, loading: false });
            console.error("Failed to resend verification:", err);gain.");
            setResendStatus({ sent: false, loading: false });
            setError("Failed to resend verification email. Please try again.");
        }
    }function handleEmail(event) {
;
    function handleEmail(event) {esend status when email changes
        setEmail(event.target.value);   setIsUnverifiedEmail(false);
        // Reset unverified status and resend status when email changes    setResendStatus({ sent: false, loading: false });
        setIsUnverifiedEmail(false);
        setResendStatus({ sent: false, loading: false });
    }unction handlePassword(event) {
            setPassword(event.target.value);
    function handlePassword(event) {
        setPassword(event.target.value);
    }
    
    function toggleVisibility() {
        setVisible((prev) => !prev);
    }

    return (<>
        <div className="container2">
            {/* Show CORS alert if detected */}/h2>
            {corsError && <CorsAlert origin={window.location.origin} />}bmit={handleSubmit}>
            
            <div className="inside2">
                <div className="inside2.1">
                    <h2 className="login">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-email">
                            <input type="email" sName="input-password">
                                placeholder="Email"
                                onChange={handleEmail}
                                value={email} />nChange={handlePassword}
                        </div>    value={password} 
                        <div className="input-password">  />
                            <input type={visible ? "text" : "password"}
                                placeholder="Password"                                    visible? <AiOutlineEye className="eye-icon" onClick={toggleVisibility}/> :
                                onChange={handlePassword}            <AiOutlineEyeInvisible className="eye-icon" onClick={toggleVisibility}/>
                                value={password} 
                                />
                                {
                                    visible? <AiOutlineEye className="eye-icon" onClick={toggleVisibility}/> :message">{error}</p>}
                                    <AiOutlineEyeInvisible className="eye-icon" onClick={toggleVisibility}/>
                                }
                            rification option when appropriate */}
                        </div>Email && (
                        {error && <p className="error-message">{error}</p>}verification-actions">
(
                        
                        {/* Show resend verification option when appropriate */}Please check your inbox.
                        {isUnverifiedEmail && (
                            <div className="verification-actions">
                                {resendStatus.sent ? (
                                    <div className="success-message">"button"
                                        Verification email has been sent! Please check your inbox.      className="resend-verification-btn"
                                    </div>      onClick={handleResendVerification}
                                ) : (              disabled={resendStatus.loading}
                                    <button             >
                                        type="button"" : "Resend Verification Email"}
                                        className="resend-verification-btn"
                                        onClick={handleResendVerification}
                                        disabled={resendStatus.loading}
                                    >
                                        {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
                                    </button><Link to="/forgot-password">Forgot Password?</Link>
                                )}
                            </div>me="login-btn" type="submit" disabled={loading}>
                        )}  {loading ? 'Logging in...' : 'Login'}
                            </button>
                        <Link to="/forgot-password">Forgot Password?</Link>
                        <div className="control">
                            <button className="login-btn" type="submit" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'} <span>OR</span>
                            </button>  </div>
                        </div>      
                                  <GoogleLoginButton onSuccess={() => navigate("/inputMain")} actionType="login" />
                        <div className="or-divider">                
                            <span>OR</span>                       <p>Don't have an account? <span><Link to="/signup">Signup</Link></span></p>
                        </div>/form>











export default Login;}    </>)        </div>            </div>                </div>                    </form>                        <p>Don't have an account? <span><Link to="/signup">Signup</Link></span></p>                                                <GoogleLoginButton onSuccess={() => navigate("/inputMain")} actionType="login" />                                        </div>
            </div>
        </div>
    </>)
}
export default Login;