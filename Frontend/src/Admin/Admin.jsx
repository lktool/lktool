import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import { adminService } from '../api/adminService';
import './Admin.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = adminService.isAdminAuthenticated();
      setIsAuthenticated(isAdmin);
      
      if (isAdmin) {
        fetchSubmissions();
      }
    };
    
    checkAuth();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSubmissions(filter !== 'all' ? filter : '');
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions();
    }
  }, [filter, isAuthenticated]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateSubmissionStatus(id, newStatus);
      fetchSubmissions(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    setIsAuthenticated(false);
  };

  // Return login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
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
        
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading submissions..." />
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
            <p>No submissions found</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;