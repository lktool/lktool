import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { unifiedAuthService } from '../api/unifiedAuthService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      setIsAuthenticated(!!token);
      setIsAdmin(userRole === 'admin');
      
      // If already authenticated as admin, redirect to dashboard
      if (token && userRole === 'admin') {
        navigate('/admin/dashboard');
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Handle successful login
  const handleLoginSuccess = (response) => {
    if (response.isAdmin) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      navigate('/admin/dashboard');
    } else {
      setIsAuthenticated(true);
      setIsAdmin(false);
      // Show an error that the user is not an admin
    }
  };
  
  if (isLoading) {
    return (
      <div className="admin-container">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  // If not authenticated or not admin, show login form
  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }
  
  // This should not be shown since we redirect after login
  return (
    <div className="admin-container">
      <LoadingSpinner size="large" text="Redirecting to dashboard..." />
    </div>
  );
}

export default Admin;