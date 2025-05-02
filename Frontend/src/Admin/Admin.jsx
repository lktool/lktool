import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { adminService } from '../api/adminService'; // Import dedicated service
import LoadingSpinner from '../components/LoadingSpinner';
import './Admin.css';

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const isAdmin = adminService.isAuthenticated();
      setIsAuthenticated(isAdmin);
      
      // If already authenticated, redirect to admin dashboard
      if (isAdmin) {
        navigate('/admin/dashboard');
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/admin/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="admin-container">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  // If not authenticated, show login form
  if (!isAuthenticated) {
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