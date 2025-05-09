import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../Utils/validate";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { unifiedAuthService } from '../api/unifiedAuthService';

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
    
    const [formErrors, setFormErrors] = useState([]);

    useEffect(() => {
        return () => {
            if (loginAttemptRef.current) {
                clearTimeout(loginAttemptRef.current);
            }
        };
    }, []);

    const validateForm = () => {
        const errors = [];
        
        if (!email.trim()) {
            errors.push("Email is required");
        } else if (!validateEmail(email)) {
            errors.push("Please provide valid Email address");
        }

        if (!password) {
            errors.push("Password is required");
        }
        
        setFormErrors(errors);
        return errors.length === 0;
    };

    useEffect(() => {
        const redirectReason = localStorage.getItem('auth_redirect_reason');
        if (redirectReason) {
            if (redirectReason === 'login_required') {
                setError('Authentication required. Please log in to continue.');
            }
            localStorage.removeItem('auth_redirect_reason');
        }
        
        const expiredToken = localStorage.getItem('expired_token');
        if (expiredToken === 'true') {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('expired_token');
            unifiedAuthService.logout();
        }
        
        if (unifiedAuthService.isAuthenticated()) {
            navigate('/inputMain');
        }
    }, [navigate]);

    function handleEmailChange(event) {
        setEmail(event.target.value);
        setIsUnverifiedEmail(false);
        setResendStatus({ sent: false, loading: false });
        setError("");
        setFormErrors([]);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
        setError("");
        setFormErrors([]);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loginAttemptRef.current) {
            clearTimeout(loginAttemptRef.current);
        }

        if (!validateForm()) {
            return;
        }

        setError("");
        setLoading(true);
        setIsUnverifiedEmail(false); 
        setCorsError(false);

        loginAttemptRef.current = setTimeout(async () => {
            try {
                const response = await unifiedAuthService.login(email, password);
                
                if (response.success) {
                    navigate("/inputMain");
                } else {
                    setError(response.error || "Authentication failed");
                }
            }
            catch (err) {
                console.error("Login error:", err);
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || 
                    (err.message && err.message.includes('cancel'))) {
                    setError("Login request was canceled. Please try again.");
                } else if (err.message && (err.message.includes('CORS') || 
                                    err.message.includes('Network Error'))) {
                    setError("Cannot connect to the server. This may be a CORS or network issue.");
                    setCorsError(true);
                } else if (err.response?.data?.detail?.includes('not verified') || 
                         err.response?.data?.detail?.includes('verification') ||
                         err.message?.includes('not verified')) {
                    setIsUnverifiedEmail(true);
                    setError("Your email address has not been verified. Please verify your email or request a new verification link below.");
                } else if (err.response?.data?.email) {
                    setError(`Email error: ${err.response.data.email[0]}`);
                } else if (err.message === 'Request timeout') {
                    setError("Login request timed out. Please try again.");
                } else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                } else if (err.response?.status === 401) {
                    setError("Invalid email or password");
                } else {
                    setError(err.message || "Login failed. Please check your credentials.");
                }
            } finally {
                setLoading(false);
                loginAttemptRef.current = null;
            }
        }, 50);
    }

    async function handleResendVerification() {
        if (!email || !validateEmail(email)) {
            setError("Please enter a valid email address to resend verification.");
            return;
        }
        
        setResendStatus({ sent: false, loading: true });
        
        try {
            await unifiedAuthService.resendVerification(email);
            setResendStatus({ sent: true, loading: false });
            setError("");
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
                        
                        {(formErrors.length > 0 || error) && (
                            <p className="error-message">
                                {formErrors.length > 0 ? formErrors[0] : error}
                            </p>
                        )}

                        {corsError && (
                            <div className="cors-error">
                                <p>CORS error detected. The server might be unavailable or not configured to accept requests from this domain.</p>
                            </div>
                        )}
                        
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