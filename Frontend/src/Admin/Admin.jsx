import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService';
import './Admin.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Admin credentials
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "adminLK@123";

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = adminService.isAdminAuthenticated();
      setIsAuthenticated(isAdmin);
      
      if (isAdmin) {
        // Redirect to FormData if already authenticated
        navigate('/formData');
      }
      setIsLoading(false);
    };
    
    checkAuth();
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
    
    // Check against hardcoded credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Store admin token
      const adminToken = 'admin-token'; // In a real app, use a proper token
      localStorage.setItem('adminToken', adminToken);
      
      // Set authenticated state
      setIsAuthenticated(true);
      
      // Redirect to FormData page
      navigate('/formData');
    } else {
      setError('Invalid admin credentials');
      setLoading(false);
    }
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="admin-loading">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  // Return admin login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-container">
        <div className="admin-login-card">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter admin email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
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

  // This should never be seen as we redirect on login success
  return (
    <div className="admin-redirect">
      <LoadingSpinner size="large" text="Redirecting to Form Data..." />
    </div>
  );
}

export default Admin;