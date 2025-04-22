import './Login.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useState, useEffect } from "react";
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

    const navigate = useNavigate();

    // Check for token expiration or session issues
    useEffect(() => {
        // Clear any expired tokens
        const expiredToken = localStorage.getItem('expired_token');
        if (expiredToken === 'true') {
            setError('Your session has expired. Please log in again.');
            localStorage.removeItem('expired_token');
        }
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateEmail(email)) {
            setError("Please provide valid Email address.");
            return;
        }

        if (!password) {
            setError("Please provide the Password");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Use authService instead of direct axios call
            await authService.login(email, password);
            navigate("/inputMain");
        }
        catch (err) {
            console.error("Login error:", err);
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleEmail(event) {
        setEmail(event.target.value);
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