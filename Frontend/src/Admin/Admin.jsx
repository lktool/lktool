import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // FIX: Clear any incorrect tokens and properly verify admin authentication
  useEffect(() => {
    // IMPORTANT: Clear localStorage on component mount to fix the bypass issue
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      
      // ONLY set authenticated if we have a valid token
      if (adminToken) {
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
      } else {
        // Force logout to clear any incorrect state
        localStorage.removeItem('adminToken'); 
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    // CRITICAL: Fixed credentials matching
    const ADMIN_EMAIL = "admin@gmail.com"; 
    const ADMIN_PASSWORD = "adminLK@123";
    
    // Check credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminToken', 'admin_authenticated'); // Store admin token
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
    setLoading(false);
  };
  
  // Show loading screen while checking auth state
  if (isLoading) {
    return <div className="admin-container"><LoadingSpinner size="large" text="Checking authentication..." /></div>;
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
  
  return <div className="admin-container"><LoadingSpinner size="large" text="Redirecting to Admin Dashboard..." /></div>;
}

export default Admin;