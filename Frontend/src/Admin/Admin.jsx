import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import { adminService } from '../api/adminService';
import './Admin.css';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if admin is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = adminService.isAdminAuthenticated();
      setIsAuthenticated(isAdmin);
      
      if (isAdmin) {
        // Redirect to FormData if already authenticated
        navigate('/formData');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Handle login success by redirecting to FormData page
  const handleLoginSuccess = () => {
    // Set authenticated state and redirect to FormData page
    setIsAuthenticated(true);
    navigate('/formData');
  };

  // Return login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // This part will only be shown briefly before redirecting
  return (
    <div className="admin-dashboard">
      <div className="loading-container">
        <LoadingSpinner size="large" text="Redirecting to Form Data..." />
      </div>
    </div>
  );
}

export default Admin;