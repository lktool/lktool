import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Update import to use the new API structure
import { authService } from '../api';
import './Admin.css';

function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in as admin
  useEffect(() => {
    if (authService.isAuthenticated() && authService.isAdmin()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the new auth service
      const response = await authService.login(email, password);
      
      if (response.success) {
        if (response.isAdmin) {
          // Admin login succeeded
          navigate('/admin/dashboard');
        } else {
          // Regular user tried to log into admin
          setError('You do not have admin privileges');
          authService.logout();
        }
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <form onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Admin;