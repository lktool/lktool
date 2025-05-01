import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { getApiUrl, ADMIN_ENDPOINTS } from '../api/apiConfig';

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
    
    try {
      const response = await axios.post(
        getApiUrl(ADMIN_ENDPOINTS.LOGIN), 
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (response.data && response.data.token) {
        // Store the admin token
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
        navigate('/formData');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      
      if (err.response?.status === 405) {
        setError('API endpoint method not allowed. Please contact support.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
  
  // This shouldn't be seen since we navigate away after login
  return <div className="admin-container"><LoadingSpinner size="large" text="Redirecting to Form Data..." /></div>;
}

export default Admin;