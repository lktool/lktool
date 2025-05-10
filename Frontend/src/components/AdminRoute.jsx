import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated AND is admin
    const checkAdminAuth = () => {
      const isAuthenticated = unifiedAuthService.isAuthenticated();
      const hasAdminRole = unifiedAuthService.isAdmin();
      
      setIsAdmin(isAuthenticated && hasAdminRole);
      setIsLoading(false);
    };
    
    checkAdminAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAdminAuth();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to admin login if not authenticated as admin
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated as admin, render the protected content
  return children;
}

export default AdminRoute;
