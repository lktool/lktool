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
    const checkAuth = () => {
      const isAdmin = adminService.isAuthenticated();
      setIsAuthenticated(isAdmin);
      
      if (isAdmin) {
        // Redirect to admin dashboard if already logged in
        navigate('/admin/dashboard');
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }
    
    try {
      const success = await adminService.login(email, password);
      
      if (success) {
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid admin credentials');
      } else {
        setError('Login failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading) {
    return <div className="admin-container"><LoadingSpinner size="large" text="Checking authentication..." /></div>;
  }
  
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