import { useState } from 'react';
import { adminService } from '../api/adminService'; // Import our dedicated admin service
import './AdminLogin.css';

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log(`Attempting admin login with email: ${email}`);
      const success = await adminService.login(email, password);
      
      if (success) {
        console.log('Admin login successful!');
        onLoginSuccess();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error details:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid admin credentials');
      } else if (err.message && err.message.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <p>Please enter your admin credentials to continue</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
            />
          </div>
          
          {error && <div className="admin-error">{error}</div>}
          
          <button 
            type="submit" 
            className="admin-login-btn" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
