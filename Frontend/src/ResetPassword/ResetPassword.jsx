import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import './ResetPassword.css';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { uid, token } = useParams();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        
        if (!password) {
            setError('Please enter a new password');
            return;
        }
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            // Use authService instead of direct axios call
            await authService.confirmPasswordReset(uid, token, password, confirmPassword);
            
            setSuccess(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
            
        } catch (err) {
            console.error('Password reset confirmation error:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (err.response?.data?.password) {
                setError(err.response.data.password[0]);
            } else {
                setError('Failed to reset password. The link may be invalid or expired.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="reset-password-container">
            <div className="reset-password-inner">
                <h1>Set New Password</h1>
                
                {success ? (
                    <div className="success-message">
                        <p>Your password has been reset successfully!</p>
                        <p>Redirecting to login page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p>Enter your new password below.</p>
                        
                        <div className="input-field">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>
                        
                        <div className="input-field">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <button 
                            className="reset-confirm-button" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;
