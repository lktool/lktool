import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import './Admin.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Check if admin is already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAuthenticated(true);
      navigate('/formData');
    }
    setIsLoading(false);
  }, [navigate]);
  
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    // HARDCODED CREDENTIALS - match what's in Django settings.py
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "adminLK@123";
    
    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store admin authentication token
      localStorage.setItem('adminToken', 'admin-auth-token');
      setIsAuthenticated(true);
      navigate('/formData');
    } else {
      setError('Invalid admin credentials');
      setLoading(false);
    }
  };
  
  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingSpinner size="large" text="Checking authentication..." />;
  }
  
  // If not authenticated, show admin login form
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <p>Please enter your admin credentials</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Admin Email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Admin Password"
              />
            </div>
            
            {error && <div className="admin-error">{error}</div>}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="admin-login-btn"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // This shouldn't be seen since we navigate away after login
  return <LoadingSpinner size="large" text="Redirecting to Form Data..." />;
}

export default Admin;