import React, { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import './Admin.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form data state
  const [submissions, setSubmissions] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Admin credentials - update to your preferred values
  const ADMIN_EMAIL = "admin@lktool.com";
  const ADMIN_PASSWORD = "adminLK@123";
  
  // Check if admin is already logged in
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
      fetchFormData();
    }
  }, []);
  
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
      setTimeout(() => {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        setLoading(false);
        fetchFormData();
      }, 1000); // Adding slight delay for UX
    } else {
      setTimeout(() => {
        setError('Invalid email or password');
        setLoading(false);
      }, 1000);
    }
  };
  
  const fetchFormData = async () => {
    setDataLoading(true);
    try {
      let url = '';
      if (filter !== 'all') {
        url = `?status=${filter}`;
      }
      
      const data = await adminService.getFormSubmissions(url);
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching form data:", error);
    } finally {
      setDataLoading(false);
    }
  };
  
  // Add status update function
  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateSubmissionStatus(id, newStatus);
      // Refresh data after update
      fetchFormData();
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    setEmail('');
    setPassword('');
  };

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
  
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      <main className="admin-main">
        <h2>Form Submissions</h2>
        
        <div className="filter-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`filter-btn ${filter === 'processed' ? 'active' : ''}`}
            onClick={() => setFilter('processed')}
          >
            Processed
          </button>
        </div>
        
        {dataLoading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading form data..." />
          </div>
        ) : submissions.length > 0 ? (
          <div className="submissions-table-container">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>LinkedIn URL</th>
                  <th>Message</th>
                  <th>Date Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.id}</td>
                    <td>{submission.email}</td>
                    <td>
                      <a href={submission.linkedin_url} target="_blank" rel="noopener noreferrer">
                        {submission.linkedin_url}
                      </a>
                    </td>
                    <td>{submission.message}</td>
                    <td>{new Date(submission.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`status ${submission.is_processed ? 'processed' : 'pending'}`}>
                        {submission.is_processed ? 'Processed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {submission.is_processed ? (
                        <button 
                          className="action-btn mark-pending"
                          onClick={() => handleStatusChange(submission.id, false)}
                        >
                          Mark as Pending
                        </button>
                      ) : (
                        <button 
                          className="action-btn mark-processed"
                          onClick={() => handleStatusChange(submission.id, true)}
                        >
                          Mark as Processed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No form submissions found</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;