import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { unifiedAuthService } from '../api/unifiedAuthService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Admin.css';

function Admin() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = () => {
      // Use the unified auth service to check if user is authenticated AND is admin
      const isAuthenticated = unifiedAuthService.isAuthenticated();
      const isAdmin = unifiedAuthService.isAdmin();
      
      if (isAuthenticated && isAdmin) {
        // Already authenticated as admin, redirect to dashboard
        navigate('/admin/dashboard');
      } else if (isAuthenticated && !isAdmin) {
        // User is logged in but not an admin
        navigate('/');
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);
  
  // Handle successful login
  const handleLoginSuccess = (response) => {
    if (response.isAdmin) {
      navigate('/admin/dashboard');
    } else {
      // Show error - not admin privileges
      alert('Your account does not have admin privileges');
      unifiedAuthService.logout();
      navigate('/login');
    }
  };
  
  if (isLoading) {
    return (
      <div className="admin-container">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }
  
  // Show the admin login form
  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}

export default Admin;